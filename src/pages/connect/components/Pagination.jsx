import { ChevronLeft, ChevronRight } from 'lucide-react';
import '../connect.css';

export default function Pagination({ page, totalPages, onChange }) {
  if (!totalPages || totalPages <= 1) return null;
  return (
    <div className="connect-pagination">
      <button className="btn-secondary" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        <ChevronLeft size={14} />
      </button>
      <span className="table-toolbar-count">
        Page {page} of {totalPages}
      </span>
      <button className="btn-secondary" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        <ChevronRight size={14} />
      </button>
    </div>
  );
}
