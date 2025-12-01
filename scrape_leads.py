from homeharvest import scrape_property
from datetime import datetime
import pandas as pd
import os

def scrape_leads(location, listing_type="for_sale", past_days=30, min_price=None, max_price=None, beds_min=None, baths_min=None):
    """
    Scrapes real estate leads using HomeHarvest and filters them.
    """
    print(f"Scraping {listing_type} properties in {location} from the last {past_days} days...")
    
    try:
        properties = scrape_property(
            location=location,
            listing_type=listing_type,
            past_days=past_days,
        )
    except Exception as e:
        print(f"Error during scraping: {e}")
        # Return empty DataFrame on error
        return pd.DataFrame()
    
    if properties is not None and not properties.empty:
        print(f"Original count: {len(properties)}")
        
        # Filter by Price
        if min_price or max_price:
            # Ensure list_price is numeric
            properties['list_price'] = pd.to_numeric(properties['list_price'], errors='coerce')
            
        if min_price:
            print(f"Filtering min_price: {min_price}")
            properties = properties[properties['list_price'] >= int(min_price)]
        if max_price:
            print(f"Filtering max_price: {max_price}")
            properties = properties[properties['list_price'] <= int(max_price)]
            
        # Filter by Beds
        if beds_min:
            print(f"Filtering beds_min: {beds_min}")
            properties['beds'] = pd.to_numeric(properties['beds'], errors='coerce')
            properties = properties[properties['beds'] >= int(beds_min)]
            
        # Filter by Baths
        if baths_min:
            print(f"Filtering baths_min: {baths_min}")
            properties['full_baths'] = pd.to_numeric(properties['full_baths'], errors='coerce')
            properties = properties[properties['full_baths'] >= int(baths_min)]
            
    print(f"Found {len(properties)} properties after filtering.")
    return properties

def save_leads(properties, filename=None):
    """
    Saves the scraped properties to a CSV file.
    """
    if properties is None or properties.empty:
        print("No properties to save.")
        return

    if filename is None:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"leads_{timestamp}.csv"
    
    # Ensure the directory exists
    os.makedirs("leads", exist_ok=True)
    filepath = os.path.join("leads", filename)
    
    properties.to_csv(filepath, index=False)
    print(f"Leads saved to {filepath}")
    return filepath

if __name__ == "__main__":
    # Example usage
    # You can change these variables to customize your search
    TARGET_LOCATION = "Dallas, TX" 
    LISTING_TYPE = "for_sale" # Options: for_sale, for_rent, sold
    PAST_DAYS = 30

    leads = scrape_leads(TARGET_LOCATION, LISTING_TYPE, PAST_DAYS)
    save_leads(leads)
