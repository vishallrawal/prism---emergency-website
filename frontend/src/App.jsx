import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import EmergencyRoute from './pages/EmergencyRoute';
import Voice from './pages/Voice';
import NearbyServices from './pages/NearbyServices';
import BloodDonor from './pages/BloodDonor';
import AIAssistant from './pages/AIAssistant';
import UserProfile from './pages/UserProfile';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

function RootRedirect() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to="/home" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          
          <Route path="/admin" element={<AdminLogin />} />

          
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/emergency-route" element={<ProtectedRoute><EmergencyRoute /></ProtectedRoute>} />
          <Route path="/voice" element={<ProtectedRoute><Voice /></ProtectedRoute>} />
          <Route path="/nearby-services" element={<ProtectedRoute><NearbyServices /></ProtectedRoute>} />
          <Route path="/blood-donor" element={<ProtectedRoute><BloodDonor /></ProtectedRoute>} />
          <Route path="/ai-assistant" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />

          
          <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>} />

          
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
