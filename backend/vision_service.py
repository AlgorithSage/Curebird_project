"""
Shared VLM helper for medical document extraction.

Primary:  Groq (qwen/qwen3.6-27b) — keeps document analysis on the same stack
          as the rest of the AI features.
Fallback: Gemini (gemini-3.6-flash) — used when Groq rate-limits or errors.
          Groq's vision tier allows 8k tokens/min and a single report costs
          ~4.5k, so concurrent uploads hit 429 quickly.

Callers get a parsed dict back, or VisionError when BOTH providers fail — so a
provider outage can never be mistaken for "no data found in the document".
"""

import base64
import io
import json
import os
import re

from groq import Groq
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

GROQ_VISION_MODEL = os.getenv('GROQ_VISION_MODEL', 'qwen/qwen3.6-27b')
GEMINI_VISION_MODEL = os.getenv('GEMINI_VISION_MODEL', 'gemini-3.6-flash')

# Reasoning models wrap their scratchpad in <think> tags, which is not valid JSON.
_THINK_BLOCK = re.compile(r'<think>.*?</think>', re.DOTALL)


class VisionError(RuntimeError):
    """Every vision provider failed. The document was never actually read."""


def _mime_type(image_bytes):
    if image_bytes.startswith(b'\x89PNG'):
        return "image/png"
    if image_bytes.startswith(b'%PDF'):
        return "application/pdf"
    return "image/jpeg"


def _parse_json(text):
    """Strip reasoning blocks and markdown fences, then parse."""
    text = _THINK_BLOCK.sub('', text or '').strip()

    if text.startswith('```'):
        parts = text.split('```')
        if len(parts) > 1:
            text = parts[1]
        if text.startswith('json'):
            text = text[4:]
        text = text.strip()

    return json.loads(text)


def _groq_vision(prompt, image_bytes, api_key):
    if not api_key:
        raise ValueError("Groq API key not found in environment variables.")

    client = Groq(api_key=api_key)
    data_url = f"data:{_mime_type(image_bytes)};base64,{base64.b64encode(image_bytes).decode('utf-8')}"

    completion = client.chat.completions.create(
        model=GROQ_VISION_MODEL,
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": data_url}},
                ],
            }
        ],
        temperature=0.1,
        max_tokens=4096,
        response_format={"type": "json_object"},
        reasoning_format="hidden",
        reasoning_effort="none",  # 'default' burns the whole max_tokens budget on hidden reasoning for dense documents, leaving empty content
    )
    return _parse_json(completion.choices[0].message.content)


def _gemini_vision(prompt, image_bytes):
    import google.generativeai as genai
    from PIL import Image

    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in environment variables.")

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(
        model_name=GEMINI_VISION_MODEL,
        generation_config={
            'temperature': 0.1,
            'max_output_tokens': 4096,
            'response_mime_type': 'application/json',
        },
    )

    image = Image.open(io.BytesIO(image_bytes))
    if image.mode != 'RGB':
        image = image.convert('RGB')

    return _parse_json(model.generate_content([prompt, image]).text)


def extract_json(prompt, file_stream=None, api_key=None, image_bytes=None):
    """
    Run `prompt` against a document image and return the parsed JSON response.

    Tries Groq first, falls back to Gemini. Raises VisionError if both fail.
    """
    if image_bytes is None:
        if file_stream is None:
            raise ValueError("extract_json requires file_stream or image_bytes")
        file_stream.seek(0)
        image_bytes = file_stream.read()

    failures = []

    try:
        return _groq_vision(
            prompt,
            image_bytes,
            api_key or os.getenv('GROQ_API_KEY_VISION') or os.getenv('GROQ_API_KEY'),
        )
    except Exception as e:
        failures.append(f"Groq/{GROQ_VISION_MODEL}: {e}")
        print(f"VLM: Groq failed, falling back to Gemini -> {e}")

    try:
        return _gemini_vision(prompt, image_bytes)
    except Exception as e:
        failures.append(f"Gemini/{GEMINI_VISION_MODEL}: {e}")
        print(f"VLM: Gemini fallback also failed -> {e}")

    raise VisionError(" | ".join(failures))
