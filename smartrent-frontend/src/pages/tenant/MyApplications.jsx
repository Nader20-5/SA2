import React, { useEffect, useState } from 'react';
import { getMyApplications } from '../../services/rentalService';
import { toast } from 'react-toastify';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const data = await getMyApplications();
        setApplications(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching applications:", error);
        toast.error("Failed to load your applications");
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#1a237e' }}>
      <div className="spinner-border" role="status"></div>
      <span style={{ marginLeft: '15px', fontWeight: '600' }}>Loading your journey...</span>
    </div>
  );

  return (
    <div style={{ backgroundColor: '#f4f7fa', minHeight: '100vh', padding: '60px 20px', fontFamily: "'Poppins', sans-serif" }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ color: '#1a237e', fontWeight: '800', fontSize: '36px', marginBottom: '10px' }}>My Applications</h1>
          <p style={{ color: '#7f8c8d' }}>Track the status of your rental requests and document approvals.</p>
        </div>

        {/* Applications List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {applications.length > 0 ? applications.map((app) => (
            <div key={app.id} style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={iconBoxStyle}>🏠</div>
                <div>
                  <h3 style={{ margin: 0, color: '#2c3e50', fontWeight: '700' }}>{app.propertyTitle || "Premium Property"}</h3>
                  <p style={{ margin: '5px 0 0', color: '#94a3b8', fontSize: '13px' }}>
                    Applied on: {new Date(app.createdAt).toLocaleDateString()}
                  </p>
                  {app.status === 'APPROVED' && app.moveInDate && app.leaseEndDate && (
                    <p style={{ margin: '6px 0 0', color: '#2e7d32', fontSize: '13px', fontWeight: '600' }}>
                      🏠 Rented from {new Date(app.moveInDate).toLocaleDateString()} to {new Date(app.leaseEndDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ marginBottom: '10px' }}>
                  <span style={getStatusStyle(app.status)}>
                    {app.status || 'Pending'}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#bdc3c7', fontWeight: '600' }}>
                  REF: {String(app.id).padStart(5, '0')}
                </div>
              </div>
            </div>
          )) : (
            <div style={{ textAlign: 'center', padding: '100px', backgroundColor: '#fff', borderRadius: '30px', color: '#bdc3c7' }}>
              <div style={{ fontSize: '50px', marginBottom: '20px' }}>📭</div>
              <p style={{ fontSize: '18px', fontWeight: '500' }}>No applications yet. Start your journey today!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Helper Functions & Styles ---

const getStatusStyle = (status) => {
  const baseStyle = {
    padding: '8px 20px',
    borderRadius: '50px',
    fontSize: '12px',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  };

  switch (status?.toLowerCase()) {
    case 'accepted':
    case 'approved':
      return { ...baseStyle, backgroundColor: '#e8f5e9', color: '#2e7d32' };
    case 'rejected':
      return { ...baseStyle, backgroundColor: '#ffebee', color: '#c62828' };
    default:
      return { ...baseStyle, backgroundColor: '#fff3e0', color: '#ef6c00' };
  }
};

const cardStyle = {
  backgroundColor: '#ffffff',
  padding: '25px 35px',
  borderRadius: '24px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
  transition: 'transform 0.3s ease',
  border: '1px solid #f0f2f5'
};

const iconBoxStyle = {
  width: '60px',
  height: '60px',
  backgroundColor: '#f0f2f8',
  borderRadius: '18px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '24px'
};

export default MyApplications;
