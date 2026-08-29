"""
State-wise disease burden from data.gov.in (NVBDCP / NCDC / MoHFW releases).

Replaces the fixed STATE_DISTRIBUTION_WEIGHTS the frontend used to fake state
numbers. Those weights were identical for every disease, so the map showed the
same five states for dengue, malaria and everything else. The real data does not
agree: dengue's 2021 top states (UP, Punjab, Rajasthan, MP) and malaria's
(Chhattisgarh, Odisha, West Bengal, Maharashtra) share none of the same states.

These are annual government releases, NOT live surveillance — every entry
carries the year it belongs to so the UI can label it honestly.
"""

import os
import json
import time
import urllib.parse
import urllib.request

from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

BASE_URL = 'https://api.data.gov.in/resource'
CACHE_DURATION = 21600   # 6h; these are annual releases, they do not move
REQUEST_TIMEOUT = 60

# Significance floors for the comparative (location-quotient) view. Small
# absolute numbers produce enormous, meaningless national shares.
MIN_NATIONAL_TOTAL = 1000
MIN_STATE_CASES = 10

_CACHE = None
_CACHE_TS = 0

# Every dataset names its columns differently, so the state and value fields are
# configured per source rather than guessed. Verified against live responses.
DISEASE_SOURCES = {
    'Dengue': {
        'resource': 'bbfa6042-ec2e-4c28-8135-6fc7b3e4c39c',
        'state_field': 'state_ut',
        'value_field': '_2021_prov_till_21st_nov___cases',
        'year': 2021,
        'source': 'NVBDCP / MoHFW (provisional, to 21 Nov 2021)',
    },
    'Malaria': {
        'resource': '3a112ee6-df4c-414a-9b2d-874be5922169',
        'state_field': 'state_ut',
        'value_field': '_2021_____cases_',
        'year': 2021,
        'source': 'NVBDCP / MoHFW',
    },
    'Chikungunya': {
        'resource': 'ab8a98cd-9f6c-4a79-8624-473cb4863b86',
        'state_field': 'state_ut',
        'value_field': '_2021__prov_till_5th_dec_____chikungunya___confirmed',
        'year': 2021,
        'source': 'NVBDCP / MoHFW (lab-confirmed, provisional to 5 Dec 2021)',
    },
    'Measles': {
        'resource': '2cfb870b-8288-49b9-a36a-5ce0a7bd7a46',
        'state_field': 'states_uts',
        'value_field': '_2021',
        'year': 2021,
        'source': 'MoHFW immunisation reporting',
    },
    'Acute Diarrheal Disease (ADD)': {
        'resource': '07e6b0bb-acaa-46da-84b2-07aaf6f394f1',
        'state_field': 'state__ut_name',
        'value_field': '_2015__prov_____cases',
        'year': 2015,
        'source': 'IDSP / NCDC (provisional)',
    },
}

# Rows that are not states. The datasets repeat their own header as a record and
# carry a grand-total row, which would otherwise top every ranking.
_NON_STATE_ROWS = {
    'total', 'total*', 'grand total', 'india', 'all india',
    'state_ut', 'states_uts', 'state__ut_name', 'sl_no_', 'sl__no_',
}

# Government spellings normalised onto the names used by standard India GeoJSON.
STATE_ALIASES = {
    'orissa': 'Odisha',
    'pondicherry': 'Puducherry',
    'uttaranchal': 'Uttarakhand',
    'nct of delhi': 'Delhi',
    'delhi (nct)': 'Delhi',
    'jammu & kashmir': 'Jammu and Kashmir',
    'jammu and kashmir': 'Jammu and Kashmir',
    'andaman & nicobar islands': 'Andaman and Nicobar Islands',
    'andaman and nicobar islands': 'Andaman and Nicobar Islands',
    'andaman and nicobar': 'Andaman and Nicobar Islands',   # GeoJSON spelling
    'andaman & nicobar': 'Andaman and Nicobar Islands',
    'a & n islands': 'Andaman and Nicobar Islands',
    'dadra & nagar haveli': 'Dadra and Nagar Haveli and Daman and Diu',
    'dadra and nagar haveli': 'Dadra and Nagar Haveli and Daman and Diu',
    'daman & diu': 'Dadra and Nagar Haveli and Daman and Diu',
    'daman and diu': 'Dadra and Nagar Haveli and Daman and Diu',
    'dadra and nagar haveli and daman and diu': 'Dadra and Nagar Haveli and Daman and Diu',
    'd & n haveli and daman & diu': 'Dadra and Nagar Haveli and Daman and Diu',
    'chattisgarh': 'Chhattisgarh',
    'chhatisgarh': 'Chhattisgarh',
    'telengana': 'Telangana',
    'tamilnadu': 'Tamil Nadu',
    'himachal pradesh ': 'Himachal Pradesh',
}


class DiseaseGeographyError(RuntimeError):
    """The upstream release could not be read."""


def normalise_state(raw):
    """Clean a government state label into a canonical, joinable name.

    Handles the asterisk footnote markers ('West Bengal*'), stray whitespace,
    '&' vs 'and', and the spelling variants above. The frontend must run the
    same normalisation on its GeoJSON, or the map join silently half-fails.
    """
    if not raw:
        return None

    name = str(raw).replace('*', '').replace('#', '').strip()
    name = ' '.join(name.split())
    if not name:
        return None

    key = name.lower()
    if key in _NON_STATE_ROWS:
        return None

    if key in STATE_ALIASES:
        return STATE_ALIASES[key]

    expanded = key.replace(' & ', ' and ')
    if expanded in STATE_ALIASES:
        return STATE_ALIASES[expanded]

    return name.replace(' & ', ' and ').title() if name.isupper() else name.replace(' & ', ' and ')


