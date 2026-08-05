// Route-level fork point: picks the Macropage Connect (real API) page for
// macropage-connect and leaves every other product on the original,
// untouched mock-data component. Keeps the shared tab/route structure in
// App.jsx intact while isolating Connect's data layer.

import { useParams, Navigate } from 'react-router-dom';

import Dashboard from '../Dashboard';
import Customers from '../Customers';
import CustomerDetails from '../CustomerDetails';
import SupportQuery from '../SupportQuery';
import QueryDetail from '../QueryDetail';
import Plans from '../Plans';
import LiveChat from '../LiveChat';
import PushNotifications from '../PushNotifications';
import AdsPopup from '../AdsPopup';
import Templates from '../Templates';

import ConnectDashboard from './Dashboard';
import ConnectCustomers from './Customers';
import ConnectCustomerDetails from './CustomerDetails';
import ConnectSupportQuery from './SupportQuery';
import ConnectQueryDetail from './QueryDetail';
import ConnectPlans from './Plans';
import ConnectLiveChat from './LiveChat';
import ConnectNotifications from './Notifications';
import ConnectAdsPopup from './AdsPopup';
import ConnectTemplates from './Templates';
import ConnectHelpCenter from './HelpCenter';
import ConnectIntegrationPlatforms from './IntegrationPlatforms';
import ConnectVideos from './Videos';
import ConnectDemoRequests from './DemoRequests';

const IS_CONNECT = 'macropage-connect';

export function DashboardRoute() {
  const { productId } = useParams();
  return productId === IS_CONNECT ? <ConnectDashboard /> : <Dashboard />;
}

export function CustomersRoute() {
  const { productId } = useParams();
  return productId === IS_CONNECT ? <ConnectCustomers /> : <Customers />;
}

export function CustomerDetailsRoute() {
  const { productId } = useParams();
  return productId === IS_CONNECT ? <ConnectCustomerDetails /> : <CustomerDetails />;
}

export function SupportQueryRoute() {
  const { productId } = useParams();
  return productId === IS_CONNECT ? <ConnectSupportQuery /> : <SupportQuery />;
}

export function QueryDetailRoute() {
  const { productId } = useParams();
  return productId === IS_CONNECT ? <ConnectQueryDetail /> : <QueryDetail />;
}

export function PlansRoute() {
  const { productId } = useParams();
  return productId === IS_CONNECT ? <ConnectPlans /> : <Plans />;
}

export function LiveChatRoute() {
  const { productId } = useParams();
  return productId === IS_CONNECT ? <ConnectLiveChat /> : <LiveChat />;
}

export function PushNotificationsRoute() {
  const { productId } = useParams();
  return productId === IS_CONNECT ? <ConnectNotifications /> : <PushNotifications />;
}

export function AdsPopupRoute() {
  const { productId } = useParams();
  return productId === IS_CONNECT ? <ConnectAdsPopup /> : <AdsPopup />;
}

export function TemplatesRoute() {
  const { productId } = useParams();
  return productId === IS_CONNECT ? <ConnectTemplates /> : <Templates />;
}

// Connect-exclusive — there's no mock equivalent for other products, so a
// stray visit just bounces back to that product's dashboard.
export function HelpCenterRoute() {
  const { productId } = useParams();
  return productId === IS_CONNECT ? <ConnectHelpCenter /> : <Navigate to={`/p/${productId}/dashboard`} replace />;
}

// Connect-exclusive — these are the third-party platforms surfaced inside
// Macropage Connect specifically, so there's no mock equivalent either.
export function IntegrationPlatformsRoute() {
  const { productId } = useParams();
  return productId === IS_CONNECT ? <ConnectIntegrationPlatforms /> : <Navigate to={`/p/${productId}/dashboard`} replace />;
}

// Connect-exclusive — tutorial videos surfaced inside Macropage Connect
// specifically, so there's no mock equivalent either.
export function VideosRoute() {
  const { productId } = useParams();
  return productId === IS_CONNECT ? <ConnectVideos /> : <Navigate to={`/p/${productId}/dashboard`} replace />;
}

// Connect-exclusive — demo requests submitted through Macropage Connect
// specifically, so there's no mock equivalent either.
export function DemoRequestsRoute() {
  const { productId } = useParams();
  return productId === IS_CONNECT ? <ConnectDemoRequests /> : <Navigate to={`/p/${productId}/dashboard`} replace />;
}
