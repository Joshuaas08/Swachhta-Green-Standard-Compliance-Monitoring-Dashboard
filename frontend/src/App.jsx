import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Buildings from './pages/Buildings';
import Criteria from './pages/Criteria';
import NewInspection from './pages/NewInspection';
import InspectionsList from './pages/InspectionsList';
import InspectionDetails from './pages/InspectionDetails';
import Issues from './pages/Issues';
import Analytics from './pages/Analytics';

function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Navbar />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route
              path="/"
              element={
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              }
            />
            <Route
              path="/buildings"
              element={
                <AppLayout>
                  <Buildings />
                </AppLayout>
              }
            />
            <Route
              path="/criteria"
              element={
                <AppLayout>
                  <Criteria />
                </AppLayout>
              }
            />
            <Route
              path="/inspections"
              element={
                <AppLayout>
                  <InspectionsList />
                </AppLayout>
              }
            />
            <Route
              path="/inspections/:id"
              element={
                <AppLayout>
                  <InspectionDetails />
                </AppLayout>
              }
            />
            <Route
              path="/issues"
              element={
                <AppLayout>
                  <Issues />
                </AppLayout>
              }
            />
          </Route>

          {/* Inspector Specific Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'INSPECTOR']} />}>
            <Route
              path="/inspections/new"
              element={
                <AppLayout>
                  <NewInspection />
                </AppLayout>
              }
            />
          </Route>

          {/* Analytics / Executive Specific Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MAINTENANCE']} />}>
            <Route
              path="/analytics"
              element={
                <AppLayout>
                  <Analytics />
                </AppLayout>
              }
            />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
