import os
import requests
import traceback
import fitz  # PyMuPDF
from io import BytesIO
from dotenv import load_dotenv
from cerebras.cloud.sdk import Cerebras
from app.services import analyze_with_vlm

load_dotenv()

CEREBRAS_API_KEY = os.getenv("CEREBRAS_API_KEY")

# Cerebras retired the llama-3.x lineup; gpt-oss-120b and gemma-4-31b are what
# the account can reach. Summaries fall back to Groq when Cerebras is unusable
# (dead model, 402 unpaid quota, missing key).
CEREBRAS_MODEL = os.getenv("CEREBRAS_MODEL", "gpt-oss-120b")
GROQ_SUMMARY_MODEL = os.getenv("GROQ_SUMMARY_MODEL", "openai/gpt-oss-120b")

def download_file(url):
    try:
        response = requests.get(url, timeout=15)
        response.raise_for_status()
        return BytesIO(response.content), response.headers.get('Content-Type', '')
    except Exception as e:
        print(f"Error downloading file {url}: {e}")
        return None, None

def extract_text_from_file(file_stream, content_type, url):
    try:
        # Determine type
        is_pdf = 'pdf' in content_type.lower() or url.lower().endswith('.pdf')
        is_image = 'image' in content_type.lower() or any(url.lower().endswith(ext) for ext in ['.jpg', '.jpeg', '.png', '.webp'])
        
        if is_pdf:
            doc = fitz.open(stream=file_stream, filetype="pdf")
            text = ""
            for page in doc:
                text += page.get_text()
            return f"[PDF Content]: {text[:5000]}" # Limit context
            
        elif is_image:
            # Use VLM for Deep Analysis of Medical Images
            print(f"Analyzing Image with VLM: {url}")
            analysis = analyze_with_vlm(file_stream)
            # Prefer digital_copy if available, else fallback to structured data
            content = analysis.get('digital_copy')
            if not content:
                content = f"Diseases: {analysis.get('diseases', [])}, Meds: {analysis.get('medications', [])}"
            return f"[Image Analysis]: {content}"
            
        return "[Unknown File Type]"
    except Exception as e:
        print(f"Extraction Error for {url}: {e}")
        return "[Error extracting content]"

def generate_medical_summary(texts=None, file_urls=None):
    """
    Generates a medical summary from a list of text records AND deep analysis of file URLs.
    """
    texts = texts or []
    
    # Process Files
    if file_urls:
        print(f"Processing {len(file_urls)} files for deep summary...")
        for url in file_urls:
            if not url: continue
            file_stream, content_type = download_file(url)
            if file_stream:
                extracted = extract_text_from_file(file_stream, content_type, url)
                if extracted:
                    texts.append(extracted)

    if not texts:
        return "No recent records available to summarize."

    combined_text = "\n\n".join(texts)
    
    # Truncate if too long (Cerebras has large context, but safe limit)
    if len(combined_text) > 30000:
        combined_text = combined_text[:30000] + "...(truncated)"

    prompt = f"""
    You are an expert medical AI assistant. 
    Below are the contents (including OCR/VLM extracted text from images/PDFs) of a patient's last few medical records.
    Please write a CONCISE, single-paragraph summary of their recent medical history based on these records.
    
    CRITICAL INSTRUCTIONS:
    - Analyze the extracted text (prescriptions, lab reports).
    - Identify main diagnoses, key trends (improving/worsening), and any critical alerts.
    - If a report shows abnormal values, mention them.
    - Write in a professional, empathetic tone.
    - Do NOT use bullet points.
    
    Records Content:
    {combined_text}
    
    Summary:
    """

    messages = [
        {"role": "system", "content": "You are a helpful medical assistant."},
        {"role": "user", "content": prompt},
    ]

    failures = []

    # Primary: Cerebras. Falls through on a dead model, an unpaid quota (402),
    # or a missing key — none of which should cost the user their summary.
    if CEREBRAS_API_KEY:
        try:
            response = Cerebras(api_key=CEREBRAS_API_KEY).chat.completions.create(
                model=CEREBRAS_MODEL,
                messages=messages,
                max_tokens=600,
                temperature=0.7,
                top_p=1,
                stream=False,
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            failures.append(f"Cerebras/{CEREBRAS_MODEL}: {e}")
            print(f"Cerebras API Error, falling back to Groq -> {e}")
    else:
        failures.append("Cerebras: CEREBRAS_API_KEY not set")

    # Fallback: Groq, the same stack the rest of the AI features run on.
    groq_key = os.getenv("GROQ_API_KEY")
    if groq_key:
        try:
            from groq import Groq

            response = Groq(api_key=groq_key).chat.completions.create(
                model=GROQ_SUMMARY_MODEL,
                messages=messages,
                max_tokens=600,
                temperature=0.7,
                top_p=1,
                stream=False,
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            failures.append(f"Groq/{GROQ_SUMMARY_MODEL}: {e}")
            print(f"Groq summary fallback also failed -> {e}")
    else:
        failures.append("Groq: GROQ_API_KEY not set")

    print(f"Medical summary failed on every provider: {' | '.join(failures)}")
    return "Unable to generate summary at this time."