import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PRODUCTS } from '../config/products';
import './ProductSelect.css';

export default function ProductSelect() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="select-screen">
      <div className="select-topbar">
        <div className="brand">
          <span className="dot" />
          Control Center
        </div>
        <div className="select-user">
          <div className="name">{user?.name}</div>
          <div className="avatar">{user?.name?.[0] || 'U'}</div>
          <button className="logout-btn" onClick={logout}>
            Log out
          </button>
        </div>
      </div>

      <div className="select-body">
        <div className="select-heading">
          <h1>Which product do you want to manage?</h1>
          <p>Pick a product to open its dashboard, customers, support queries and more.</p>
        </div>

        <div className="product-grid">
          {PRODUCTS.map((product) => (
            <button
              key={product.id}
              className="product-card"
              onClick={() => navigate(`/p/${product.id}/dashboard`)}
            >
              <span className="accent-bar" style={{ background: product.accent }} />
              <div className="icon-badge" style={{ background: product.accent }}>
                {product.initials}
              </div>
              <h3>{product.name}</h3>
              <p className="tagline">{product.tagline}</p>
              <span className="tab-count">{product.tabs.length} sections</span>
              <span className="go-arrow">&rarr;</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
