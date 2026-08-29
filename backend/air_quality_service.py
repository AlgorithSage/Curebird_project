"""
Real-time air quality from the CPCB / data.gov.in national feed.

Served from the backend rather than the browser for three reasons:
  * data.gov.in sends no CORS headers, so a direct fetch() is blocked.
  * The API key stays server-side instead of being compiled into the bundle.
  * ~500 stations refresh hourly; one cached fetch serves every user.

The feed reports per-pollutant concentrations, NOT a ready-made AQI, so the
CPCB sub-index breakpoints below convert them and take the worst sub-index —
which is how CPCB itself defines the headline AQI.
"""

import os
import json
import time
import urllib.parse
import urllib.request

from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

RESOURCE_ID = '3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69'
BASE_URL = f'https://api.data.gov.in/resource/{RESOURCE_ID}'
PAGE_SIZE = 2000          # server caps a single response around this
MAX_RECORDS = 10000       # safety stop for the pagination loop
CACHE_DURATION = 3600     # feed updates hourly

_CACHE = None
_CACHE_TS = 0

# CPCB sub-index breakpoints: (C_low, C_high, I_low, I_high) in ug/m3.
# CO is deliberately excluded — the feed's CO values (median 25, max 104) are
# not the mg/m3 the CPCB scale expects, and guessing the unit would produce a
# wrong headline number. PM2.5/PM10 drive the Indian AQI in practice anyway.
BREAKPOINTS = {
    'PM2.5': [(0, 30, 0, 50), (30, 60, 51, 100), (60, 90, 101, 200),
              (90, 120, 201, 300), (120, 250, 301, 400), (250, 500, 401, 500)],
    'PM10':  [(0, 50, 0, 50), (50, 100, 51, 100), (100, 250, 101, 200),
              (250, 350, 201, 300), (350, 430, 301, 400), (430, 600, 401, 500)],
    'NO2':   [(0, 40, 0, 50), (40, 80, 51, 100), (80, 180, 101, 200),
              (180, 280, 201, 300), (280, 400, 301, 400), (400, 600, 401, 500)],
    'SO2':   [(0, 40, 0, 50), (40, 80, 51, 100), (80, 380, 101, 200),
              (380, 800, 201, 300), (800, 1600, 301, 400), (1600, 2000, 401, 500)],
    'OZONE': [(0, 50, 0, 50), (50, 100, 51, 100), (100, 168, 101, 200),
              (168, 208, 201, 300), (208, 748, 301, 400), (748, 1000, 401, 500)],
    'NH3':   [(0, 200, 0, 50), (200, 400, 51, 100), (400, 800, 101, 200),
              (800, 1200, 201, 300), (1200, 1800, 301, 400), (1800, 2400, 401, 500)],
}


# CPCB names some cities differently from the app's location list. Anything not
# listed here and absent from the feed is a real coverage gap (Mizoram, Goa and
# Manipur have no CPCB station at all), which the UI reports as "No Station"
# rather than passing an estimate off as a live reading.
CITY_ALIASES = {
    'new delhi': 'Delhi',
    'bangalore': 'Bengaluru',
    'bengaluru': 'Bengaluru',
    'itanagar': 'Naharlagun',   # adjacent twin city, ~10km, the only AP station
    'mysore': 'Mysuru',
    'hubli': 'Hubballi',
    'gulbarga': 'Kalaburagi',
    'shimoga': 'Shivamogga',
    'bombay': 'Mumbai',
    'madras': 'Chennai',
    'calcutta': 'Kolkata',
    'trivandrum': 'Thiruvananthapuram',
    'pondicherry': 'Puducherry',
    'baroda': 'Vadodara',
    'allahabad': 'Prayagraj',
}


def resolve_city_name(name):
    """Map an app-side city name onto the name CPCB publishes."""
    if not name:
        return name
    return CITY_ALIASES.get(name.strip().lower(), name)


# Regions with no CPCB station at all. Filled from the Open-Meteo/CAMS model so
# the map has national coverage — but flagged `modelled` everywhere, because a
# spot-check against measured CPCB values showed the model can be far off
# (Delhi 127 modelled vs 60.6 measured; Bengaluru 8 vs 39.9). Model output is
# only ever used where no station exists; it never overrides a real reading.
MODELLED_LOCATIONS = [
    {'name': 'Panaji',     'state': 'Goa',                                      'lat': 15.4909, 'lon': 73.8278},
    {'name': 'Imphal',     'state': 'Manipur',                                  'lat': 24.8170, 'lon': 93.9368},
    {'name': 'Aizawl',     'state': 'Mizoram',                                  'lat': 23.7307, 'lon': 92.7173},
    {'name': 'Port Blair', 'state': 'Andaman and Nicobar Islands',              'lat': 11.6234, 'lon': 92.7265},
    {'name': 'Daman',      'state': 'Dadra and Nagar Haveli and Daman and Diu', 'lat': 20.3974, 'lon': 72.8328},
    {'name': 'Kavaratti',  'state': 'Lakshadweep',                              'lat': 10.5669, 'lon': 72.6420},
]

