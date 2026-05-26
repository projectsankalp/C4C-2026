/**
 * GraamSehat Admin Dashboard - Search Bar Component
 * Location: /src/components/SearchBar.jsx
 */

import React from 'react';
import { Search, X } from 'lucide-react';
import './SearchBar.css';

export default function SearchBar({ value, onChange, placeholder = 'Search...', onClear }) {
  return (
    <div className="search-bar-wrapper">
      <Search size={18} className="search-bar-icon" />
      <input 
        type="text" 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        placeholder={placeholder}
        className="form-input search-bar-input"
      />
      {value && onClear && (
        <button className="search-bar-clear" onClick={onClear}>
          <X size={16} />
        </button>
      )}
    </div>
  );
}
