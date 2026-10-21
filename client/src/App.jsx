import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import CitizenDashboard from './pages/CitizenDashboard';
import AssetDetail from './pages/AssetDetail';
import ReportIssue from './pages/ReportIssue';
import MyReports from './pages/MyReports';
import AdminReports from './pages/AdminReports';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

// Smart Home Dispatcher: Automatically routes to role portal or login, bypassing marketing home page
const HomeDispatcher = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-sm text-slate-400">Loading Smart Urban Green Portal...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    if (user?.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/citizen/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
};

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
          {/* Public & Entry Routes */}
          <Route index element={<HomeDispatcher />} />
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
