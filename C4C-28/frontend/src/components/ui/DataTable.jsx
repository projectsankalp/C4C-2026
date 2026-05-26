import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ROWS_PER_PAGE = 10;

const DataTable = ({ columns, data, pagination = false }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = pagination ? Math.max(1, Math.ceil(data.length / ROWS_PER_PAGE)) : 1;
  const startIdx = pagination ? (currentPage - 1) * ROWS_PER_PAGE : 0;
  const endIdx = pagination ? startIdx + ROWS_PER_PAGE : data.length;
  const pageData = data.slice(startIdx, endIdx);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div style={{ width: '100%', overflowX: 'auto', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', backgroundColor: 'white' }}>
        <thead>
          <tr style={{ backgroundColor: 'var(--color-secondary)', color: 'white' }}>
            {columns.map((col, index) => (
              <th key={index} style={{ padding: '12px 16px', fontWeight: '600', fontSize: '14px', borderBottom: '2px solid var(--color-primary)' }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pageData.map((row, rowIndex) => (
            <tr key={rowIndex} style={{ backgroundColor: rowIndex % 2 === 0 ? 'white' : '#F9FAFB', borderBottom: '1px solid #E5E7EB', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#EFF6FF'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = rowIndex % 2 === 0 ? 'white' : '#F9FAFB'}>
              {columns.map((col, colIndex) => (
                <td key={colIndex} style={{ padding: '12px 16px', fontSize: '14px', color: 'var(--color-text)' }}>
                  {col.cell ? col.cell(row) : row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length} style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      
      {pagination && data.length > 0 && (
        <div className="flex justify-between items-center" style={{ padding: '12px 16px', backgroundColor: '#F9FAFB', borderTop: '1px solid var(--color-border)' }}>
          <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            Showing {startIdx + 1} to {Math.min(endIdx, data.length)} of {data.length} entries
          </span>
          <div className="flex gap-2" style={{ alignItems: 'center' }}>
            <button 
              onClick={() => goToPage(currentPage - 1)} 
              disabled={currentPage === 1}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '6px 12px', border: '1px solid var(--color-border)', backgroundColor: 'white', 
                borderRadius: '6px', fontSize: '13px', fontWeight: 500,
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer', 
                opacity: currentPage === 1 ? 0.5 : 1,
                transition: 'all 0.15s',
              }}>
              <ChevronLeft size={14} /> Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
              Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2)
            ).map(page => (
              <button key={page} onClick={() => goToPage(page)}
                style={{ 
                  padding: '6px 10px', minWidth: '32px',
                  border: page === currentPage ? '1px solid var(--color-primary)' : '1px solid var(--color-border)', 
                  backgroundColor: page === currentPage ? 'var(--color-primary)' : 'white', 
                  color: page === currentPage ? 'white' : 'var(--color-text)',
                  borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                  transition: 'all 0.15s',
                }}>
                {page}
              </button>
            ))}
            <button 
              onClick={() => goToPage(currentPage + 1)} 
              disabled={currentPage === totalPages}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '6px 12px', border: '1px solid var(--color-border)', backgroundColor: 'white',
                borderRadius: '6px', fontSize: '13px', fontWeight: 500,
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', 
                opacity: currentPage === totalPages ? 0.5 : 1,
                transition: 'all 0.15s',
              }}>
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
