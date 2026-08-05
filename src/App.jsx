import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import EnvironmentBadge from './components/EnvironmentBadge';
import Login from './pages/Login';
import ProductSelect from './pages/ProductSelect';
import ProductLayout from './pages/ProductLayout';
import GenerateLeads from './pages/GenerateLeads';
import ManageLeads from './pages/ManageLeads';
import {
  DashboardRoute,
  CustomersRoute,
  CustomerDetailsRoute,
  SupportQueryRoute,
  QueryDetailRoute,
  PlansRoute,
  LiveChatRoute,
  PushNotificationsRoute,
  AdsPopupRoute,
  TemplatesRoute,
  HelpCenterRoute,
  IntegrationPlatformsRoute,
  VideosRoute,
  DemoRequestsRoute,
} from './pages/connect/RouteSwitch';

export default function App() {
  return (
    <AuthProvider>
      <EnvironmentBadge />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <ProductSelect />
              </ProtectedRoute>
            }
          />

          <Route
            path="/p/:productId"
            element={
              <ProtectedRoute>
                <ProductLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardRoute />} />
            <Route path="customers" element={<CustomersRoute />} />
            <Route path="customers/:customerId" element={<CustomerDetailsRoute />} />
            <Route path="support-query" element={<SupportQueryRoute />} />
            <Route path="support-query/:ticketId" element={<QueryDetailRoute />} />
            <Route path="plans" element={<PlansRoute />} />
            <Route path="live-chat" element={<LiveChatRoute />} />
            <Route path="generate-leads" element={<GenerateLeads />} />
            <Route path="manage-leads" element={<ManageLeads />} />
            <Route path="push-notifications" element={<PushNotificationsRoute />} />
            <Route path="ads-popup" element={<AdsPopupRoute />} />
            <Route path="templates" element={<TemplatesRoute />} />
            <Route path="help-center" element={<HelpCenterRoute />} />
            <Route path="integration-platforms" element={<IntegrationPlatformsRoute />} />
            <Route path="videos" element={<VideosRoute />} />
            <Route path="demo-requests" element={<DemoRequestsRoute />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
