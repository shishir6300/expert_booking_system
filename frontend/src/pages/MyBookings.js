import { useState } from 'react';
import { getBookingsByEmail } from '../api';

const STATUS_COLORS = {
  Pending: 'badge-pending',
  Confirmed: 'badge-confirmed',
  Completed: 'badge-completed'
};

function BookingCard({ booking }) {
  return (
    <div className="card" style={{ padding: 20, marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>{booking.expertName}</h3>
          <p style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 4 }}>
            📅 {new Date(booking.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} &nbsp;|&nbsp; 🕐 {booking.timeSlot}
          </p>
          <p style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 2 }}>
            👤 {booking.name} &nbsp;|&nbsp; 📞 {booking.phone}
          </p>
          {booking.notes && (
            <p style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 2 }}>
              📝 {booking.notes}
            </p>
          )}
        </div>
        <span className={`badge ${STATUS_COLORS[booking.status]}`}>{booking.status}</span>
      </div>
      <p style={{ fontSize: 12, color: 'var(--gray-300)', marginTop: 12 }}>
        Booked on {new Date(booking.createdAt).toLocaleDateString('en-IN')}
      </p>
    </div>
  );
}

export default function MyBookings() {
  const [email, setEmail] = useState('');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Please enter a valid email address');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await getBookingsByEmail(email);
      setBookings(res.data.data);
      setSearched(true);
    } catch {
      setError('Failed to fetch bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const grouped = bookings.reduce((acc, b) => {
    if (!acc[b.status]) acc[b.status] = [];
    acc[b.status].push(b);
    return acc;
  }, {});

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', paddingBottom: 40 }}>
      <div className="page-header">
        <h1 className="page-title">My Bookings</h1>
        <p className="page-subtitle">Enter your email to view all your sessions</p>
      </div>

      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <input
            className="form-input"
            style={{ flex: 1 }}
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
          <button className="btn btn-primary" onClick={handleSearch} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
        {error && <p className="form-error" style={{ marginTop: 8 }}>{error}</p>}
      </div>

      {loading && <div className="loading-center"><div className="spinner" /></div>}

      {searched && !loading && (
        bookings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h3>No bookings found</h3>
            <p>No sessions found for {email}</p>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 20 }}>
              Found <strong>{bookings.length}</strong> booking{bookings.length !== 1 ? 's' : ''} for {email}
            </p>
            {['Pending', 'Confirmed', 'Completed'].map(status => (
              grouped[status]?.length > 0 && (
                <div key={status} style={{ marginBottom: 28 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className={`badge ${STATUS_COLORS[status]}`}>{status}</span>
                    <span style={{ color: 'var(--gray-500)', fontWeight: 400, fontSize: 14 }}>
                      ({grouped[status].length})
                    </span>
                  </h2>
                  {grouped[status].map(b => <BookingCard key={b._id} booking={b} />)}
                </div>
              )
            ))}
          </div>
        )
      )}
    </div>
  );
}