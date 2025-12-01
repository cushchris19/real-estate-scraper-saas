import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import './index.css';

function ScraperApp() {
  const [location, setLocation] = useState('');
  const [listingType, setListingType] = useState('for_sale');
  const [pastDays, setPastDays] = useState(30);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [bedsMin, setBedsMin] = useState('');
  const [bathsMin, setBathsMin] = useState('');
  const [results, setResults] = useState([]);
  const [sortConfig, setSortConfig] = useState([]); // Array of { key, direction }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { user, isAdmin, logout } = useAuth();
  console.log("App Render. User:", user);

  const sortedResults = React.useMemo(() => {
    let sortableItems = [...results];
    if (sortConfig.length > 0) {
      sortableItems.sort((a, b) => {
        for (const config of sortConfig) {
          let aValue = a[config.key];
          let bValue = b[config.key];

          // Handle numeric values
          if (['list_price', 'beds', 'full_baths', 'sqft'].includes(config.key)) {
            aValue = Number(aValue) || 0;
            bValue = Number(bValue) || 0;
          }

          if (aValue < bValue) {
            return config.direction === 'ascending' ? -1 : 1;
          }
          if (aValue > bValue) {
            return config.direction === 'ascending' ? 1 : -1;
          }
        }
        return 0;
      });
    }
    return sortableItems;
  }, [results, sortConfig]);

  if (!user) {
    return <Login />;
  }

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const queryParams = new URLSearchParams({
        location,
        listing_type: listingType,
        past_days: pastDays,
        min_price: minPrice,
        max_price: maxPrice,
        beds_min: bedsMin,
        baths_min: bathsMin
      });

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
      console.log("Fetching from:", API_BASE_URL);
      const response = await fetch(`${API_BASE_URL}/api/scrape?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      setResults(data.results || []);
    } catch (err) {
      console.error("Fetch error details:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const requestSort = (key, event) => {
    let direction = 'ascending';
    let newSortConfig = [...sortConfig];

    // Check if key is already being sorted
    const existingIndex = newSortConfig.findIndex(item => item.key === key);

    if (existingIndex >= 0) {
      // If already sorted, toggle direction or remove if it was descending
      if (newSortConfig[existingIndex].direction === 'ascending') {
        newSortConfig[existingIndex].direction = 'descending';
      } else {
        // If it was descending, remove it from sort
        newSortConfig.splice(existingIndex, 1);
      }
    } else {
      // Add new sort key
      // If Shift key is not pressed, replace entire sort config
      if (!event.shiftKey) {
        newSortConfig = [{ key, direction }];
      } else {
        newSortConfig.push({ key, direction });
      }
    }

    setSortConfig(newSortConfig);
  };

  const getSortIndicator = (key) => {
    const index = sortConfig.findIndex(item => item.key === key);
    if (index >= 0) {
      const item = sortConfig[index];
      const arrow = item.direction === 'ascending' ? ' ↑' : ' ↓';
      // Show priority number if multiple sorts
      return sortConfig.length > 1 ? `${arrow} (${index + 1})` : arrow;
    }
    return '';
  };

  const downloadCSV = () => {
    if (sortedResults.length === 0) return;

    const headers = Object.keys(sortedResults[0]).join(',');
    const rows = sortedResults.map(row => Object.values(row).map(val => `"${val}"`).join(','));
    const csvContent = [headers, ...rows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_${location}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`glass-container ${isAdmin ? 'admin-theme' : ''}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className={isAdmin ? 'glitch-text' : ''}>
          {isAdmin ? 'GOD MODE: ACTIVE' : 'Real Estate Lead Scraper'}
        </h1>
        <button onClick={logout} className="logout-btn" style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>
          Logout
        </button>
      </div>

      <form className="search-form" onSubmit={handleSearch}>
        <div className="input-group">
          <label>Location</label>
          <input
            type="text"
            placeholder="City, State or Zip (e.g. Dallas, TX)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label>Listing Type</label>
          <select value={listingType} onChange={(e) => setListingType(e.target.value)}>
            <option value="for_sale">For Sale</option>
            <option value="for_rent">For Rent</option>
            <option value="sold">Sold</option>
          </select>
        </div>

        <div className="input-group">
          <label>Past Days</label>
          <input
            type="number"
            value={pastDays}
            onChange={(e) => setPastDays(e.target.value)}
            min="1"
            max="365"
          />
        </div>

        <div className="input-group">
          <label>Min Price</label>
          <input
            type="number"
            placeholder="Min Price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>Max Price</label>
          <input
            type="number"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>Min Beds</label>
          <input
            type="number"
            placeholder="Beds"
            value={bedsMin}
            onChange={(e) => setBedsMin(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>Min Baths</label>
          <input
            type="number"
            placeholder="Baths"
            value={bathsMin}
            onChange={(e) => setBathsMin(e.target.value)}
          />
        </div>

        <button type="submit" disabled={loading} className={isAdmin ? 'admin-btn' : ''}>
          {loading ? 'Scraping...' : 'Search Leads'}
        </button>
      </form>

      {error && (
        <div className="error">
          <p><strong>Error:</strong> {error}</p>
          <p><small>Backend URL: {import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'}</small></p>
        </div>
      )}

      {results.length > 0 && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>Found {results.length} Properties</h3>
            <button className="download-btn" onClick={downloadCSV}>Download CSV</button>
          </div>

          <div className="results-table-container">
            <table className="results-table">
              <thead>
                <tr>
                  <th>Address</th>
                  <th onClick={(e) => requestSort('list_price', e)}>Price{getSortIndicator('list_price')}</th>
                  <th onClick={(e) => requestSort('beds', e)}>Beds{getSortIndicator('beds')}</th>
                  <th onClick={(e) => requestSort('full_baths', e)}>Baths{getSortIndicator('full_baths')}</th>
                  <th onClick={(e) => requestSort('sqft', e)}>Sqft{getSortIndicator('sqft')}</th>
                  <th>Link</th>
                </tr>
              </thead>
              <tbody>
                {sortedResults.slice(0, 50).map((property, index) => (
                  <tr key={index}>
                    <td>{property.street}, {property.city}, {property.state}</td>
                    <td>${Number(property.list_price)?.toLocaleString() || 'N/A'}</td>
                    <td>{property.beds || '-'}</td>
                    <td>{property.full_baths || '-'}</td>
                    <td>{Number(property.sqft)?.toLocaleString() || '-'}</td>
                    <td>
                      <a href={property.property_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--secondary-color)' }}>
                        View
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {results.length > 50 && <p style={{ textAlign: 'center', opacity: 0.7, marginTop: '1rem' }}>Showing first 50 results. Download CSV for full list.</p>}
          </div>
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ScraperApp />
    </AuthProvider>
  );
}
