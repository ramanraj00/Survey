import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layout & Protection
import AppLayout from './components/common/AppLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import Login from './pages/Login';
import InviteSignup from './pages/Signup/InviteSignup';

// Agent Pages
import AgentDashboard from './pages/Dashboard/AgentDashboard';
import AgentSurveyList from './pages/SurveyList/AgentSurveyList';
import SurveyCreate from './pages/SurveyCreate';
import CommonForm from './pages/Survey/Common';
import ResidentialForm from './pages/Survey/Residential';
import CommercialForm from './pages/Survey/Commercial';
import IndustrialForm from './pages/Survey/Industrial';
import DemandResponseForm from './pages/Survey/DemandResponse';
import SurveySubmit from './pages/SurveySubmit';

// Admin Pages
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import AdminSurveyList from './pages/SurveyList/AdminSurveyList';
import AdminSurveyView from './pages/Survey/Admin/AdminSurveyView';
import AdminAgentsList from './pages/Admin/Agents';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<InviteSignup />} />
        
        {/* Protected Application Routes mapped with AppLayout */}
        <Route path="/" element={<AppLayout />}>
          
          {/* Default Route Redirect based on auth context could happen here, 
              for now redirect to login or dashboard */}
          <Route index element={<Navigate to="/login" replace />} />

          {/* =======================
              AGENT ROUTES (role: agent)
              ======================= */}
          <Route 
            path="agent" 
            element={
              <ProtectedRoute allowedRoles={['agent']}>
                <OutletWrapper />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AgentDashboard />} />
            <Route path="surveys" element={<AgentSurveyList />} />
            <Route path="surveys/new" element={<SurveyCreate />} />
            
            {/* Multi-step survey routes */}
            <Route path="surveys/:id">
              <Route index element={<Navigate to="common" replace />} />
              <Route path="common" element={<CommonForm />} />
              <Route path="residential" element={<ResidentialForm />} />
              <Route path="commercial" element={<CommercialForm />} />
              <Route path="industrial" element={<IndustrialForm />} />
              <Route path="demand-response" element={<DemandResponseForm />} />
              <Route path="submit" element={<SurveySubmit />} />
            </Route>
          </Route>

          {/* =======================
              ADMIN ROUTES (role: admin)
              ======================= */}
          <Route 
            path="admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <OutletWrapper />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="surveys" element={<AdminSurveyList />} />
            <Route path="agents" element={<AdminAgentsList />} />
            {/* Admin 360 view / audit routes */}
            <Route path="surveys/:id" element={<AdminSurveyView />} />
            
            {/* Admin Survey Editor Routes */}
            <Route path="surveys/:id/edit">
              <Route index element={<Navigate to="common" replace />} />
              <Route path="common" element={<CommonForm />} />
              <Route path="residential" element={<ResidentialForm />} />
              <Route path="commercial" element={<CommercialForm />} />
              <Route path="industrial" element={<IndustrialForm />} />
              <Route path="demand-response" element={<DemandResponseForm />} />
              <Route path="submit" element={<SurveySubmit isAdmin={true} />} />
            </Route>
          </Route>

        </Route>

        {/* Catch-all 404 */}
        <Route path="*" element={<div className="flex-center" style={{height: '100vh', color: 'white'}}>404 - Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

// Simple wrapper to render nested routes inside role-protected blocks
import { Outlet } from 'react-router-dom';
function OutletWrapper() {
  return <Outlet />;
}

export default App;
