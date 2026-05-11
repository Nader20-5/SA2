import React, { useEffect, useState } from 'react';
import { getMyApplications } from '../../services/rentalService';
import { getMyVisits } from '../../services/visitService';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { 
  FaCalendarAlt, 
  FaFileAlt, 
  FaClock, 
  FaCheckCircle, 
  FaTimesCircle,
  FaMapMarkerAlt,
  FaExternalLinkAlt
} from 'react-icons/fa';

const MyJourney = () => {
  const [applications, setApplications] = useState([]);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('applications');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [appsData, visitsData] = await Promise.all([
          getMyApplications(),
          getMyVisits()
        ]);
        setApplications(Array.isArray(appsData) ? appsData : []);
        setVisits(Array.isArray(visitsData) ? visitsData : []);
      } catch (error) {
        console.error("Error fetching journey data:", error);
        toast.error("Failed to load your activity data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusConfig = (status) => {
    const s = (status || 'PENDING').toUpperCase();
    switch (s) {
      case 'APPROVED':
      case 'ACCEPTED':
        return { color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: <FaCheckCircle /> };
      case 'REJECTED':
      case 'CANCELLED':
        return { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: <FaTimesCircle /> };
      default:
        return { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: <FaClock /> };
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) return (
    <div className="loading-page">
      <div className="spinner" />
    </div>
  );

  return (
    <div className="journey-page" style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', padding: '120px 20px 60px' }}>
      <div className="container" style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Header */}
        <header style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--color-text)', marginBottom: '8px' }}>My Journey</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>Manage your rental applications and visit schedules.</p>
        </header>

        {/* Tab Switcher */}
        <div style={{ 
          display: 'inline-flex', 
          background: 'var(--color-bg-card)', 
          padding: '6px', 
          borderRadius: '16px', 
          marginBottom: '30px',
          border: '1px solid var(--color-border)'
        }}>
          <button 
            onClick={() => setActiveTab('applications')}
            style={{ 
              padding: '10px 24px', 
              borderRadius: '12px', 
              border: 'none', 
              background: activeTab === 'applications' ? 'var(--color-primary)' : 'transparent',
              color: activeTab === 'applications' ? '#fff' : 'var(--color-text)',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Applications ({applications.length})
          </button>
          <button 
            onClick={() => setActiveTab('visits')}
            style={{ 
              padding: '10px 24px', 
              borderRadius: '12px', 
              border: 'none', 
              background: activeTab === 'visits' ? 'var(--color-primary)' : 'transparent',
              color: activeTab === 'visits' ? '#fff' : 'var(--color-text)',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Visits ({visits.length})
          </button>
        </div>

        {/* Table Container */}
        <div style={{ 
          background: 'var(--color-bg-card)', 
          borderRadius: '24px', 
          border: '1px solid var(--color-border)', 
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)'
        }}>
          {activeTab === 'applications' ? (
            applications.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--color-border)' }}>
                    <th style={thStyle}>Property</th>
                    <th style={thStyle}>Applied Date</th>
                    <th style={thStyle}>Income</th>
                    <th style={thStyle}>Status</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map(app => {
                    const cfg = getStatusConfig(app.status);
                    return (
                      <tr key={app.id} style={trStyle}>
                        <td style={tdStyle}>
                          <div style={{ fontWeight: '700', color: 'var(--color-text)' }}>{app.propertyTitle}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>ID: #{String(app.id).padStart(5, '0')}</div>
                        </td>
                        <td style={tdStyle}>{formatDate(app.createdAt)}</td>
                        <td style={tdStyle}>
                          <span style={{ fontWeight: '600', color: 'var(--color-success)' }}>
                            ${app.monthlyIncome?.toLocaleString() || '—'}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          <span style={{ 
                            padding: '4px 12px', 
                            borderRadius: '50px', 
                            fontSize: '0.75rem', 
                            fontWeight: '700', 
                            background: cfg.bg, 
                            color: cfg.color,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}>
                            {cfg.icon} {app.status || 'PENDING'}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'right' }}>
                          <Link to={`/property/${app.propertyId}`} style={actionBtnStyle}>
                            View <FaExternalLinkAlt style={{ fontSize: '0.7rem' }} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <EmptyState message="No rental applications found." />
            )
          ) : (
            visits.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--color-border)' }}>
                    <th style={thStyle}>Property</th>
                    <th style={thStyle}>Date & Time</th>
                    <th style={thStyle}>Location</th>
                    <th style={thStyle}>Status</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visits.map(visit => {
                    const cfg = getStatusConfig(visit.status);
                    return (
                      <tr key={visit.id} style={trStyle}>
                        <td style={tdStyle}>
                          <div style={{ fontWeight: '700', color: 'var(--color-text)' }}>{visit.propertyTitle}</div>
                        </td>
                        <td style={tdStyle}>
                          <div style={{ fontWeight: '600' }}>{formatDate(visit.requestedDate)}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{visit.requestedTime}</div>
                        </td>
                        <td style={tdStyle}>
                          <div style={{ fontSize: '0.9rem' }}>
                            <FaMapMarkerAlt style={{ color: 'var(--color-primary)', marginRight: '5px' }} />
                            {visit.propertyAddress || 'N/A'}
                          </div>
                        </td>
                        <td style={tdStyle}>
                          <span style={{ 
                            padding: '4px 12px', 
                            borderRadius: '50px', 
                            fontSize: '0.75rem', 
                            fontWeight: '700', 
                            background: cfg.bg, 
                            color: cfg.color,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}>
                            {cfg.icon} {visit.status || 'PENDING'}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'right' }}>
                          <Link to={`/property/${visit.propertyId}`} style={actionBtnStyle}>
                            View <FaExternalLinkAlt style={{ fontSize: '0.7rem' }} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <EmptyState message="No visit requests found." />
            )
          )}
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ message }) => (
  <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
    <p style={{ fontSize: '1.1rem', marginBottom: '20px' }}>{message}</p>
    <Link to="/" className="btn btn-primary">Browse Properties</Link>
  </div>
);

const thStyle = {
  padding: '16px 24px',
  fontSize: '0.8rem',
  fontWeight: '700',
  color: 'var(--color-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
};

const tdStyle = {
  padding: '20px 24px',
  fontSize: '0.95rem',
  borderBottom: '1px solid var(--color-border-light)'
};

const trStyle = {
  transition: 'background 0.2s'
};

const actionBtnStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '8px 16px',
  background: 'rgba(99,102,241,0.08)',
  color: 'var(--color-primary)',
  borderRadius: '10px',
  textDecoration: 'none',
  fontWeight: '700',
  fontSize: '0.85rem',
  transition: 'all 0.2s'
};

export default MyJourney;
