/**
 * GraamSehat Admin Dashboard - Export Utilities
 * Location: /src/utils/exportUtils.js
 */

import Papa from 'papaparse';

/**
 * Exports data to CSV.
 * @param {Array<object>} data - Array of objects to export
 * @param {string} filename - Output file name
 */
export const exportToCSV = (data, filename = 'export.csv') => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }
  
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Triggers browser print, which defaults to saving as PDF if set in the browser print options.
 * Requires print-specific styling (in index.css) to hide navigation elements.
 */
export const exportToPDF = () => {
  window.print();
};
