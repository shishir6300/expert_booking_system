import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getExpertById } from '../api';
import { useSocket } from '../context/SocketContext';

function groupSlotsByDate(slots) {
  return slots.reduce((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = [];
    acc[slot.date].push(slot);
    return acc;
  }, {});
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long'
  });
}

export default function ExpertDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const socketRef = useSocket();
  const [expert, setExpert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    const fetchExpert = async () => {
      try {
        const res = await getExpertById(id);
        setExpert(res.data.data);
      } catch {
        setError('Failed to load expert details.');
      } finally {
        setLoading(false);
      }
    };
    fetchExpert();
  }, [id]);

  // Real-time slot updates via Socket.io
  useEffect(() => {
    const socket = socketRef?.current;
    if (!socket) return;
    const handler = ({ expertId, date, timeSlot }) => {
      if (expertId !== id) return;
      setExpert(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          slots: prev.slots.map(s =>
            s.date === date && s.time === timeSlot ? { ...s, isBooked: true } : s
          )
        };
      });
      // Clear selection if it was just booked by someone else
      setSelectedSlot(prev =>
        prev?.date === date && prev?.time === timeSlot ? null : prev
      );
    };
    socket.on('slotBooked', handler);
    return () => socket.off('slotBooked', handler);
  }, [id, socketRef]);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (error) return <div className="alert alert-error" style={{ marginTop: 32 }}>{error}</div>;
  if (!expert) return null;

  const grouped = groupSlotsByDate(expert.slots);

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', paddingBottom: 40 }}>
      <button
        onClick={() => navigate(-1)}
        style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: 14, marginTop: 24, marginBottom: 16, cursor: 'pointer' }}
      >
        ← Back to Experts
      </button>

      {/* Expert Info */}
      <div className="card" style={{ padding: 28, marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
          <div className="avatar" style={{ width: 72, height: 72, fontSize: 24 }}>{expert.avatar}</div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700 }}>{expert.name}</h1>
            <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '3px 12px', borderRadius: 100, fontSize: 13, fontWeight: 600 }}>
                {expert.category}
              </span>
              <span style={{ fontSize: 14, color: 'var(--gray-500)' }}>⭐ {expert.rating} rating</span>
              <span style={{ fontSize: 14, color: 'var(--gray-500)' }}>💼 {expert.experience} years experience</span>
            </div>
            <p style={{ fontSize: 14, color: 'var(--gray-500)', marginTop: 12, lineHeight: 1.6 }}>{expert.bio}</p>
          </div>
        </div>
      </div>

      {/* Slots */}
      <div className="card" style={{ padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Available Slots</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--gray-500)' }}>
            <span className="realtime-dot" /> Live updates
          </div>
        </div>

        <div className="slots-container">
          {Object.entries(grouped).map(([date, slots]) => (
            <div key={date}>
              <div className="slots-date">📅 {formatDate(date)}</div>
              <div className="slots-row">
                {slots.map(slot => (
                  <button
                    key={slot._id}
                    className={`slot-btn${selectedSlot?._id === slot._id ? ' selected' : ''}`}
                    disabled={slot.isBooked}
                    onClick={() => setSelectedSlot(slot.isBooked ? null : { ...slot, date })}
                  >
                    {slot.time} {slot.isBooked ? '✗' : ''}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {selectedSlot && (
          <div style={{ marginTop: 24, padding: 16, background: 'var(--primary-light)', borderRadius: 8 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary)' }}>
              ✅ Selected: {formatDate(selectedSlot.date)} at {selectedSlot.time}
            </p>
          </div>
        )}

        <button
          className="btn btn-primary"
          style={{ marginTop: 20, width: '100%', padding: '13px', fontSize: 15 }}
          disabled={!selectedSlot}
          onClick={() => navigate(`/book/${expert._id}`, { state: { expert, selectedSlot } })}
        >
          Book This Slot →
        </button>
      </div>
    </div>
  );
}
