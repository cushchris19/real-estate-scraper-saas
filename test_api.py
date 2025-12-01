import requests
import time

def test_api():
    url = "http://127.0.0.1:5000/api/scrape"
    params = {
        "location": "Dallas, TX",
        "listing_type": "for_sale",
        "past_days": 1
    }
    
    print(f"Testing API at {url} with params: {params}")
    try:
        response = requests.get(url, params=params)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Success! Found {data.get('count')} results.")
            # print(data)
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    # Wait a bit for server to start
    # time.sleep(5) 
    test_api()
