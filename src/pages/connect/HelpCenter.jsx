import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import HelpDocs from './HelpDocs';
import HelpFaqs from './HelpFaqs';
import './connect.css';

const SECTIONS = [
  { id: 'docs', label: 'Docs' },
  { id: 'faqs', label: 'FAQs' },
];

// This is the real, live self-serve help center for Macropage Connect —
// every create/edit/delete here publishes immediately to the product.
export default function ConnectHelpCenter() {
  const [section, setSection] = useState('docs');

  return (
    <div>
      <div className="connect-live-banner">
        <AlertTriangle size={14} />
        Changes here go live immediately on the real Macropage Connect help center.
      </div>

      <div className="connect-segmented">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            className="btn-secondary"
            style={
              section === s.id
                ? { background: 'var(--accent)', color: '#fff', borderColor: 'var(--accent)' }
                : undefined
            }
            onClick={() => setSection(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {section === 'docs' ? <HelpDocs /> : <HelpFaqs />}
    </div>
  );
}
