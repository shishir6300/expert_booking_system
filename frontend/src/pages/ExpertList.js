import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getExperts } from '../api';

const CATEGORIES = ['All', 'Technology', 'Finance', 'Health', 'Legal', 'Marketing', 'Design', 'Education', 'Business'];

function StarRating({ rating }) {
  return (
    <span className="stars">
      {'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}
      <span style={{ color: '#6B7280', fontSize: 13, marginLeft: 4 }}>{rating}</span>
    </span>
  );
}

function ExpertCard({ expert, onClick }) {
  return (
    <div className="card" style={{ padding: 20, cursor: 'pointer' }} onClick={onClick}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <div className="avatar">{expert.avatar}</div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}>{expert.name}</h3>
          <span style={{
            background: 'var(--primary-light)', color: 'var(--primary)',
            padding: '2px 10px', borderRadius: 100, fontSize: 12, fontWeight: 600
          }}>{expert.category}</span>
        </div>
      </div>
      <p style={{ fontSize: 13, color: 'var(--gray-500)', margin: '12px 0', lineHeight: 1.5 }}>
        {expert.bio}
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <StarRating rating={expert.rating} />
        <span style={{ fontSize: 13, color: 'var(--gray-500)' }}>
          {expert.experience} yrs exp
        </span>
      </div>
      <button className="btn btn-primary" style={{ width: '100%', marginTop: 14 }}>
        View Profile →
      </button>
    </div>
  );
}

export default function ExpertList() {
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const navigate = useNavigate();

  const fetchExperts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getExperts({ page, limit: 6, search, category });
      setExperts(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      setError('Failed to load experts. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page, search, category]);

  useEffect(() => { fetchExperts(); }, [fetchExperts]);

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [search, category]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Find Your Expert</h1>
        <p className="page-subtitle">Connect with top professionals for personalized guidance</p>
      </div>

      <div className="filters-bar">
        <input
          className="search-input"
          placeholder="🔍  Search by name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="filter-select" value={category} onChange={e => setCategory(e.target.value)}>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : error ? (
        <div className="alert alert-error">{error}</div>
      ) : experts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3>No experts found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <p style={{ fontSize: 14, color: 'var(--gray-500)', marginTop: 8 }}>
            Showing {experts.length} of {pagination.total} experts
          </p>
          <div className="experts-grid">
            {experts.map(expert => (
              <ExpertCard
                key={expert._id}
                expert={expert}
                onClick={() => navigate(`/experts/${expert._id}`)}
              />
            ))}
          </div>

          {pagination.pages > 1 && (
            <div className="pagination">
              <button className="page-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</button>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                <button key={p} className={`page-btn${p === page ? ' active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              ))}
              <button className="page-btn" onClick={() => setPage(p => p + 1)} disabled={page === pagination.pages}>›</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
