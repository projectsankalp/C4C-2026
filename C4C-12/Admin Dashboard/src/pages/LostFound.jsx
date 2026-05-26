/**
 * GraamSehat Admin Dashboard - Lost & Found Page
 * Location: /src/pages/LostFound.jsx
 */

import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { searchLostFound } from '../firebase/patients.admin';
import LostFoundCard from '../components/LostFoundCard';
import AlertBanner from '../components/AlertBanner';
import { ShieldAlert, Search, Info } from 'lucide-react';
import './LostFound.css';

export default function LostFound() {
  const { currentAdmin } = useAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) {
      alert('Please enter a name, village, or UID prefix.');
      return;
    }

    try {
      setSearching(true);
      const data = await searchLostFound(currentAdmin.uid, query);
      setResults(data);
      setHasSearched(true);
    } catch (error) {
      console.error(error);
      alert('Error searching patient records. Verify connections.');
    } finally {
      setSearching(false);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setResults([]);
    setHasSearched(false);
  };

  return (
    <div className="lost-found-page">
      <div className="lost-found-header no-print">
        <h1>Emergency Contact Retrieval</h1>
        <p className="subtitle">Retrieve full contact numbers and demographic records for patients in emergency scenarios without OTP confirmation.</p>
      </div>

      {/* Authorized Use Banner */}
      <AlertBanner 
        message="SECURITY WARNING: This system is for authorised admin use only. All search queries, results returned, and viewing logs are audit-recorded to Firestore." 
        type="error"
      />

      {/* Search Input Box */}
      <div className="glass-card lost-found-search no-print">
        <form onSubmit={handleSearchSubmit} className="search-form-row">
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter patient full name, partial name, village, or UID prefix digits..."
              className="form-input search-box-field"
              required
            />
          </div>
          <div className="search-action-btns">
            <button type="submit" className="btn btn-primary" disabled={searching}>
              {searching ? 'Querying...' : 'Retrieve Info'}
            </button>
            {hasSearched && (
              <button type="button" className="btn btn-secondary" onClick={handleClear}>
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Search Logs Audit details info banner */}
      <div className="glass-card info-audit-bar no-print">
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Info size={16} style={{ color: 'var(--primary-dark)' }} />
          <span>Your ID: <strong>{currentAdmin.uid}</strong> will be tagged on this lookup session history.</span>
        </div>
      </div>

      {/* Results grid */}
      <div className="lost-found-results-section">
        {searching && <div className="loading-results">Verifying credentials and compiling search query...</div>}

        {!searching && hasSearched && (
          <div className="results-wrapper">
            <div className="results-summary">
              Found <strong>{results.length}</strong> matching record{results.length !== 1 ? 's' : ''} (capped at 20).
            </div>
            
            {results.length === 0 ? (
              <div className="glass-card no-results-card">
                <ShieldAlert size={36} className="no-res-icon" />
                <h3>No records matched your search query</h3>
                <p>Verify spelling or prefix numbers. Search query was audit-logged.</p>
              </div>
            ) : (
              <div className="lost-found-cards-grid">
                {results.map((patient) => (
                  <LostFoundCard key={patient.id} patient={patient} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