OPEN_METEO_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality'


def _fetch_modelled():
    """One batched call covering every station-less region."""
    params = urllib.parse.urlencode({
        'latitude': ','.join(str(p['lat']) for p in MODELLED_LOCATIONS),
        'longitude': ','.join(str(p['lon']) for p in MODELLED_LOCATIONS),
        'current': 'pm2_5,pm10',
        'timezone': 'Asia/Kolkata',
    })
    request = urllib.request.Request(
        f'{OPEN_METEO_URL}?{params}',
        headers={'User-Agent': 'CureBird/1.0 (+https://www.curebird.tech)'},
    )

    with urllib.request.urlopen(request, timeout=45) as r:
        payload = json.loads(r.read().decode('utf-8'))

    # A multi-location query returns a list; a single one returns an object.
    entries = payload if isinstance(payload, list) else [payload]

    results = []
    for place, entry in zip(MODELLED_LOCATIONS, entries):
        current = (entry or {}).get('current') or {}
        pm25 = current.get('pm2_5')
        pm10 = current.get('pm10')
        if pm25 is None and pm10 is None:
            continue

        # Score on the same CPCB scale as the station data so the two are
        # directly comparable in the UI.
        subs = [s for s in (_sub_index('PM2.5', pm25) if pm25 is not None else None,
                            _sub_index('PM10', pm10) if pm10 is not None else None)
                if s is not None]
        if not subs:
            continue

        aqi = max(subs)
        results.append({
            'name': place['name'],
            'state': place['state'],
            'aqi': aqi,
            'max_aqi': aqi,
            'category': category(aqi),
            'dominant_pollutant': 'PM2.5' if pm25 is not None and _sub_index('PM2.5', pm25) == aqi else 'PM10',
            'pm25': round(pm25, 1) if pm25 is not None else None,
            'pm10': round(pm10, 1) if pm10 is not None else None,
            'station_count': 0,
            'last_update': current.get('time'),
            'modelled': True,
            'data_source': 'Open-Meteo / CAMS model (no CPCB station in region)',
        })

    return results


class AirQualityError(RuntimeError):
    """The upstream feed could not be read. Never mistake this for clean air."""


def _sub_index(pollutant, value):
    """CPCB sub-index for one pollutant, or None if it has no scale."""
    scale = BREAKPOINTS.get(pollutant)
    if scale is None:
        return None

    for c_low, c_high, i_low, i_high in scale:
        if c_low <= value <= c_high:
            return round(i_low + (i_high - i_low) * (value - c_low) / (c_high - c_low))

    # Above the top breakpoint the scale saturates at 500.
    return 500 if value > scale[-1][1] else None


def category(aqi):
    """CPCB's six AQI bands."""
    if aqi is None:
        return 'Unknown'
    if aqi <= 50:
        return 'Good'
    if aqi <= 100:
        return 'Satisfactory'
    if aqi <= 200:
        return 'Moderate'
    if aqi <= 300:
        return 'Poor'
    if aqi <= 400:
        return 'Very Poor'
    return 'Severe'


def _fetch_page(api_key, offset, attempts=3):
    params = urllib.parse.urlencode({
        'api-key': api_key,
        'format': 'json',
        'limit': PAGE_SIZE,
        'offset': offset,
    })
    # data.gov.in throttles the default Python-urllib agent; a normal UA and a
    # short backoff make the fetch reliable.
    request = urllib.request.Request(
        f'{BASE_URL}?{params}',
        headers={'User-Agent': 'CureBird/1.0 (+https://www.curebird.tech)'},
    )

    last_error = AirQualityError('data.gov.in request never ran')
    for attempt in range(attempts):
        try:
            with urllib.request.urlopen(request, timeout=90) as r:
                return json.loads(r.read().decode('utf-8'))
        except Exception as e:
            last_error = e
            if attempt < attempts - 1:
                time.sleep(2 * (attempt + 1))

    raise last_error


def _fetch_all_records(api_key):
    """Page through the feed; it holds more rows than one response returns."""
    records, offset = [], 0

    while offset < MAX_RECORDS:
        payload = _fetch_page(api_key, offset)
        page = payload.get('records') or []
        records.extend(page)

        total = payload.get('total') or 0
        offset += PAGE_SIZE
        if not page or offset >= total:
            break

    return records


