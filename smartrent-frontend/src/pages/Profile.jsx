import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../utils/constants';
import {
  FaCamera,
  FaSave,
  FaEnvelope,
  FaPhone,
  FaShieldAlt,
  FaUserTag,
  FaCalendarAlt,
  FaUser,
} from 'react-icons/fa';

import './Profile.css';

const Profile = () => {
  const { user: authUser } = useAuth();
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    status: '',
    profilePictureUrl: '',
    createdAt: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/users/me');
        setProfile({
          firstName: response.data.firstName || '',
          lastName: response.data.lastName || '',
          email: response.data.email || '',
          phone: response.data.phone || '',
          role: response.data.role || '',
          status: response.data.status || '',
          profilePictureUrl: response.data.profilePictureUrl || '',
          createdAt: response.data.createdAt || '',
        });
      } catch (error) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
      };
      await api.put('/users/me', payload);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/users/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfile((prev) => ({ ...prev, profilePictureUrl: response.data.url }));
      toast.success('Profile picture updated!');
    } catch (error) {
      toast.error('Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const getAvatarUrl = () => {
    if (!profile.profilePictureUrl) return null;
    if (profile.profilePictureUrl.startsWith('http')) return profile.profilePictureUrl;
    return `${API_URL.replace('/api', '')}${profile.profilePictureUrl}`;
  };

  const getInitials = () => {
    const first = profile.firstName?.[0] || '';
    const last = profile.lastName?.[0] || '';
    return (first + last).toUpperCase() || '?';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getRoleBadge = (role) => {
    const map = {
      ADMIN: { label: 'Administrator', cls: 'role-admin' },
      LANDLORD: { label: 'Landlord', cls: 'role-landlord' },
      TENANT: { label: 'Tenant', cls: 'role-tenant' },
    };
    return map[role] || { label: role, cls: '' };
  };

  const getStatusBadge = (status) => {
    const map = {
      ACTIVE: { label: 'Active', cls: 'status-active' },
      PENDING: { label: 'Pending', cls: 'status-pending' },
      INACTIVE: { label: 'Inactive', cls: 'status-inactive' },
    };
    return map[status] || { label: status, cls: '' };
  };

  if (loading) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <span className="spinner"></span>
      </div>
    );
  }

  const roleBadge = getRoleBadge(profile.role);
  const statusBadge = getStatusBadge(profile.status);
  const avatarUrl = getAvatarUrl();

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: '900px', paddingTop: '1rem', paddingBottom: '4rem' }}>

        {/* ── Profile Hero Card ── */}
        <div className="profile-hero">
          <div className="profile-hero-bg"></div>
          <div className="profile-hero-content">
            {/* Avatar */}
            <div className="profile-avatar-wrapper" onClick={handleAvatarClick}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="profile-avatar-img" />
              ) : (
                <div className="profile-avatar-placeholder">{getInitials()}</div>
              )}
              <div className="profile-avatar-overlay">
                {uploading ? (
                  <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></span>
                ) : (
                  <FaCamera />
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                style={{ display: 'none' }}
              />
            </div>

            {/* Name + Badges */}
            <div className="profile-hero-info">
              <h1 className="profile-hero-name">
                {profile.firstName} {profile.lastName}
              </h1>
              <p className="profile-hero-email">{profile.email}</p>
              <div className="profile-hero-badges">
                <span className={`profile-badge ${roleBadge.cls}`}>
                  <FaUserTag /> {roleBadge.label}
                </span>
                <span className={`profile-badge ${statusBadge.cls}`}>
                  <FaShieldAlt /> {statusBadge.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Two Column Layout ── */}
        <div className="profile-grid">

          {/* Left: Edit Form */}
          <div className="profile-card">
            <div className="profile-card-header">
              <FaUser className="profile-card-icon" />
              <h2>Personal Information</h2>
            </div>
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    className="form-input"
                    value={profile.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    className="form-input"
                    value={profile.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-input"
                  value={profile.phone}
                  onChange={handleChange}
                  placeholder="e.g. +20 123 456 7890"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg profile-save-btn"
                disabled={saving}
              >
                {saving ? (
                  <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></span>
                ) : (
                  <FaSave />
                )}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* Right: Account Details */}
          <div className="profile-card">
            <div className="profile-card-header">
              <FaShieldAlt className="profile-card-icon" />
              <h2>Account Details</h2>
            </div>
            <div className="profile-details-list">
              <div className="profile-detail-item">
                <div className="profile-detail-icon-wrapper">
                  <FaEnvelope />
                </div>
                <div className="profile-detail-info">
                  <span className="profile-detail-label">Email Address</span>
                  <span className="profile-detail-value">{profile.email}</span>
                </div>
              </div>

              <div className="profile-detail-item">
                <div className="profile-detail-icon-wrapper">
                  <FaPhone />
                </div>
                <div className="profile-detail-info">
                  <span className="profile-detail-label">Phone</span>
                  <span className="profile-detail-value">{profile.phone || 'Not provided'}</span>
                </div>
              </div>

              <div className="profile-detail-item">
                <div className="profile-detail-icon-wrapper">
                  <FaUserTag />
                </div>
                <div className="profile-detail-info">
                  <span className="profile-detail-label">Role</span>
                  <span className={`profile-badge-inline ${roleBadge.cls}`}>{roleBadge.label}</span>
                </div>
              </div>

              <div className="profile-detail-item">
                <div className="profile-detail-icon-wrapper">
                  <FaShieldAlt />
                </div>
                <div className="profile-detail-info">
                  <span className="profile-detail-label">Account Status</span>
                  <span className={`profile-badge-inline ${statusBadge.cls}`}>{statusBadge.label}</span>
                </div>
              </div>

              <div className="profile-detail-item">
                <div className="profile-detail-icon-wrapper">
                  <FaCalendarAlt />
                </div>
                <div className="profile-detail-info">
                  <span className="profile-detail-label">Member Since</span>
                  <span className="profile-detail-value">{formatDate(profile.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
