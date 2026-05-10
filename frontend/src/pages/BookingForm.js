import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { createBooking } from '../api';

function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Name is required';
  if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errors.email = 'Valid email is required';
  if (!form.phone.match(/^[0-9]{10}$/)) errors.phone = '10-digit phone number required';
  return errors;
}

export default function BookingForm() {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { expert, selectedSlot } = state || {};

  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState('');

  if (!expert || !selectedSlot) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <p>No slot selected. <button className="btn btn-primary btn-sm" onClick={() => navigate('/')}>Go to Experts</button></p>
      </div>
    );
  }

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setErrors(err => ({ ...err, [e.target.name]: '' }));
  };

  const handleSubmit = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setApiError('');
    try {
      await createBooking({
        expertId: id,
        ...form,
        date: selectedSlot.date,
        timeSlot: selectedSlot.time
      });
      setSuccess(true);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ maxWidth: 500, margin: '60px auto', textAlign: 'center' }}>
        <div className="card" style={{ padding: 40 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Booking Confirmed!</h2>
          <p style={{ color: 'var(--gray-500)', marginBottom: 8 }}>
            Your session with <strong>{expert.name}</strong> is booked for
          </p>
          <p style={{ color: 'var(--primary)', fontWeight: 600, marginBottom: 24 }}>
            {new Date(selectedSlot.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })} at {selectedSlot.time}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn btn-outline" onClick={() => navigate('/')}>Browse More</button>
            <button className="btn btn-primary" onClick={() => navigate('/my-bookings')}>My Bookings</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', paddingBottom: 40 }}>
      <button
        onClick={() => navigate(-1)}
        style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: 14, marginTop: 24, marginBottom: 16, cursor: 'pointer' }}
      >
        ← Back
      </button>

      <div className="card" style={{ padding: 28, marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Booking Summary</h2>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div className="avatar">{expert.avatar}</div>
          <div>
            <p style={{ fontWeight: 700 }}>{expert.name}</p>
            <p style={{ fontSize: 13, color: 'var(--gray-500)' }}>{expert.category}</p>
          </div>
        </div>
        <div style={{ marginTop: 16, padding: 14, background: 'var(--primary-light)', borderRadius: 8 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary)' }}>
            📅 {new Date(selectedSlot.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary)', marginTop: 4 }}>
            🕐 {selectedSlot.time}
          </p>
        </div>
      </div>

      <div className="card" style={{ padding: 28 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Your Details</h2>

        {apiError && <div className="alert alert-error">{apiError}</div>}

        <div className="form-group">
          <label className="form-label">Full Name *</label>
          <input className={`form-input${errors.name ? ' error' : ''}`} name="name" value={form.name} onChange={handleChange} placeholder="John Doe" />
          {errors.name && <span className="form-error">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Email Address *</label>
          <input className={`form-input${errors.email ? ' error' : ''}`} name="email" type="email" value={form.email} onChange={handleChange} placeholder="john@example.com" />
          {errors.email && <span className="form-error">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Phone Number *</label>
          <input className={`form-input${errors.phone ? ' error' : ''}`} name="phone" value={form.phone} onChange={handleChange} placeholder="10-digit number" maxLength={10} />
          {errors.phone && <span className="form-error">{errors.phone}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Notes (optional)</label>
          <textarea className="form-input" name="notes" value={form.notes} onChange={handleChange} rows={3} placeholder="What would you like to discuss?" style={{ resize: 'vertical' }} />
        </div>

        <button className="btn btn-primary" style={{ width: '100%', padding: 14, fontSize: 15 }} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Confirming...' : 'Confirm Booking ✓'}
        </button>
      </div>
    </div>
  );
}