def _to_float(value):
    """avg_value is a string, and absent readings arrive as the text 'NA'."""
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _build_snapshot(records):
    """Collapse station/pollutant rows into per-station, city and state views."""
    stations = {}

    for row in records:
        value = _to_float(row.get('avg_value'))
        if value is None:
            continue

        key = (row.get('state'), row.get('city'), row.get('station'))
        entry = stations.setdefault(key, {
            'state': row.get('state'),
            'city': row.get('city'),
            'station': row.get('station'),
            'latitude': _to_float(row.get('latitude')),
            'longitude': _to_float(row.get('longitude')),
            'last_update': row.get('last_update'),
            'pollutants': {},
            'aqi': None,
            'dominant_pollutant': None,
        })

        entry['pollutants'][row.get('pollutant_id')] = value

        sub = _sub_index(row.get('pollutant_id'), value)
        if sub is not None and (entry['aqi'] is None or sub > entry['aqi']):
            entry['aqi'] = sub
            entry['dominant_pollutant'] = row.get('pollutant_id')

    station_list = [s for s in stations.values() if s['aqi'] is not None]

    def aggregate(group_key):
        groups = {}
        for s in station_list:
            name = s.get(group_key)
            if not name:
                continue
            groups.setdefault(name, []).append(s)

        out = []
        for name, members in groups.items():
            values = [m['aqi'] for m in members]
            worst = max(members, key=lambda m: m['aqi'])
            mean_aqi = round(sum(values) / len(values))

            # PM2.5 concentration drives the cigarette-equivalent and
            # life-expectancy maths on the client, so surface it directly
            # rather than making the client reverse it out of the index.
            pm25 = [m['pollutants']['PM2.5'] for m in members if 'PM2.5' in m['pollutants']]
            pm10 = [m['pollutants']['PM10'] for m in members if 'PM10' in m['pollutants']]

            out.append({
                'name': name,
                'state': worst['state'],
                'aqi': mean_aqi,
                'max_aqi': worst['aqi'],
                'category': category(mean_aqi),
                'dominant_pollutant': worst['dominant_pollutant'],
                'pm25': round(sum(pm25) / len(pm25), 1) if pm25 else None,
                'pm10': round(sum(pm10) / len(pm10), 1) if pm10 else None,
                'station_count': len(members),
                'last_update': worst['last_update'],
            })
        return sorted(out, key=lambda x: x['aqi'], reverse=True)

    cities = aggregate('city')
    states = aggregate('state')

    # Mark everything measured, then append modelled entries only for regions
    # the CPCB network does not reach.
    for row in cities + states:
        row['modelled'] = False
        row['data_source'] = 'CPCB station'

    modelled = []
    try:
        modelled = _fetch_modelled()
    except Exception as e:
        print(f'Modelled air-quality fill failed (station data unaffected) -> {e}')

    if modelled:
        covered_states = {s['name'] for s in states}
        for entry in modelled:
            if entry['state'] in covered_states:
                continue  # a real station appeared; never shadow it
            cities.append(entry)
            states.append({**entry, 'name': entry['state']})

        cities.sort(key=lambda x: x['aqi'], reverse=True)
        states.sort(key=lambda x: x['aqi'], reverse=True)

    return {
        'success': True,
        'stations': station_list,
        'cities': cities,
        'states': states,
        'station_count': len(station_list),
        'modelled_count': len(modelled),
        'source': 'CPCB / data.gov.in real-time AQI',
        'note': ('AQI computed from CPCB sub-index breakpoints; CO excluded (unit ambiguous in feed). '
                 'Entries with modelled=true have no CPCB station and come from the Open-Meteo/CAMS '
                 'model — indicative only, and materially less accurate than measured readings.'),
    }


def get_air_quality(force_refresh=False):
    """Cached national air-quality snapshot. Raises AirQualityError on failure."""
    global _CACHE, _CACHE_TS

    if _CACHE and not force_refresh and (time.time() - _CACHE_TS) < CACHE_DURATION:
        return _CACHE

    api_key = os.getenv('DATA_GOV_API_KEY')
    if not api_key:
        raise AirQualityError('DATA_GOV_API_KEY not set')

    try:
        records = _fetch_all_records(api_key)
    except Exception as e:
        # Serve stale data rather than nothing — an hour-old reading beats none.
        if _CACHE:
            print(f'Air quality refresh failed, serving cached snapshot -> {e}')
            return _CACHE
        raise AirQualityError(f'data.gov.in fetch failed: {e}')

    if not records:
        if _CACHE:
            return _CACHE
        raise AirQualityError('data.gov.in returned no records')

    _CACHE = _build_snapshot(records)
    _CACHE_TS = time.time()
    print(f"--- Air quality cache updated: {_CACHE['station_count']} stations ---")
    return _CACHE
