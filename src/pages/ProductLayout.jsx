import { NavLink, Navigate, Outlet, useParams, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  LifeBuoy,
  CreditCard,
  MessageCircle,
  Target,
  ListChecks,
  Bell,
  Monitor,
  FileText,
  ArrowLeft,
  HelpCircle,
  Puzzle,
} from 'lucide-react';
import { getProduct, TAB_LABELS } from '../config/products';
import { useAuth } from '../context/AuthContext';
import './ProductLayout.css';

const TAB_ICONS = {
  dashboard: LayoutDashboard,
  customers: Users,
  'support-query': LifeBuoy,
  plans: CreditCard,
  'live-chat': MessageCircle,
  'generate-leads': Target,
  'manage-leads': ListChecks,
  'push-notifications': Bell,
  'ads-popup': Monitor,
  templates: FileText,
  'help-center': HelpCircle,
  'integration-platforms': Puzzle,
};

const COMMON_TABS = ['dashboard', 'customers', 'support-query'];
const CONFIG_TABS = ['integration-platforms'];

export default function ProductLayout() {
  const { productId } = useParams();
  const { user } = useAuth();
  const location = useLocation();
  const product = getProduct(productId);

  if (!product) return <Navigate to="/" replace />;

  const pathParts = location.pathname.split('/').filter(Boolean);
  const currentTab = pathParts[2] || 'dashboard';
  const commonTabs = product.tabs.filter((t) => COMMON_TABS.includes(t));
  const configTabs = product.tabs.filter((t) => CONFIG_TABS.includes(t));
  const extraTabs = product.tabs.filter((t) => !COMMON_TABS.includes(t) && !CONFIG_TABS.includes(t));
  const currentLabel = TAB_LABELS[currentTab] || 'Dashboard';

  return (
    <div
      className="shell"
      style={{ '--accent': product.accent, '--accent-soft': product.accentSoft }}
    >
      <aside className="sidebar">
        <NavLink to="/" className="sidebar-back">
          <ArrowLeft size={14} />
          All products
        </NavLink>

        <div className="sidebar-product">
          <div className="badge" style={{ background: product.accent }}>
            {product.initials}
          </div>
          <div className="info">
            <h4>{product.name}</h4>
            <span>{product.tagline}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">General</div>
          {commonTabs.map((tab) => {
            const Icon = TAB_ICONS[tab];
            return (
              <NavLink
                key={tab}
                to={`/p/${product.id}/${tab}`}
                className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
              >
                <Icon />
                {TAB_LABELS[tab]}
              </NavLink>
            );
          })}

          {extraTabs.length > 0 && (
            <>
              <div className="sidebar-section-label">Growth</div>
              {extraTabs.map((tab) => {
                const Icon = TAB_ICONS[tab];
                return (
                  <NavLink
                    key={tab}
                    to={`/p/${product.id}/${tab}`}
                    className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
                  >
                    <Icon />
                    {TAB_LABELS[tab]}
                  </NavLink>
                );
              })}
            </>
          )}

          {configTabs.length > 0 && (
            <>
              <div className="sidebar-section-label">Configuration</div>
              {configTabs.map((tab) => {
                const Icon = TAB_ICONS[tab];
                return (
                  <NavLink
                    key={tab}
                    to={`/p/${product.id}/${tab}`}
                    className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
                  >
                    <Icon />
                    {TAB_LABELS[tab]}
                  </NavLink>
                );
              })}
            </>
          )}
        </nav>

        <div className="sidebar-footer">Signed in as {user?.name}</div>
      </aside>

      <div className="content-area">
        <div className="content-topbar">
          <div>
            <h2>{currentLabel}</h2>
            <div className="breadcrumb">
              {product.name} / {currentLabel}
            </div>
          </div>
          <span className="accent-chip">{product.name}</span>
        </div>

        <div className="content-main">
          <Outlet context={{ product }} />
        </div>
      </div>
    </div>
  );
}
