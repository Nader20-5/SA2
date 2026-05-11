import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createVisit } from '../../services/visitService';
import { toast } from 'react-toastify';

const BookVisit = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const [requestedDate, setRequestedDate] = useState('');
  const [message, setMessage] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const [datePart, timePart] = requestedDate.split('T');
      await createVisit({
        propertyId: parseInt(propertyId),
        requestedDate: datePart,
        requestedTime: timePart,
        notes: message
      });
      toast.success("Visit requested successfully!");
      navigate('/my-visits');
    } catch (error) {
      toast.error(error.response?.data?.message || "Error booking visit");
    }
  };

  return (
    <div style={{ 
      backgroundColor: '#f4f7f6', 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '20px',
      fontFamily: "'Poppins', sans-serif" 
    }}>
      <div style={{ 
        backgroundColor: '#fff', 
        width: '100%', 
        maxWidth: '550px', 
        borderRadius: '35px', 
        padding: '50px', 
        boxShadow: '0 20px 50px rgba(0,0,0,0.05)',
        textAlign: 'center'
      }}>
        
        {/* Icon & Title */}
        <div style={{ marginBottom: '35px' }}>
          <div style={{ 
            width: '70px', 
            height: '70px', 
            backgroundColor: '#e1f5fe', 
            borderRadius: '20px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 20px',
            fontSize: '30px'
          }}>
            🗓️
          </div>
          <h2 style={{ color: '#1a237e', fontWeight: '800', fontSize: '28px', marginBottom: '10px' }}>
            Book a Property Visit
          </h2>
          <p style={{ color: '#7f8c8d', fontSize: '15px' }}>
            Select your preferred date and time to see the property.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          
          {/* Date Input */}
          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', color: '#2c3e50', fontWeight: '700', fontSize: '14px', marginBottom: '10px', marginLeft: '5px' }}>
              Requested Date & Time
            </label>
            <input 
              type="datetime-local" 
              required 
              onChange={(e) => setRequestedDate(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '15px 20px', 
                borderRadius: '18px', 
                border: '2px solid #f0f2f5', 
                backgroundColor: '#f8f9fa', 
                color: '#333',
                fontSize: '15px',
                outline: 'none',
                transition: '0.3s'
              }}
              onFocus={(e) => e.target.style.border = '2px solid #1a237e'}
              onBlur={(e) => e.target.style.border = '2px solid #f0f2f5'}
            />
          </div>

          {/* Message Input */}
          <div style={{ marginBottom: '35px' }}>
            <label style={{ display: 'block', color: '#2c3e50', fontWeight: '700', fontSize: '14px', marginBottom: '10px', marginLeft: '5px' }}>
              Message for Landlord
            </label>
            <textarea 
              placeholder="Tell the landlord why you want to visit..."
              rows="4"
              onChange={(e) => setMessage(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '15px 20px', 
                borderRadius: '18px', 
                border: '2px solid #f0f2f5', 
                backgroundColor: '#f8f9fa', 
                color: '#333',
                fontSize: '15px',
                outline: 'none',
                resize: 'none',
                transition: '0.3s'
              }}
              onFocus={(e) => e.target.style.border = '2px solid #1a237e'}
              onBlur={(e) => e.target.style.border = '2px solid #f0f2f5'}
            ></textarea>
          </div>

          {/* Submit Button */}
          <button 
            type="submit"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ 
              width: '100%', 
              padding: '18px', 
              borderRadius: '50px', 
              border: 'none', 
              backgroundColor: '#1a237e', 
              color: '#fff', 
              fontWeight: 'bold', 
              fontSize: '16px', 
              cursor: 'pointer', 
              boxShadow: isHovered ? '0 10px 25px rgba(26, 35, 126, 0.3)' : '0 4px 15px rgba(26, 35, 126, 0.2)',
              transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
              transition: '0.3s all ease'
            }}
          >
            Confirm Visit Request
          </button>
          
          <button 
            type="button"
            onClick={() => navigate(-1)}
            style={{ 
              width: '100%', 
              marginTop: '15px',
              padding: '12px', 
              borderRadius: '50px', 
              border: 'none', 
              backgroundColor: 'transparent', 
              color: '#7f8c8d', 
              fontWeight: '600', 
              fontSize: '14px', 
              cursor: 'pointer',
              transition: '0.3s'
            }}
          >
            Cancel
          </button>

        </form>
      </div>
    </div>
  );
};

export default BookVisit;