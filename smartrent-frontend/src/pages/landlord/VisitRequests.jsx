import React, { useEffect, useState } from 'react';
import { getLandlordVisits, approveVisit, rejectVisit } from '../../services/visitService';
import { toast } from 'react-toastify';
import Sidebar from '../../components/common/Sidebar';
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaMapMarkerAlt,
  FaUser,
  FaEnvelope,
} from 'react-icons/fa';

const STATUS_CONFIG = {
  ACCEPTED: { color: 'var(--color-success)', bg: 'rgba(16,185,129,0.12)', icon: FaCheckCircle },
  APPROVED: { color: 'var(--color-success)', bg: 'rgba(16,185,129,0.12)', icon: FaCheckCircle },
  REJECTED: { color: 'var(--color-error)', bg: 'rgba(239,68,68,0.12)', icon: FaTimesCircle },
  PENDING: { color: 'var(--color-warning)', bg: 'rgba(245,158,11,0.12)', icon: FaClock },
  CANCELLED: { color: 'var(--color-text-muted)', bg: 'var(--color-bg-elevated)', icon: FaTimesCircle },
};

const VisitRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await getLandlordVisits();
      let items = [];
      if (Array.isArray(res)) items = res;
      else if (res?.data?.items) items = res.data.items;
      else if (Array.isArray(res?.data)) items = res.data;
      setRequests(items);
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error("Failed to load visit requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id, action) => {
    try {
      if (action === 'approve') {
        await approveVisit(id);
        toast.success("Visit Request Accepted!");
      } else {
        const reason = prompt("Please enter rejection reason:");
        if (reason === null) return; 
        
        await rejectVisit(id, reason);
        toast.info("Visit Request Rejected");
      }
      fetchRequests();
    } catch (error) {
      toast.error("Action failed. Please try again.");
    }
  };

  const filteredRequests = requests.filter(req => 
    filter === 'All' ? true : (req.status === filter.toUpperCase() || (filter === 'Accepted' && req.status === 'APPROVED'))
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    return timeStr;
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-content">
        <div className="dashboard-header">
          <div>
            <nav className="dashboard-breadcrumb" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Management / Visit Requests
            </nav>
            <h1 className="dashboard-title">Visit Requests</h1>
            <p className="dashboard-subtitle">Manage site visit applications and schedule tours for your properties.</p>
          </div>
        </div>

        <div className="dashboard-tabs" style={{ marginBottom: 'var(--space-6)' }}>
          {['All', 'Pending', 'Accepted', 'Rejected'].map(statusOption => (
            <button 
              key={statusOption} 
              onClick={() => setFilter(statusOption)}
              className={`dashboard-tab ${filter === statusOption ? 'is-active' : ''}`}
            > 
              {statusOption} 
              {statusOption !== 'All' && (
                <span style={{ marginLeft: 6, fontSize: 'var(--font-size-xs)', opacity: 0.6 }}>
                  ({requests.filter(r => (statusOption === 'All' ? true : (r.status === statusOption.toUpperCase() || (statusOption === 'Accepted' && r.status === 'APPROVED')))).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-page">
            <div className="spinner" />
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon-wrapper">
              <FaCalendarAlt className="empty-state-icon" />
            </div>
            <h3 className="empty-state-title">No Requests Found</h3>
            <p className="empty-state-text">
              {filter !== 'All' 
                ? `No ${filter.toLowerCase()} visit requests currently.` 
                : 'You haven\'t received any visit requests yet.'}
            </p>
          </div>
        ) : (
          <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--font-size-sm)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                  <th style={{ padding: 'var(--space-4) var(--space-5)' }}>Tenant</th>
                  <th>Property</th>
                  <th>Schedule</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right', paddingRight: 'var(--space-5)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map(req => {
                  const cfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.PENDING;
                  const StatusIcon = cfg.icon;
                  return (
                    <tr key={req.id} style={{ borderBottom: '1px solid var(--color-border-light)', transition: 'background 0.15s' }}>
                      <td style={{ padding: 'var(--space-4) var(--space-5)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                          <div style={{ width: '40px', height: '40px', background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary-light)' }}>
                            <FaUser />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>{req.tenantName || 'N/A'}</div>
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <FaEnvelope style={{ fontSize: 10 }} /> {req.tenantEmail || 'No Email'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>{req.propertyTitle || req.propertyName}</div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary-light)', fontWeight: 700 }}>ID: #{req.propertyId}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <FaCalendarAlt style={{ color: 'var(--color-primary-light)', fontSize: '0.75rem' }} />
                          <div>
                            <div style={{ fontWeight: 600 }}>{formatDate(req.requestedDate)}</div>
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{req.requestedTime || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-xs)', fontWeight: 700, background: cfg.bg, color: cfg.color }}>
                          <StatusIcon style={{ fontSize: '0.65rem' }} />
                          {req.status?.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', paddingRight: 'var(--space-5)' }}>
                        {req.status === 'PENDING' && (
                          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                            <button onClick={() => handleAction(req.id, 'approve')} className="btn btn-primary btn-sm">Accept</button>
                            <button onClick={() => handleAction(req.id, 'reject')} className="btn btn-sm" style={{ background: 'transparent', color: 'var(--color-error)', border: '1px solid var(--color-error)' }}>Reject</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default VisitRequests;