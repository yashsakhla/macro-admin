import { listTags } from '../../../api/macropageConnect/tags';
import { useApiQuery } from '../../../api/macropageConnect/hooks';

// Multi-select tag list, reused wherever the API needs targetIds for
// targetType: 'tag' (notifications, ads).
export default function TagPicker({ value = [], onChange }) {
  const { data: tags, loading, error } = useApiQuery(() => listTags(), []);

  function toggle(id) {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  }

  if (loading) return <span className="cell-sub">Loading tags…</span>;
  if (error) return <span className="cell-sub">Could not load tags.</span>;
  if (!tags || tags.length === 0) return <span className="cell-sub">No tags created yet.</span>;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {tags.map((tag) => (
        <button
          key={tag._id}
          type="button"
          className="tag-chip"
          style={
            value.includes(tag._id)
              ? { background: 'var(--accent)', color: '#fff', borderColor: 'var(--accent)' }
              : undefined
          }
          onClick={() => toggle(tag._id)}
        >
          {tag.name}
        </button>
      ))}
    </div>
  );
}
