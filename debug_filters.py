from scrape_leads import scrape_leads
import pandas as pd

def debug_filters():
    print("Running debug scrape...")
    # Simulate the user's request
    location = "Denton, TX"
    max_price = 250000
    
    # We'll just get a few results to inspect the data
    df = scrape_leads(location, past_days=30)
    
    if df is not None and not df.empty:
        print("\nData Types:")
        print(df.dtypes)
        
        print("\nFirst 5 list_price values:")
        print(df['list_price'].head())
        
        print(f"\nFiltering for max_price <= {max_price}...")
        
        # Try the filtering logic exactly as it is in the main script
        filtered_df = df[df['list_price'] <= int(max_price)]
        
        print(f"\nOriginal count: {len(df)}")
        print(f"Filtered count: {len(filtered_df)}")
        
        if not filtered_df.empty:
            print("\nFiltered results (list_price):")
            print(filtered_df['list_price'].head())
            
            # Check if any are actually above the max price (which would be weird if the filter worked)
            bad_results = filtered_df[filtered_df['list_price'] > max_price]
            if not bad_results.empty:
                print("\nERROR: Found results above max price!")
                print(bad_results['list_price'].head())
        else:
            print("No results found after filtering.")

if __name__ == "__main__":
    debug_filters()
