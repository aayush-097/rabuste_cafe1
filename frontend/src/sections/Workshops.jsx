import { useState } from 'react';
import { registerWorkshop } from '../services/api';

const Workshops = ({ workshops, loading }) => {
  const [form, setForm] = useState({ 
    workshopId: '', 
    workshopTitle: '',
    name: '', 
    phone: '',
    email: '' 
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setSubmitting(true);
    try {
      const res = await registerWorkshop(form);
      setMessage(res.data.message);
      // Clear form on success
      setForm({ 
        workshopId: '', 
        workshopTitle: '',
        name: '', 
        phone: '',
        email: '' 
      });
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not register');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWorkshopSelect = (e) => {
    const selectedId = e.target.value;
    const selectedWorkshop = workshops.find(w => w._id === selectedId);
    setForm({
      ...form,
      workshopId: selectedId,
      workshopTitle: selectedWorkshop ? selectedWorkshop.title : '',
    });
  };

  return (
    <section id="workshops">
      <p className="section-kicker">Workshops & Experiences</p>
      <div className="section-header">
        <h2 className="section-title">Limited-seat sessions to play with robusta.</h2>
        <span className="pill">Seat validation enforced</span>
      </div>
      {loading ? (
        <p className="muted">Loading workshops…</p>
      ) : (
        <div className="grid two">
          <div className="grid">
            {workshops.map((w) => (
              <div className="card" key={w._id || w.title}>
                <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3>{w.title}</h3>
                  <span className="pill">{new Date(w.date).toLocaleDateString()}</span>
                </div>
                <p className="muted" style={{ margin: '6px 0 10px' }}>
                  {w.description}
                </p>
                <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="tag">Seats left: {w.seatsLeft ?? w.totalSeats - w.registeredCount}</span>
                  <span className="pill">{w.registeredCount}/{w.totalSeats} booked</span>
                </div>
              </div>
            ))}
          </div>
          <div className="card">
            <h3>Register</h3>
            <p className="muted" style={{ marginBottom: 12 }}>
              Pick a session. Seat limits are enforced in the backend to prevent overbooking.
            </p>
            <form onSubmit={onSubmit} className="grid">
              <select
                className="input"
                value={form.workshopId}
                onChange={handleWorkshopSelect}
                required
              >
                <option value="">Select a workshop</option>
                {workshops.map((w) => (
                  <option key={w._id || w.title} value={w._id}>
                    {w.title} — {Math.max(w.totalSeats - w.registeredCount, 0)} seats left
                  </option>
                ))}
              </select>
              <input
                className="input"
                placeholder="Your name *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <input
                className="input"
                type="tel"
                placeholder="Phone number *"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
              />
              <input
                className="input"
                type="email"
                placeholder="Email (optional)"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <button className="cta" type="submit" disabled={submitting}>
                {submitting ? 'Booking…' : 'Save my seat'}
              </button>
              {message && <div className="toast">{message}</div>}
              {error && <div className="toast error">{error}</div>}
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default Workshops;









