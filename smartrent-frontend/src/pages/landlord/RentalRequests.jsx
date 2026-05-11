import React, { useEffect, useState } from 'react';
import { getLandlordApplications, approveRental, rejectRental } from '../../services/rentalService';
import api from '../../services/api';
import { toast } from 'react-toastify';
import Sidebar from '../../components/common/Sidebar';
import {
  FaFileSignature,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaCalendarAlt,
  FaExternalLinkAlt,
} from 'react-icons/fa';

const STATUS_CONFIG = {
  APPROVED: { color: 'var(--color-success)', bg: 'rgba(16,185,129,0.12)', icon: FaCheckCircle },
  REJECTED: { color: 'var(--color-error)', bg: 'rgba(239,68,68,0.12)', icon: FaTimesCircle },
  PENDING: { color: 'var(--color-warning)', bg: 'rgba(245,158,11,0.12)', icon: FaClock },
  WITHDRAWN: { color: 'var(--color-text-muted)', bg: 'rgba(107,114,128,0.12)', icon: FaClock },
};

const RentalRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await getLandlordApplications();
      let items = [];
      if (Array.isArray(res)) items = res;
      else if (res?.data?.items) items = res.data.items;
      else if (Array.isArray(res?.data)) items = res.data;
      else if (res?.items) items = res.items;
      setRequests(items);
    } catch (error) {
      console.error('Error fetching rental requests:', error);
      toast.error('Failed to load rental applications.');
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
        await approveRental(id);
        toast.success('Rental Application Approved!');
      } else {
        const reason = prompt('Enter rejection reason:');
        if (reason === null) return;
        await rejectRental(id, reason);
        toast.info('Application Rejected');
      }
      fetchRequests();
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data || 'Action failed.';
      toast.error(typeof msg === 'string' ? msg : 'Action failed.');
    }
  };

  const handleDownloadDocument = async (url) => {
    try {
      toast.info('Decrypting and downloading...');
      const response = await api.get(`/Document/download?url=${encodeURIComponent(url)}`, {
        responseType: 'blob'
      });
      const blobURL = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = blobURL;
      
      // Try to extract original name or use generic
      const contentDisposition = response.headers['content-disposition'];
      let filename = `document_${Date.now()}`;
      if (contentDisposition && contentDisposition.indexOf('filename=') !== -1) {
        filename = contentDisposition.split('filename=')[1].replace(/["']/g, '');
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to download document. Not authorized or not found.';
      toast.error(typeof msg === 'string' ? msg : 'Download failed.');
    }
  };

  const filteredRequests = requests.filter((req) =>
    filter === 'All' ? true : (req.status || '').toUpperCase() === filter.toUpperCase()
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-content">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Rental Applications</h1>
            <p className="dashboard-subtitle">
              Review tenant applications, income proposals, and supporting documents.
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="dashboard-tabs" id="rental-filter-tabs" style={{ marginBottom: 'var(--space-6)' }}>
          {['All', 'Pending', 'Approved', 'Rejected'].map((opt) => (
            <button
              key={opt}
              className={`dashboard-tab ${filter === opt ? 'is-active' : ''}`}
              onClick={() => setFilter(opt)}
            >
              {opt}
              {opt !== 'All' && (
                <span
                  style={{
                    marginLeft: 6,
                    fontSize: 'var(--font-size-xs)',
                    opacity: 0.6,
                  }}
                >
                  ({requests.filter((r) => (opt === 'All' ? true : (r.status || '').toUpperCase() === opt.toUpperCase())).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="loading-page">
            <div className="spinner" />
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon-wrapper">
              <FaFileSignature className="empty-state-icon" />
            </div>
            <h3 className="empty-state-title">No Applications Found</h3>
            <p className="empty-state-text">
              {filter !== 'All'
                ? `No ${filter.toLowerCase()} rental applications at the moment.`
                : 'No rental applications have been submitted yet.'}
            </p>
          </div>
        ) : (
          /* Table */
          <div
            style={{
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
                fontSize: 'var(--font-size-sm)',
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: '1px solid var(--color-border)',
                    color: 'var(--color-text-muted)',
                    fontSize: 'var(--font-size-xs)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontWeight: 600,
                  }}
                >
                  <th style={{ padding: 'var(--space-4) var(--space-5)' }}>Applicant</th>
                  <th>Monthly Income</th>
                  <th>Lease Period</th>
                  <th>Documents</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right', paddingRight: 'var(--space-5)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((req) => {
                  const statusKey = (req.status || 'PENDING').toUpperCase();
                  const cfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.PENDING;
                  const StatusIcon = cfg.icon;
                  return (
                    <tr
                      key={req.id}
                      style={{
                        borderBottom: '1px solid var(--color-border-light)',
                        transition: 'background 0.15s',
                      }}
                    >
                      {/* Applicant */}
                      <td style={{ padding: 'var(--space-4) var(--space-5)' }}>
                        <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                          {req.tenantName || 'Applicant'}
                        </div>
                        {req.coverLetter && (
                          <div
                            style={{
                              fontSize: 'var(--font-size-xs)',
                              color: 'var(--color-text-muted)',
                              marginTop: 2,
                              maxWidth: 200,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            "{req.coverLetter}"
                          </div>
                        )}
                      </td>

                      {/* Monthly Income */}
                      <td>
                        <span style={{ fontWeight: 700, color: 'var(--color-success)' }}>
                          ${req.monthlyIncome?.toLocaleString() || '—'}
                        </span>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                          /month
                        </div>
                      </td>

                      {/* Lease Period */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <FaCalendarAlt style={{ color: 'var(--color-primary-light)', fontSize: '0.7rem' }} />
                          <div>
                            <div style={{ fontWeight: 500 }}>{formatDate(req.moveInDate)}</div>
                            {req.leaseEndDate && (
                              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                                to {formatDate(req.leaseEndDate)}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Documents */}
                      <td>
                        {req.documents && req.documents.length > 0 ? (
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {req.documents.map((doc, i) => (
                              <button
                                key={i}
                                onClick={() => handleDownloadDocument(doc.fileUrl)}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  padding: '3px 10px',
                                  background: 'rgba(99,102,241,0.08)',
                                  border: '1px solid rgba(99,102,241,0.15)',
                                  borderRadius: 'var(--radius-sm)',
                                  fontSize: 'var(--font-size-xs)',
                                  fontWeight: 600,
                                  color: 'var(--color-primary-light)',
                                  textDecoration: 'none',
                                  cursor: 'pointer'
                                }}
                              >
                                {doc.documentType || `Doc ${i + 1}`} <FaExternalLinkAlt style={{ fontSize: '0.55rem' }} />
                              </button>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>
                            No documents
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '4px 12px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: 'var(--font-size-xs)',
                            fontWeight: 700,
                            background: cfg.bg,
                            color: cfg.color,
                          }}
                        >
                          <StatusIcon style={{ fontSize: '0.65rem' }} />
                          {req.status?.toUpperCase()}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right', paddingRight: 'var(--space-5)' }}>
                        {(req.status || '').toUpperCase() === 'PENDING' && (
                          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleAction(req.id, 'approve')}
                              id={`approve-rental-${req.id}`}
                            >
                              Approve
                            </button>
                            <button
                              className="btn btn-sm"
                              style={{
                                background: 'transparent',
                                color: 'var(--color-error)',
                                border: '1px solid var(--color-error)',
                              }}
                              onClick={() => handleAction(req.id, 'reject')}
                              id={`reject-rental-${req.id}`}
                            >
                              Reject
                            </button>
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

export default RentalRequests;