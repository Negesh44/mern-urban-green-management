import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import CitizenDashboard from './pages/CitizenDashboard';
import AssetDetail from './pages/AssetDetail';
import ReportIssue from './pages/ReportIssue';
import MyReports from './pages/MyReports';
import AdminReports from './pages/AdminReports';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#090d16',
            color: '#f8fafc',
            border: '1px solid #065f46',
            borderRadius: '0.875rem',
            fontSize: '12px',
            fontWeight: '500',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#022c22',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#450a0a',
            },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Public Routes */}
          <Route index element={<Landing />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />

          {/* Admin Protected Routes */}
          <Route
            path="admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/reports"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminReports />
              </ProtectedRoute>
            }
          />

          {/* Citizen & Authenticated Protected Routes */}
          <Route
            path="citizen/dashboard"
            element={
              <ProtectedRoute allowedRoles={['citizen', 'admin']}>
                <CitizenDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="citizen/report"
            element={
              <ProtectedRoute allowedRoles={['citizen', 'admin']}>
                <ReportIssue />
              </ProtectedRoute>
            }
          />
          <Route
            path="citizen/reports"
            element={
              <ProtectedRoute allowedRoles={['citizen', 'admin']}>
                <MyReports />
              </ProtectedRoute>
            }
          />

          {/* Asset Detail Page */}
          <Route
            path="assets/:id"
            element={
              <ProtectedRoute allowedRoles={['citizen', 'admin']}>
                <AssetDetail />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
