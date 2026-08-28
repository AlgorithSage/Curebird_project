"""
Shared disease-trend context for the AI system prompts.

Previously both chat services read a `disease_data_cache.json` file that nothing
in the repo ever wrote, so the context silently degraded to "temporarily
unavailable" on every request. The surveillance pipeline in
`app.services.get_trends_data()` already produces exactly this data (and keeps
its own 1-hour cache), so we read from it directly instead.
"""

TOP_N = 10

UNAVAILABLE = "Disease trend data temporarily unavailable."


def _load_trends():
    """Imported lazily: app.services pulls in routes, which imports this module."""
    from app.services import get_trends_data
    return get_trends_data() or []


def _format_cases(value):
    """`outbreaks` may be an int, a float, or a string like '12.5%' or '1,200'."""
    if isinstance(value, (int, float)):
        return f"{value:,}"
    return str(value) if value not in (None, '') else 'N/A'


def _latest_year(disease):
    history = disease.get('history') or []
    if history:
        return history[-1].get('year', 'N/A')
    return disease.get('timeframe', 'N/A')


def get_disease_records():
    """Top diseases as plain dicts, for the /context endpoint."""
    records = []
    for d in _load_trends()[:TOP_N]:
        cases = d.get('annual_count') or 0

        # The surveillance store defaults risk_level to the literal 'Unknown',
        # so treat that as absent and derive the level from case volume.
        risk = d.get('risk_level')
        if not risk or risk == 'Unknown':
            if isinstance(cases, (int, float)) and cases > 100000:
                risk = 'High'
            elif isinstance(cases, (int, float)) and cases > 10000:
                risk = 'Medium'
            else:
                risk = 'Low'

        records.append({
            'name': d.get('disease', 'Unknown'),
            'cases': cases,
            'risk_level': risk,
            'year': _latest_year(d),
        })
    return records


def build_context_string():
    """The block injected into the Cure AI system prompt."""
    try:
        diseases = _load_trends()[:TOP_N]
        if not diseases:
            return UNAVAILABLE

        lines = ["Current Disease Trends in India:"]
        for i, d in enumerate(diseases, 1):
            name = d.get('disease', 'Unknown')
            cases = _format_cases(d.get('outbreaks', 0))
            lines.append(f"{i}. {name}: {cases} cases ({_latest_year(d)})")
        return "\n".join(lines) + "\n"
    except Exception as e:
        print(f"Error loading disease context: {e}")
        return UNAVAILABLE