def _to_int(value):
    """Values arrive as ints, comma strings, or the literal text 'NA'."""
    if value is None:
        return None
    text = str(value).replace(',', '').strip()
    if not text or text.upper() in ('NA', 'N/A', '-', 'NIL'):
        return None
    try:
        return int(float(text))
    except ValueError:
        return None


def _fetch_resource(resource_id, api_key, limit=200):
    params = urllib.parse.urlencode({
        'api-key': api_key,
        'format': 'json',
        'limit': limit,
    })
    request = urllib.request.Request(
        f'{BASE_URL}/{resource_id}?{params}',
        headers={'User-Agent': 'CureBird/1.0 (+https://www.curebird.tech)'},
    )
    with urllib.request.urlopen(request, timeout=REQUEST_TIMEOUT) as r:
        return json.loads(r.read().decode('utf-8')).get('records', [])


def _load_disease(name, config, api_key):
    records = _fetch_resource(config['resource'], api_key)

    rows = []
    for record in records:
        state = normalise_state(record.get(config['state_field']))
        if not state:
            continue                      # header echo, total row, or blank

        cases = _to_int(record.get(config['value_field']))
        if cases is None:
            continue                      # 'NA' means not reported, not zero

        rows.append({'state': state, 'cases': cases})

    # A state can appear twice across footnoted rows; keep the larger figure.
    merged = {}
    for row in rows:
        if row['state'] not in merged or row['cases'] > merged[row['state']]['cases']:
            merged[row['state']] = row

    ordered = sorted(merged.values(), key=lambda r: r['cases'], reverse=True)
    for rank, row in enumerate(ordered, 1):
        row['rank'] = rank

    return {
        'disease': name,
        'year': config['year'],
        'source': config['source'],
        'states': ordered,
        'state_count': len(ordered),
        'national_total': sum(r['cases'] for r in ordered),
    }


def _build_dominant(by_disease):
    """For each state, which disease is most *characteristic* of it.

    Raw counts cannot answer this. Diarrhoeal disease reports ~12.2M cases
    against dengue's ~164k, so ranking by count makes every single state read
    "ADD" and the map says nothing. The datasets also span different years,
    which makes cross-disease count comparison meaningless anyway.

    Instead this uses a location quotient: the state's share of a disease's
    national total, divided by that state's average share across all diseases.
    LQ > 1 means the state carries more of that disease than its general
    reporting volume would predict — which is the "malaria belt", "dengue belt"
    signal a reader actually wants.
    """
    shares = {}

    for name, payload in by_disease.items():
        national = payload['national_total']

        # A disease with a tiny national total produces meaningless shares:
        # 2021 measles reported 16 cases nationwide, so a state with 8 holds
        # "50% of the national burden" and dominates the map on noise. Such
        # diseases stay available for the per-disease view but are excluded
        # from the comparative one.
        if national < MIN_NATIONAL_TOTAL:
            continue

        for row in payload['states']:
            if row['cases'] < MIN_STATE_CASES:
                continue
            entry = shares.setdefault(row['state'], {})
            entry[name] = {'share': row['cases'] / national, 'cases': row['cases']}

    dominant = []
    for state, per_disease in shares.items():
        if not per_disease:
            continue

        mean_share = sum(d['share'] for d in per_disease.values()) / len(per_disease)
        if mean_share <= 0:
            continue

        scored = {
            name: {
                'cases': d['cases'],
                'share_pct': round(d['share'] * 100, 2),
                'lq': round(d['share'] / mean_share, 2),
                'year': by_disease[name]['year'],
            }
            for name, d in per_disease.items()
        }

        top_name = max(scored, key=lambda n: scored[n]['lq'])
        dominant.append({
            'state': state,
            'disease': top_name,
            'cases': scored[top_name]['cases'],
            'location_quotient': scored[top_name]['lq'],
            'share_of_national_pct': scored[top_name]['share_pct'],
            'year': scored[top_name]['year'],
            'breakdown': scored,
            'diseases_compared': len(scored),
        })

    return sorted(dominant, key=lambda d: d['location_quotient'], reverse=True)


def get_disease_geography(force_refresh=False):
    """Cached state-wise burden for every disease with a published release."""
    global _CACHE, _CACHE_TS

    if _CACHE and not force_refresh and (time.time() - _CACHE_TS) < CACHE_DURATION:
        return _CACHE

    api_key = os.getenv('DATA_GOV_API_KEY')
    if not api_key:
        raise DiseaseGeographyError('DATA_GOV_API_KEY not set')

    by_disease, failures = {}, []

    for name, config in DISEASE_SOURCES.items():
        try:
            payload = _load_disease(name, config, api_key)
            if payload['states']:
                by_disease[name] = payload
            else:
                failures.append(f'{name}: no usable rows')
        except Exception as e:
            failures.append(f'{name}: {e}')
            print(f'Disease geography: {name} failed -> {e}')

    if not by_disease:
        if _CACHE:
            print('Disease geography refresh failed entirely; serving cached snapshot')
            return _CACHE
        raise DiseaseGeographyError('; '.join(failures) or 'no data returned')

    _CACHE = {
        'success': True,
        'by_disease': by_disease,
        'dominant': _build_dominant(by_disease),
        'available_diseases': sorted(by_disease),
        'unavailable_diseases': failures,
        'source': 'data.gov.in — NVBDCP / IDSP / MoHFW state-wise releases',
        'note': ('Annual government releases, not live surveillance. Each disease carries its own '
                 'year. Counts are raw reported cases, not population-normalised, so larger states '
                 'rank higher by construction.'),
    }
    _CACHE_TS = time.time()
    print(f'--- Disease geography cached: {len(by_disease)} diseases ---')
    return _CACHE
