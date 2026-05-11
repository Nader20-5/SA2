import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { createRentalApplication, uploadDocument, getBookedDates } from '../../services/rentalService';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  FaFileSignature,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaEnvelopeOpenText,
  FaCloudUploadAlt,
  FaChevronLeft,
  FaCheckCircle,
} from 'react-icons/fa';

const ApplyRental = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [bookedDates, setBookedDates] = useState([]);
  const [formData, setFormData] = useState({
    monthlyIncome: '',
    moveInDate: null,
    leaseEndDate: null,
    employmentStatus: 'EMPLOYED',
    coverLetter: '',
    documents: null,
  });

  // Get tomorrow as minimum selectable date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  useEffect(() => {
    const fetchBookedDates = async () => {
      try {
        const dates = await getBookedDates(propertyId);
        const intervals = dates.map(d => ({
          start: new Date(d.startDate),
          end: new Date(d.endDate)
        }));
        setBookedDates(intervals);
      } catch (err) {
        console.error("Failed to fetch booked dates", err);
      }
    };
    fetchBookedDates();
  }, [propertyId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name, date) => {
    setFormData((prev) => ({ ...prev, [name]: date }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, documents: e.target.files }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate inputs
    if (formData.moveInDate && formData.leaseEndDate) {
      if (formData.leaseEndDate <= formData.moveInDate) {
        toast.error('Lease end date must be after the move-in date.');
        return;
      }
    } else {
      toast.error('Please select both move-in and lease end dates.');
      return;
    }

    if (!formData.monthlyIncome || parseFloat(formData.monthlyIncome) <= 0) {
      toast.error('Please enter a valid monthly income.');
      return;
    }

    setLoading(true);

    try {
      // 1. Submit JSON payload
      // Fix date format
      const moveInDateStr = formData.moveInDate.toISOString().split('T')[0];
      const leaseEndDateStr = formData.leaseEndDate.toISOString().split('T')[0];

      const applicationDto = {
        propertyId: parseInt(propertyId),
        monthlyIncome: parseFloat(formData.monthlyIncome),
        moveInDate: moveInDateStr,
        leaseEndDate: leaseEndDateStr,
        employmentStatus: formData.employmentStatus,
        coverLetter: formData.coverLetter,
      };
      const response = await createRentalApplication(applicationDto);
      const newRentalId = response.id;

      // 2. Upload documents if any
      if (formData.documents && formData.documents.length > 0) {
        for (let i = 0; i < formData.documents.length; i++) {
          await uploadDocument(newRentalId, 'OTHER', formData.documents[i]);
        }
      }
      toast.success('Application submitted successfully!');
      navigate('/my-journey');
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data ||
        'Submission failed. Please try again.';
      toast.error(typeof msg === 'string' ? msg : 'Submission failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 720, paddingTop: '2rem', paddingBottom: '4rem' }}>
        {/* Breadcrumb */}
        <nav className="detail-breadcrumb" id="apply-rental-breadcrumb">
          <Link to={`/property/${propertyId}`} className="detail-breadcrumb-link">
            <FaChevronLeft style={{ fontSize: '0.65rem', marginRight: 4 }} />
            Back to Property
          </Link>
          <span className="detail-breadcrumb-separator">/</span>
          <span className="detail-breadcrumb-current">Apply for Rental</span>
        </nav>

        {/* Card */}
        <div
          style={{
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-10)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: 'var(--space-8)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
              <FaFileSignature style={{ color: 'var(--color-primary-light)', fontSize: '1.5rem' }} />
              <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, letterSpacing: '-0.02em' }}>
                Rental Application
              </h1>
            </div>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
              Complete the form below to apply for Property <strong>#{propertyId}</strong>
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {/* Date Range Row */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <FaCalendarAlt style={{ marginRight: 6, color: 'var(--color-primary-light)' }} />
                  Move-in Date *
                </label>
                <DatePicker
                  selected={formData.moveInDate}
                  onChange={(date) => handleDateChange('moveInDate', date)}
                  minDate={tomorrow}
                  excludeDateIntervals={bookedDates}
                  className="form-input"
                  placeholderText="Select move-in date"
                  required
                  id="input-move-in-date"
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  <FaCalendarAlt style={{ marginRight: 6, color: 'var(--color-primary-light)' }} />
                  Lease End Date *
                </label>
                <DatePicker
                  selected={formData.leaseEndDate}
                  onChange={(date) => handleDateChange('leaseEndDate', date)}
                  minDate={formData.moveInDate || tomorrow}
                  excludeDateIntervals={bookedDates}
                  className="form-input"
                  placeholderText="Select lease end date"
                  required
                  id="input-lease-end-date"
                />
              </div>
            </div>

            {/* Employment Status & Monthly Income */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <FaFileSignature style={{ marginRight: 6, color: 'var(--color-primary-light)' }} />
                  Employment Status *
                </label>
                <select
                  name="employmentStatus"
                  className="form-input"
                  required
                  value={formData.employmentStatus}
                  onChange={handleChange}
                  id="input-employment-status"
                >
                  <option value="EMPLOYED">Employed</option>
                  <option value="SELF_EMPLOYED">Self Employed</option>
                  <option value="STUDENT">Student</option>
                  <option value="RETIRED">Retired</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            {/* Monthly Income */}
            <div className="form-group">
              <label className="form-label">
                <FaMoneyBillWave style={{ marginRight: 6, color: 'var(--color-success)' }} />
                Monthly Income ($) *
              </label>
              <input
                type="number"
                name="monthlyIncome"
                className="form-input"
                placeholder="e.g. 5000"
                required
                min="1"
                value={formData.monthlyIncome}
                onChange={handleChange}
                id="input-monthly-income"
              />
            </div>

            {/* Cover Letter */}
            <div className="form-group">
              <label className="form-label">
                <FaEnvelopeOpenText style={{ marginRight: 6, color: 'var(--color-info)' }} />
                Cover Letter (Optional)
              </label>
              <textarea
                name="coverLetter"
                className="form-textarea"
                placeholder="Introduce yourself to the landlord. Mention your occupation, reason for renting, etc."
                rows="4"
                value={formData.coverLetter}
                onChange={handleChange}
                id="input-cover-letter"
              />
            </div>

            {/* Document Upload */}
            <div className="form-group">
              <label className="form-label">
                <FaCloudUploadAlt style={{ marginRight: 6, color: 'var(--color-warning)' }} />
                Supporting Documents *
              </label>
              <div
                style={{
                  border: '2px dashed var(--color-border)',
                  padding: 'var(--space-6)',
                  borderRadius: 'var(--radius-lg)',
                  textAlign: 'center',
                  background: 'var(--color-bg-elevated)',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                }}
              >
                <FaCloudUploadAlt style={{ fontSize: '2rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }} />
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-3)' }}>
                  Upload ID, Salary Slip, or Employment Letter (PDF, JPG, PNG)
                </p>
                <input
                  type="file"
                  multiple
                  required
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  style={{ fontSize: 'var(--font-size-sm)' }}
                  id="input-documents"
                />
                {formData.documents && formData.documents.length > 0 && (
                  <p style={{ marginTop: 'var(--space-2)', color: 'var(--color-success)', fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>
                    <FaCheckCircle style={{ marginRight: 4 }} />
                    {formData.documents.length} file(s) selected
                  </p>
                )}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', marginTop: 'var(--space-2)' }}
              id="submit-rental-btn"
            >
              {loading ? (
                <>
                  <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                  Processing...
                </>
              ) : (
                <>
                  <FaFileSignature /> Submit Application
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ApplyRental;