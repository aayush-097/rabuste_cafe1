import { useState, useEffect } from 'react';
import { bookArt } from '../services/api';

const ArtModal = ({ art, isOpen, onClose }) => {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    userName: '',
    phone: '',
    email: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setShowBookingForm(false);
      setBookingForm({ userName: '', phone: '', email: '', message: '' });
      setSubmitting(false);
      setSubmitSuccess(false);
      setError('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await bookArt({
        artId: art._id,
        artName: art.title,
        userName: bookingForm.userName,
        phone: bookingForm.phone,
        email: bookingForm.email,
        message: bookingForm.message,
      });

      setSubmitSuccess(true);
      setBookingForm({ userName: '', phone: '', email: '', message: '' });
      
      // Auto-close after 2 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
        setShowBookingForm(false);
        onClose();
      }, 2000);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to submit booking request');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !art) return null;

  const isReserved = art.availability === 'reserved' || art.availability === 'sold';

  return (
    <div 
      className="art-modal-overlay" 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
    >
      <div 
        className="art-modal" 
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'rgba(24, 18, 16, 0.95)',
          borderRadius: '20px',
          maxWidth: '800px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          border: '1px solid rgba(216, 107, 50, 0.4)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
          position: 'relative',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            cursor: 'pointer',
            color: 'var(--text)',
            fontSize: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
          onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
        >
          ×
        </button>

        <div style={{ padding: '32px' }}>
          {/* Art Image */}
          <div
            style={{
              width: '100%',
              height: '400px',
              borderRadius: '16px',
              backgroundImage: `linear-gradient(120deg, rgba(24,18,16,0.3), rgba(24,18,16,0.7)), url(${art.imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              marginBottom: '24px',
            }}
          />

          {/* Art Details */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <h2 style={{ 
                margin: 0, 
                fontFamily: 'var(--font-heading)', 
                fontSize: '2rem',
                color: 'var(--text)',
              }}>
                {art.title}
              </h2>
              <span 
                className="pill"
                style={{
                  background: isReserved ? 'rgba(211, 47, 47, 0.2)' : 'rgba(216, 107, 50, 0.2)',
                  color: isReserved ? '#ff6b6b' : 'var(--accent-soft)',
                  border: `1px solid ${isReserved ? 'rgba(211, 47, 47, 0.4)' : 'rgba(216, 107, 50, 0.4)'}`,
                }}
              >
                {art.availability === 'sold' ? 'SOLD' : art.availability === 'reserved' ? 'RESERVED' : 'AVAILABLE'}
              </span>
            </div>
            
            <p style={{ 
              margin: '8px 0', 
              color: 'var(--muted)', 
              fontSize: '1rem',
            }}>
              by {art.artistName}
            </p>

            <p style={{ 
              margin: '16px 0', 
              color: 'var(--text)', 
              lineHeight: '1.7',
              fontSize: '0.95rem',
            }}>
              {art.description}
            </p>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginTop: '20px',
              paddingTop: '20px',
              borderTop: '1px solid rgba(216, 107, 50, 0.2)',
            }}>
              <span style={{ 
                fontSize: '1.5rem', 
                fontWeight: '700', 
                color: 'var(--accent-soft)',
                fontFamily: 'var(--font-heading)',
              }}>
                ${art.price}
              </span>
            </div>
          </div>

          {/* Booking Form */}
          {!showBookingForm && !submitSuccess && (
            <button
              className="cta"
              onClick={() => setShowBookingForm(true)}
              disabled={isReserved}
              style={{
                width: '100%',
                marginTop: '8px',
                opacity: isReserved ? 0.5 : 1,
                cursor: isReserved ? 'not-allowed' : 'pointer',
              }}
            >
              {isReserved ? 'Not Available' : 'Book This Art'}
            </button>
          )}

          {showBookingForm && !submitSuccess && (
            <div style={{ marginTop: '24px' }}>
              <h3 style={{ 
                marginBottom: '16px', 
                fontFamily: 'var(--font-heading)',
                color: 'var(--text)',
              }}>
                Booking Request
              </h3>

              {error && (
                <div style={{
                  background: 'rgba(211, 47, 47, 0.1)',
                  border: '1px solid #d32f2f',
                  color: '#ff6b6b',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  marginBottom: '16px',
                  fontSize: '0.875rem',
                }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleBookingSubmit}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '16px',
                  color: 'var(--muted)',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                }}>
                  Full Name *
                  <input
                    type="text"
                    required
                    value={bookingForm.userName}
                    onChange={(e) => setBookingForm({ ...bookingForm, userName: e.target.value })}
                    style={{
                      width: '100%',
                      marginTop: '6px',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1px solid rgba(216, 107, 50, 0.4)',
                      background: 'rgba(24, 18, 16, 0.9)',
                      color: 'var(--text)',
                      fontSize: '0.9rem',
                      outline: 'none',
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent-soft)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(216, 107, 50, 0.4)'}
                  />
                </label>

                <label style={{ 
                  display: 'block', 
                  marginBottom: '16px',
                  color: 'var(--muted)',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                }}>
                  Phone Number *
                  <input
                    type="tel"
                    required
                    value={bookingForm.phone}
                    onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                    style={{
                      width: '100%',
                      marginTop: '6px',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1px solid rgba(216, 107, 50, 0.4)',
                      background: 'rgba(24, 18, 16, 0.9)',
                      color: 'var(--text)',
                      fontSize: '0.9rem',
                      outline: 'none',
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent-soft)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(216, 107, 50, 0.4)'}
                  />
                </label>

                <label style={{ 
                  display: 'block', 
                  marginBottom: '16px',
                  color: 'var(--muted)',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                }}>
                  Email (optional)
                  <input
                    type="email"
                    value={bookingForm.email}
                    onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                    style={{
                      width: '100%',
                      marginTop: '6px',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1px solid rgba(216, 107, 50, 0.4)',
                      background: 'rgba(24, 18, 16, 0.9)',
                      color: 'var(--text)',
                      fontSize: '0.9rem',
                      outline: 'none',
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent-soft)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(216, 107, 50, 0.4)'}
                  />
                </label>

                <label style={{ 
                  display: 'block', 
                  marginBottom: '20px',
                  color: 'var(--muted)',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                }}>
                  Message (optional)
                  <textarea
                    value={bookingForm.message}
                    onChange={(e) => setBookingForm({ ...bookingForm, message: e.target.value })}
                    rows="4"
                    style={{
                      width: '100%',
                      marginTop: '6px',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1px solid rgba(216, 107, 50, 0.4)',
                      background: 'rgba(24, 18, 16, 0.9)',
                      color: 'var(--text)',
                      fontSize: '0.9rem',
                      outline: 'none',
                      resize: 'vertical',
                      fontFamily: 'var(--font-body)',
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent-soft)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(216, 107, 50, 0.4)'}
                  />
                </label>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="submit"
                    className="cta"
                    disabled={submitting}
                    style={{
                      flex: 1,
                      opacity: submitting ? 0.6 : 1,
                      cursor: submitting ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {submitting ? 'Submitting...' : 'Submit Booking Request'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowBookingForm(false);
                      setError('');
                    }}
                    className="cta secondary"
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {submitSuccess && (
            <div style={{
              background: 'rgba(76, 175, 80, 0.1)',
              border: '1px solid rgba(76, 175, 80, 0.4)',
              color: '#81c784',
              padding: '16px',
              borderRadius: '10px',
              textAlign: 'center',
              marginTop: '24px',
            }}>
              <p style={{ margin: 0, fontSize: '1rem', fontWeight: '500' }}>
                ✓ Booking request sent successfully!
              </p>
              <p style={{ margin: '8px 0 0', fontSize: '0.875rem', color: 'rgba(129, 199, 132, 0.8)' }}>
                We'll get back to you shortly.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtModal;
