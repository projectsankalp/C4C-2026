/**
 * GraamSehat Admin Dashboard - Export Button Component
 * Location: /src/components/ExportButton.jsx
 */

import React from 'react';
import { Download, FileText } from 'lucide-react';
import { exportToCSV, exportToPDF } from '../utils/exportUtils';

export default function ExportButton({ data, filename = 'report', type = 'csv', label = 'Export' }) {
  const handleExport = () => {
    if (type === 'csv') {
      // If data is a function, call it first
      const exportData = typeof data === 'function' ? data() : data;
      exportToCSV(exportData, `${filename}_${Date.now()}.csv`);
    } else if (type === 'pdf') {
      exportToPDF();
    }
  };

  return (
    <button className="btn btn-secondary" onClick={handleExport}>
      {type === 'csv' ? <Download size={16} /> : <FileText size={16} />}
      <span>{label}</span>
    </button>
  );
}
