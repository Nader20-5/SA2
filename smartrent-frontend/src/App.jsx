import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";

// Auth pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";

// Landlord pages
import LandlordDashboard from "./pages/landlord/LandlordDashboard";
import MyProperties from "./pages/landlord/MyProperties";
import AddProperty from "./pages/landlord/AddProperty";
import EditProperty from "./pages/landlord/EditProperty";
import VisitRequests from "./pages/landlord/VisitRequests";
import RentalRequests from "./pages/landlord/RentalRequests";

// Tenant pages
import Home from "./pages/tenant/Home";
import PropertyDetails from "./pages/tenant/PropertyDetails";
import BookVisit from "./pages/tenant/BookVisit";
import ApplyRental from "./pages/tenant/ApplyRental";
import MyJourney from "./pages/tenant/MyJourney";
import Favorites from "./pages/tenant/Favorites";
import Profile from "./pages/Profile";

import { ROLES } from "./utils/constants";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Navbar />
          <ToastContainer position="top-right" autoClose={3000} />
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<><Home /><Footer /></>} />
            <Route path="/property/:id" element={<><PropertyDetails /><Footer /></>} />

            {/* Admin routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Landlord routes */}
            <Route
              path="/landlord/dashboard"
              element={
                <ProtectedRoute allowedRoles={[ROLES.LANDLORD]}>
                  <LandlordDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/landlord/properties"
              element={
                <ProtectedRoute allowedRoles={[ROLES.LANDLORD]}>
                  <MyProperties />
                </ProtectedRoute>
              }
            />
            <Route
              path="/landlord/properties/add"
              element={
                <ProtectedRoute allowedRoles={[ROLES.LANDLORD]}>
                  <AddProperty />
                </ProtectedRoute>
              }
            />
            <Route
              path="/landlord/properties/edit/:id"
              element={
                <ProtectedRoute allowedRoles={[ROLES.LANDLORD]}>
                  <EditProperty />
                </ProtectedRoute>
              }
            />
            <Route
              path="/landlord/visits"
              element={
                <ProtectedRoute allowedRoles={[ROLES.LANDLORD]}>
                  <VisitRequests />
                </ProtectedRoute>
              }
            />
            <Route
              path="/landlord/rentals"
              element={
                <ProtectedRoute allowedRoles={[ROLES.LANDLORD]}>
                  <RentalRequests />
                </ProtectedRoute>
              }
            />

            {/* Tenant routes */}
            <Route
              path="/book-visit/:propertyId"
              element={
                <ProtectedRoute allowedRoles={[ROLES.TENANT]}>
                  <BookVisit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/apply-rental/:propertyId"
              element={
                <ProtectedRoute allowedRoles={[ROLES.TENANT]}>
                  <ApplyRental />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-journey"
              element={
                <ProtectedRoute allowedRoles={[ROLES.TENANT]}>
                  <><MyJourney /><Footer /></>
                </ProtectedRoute>
              }
            />
            {/* Favorites and Profile */}
            <Route
              path="/favorites"
              element={
                <ProtectedRoute allowedRoles={[ROLES.TENANT, ROLES.LANDLORD, ROLES.ADMIN]}>
                  <><Favorites /><Footer /></>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={[ROLES.TENANT, ROLES.LANDLORD, ROLES.ADMIN]}>
                  <><Profile /><Footer /></>
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;