import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import OfflineBanner from './components/OfflineBanner';

// Pages
import RoleSelection from './pages/RoleSelection';
import Login from './pages/Login';
import TableSelection from './pages/TableSelection';
import OrderTaking from './pages/OrderTaking';
import MenuBrowse from './pages/MenuBrowse';
import BillDetails from './pages/BillDetails';
import OwnerDashboard from './pages/OwnerDashboard';
import OrderHistory from './pages/OrderHistory';
import MenuManagement from './pages/MenuManagement';
import MenuItemForm from './pages/MenuItemForm';
import Settings from './pages/Settings';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate home
    if (user.role === 'owner') {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/tables" replace />;
    }
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RoleSelection />} />
      <Route path="/login" element={<Login />} />
      
      {/* Waiter Routes */}
      <Route
        path="/tables"
        element={
          <ProtectedRoute allowedRoles={['waiter']}>
            <TableSelection />
          </ProtectedRoute>
        }
      />
      <Route
        path="/order/:tableId"
        element={
          <ProtectedRoute allowedRoles={['waiter']}>
            <OrderTaking />
          </ProtectedRoute>
        }
      />
      <Route
        path="/menu"
        element={
          <ProtectedRoute allowedRoles={['waiter']}>
            <MenuBrowse />
          </ProtectedRoute>
        }
      />
      
      {/* Shared Routes */}
      <Route
        path="/bill/:orderId"
        element={
          <ProtectedRoute>
            <BillDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <OrderHistory />
          </ProtectedRoute>
        }
      />
      
      {/* Owner Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['owner']}>
            <OwnerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/menu-management"
        element={
          <ProtectedRoute allowedRoles={['owner']}>
            <MenuManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/menu-item/add"
        element={
          <ProtectedRoute allowedRoles={['owner']}>
            <MenuItemForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/menu-item/edit/:id"
        element={
          <ProtectedRoute allowedRoles={['owner']}>
            <MenuItemForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute allowedRoles={['owner']}>
            <Settings />
          </ProtectedRoute>
        }
      />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Initialize mobile-specific features
const initMobile = async () => {
  if (!Capacitor.isNativePlatform()) return;
  
  try {
    // Set status bar color to match brand
    await StatusBar.setStyle({ style: Style.Light });
    await StatusBar.setBackgroundColor({ color: '#e65000' });
    
    // Hide splash screen after app loads
    await SplashScreen.hide();
  } catch (error) {
    console.log('Mobile init error:', error);
  }
};

function App() {
  useEffect(() => {
    initMobile();
  }, []);

  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <OfflineBanner />
          <AppRoutes />
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

