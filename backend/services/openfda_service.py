import requests
from utils.cache_manager import cache

OPENFDA_API_URL = "https://api.fda.gov/drug/label.json"

def get_medicines_for_disease(disease_name):
    """
    Fetches medicines for a specific disease using OpenFDA API.
    Uses caching to avoid hitting API limits.
    """
    cache_key = f"openfda_medicines_{disease_name.lower().strip()}"
    cached_data = cache.get(cache_key)
    
    if cached_data:
        print(f"Serving {disease_name} from cache")
        return cached_data

    # Logging to file for better debugging
    import os
    debug_log_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'debug.log')
    with open(debug_log_path, 'a') as f:
        f.write(f"\n[REQUEST] Disease: {disease_name}\n")

    # cleaned disease name
    query_term = disease_name.strip()
    
    # 1. Try Exact Phrase Search first
    search_query = f'indications_and_usage:"{query_term}"'
    params = {'search': search_query, 'limit': 5}
    
    try:
        response = requests.get(OPENFDA_API_URL, params=params)
        with open(debug_log_path, 'a') as f:
            f.write(f"[try 1] URL: {response.url} | Status: {response.status_code}\n")
            
        if response.status_code == 200:
            data = response.json()
            if 'results' in data and len(data['results']) > 0:
                 return parse_results(data['results'])
    except Exception as e:
        with open(debug_log_path, 'a') as f:
            f.write(f"[try 1 error] {e}\n")

    # 2. Fallback: Try Broad Search (any word match) if exact phrase failed
    # This helps with "Carpal Tunnel Syndrome" finding "Carpal Tunnel" docs
    words = query_term.split()
    if len(words) > 1:
        # Construct query: indications_and_usage:(Word1+AND+Word2)
        # Actually in OpenFDA logic, spaces default to AND usually, or we can just try distinct terms.
        # Let's try matching the main noun. Simple fallback: remove quotes.
         search_query = f'indications_and_usage:{query_term}'
         params = {'search': search_query, 'limit': 5}
         
         try:
            response = requests.get(OPENFDA_API_URL, params=params)
            with open(debug_log_path, 'a') as f:
                f.write(f"[try 2] URL: {response.url} | Status: {response.status_code}\n")
            
            if response.status_code == 200:
                data = response.json()
                if 'results' in data:
                    return parse_results(data['results'])
         except Exception as e:
            with open(debug_log_path, 'a') as f:
                 f.write(f"[try 2 error] {e}\n")
    
    return []

def parse_results(results_list):
    output = []
    for item in results_list:
        if 'openfda' in item:
            if 'brand_name' in item['openfda']:
                output.append(item['openfda']['brand_name'][0])
            elif 'generic_name' in item['openfda']:
                output.append(item['openfda']['generic_name'][0])
    return lists_to_clean_list(output)

def lists_to_clean_list(items):
    seen = set()
    cleaned = []
    for item in items:
        if item and item not in seen:
            seen.add(item)
            cleaned.append(item)
    return cleaned[:10]
