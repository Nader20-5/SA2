import React, { useEffect, useState } from 'react';
import { getMyVisits } from '../../services/visitService'; 
import { Link } from 'react-router-dom';

const MyVisits = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVisits = async () => {
      try {
        setLoading(true);
        // مناداة API الباك-إند لجلب البيانات الحقيقية
        const data = await getMyVisits();
        // تأكد أن البيانات مصفوفة (Array)
        setVisits(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        console.error("Error fetching visits:", err);
        setError("Unable to load visit requests. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchVisits();
  }, []);

  // تنسيق الألوان بناءً على حالة الطلب (Status)
  const statusColors = {
    PENDING: { bg: '#fff3e0', text: '#ef6c00', icon: '⏳' },
    ACCEPTED: { bg: '#e8f5e9', text: '#2e7d32', icon: '✅' },
    APPROVED: { bg: '#e8f5e9', text: '#2e7d32', icon: '✅' },
    REJECTED: { bg: '#ffebee', text: '#c62828', icon: '❌' },
    CANCELLED: { bg: '#f5f5f5', text: '#9e9e9e', icon: '🚫' },
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f7f6' }}>
      <div className="loader"></div>
      <style>{`
        .loader { border: 4px solid #f3f3f3; border-top: 4px solid #1a237e; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );

  return (
    <div style={{ backgroundColor: '#f4f7f6', minHeight: '100vh', padding: '60px 20px', direction: 'ltr', fontFamily: "'Poppins', sans-serif" }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '50px' }}>
          <div>
            <h1 style={{ color: '#1a237e', fontWeight: '800', fontSize: '36px', letterSpacing: '-1px' }}>My Visit Requests</h1>
            <p style={{ color: '#7f8c8d', fontSize: '16px', marginTop: '5px' }}>Track and manage your upcoming property viewings.</p>
          </div>
          <Link to="/" style={{ textDecoration: 'none', backgroundColor: '#1a237e', color: '#fff', padding: '12px 30px', borderRadius: '50px', fontWeight: 'bold', fontSize: '15px' }}>
            + Explore More
          </Link>
        </div>

        {error && (
          <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '15px', borderRadius: '10px', marginBottom: '30px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {/* Visits Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
          {visits && visits.length > 0 ? visits.map(visit => {
            // اختيار اللون بناءً على الحالة، الافتراضي هو PENDING
            const colors = statusColors[visit.status] || statusColors.PENDING;
            
            return (
              <div key={visit.id} style={{ backgroundColor: '#fff', borderRadius: '25px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                
                {/* Image Area */}
                <div style={{ position: 'relative', height: '200px' }}>
                  <img 
                    src={visit.propertyImage || "https://via.placeholder.com/400x200?text=Property+Image"} 
                    alt={visit.propertyTitle} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                  <div style={{ position: 'absolute', top: '20px', right: '20px', backgroundColor: colors.bg, color: colors.text, padding: '7px 18px', borderRadius: '50px', fontWeight: '700', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                    <span>{colors.icon}</span> {visit.status}
                  </div>
                </div>

                {/* Info Area */}
                <div style={{ padding: '25px' }}>
                  <h3 style={{ color: '#2c3e50', fontWeight: '700', fontSize: '20px', marginBottom: '8px' }}>{visit.propertyTitle || "Untitled Property"}</h3>
                  <p style={{ color: '#7f8c8d', fontSize: '14px', marginBottom: '20px' }}>
                    📍 {visit.propertyLocation || "Location Details Not Available"}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '15px', marginBottom: '20px' }}>
                    <div style={{ borderLeft: '3px solid #1a237e', paddingLeft: '10px' }}>
                      <small style={{ color: '#a0a0a0', fontSize: '11px' }}>DATE</small>
                      <p style={{ color: '#333', fontWeight: 'bold', margin: 0 }}>
                        {visit.requestedDate ? new Date(visit.requestedDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div style={{ borderLeft: '3px solid #1a237e', paddingLeft: '10px' }}>
                      <small style={{ color: '#a0a0a0', fontSize: '11px' }}>TIME</small>
                      <p style={{ color: '#333', fontWeight: 'bold', margin: 0 }}>
                        {visit.requestedTime || 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  {visit.notes && (
                     <p style={{ color: '#555', fontSize: '13px', fontStyle: 'italic', background: '#e1f5fe', padding: '10px', borderRadius: '8px' }}>
                       "{visit.notes}"
                     </p>
                  )}
                </div>

                {/* Footer Action */}
                <div style={{ padding: '0 25px 25px' }}>
                  <Link to={`/property/${visit.propertyId}`} style={{ textDecoration: 'none' }}>
                    <button style={{ backgroundColor: '#f4f7f6', color: '#1a237e', border: 'none', padding: '12px 0', width: '100%', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s' }}>
                      View Property Details
                    </button>
                  </Link>
                </div>
              </div>
            );
          }) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#7f8c8d', fontSize: '18px', padding: '60px 0' }}>
              You haven't requested any visits yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyVisits;