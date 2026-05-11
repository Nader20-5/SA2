import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getAllUsers,
  updateUserStatus,
  getPlatformStats,
  getAllPropertiesAdmin,
  updatePropertyStatusAdmin,
} from "../../services/adminService";

import "./AdminDashboard.css";

// ─── Helper: Format date ────────────────────────
const formatDate = (dateString) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// ─── Helper: Format price ───────────────────────
const formatPrice = (price) => {
  if (price == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EGP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

// ─── Helper: Get initials ────────────────────────
const getInitials = (name) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const AdminDashboard = () => {
  const { user, logout, token } = useAuth();

  // Data state
  const [allUsers, setAllUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingProperties, setPendingProperties] = useState([]);
  const [allProperties, setAllProperties] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeLandlords: 0,
    totalProperties: 0,
    activeProperties: 0,
    pendingApprovals: 0,
  });
  
  const [loading, setLoading] = useState(true);

  // Tabs
  const [activeTab, setActiveTab] = useState("dashboard");

  // Alert
  const [alert, setAlert] = useState(null);

  // Action in progress
  const [actionInProgress, setActionInProgress] = useState(null);

  // ─── Fetch Data ─────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsData, usersData, pendingUsersData, propertiesData, pendingPropsData] = await Promise.all([
        getPlatformStats(),
        getAllUsers({ page: 0, size: 100 }),
        getAllUsers({ page: 0, size: 100, status: "PENDING", role: "LANDLORD" }),
        getAllPropertiesAdmin({ page: 0, size: 100 }),
        getAllPropertiesAdmin({ page: 0, size: 100, status: "PENDING" }),
      ]);
      setStats(statsData || { totalUsers: 0, activeLandlords: 0, totalProperties: 0, activeProperties: 0, pendingApprovals: 0 });
      setAllUsers(usersData?.content || usersData || []);
      setPendingUsers(pendingUsersData?.content || pendingUsersData || []);
      setAllProperties(propertiesData?.content || propertiesData || []);
      setPendingProperties(pendingPropsData?.content || pendingPropsData || []);
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── Auto-dismiss alert ─────────────────────
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  // ─── Actions ───────────────────────
  const handleToggleUserStatus = async (id, name, currentStatus) => {
    setActionInProgress(`toggle-user-${id}`);
    try {
      const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      await updateUserStatus(id, newStatus);
      setAllUsers((prev) => prev.map(u => u.id === id ? { ...u, status: newStatus } : u));
      setAlert({ type: "success", message: `User "${name}" status updated successfully.` });
    } catch (error) {
      setAlert({ type: "error", message: `Failed to update status for user "${name}".` });
    } finally {
      setActionInProgress(null);
    }
  };

  const handleUpdatePropertyStatus = async (id, title, status) => {
    setActionInProgress(`prop-status-${id}`);
    try {
      await updatePropertyStatusAdmin(id, status, status === "REJECTED" ? "Admin rejected" : "");
      
      // Update local states
      if (status === "APPROVED") {
        const propToMove = pendingProperties.find(p => p.id === id);
        if (propToMove) {
           setPendingProperties(prev => prev.filter(p => p.id !== id));
           setAllProperties(prev => prev.map(p => p.id === id ? { ...p, status: "APPROVED" } : p));
        }
      } else if (status === "REJECTED") {
        setPendingProperties(prev => prev.filter(p => p.id !== id));
        setAllProperties(prev => prev.map(p => p.id === id ? { ...p, status: "REJECTED" } : p));
      }
      
      setAlert({ type: "success", message: `Property "${title}" has been ${status}.` });
      fetchData(); // refresh stats
    } catch (error) {
      setAlert({ type: "error", message: `Failed to update property "${title}".` });
    } finally {
      setActionInProgress(null);
    }
  };

  return (
    <div className="admin-layout">
      {/* ═══════════════════════════════════
          SIDEBAR
      ═══════════════════════════════════ */}
      <aside className="admin-sidebar">
        <div className="sidebar-logo">SmartRent</div>

        <nav className="sidebar-nav">
          <button
            className={`sidebar-nav-item ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
            id="sidebar-dashboard"
          >
            <span className="sidebar-nav-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
            </span>
            Dashboard
          </button>


          <div className="sidebar-divider"></div>
          <div className="sidebar-section-label">Management</div>


          <button 
            className={`sidebar-nav-item ${activeTab === "all-users" ? "active" : ""}`} 
            onClick={() => setActiveTab("all-users")}
            id="sidebar-all-users"
          >
            <span className="sidebar-nav-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </span>
            All Users
          </button>

          <button 
            className={`sidebar-nav-item ${activeTab === "pending-users" ? "active" : ""}`} 
            onClick={() => setActiveTab("pending-users")}
          >
            <span className="sidebar-nav-icon">⏳</span>
            Pending Landlords
          </button>

          <button 
            className={`sidebar-nav-item ${activeTab === "all-properties" ? "active" : ""}`} 
            onClick={() => setActiveTab("all-properties")}
          >
            <span className="sidebar-nav-icon">🏠</span>
            All Properties
          </button>

          <button 
            className={`sidebar-nav-item ${activeTab === "pending-properties" ? "active" : ""}`} 
            onClick={() => setActiveTab("pending-properties")}
          >
            <span className="sidebar-nav-icon">⚠️</span>
            Pending Properties
          </button>


        </nav>

        <div className="sidebar-bottom">
          <button className="sidebar-logout" onClick={logout} id="sidebar-logout">
            <span className="sidebar-nav-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </span>
            Logout
          </button>
        </div>
      </aside>

      {/* ═══════════════════════════════════
          MAIN CONTENT
      ═══════════════════════════════════ */}
      <main className="admin-main">
        {/* ─── Top Bar ──────────────────── */}
        <div className="admin-topbar">
          <div className="admin-topbar-left">
            <h1>Admin Dashboard</h1>
            <p>System overview and verification requests.</p>
          </div>
          <div className="admin-topbar-right">

            <div className="topbar-user">
              <div className="topbar-user-info">
                <div className="topbar-user-name">{user?.fullName || "Admin"}</div>
                <div className="topbar-user-role">System Admin</div>
              </div>
              <div className="topbar-avatar">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt={user.fullName} />
                ) : (
                  getInitials(user?.fullName || "Admin")
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ─── Stats Row ─────────────────── */}
        {activeTab === "dashboard" && (
          <div className="admin-stats">
            <div className="stat-card green">
              <div className="stat-label">Total Users</div>
              <div className="stat-number">{stats.totalUsers}</div>
              <div className="stat-sub green">
                <span className="stat-sub-icon">📈</span> Live DB Stats
              </div>
            </div>

            <div className="stat-card teal">
              <div className="stat-label">Active Landlords</div>
              <div className="stat-number">{stats.activeLandlords}</div>
              <div className="stat-sub teal">
                <span className="stat-sub-icon">✅</span> Live DB Stats
              </div>
            </div>

            <div className="stat-card navy">
              <div className="stat-label">Active Properties</div>
              <div className="stat-number">{stats.activeProperties}</div>
              <div className="stat-sub navy">
                <span className="stat-sub-icon">🏠</span> Approved & Live
              </div>
            </div>

            <div className="stat-card red">
              <div className="stat-label">Pending Approvals</div>
              <div className="stat-number">{stats.pendingApprovals}</div>
              <div className="stat-sub red">
                <span className="stat-sub-icon">⚠️</span> Requires Action
              </div>
            </div>
          </div>
        )}

        {/* ─── Alert ──────────────────── */}
        {alert && (
          <div className={`admin-alert ${alert.type}`} id="admin-alert">
            <span className="admin-alert-icon">
              {alert.type === "success" ? "✅" : "❌"}
            </span>
            <span className="admin-alert-text">{alert.message}</span>
            <button className="admin-alert-close" onClick={() => setAlert(null)}>×</button>
          </div>
        )}

        {/* ─── Table Content ───────────── */}
        <div className="admin-table-container">
          {loading ? (
            <div className="admin-loading">
              <div className="admin-loading-spinner"></div>
              <div className="admin-loading-text">Loading dynamic data...</div>
            </div>
          ) : activeTab === "dashboard" ? (
             <div className="admin-empty">
                <div className="admin-empty-icon">📊</div>
                <div className="admin-empty-text">Welcome to the Admin Dashboard</div>
                <div className="admin-empty-sub">Overview of the system health and key metrics. Navigate via sidebar.</div>
             </div>
          ) : activeTab === "all-users" ? (
            <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map((u) => (
                      <tr key={u.id}>
                         <td>
                           <div>
                             <div className="table-name">{u.firstName} {u.lastName}</div>
                             <div className="table-id">ID: #{u.id}</div>
                           </div>
                         </td>
                         <td>{u.email}</td>
                         <td>{u.role}</td>
                         <td><span className={u.status === "ACTIVE" ? "status-badge active" : "status-badge inactive"}>{u.status}</span></td>
                         <td>
                           <div className="admin-actions">
                             <button 
                                className={u.status === "ACTIVE" ? "btn-reject" : "btn-approve"} 
                                onClick={() => handleToggleUserStatus(u.id, `${u.firstName} ${u.lastName}`, u.status)} 
                                disabled={!!actionInProgress}
                              >
                               {u.status === "ACTIVE" ? "Deactivate" : "Activate"}
                             </button>
                           </div>
                         </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          ) : activeTab === "pending-users" ? (
            <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr><th>Landlord</th><th>Email</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {pendingUsers.length === 0 ? <tr><td colSpan="4">No pending landlords.</td></tr> : pendingUsers.map((u) => (
                      <tr key={u.id}>
                         <td><div className="table-name">{u.firstName} {u.lastName}</div></td>
                         <td>{u.email}</td>
                         <td><span className="status-badge pending">PENDING</span></td>
                         <td>
                           <div className="admin-actions">
                             <button className="btn-approve" onClick={() => handleToggleUserStatus(u.id, u.firstName, "PENDING")} disabled={!!actionInProgress}>Approve</button>
                           </div>
                         </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          ) : activeTab === "all-properties" ? (
            <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr><th>Property</th><th>Location</th><th>Rent</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {allProperties.map((p) => (
                      <tr key={p.id}>
                         <td><div className="table-name">{p.title}</div><div className="table-id">{p.type}</div></td>
                         <td>{p.city}</td>
                         <td>{formatPrice(p.monthlyRent)}</td>
                         <td><span className={`status-badge ${p.status?.toLowerCase()}`}>{p.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          ) : activeTab === "pending-properties" ? (
            <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr><th>Property</th><th>Location</th><th>Rent</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {pendingProperties.length === 0 ? <tr><td colSpan="4">No pending properties.</td></tr> : pendingProperties.map((p) => (
                      <tr key={p.id}>
                         <td><div className="table-name">{p.title}</div></td>
                         <td>{p.city}</td>
                         <td>{formatPrice(p.monthlyRent)}</td>
                         <td>
                           <div className="admin-actions">
                             <button className="btn-approve" onClick={() => handleUpdatePropertyStatus(p.id, p.title, "APPROVED")} disabled={!!actionInProgress}>Approve</button>
                             <button className="btn-reject" onClick={() => handleUpdatePropertyStatus(p.id, p.title, "REJECTED")} disabled={!!actionInProgress}>Reject</button>
                           </div>
                         </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          ) : null}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
