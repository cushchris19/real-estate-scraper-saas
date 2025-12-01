from flask import Flask, jsonify, request
from flask_cors import CORS
from scrape_leads import scrape_leads
import pandas as pd

app = Flask(__name__)
CORS(app)

@app.route('/api/scrape', methods=['GET'])
def scrape():
    location = request.args.get('location')
    listing_type = request.args.get('listing_type', 'for_sale')
    past_days = int(request.args.get('past_days', 30))
    
    min_price = request.args.get('min_price')
    max_price = request.args.get('max_price')
    beds_min = request.args.get('beds_min')
    baths_min = request.args.get('baths_min')

    if not location:
        return jsonify({"error": "Location is required"}), 400

    try:
        print(f"Received request: {location}, {listing_type}, {past_days}")
        print(f"Filters: min_price={min_price}, max_price={max_price}, beds={beds_min}, baths={baths_min}")
        df = scrape_leads(
            location, 
            listing_type, 
            past_days,
            min_price=min_price,
            max_price=max_price,
            beds_min=beds_min,
            baths_min=baths_min
        )
        
        if df is not None and not df.empty:
            # Convert timestamps to string to avoid JSON serialization errors
            for col in df.select_dtypes(include=['datetime', 'datetimetz']).columns:
                df[col] = df[col].astype(str)
            # Fill NaNs to avoid JSON errors
            df = df.fillna('')
            results = df.to_dict('records')
        else:
            results = []
        
from flask import Flask, jsonify, request
from flask_cors import CORS
from scrape_leads import scrape_leads
import pandas as pd
import os

app = Flask(__name__)
CORS(app)

@app.route('/api/scrape', methods=['GET'])
def scrape():
    location = request.args.get('location')
    listing_type = request.args.get('listing_type', 'for_sale')
    past_days = int(request.args.get('past_days', 30))
    
    min_price = request.args.get('min_price')
    max_price = request.args.get('max_price')
    beds_min = request.args.get('beds_min')
    baths_min = request.args.get('baths_min')

    if not location:
        return jsonify({"error": "Location is required"}), 400

    try:
        print(f"Received request: {location}, {listing_type}, {past_days}")
        print(f"Filters: min_price={min_price}, max_price={max_price}, beds={beds_min}, baths={baths_min}")
        df = scrape_leads(
            location, 
            listing_type, 
            past_days,
            min_price=min_price,
            max_price=max_price,
            beds_min=beds_min,
            baths_min=baths_min
        )
        
        if df is not None and not df.empty:
            # Convert timestamps to string to avoid JSON serialization errors
            for col in df.select_dtypes(include=['datetime', 'datetimetz']).columns:
                df[col] = df[col].astype(str)
            # Fill NaNs to avoid JSON errors
            df = df.fillna('')
            results = df.to_dict('records')
        else:
            results = []
        
        return jsonify({"count": len(results), "results": results})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Use PORT environment variable if available (for deployment), otherwise 5000
    port = int(os.environ.get("PORT", 5000))
    # Host must be '0.0.0.0' to be accessible externally
    app.run(host='0.0.0.0', port=port)
