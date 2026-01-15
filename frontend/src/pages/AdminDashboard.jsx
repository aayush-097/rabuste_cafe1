import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { useAuth } from '../context/AuthContext';
import {
  adminGetMenu,
  adminCreateMenu,
  adminUpdateMenu,
  adminDeleteMenu,
  adminGetWorkshops,
  adminCreateWorkshop,
  adminUpdateWorkshop,
  adminDeleteWorkshop,
  adminGetArt,
  adminCreateArt,
  adminUpdateArt,
  adminDeleteArt,
  adminGetBookings,
  adminAcceptBooking,
  adminRejectBooking,
  adminGetWorkshopRegistrations,
  adminGetFranchiseEnquiries,
  adminUpdateEnquiryStatus,
  adminGetOrders,
  adminCompleteOrder,
  adminMarkOrderAsPaid,
  adminVerifyAndCompleteOrder,
  adminDeleteOrder,
} from '../services/api';

import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState('menu');
  const sidebarRef = useRef(null);
  const tl = useRef(null);

  /* ===== LISTS ===== */
  const [menuItems, setMenuItems] = useState([]);
  const [workshopItems, setWorkshopItems] = useState([]);
  const [artItems, setArtItems] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [workshopRegistrations, setWorkshopRegistrations] = useState([]);
  const [franchiseEnquiries, setFranchiseEnquiries] = useState([]);
  const [orders, setOrders] = useState([]);
  const [orderFilter, setOrderFilter] = useState('pending'); // 'pending' or 'completed'
  const [loadingItems, setLoadingItems] = useState(false);
  const [error, setError] = useState('');

  /* ===== EDIT MODE ===== */
  const [editingMenuId, setEditingMenuId] = useState(null);
  const [editingWorkshopId, setEditingWorkshopId] = useState(null);
  const [editingArtId, setEditingArtId] = useState(null);

  /* ===== DELETE CONFIRMATION ===== */
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, type: '', id: '', name: '' });

  /* ===== FORMS ===== */
  const [menuForm, setMenuForm] = useState({ category: '', url: '', public_id: '' });
  const [workshopForm, setWorkshopForm] = useState({
    title: '',
    description: '',
    date: '',
    totalSeats: '',
  });
  const [artForm, setArtForm] = useState({
    title: '',
    artistName: '',
    description: '',
    price: '',
    imageUrl: '',
  });

  useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [loading, user, navigate]);

  /* ===== FETCH ITEMS ===== */
  const fetchMenuItems = async () => {
    setLoadingItems(true);
    setError('');
    try {
      const res = await adminGetMenu();
      setMenuItems(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load menu items');
    } finally {
      setLoadingItems(false);
    }
  };

  const fetchWorkshopItems = async () => {
    setLoadingItems(true);
    setError('');
    try {
      const res = await adminGetWorkshops();
      setWorkshopItems(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load workshops');
    } finally {
      setLoadingItems(false);
    }
  };

  const fetchArtItems = async () => {
    setLoadingItems(true);
    setError('');
    try {
      const res = await adminGetArt();
      setArtItems(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load art items');
    } finally {
      setLoadingItems(false);
    }
  };

  const fetchBookings = async () => {
    setLoadingItems(true);
    setError('');
    try {
      const res = await adminGetBookings();
      setBookings(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoadingItems(false);
    }
  };

  const fetchWorkshopRegistrations = async () => {
    setLoadingItems(true);
    setError('');
    try {
      const res = await adminGetWorkshopRegistrations();
      setWorkshopRegistrations(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load workshop registrations');
    } finally {
      setLoadingItems(false);
    }
  };

  const fetchFranchiseEnquiries = async () => {
    setLoadingItems(true);
    setError('');
    try {
      const res = await adminGetFranchiseEnquiries();
      setFranchiseEnquiries(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load franchise enquiries');
    } finally {
      setLoadingItems(false);
    }
  };

  const fetchOrders = async (filter = 'pending') => {
    setLoadingItems(true);
    setError('');
    try {
      const res = await adminGetOrders(filter);
      console.log('📦 Orders API response:', res.data);
      
      // Handle response - res.data should be the array of orders
      const ordersArray = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setOrders(ordersArray);
    } catch (err) {
      console.error('Fetch orders error:', err);
      setError(err?.response?.data?.message || 'Failed to load orders');
      setOrders([]);
    } finally {
      setLoadingItems(false);
    }
  };

  useEffect(() => {
    if (activeSection === 'menu') fetchMenuItems();
    if (activeSection === 'workshop') fetchWorkshopItems();
    if (activeSection === 'art') fetchArtItems();
    if (activeSection === 'bookings') fetchBookings();
    if (activeSection === 'workshop-registrations') fetchWorkshopRegistrations();
    if (activeSection === 'franchise-enquiries') fetchFranchiseEnquiries();
    if (activeSection === 'orders') fetchOrders(orderFilter);
  }, [activeSection, orderFilter]);

  /* ===== GSAP SIDEBAR ===== */
  
 useEffect(() => {
  if (!sidebarRef.current) return;

  const items = sidebarRef.current.querySelectorAll("h4");

  tl.current = gsap.timeline({ paused: true });

  /* Sidebar container – smooth slide with depth */
  tl.current.fromTo(
    sidebarRef.current,
    {
      x: -280,
      opacity: 0,
      rotationY: -18,
      transformPerspective: 800,
      transformOrigin: "left center",
    },
    {
      x: 0,
      opacity: 1,
      rotationY: 0,
      duration: 0.75,
      ease: "power4.out",
    }
  );

  /* Stagger menu items – premium reveal */
  tl.current.fromTo(
    items,
    {
      x: -30,
      opacity: 0,
      filter: "blur(6px)",
    },
    {
      x: 0,
      opacity: 1,
      filter: "blur(0px)",
      duration: 0.45,
      ease: "power3.out",
      stagger: {
        each: 0.08,
        from: "start",
      },
    },
    "-=0.4" // overlap with sidebar animation
  );

}, []);
useEffect(() => {
  const btn = document.querySelector(".admin-back-btn");
  if (!btn) return;

  // Entry animation
  gsap.fromTo(
    btn,
    {
      y: -20,
      opacity: 0,
      scale: 0.9,
      filter: "blur(6px)",
    },
    {
      y: 0,
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      duration: 0.6,
      delay: 0.3,
      ease: "power3.out",
    }
  );

  // Hover micro-interaction
  btn.addEventListener("mouseenter", () => {
    gsap.to(btn, {
      scale: 1.05,
      duration: 0.25,
      ease: "power2.out",
    });
  });

  btn.addEventListener("mouseleave", () => {
    gsap.to(btn, {
      scale: 1,
      duration: 0.25,
      ease: "power2.out",
    });
  });
}, []);

  /* ===== HANDLERS ===== */
  const handleMenuSubmit = async () => {
    setError('');
    
    // Validate form data
    if (!menuForm.category && !menuForm.url) {
      setError('Please fill in at least category or URL');
      return;
    }
    
    try {
      console.log('📝 Submitting menu form:', { editingMenuId, menuForm });
      
      if (editingMenuId) {
        const res = await adminUpdateMenu(editingMenuId, menuForm);
        console.log('✅ Update response:', res.data);
        setEditingMenuId(null);
      } else {
        const res = await adminCreateMenu(menuForm);
        console.log('✅ Create response:', res.data);
      }
      setMenuForm({ category: '', url: '', public_id: '' });
      await fetchMenuItems();
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('❌ Error submitting menu form:', err);
      const errorMsg = err?.response?.data?.message || err?.message || 'Failed to save menu item';
      console.error('Error message:', errorMsg);
      console.error('Full error response:', err?.response?.data);
      setError(errorMsg);
    }
  };

  const handleWorkshopSubmit = async () => {
    setError('');
    try {
      const payload = {
        ...workshopForm,
        totalSeats: parseInt(workshopForm.totalSeats) || 0,
        date: workshopForm.date ? new Date(workshopForm.date).toISOString() : new Date().toISOString(),
      };
      if (editingWorkshopId) {
        await adminUpdateWorkshop(editingWorkshopId, payload);
        setEditingWorkshopId(null);
      } else {
        await adminCreateWorkshop(payload);
      }
      setWorkshopForm({ title: '', description: '', date: '', totalSeats: '' });
      fetchWorkshopItems();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save workshop');
    }
  };

  const handleArtSubmit = async () => {
    setError('');
    try {
      const payload = {
        ...artForm,
        price: parseFloat(artForm.price) || 0,
      };
      if (editingArtId) {
        await adminUpdateArt(editingArtId, payload);
        setEditingArtId(null);
      } else {
        await adminCreateArt(payload);
      }
      setArtForm({ title: '', artistName: '', description: '', price: '', imageUrl: '' });
      fetchArtItems();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save art item');
    }
  };

  const handleEditMenu = (item) => {
    setEditingMenuId(item._id);
    setMenuForm({ category: item.category, url: item.url, public_id: item.public_id });
  };

  const handleEditWorkshop = (item) => {
    setEditingWorkshopId(item._id);
    const dateStr = item.date ? new Date(item.date).toISOString().split('T')[0] : '';
    setWorkshopForm({
      title: item.title || '',
      description: item.description || '',
      date: dateStr,
      totalSeats: item.totalSeats?.toString() || '',
    });
  };

  const handleEditArt = (item) => {
    setEditingArtId(item._id);
    setArtForm({
      title: item.title || '',
      artistName: item.artistName || '',
      description: item.description || '',
      price: item.price?.toString() || '',
      imageUrl: item.imageUrl || '',
    });
  };

  const handleDelete = async () => {
    setError('');
    try {
      if (deleteConfirm.type === 'menu') {
        await adminDeleteMenu(deleteConfirm.id);
        fetchMenuItems();
      } else if (deleteConfirm.type === 'workshop') {
        await adminDeleteWorkshop(deleteConfirm.id);
        fetchWorkshopItems();
      } else if (deleteConfirm.type === 'art') {
        await adminDeleteArt(deleteConfirm.id);
        fetchArtItems();
      }
      setDeleteConfirm({ show: false, type: '', id: '', name: '' });
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete item');
    }
  };

  const cancelEdit = () => {
    setEditingMenuId(null);
    setEditingWorkshopId(null);
    setEditingArtId(null);
    setMenuForm({ category: '', url: '', public_id: '' });
    setWorkshopForm({ title: '', description: '', date: '', totalSeats: '' });
    setArtForm({ title: '', artistName: '', description: '', price: '', imageUrl: '' });
  };


  if (loading || !user || user.role !== 'admin') return null;

  return (
    <section className="admin-section">
      {/* HEADER */}
      <header className="admin-header">
        <i
          className="ri-menu-3-line admin-menu"
          onClick={() => tl.current.play()}
        />
        <div className="admin-user">
          <span>{user.email}</span>
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* SIDEBAR */}
      <aside className="admin-sidebar" ref={sidebarRef}>
        <h4 onClick={() => { setActiveSection('menu'); tl.current.reverse(); }}>🍽 Menu Images</h4>
        <h4 onClick={() => { navigate('/admin/menu'); tl.current.reverse(); }}>☕ Menu Items</h4>
        <h4 onClick={() => { setActiveSection('workshop'); tl.current.reverse(); }}>🎓 Workshops</h4>
        <h4 onClick={() => { setActiveSection('workshop-registrations'); tl.current.reverse(); }}>📝 Workshop Registrations</h4>
        <h4 onClick={() => { setActiveSection('art'); tl.current.reverse(); }}>🎨 Art</h4>
        <h4 onClick={() => { setActiveSection('bookings'); tl.current.reverse(); }}>📋 Art Bookings</h4>
        <h4 onClick={() => { setActiveSection('franchise-enquiries'); tl.current.reverse(); }}>🏢 Franchise Enquiries</h4>
        <h4 onClick={() => { setActiveSection('orders'); tl.current.reverse(); }}>🛒 Orders</h4>

        {/* CLOSE BUTTON AT BOTTOM */}
        <i
          className="ri-close-line close"
          onClick={() => tl.current.reverse()}
        />
      </aside>

      {/* CONTENT */}
      <main className="admin-content">
        {error && <div className="admin-error">{error}</div>}

        {activeSection === 'menu' && (
          <>
            <div className="admin-form-container">
              <div className="admin-form-card">
                <h3>{editingMenuId ? '✏️ Edit Menu Item' : '➕ Add New Menu Item'}</h3>
                
                <div className="form-group">
                  <label>Category</label>
                  <input 
                    placeholder="e.g., logo, coffee, appetizer" 
                    value={menuForm.category}
                    onChange={e => setMenuForm({ ...menuForm, category: e.target.value })} 
                  />
                </div>

                <div className="form-group">
                  <label>Image URL</label>
                  <input 
                    placeholder="e.g., https://example.com/image.jpg" 
                    value={menuForm.url}
                    onChange={e => setMenuForm({ ...menuForm, url: e.target.value })} 
                  />
                </div>

                <div className="form-group">
                  <label>Public ID</label>
                  <input 
                    placeholder="e.g., primary-logo, product-1" 
                    value={menuForm.public_id}
                    onChange={e => setMenuForm({ ...menuForm, public_id: e.target.value })} 
                  />
                </div>

                <div className="form-actions">
                  <button onClick={handleMenuSubmit} className="btn-primary">
                    {editingMenuId ? '💾 Update Item' : '➕ Save Item'}
                  </button>
                  {editingMenuId && (
                    <button onClick={cancelEdit} className="btn-secondary">❌ Cancel</button>
                  )}
                </div>
              </div>
            </div>

            <div className="admin-card">
              <h3>Menu Items ({menuItems.length})</h3>
              {loadingItems ? (
                <p>Loading...</p>
              ) : menuItems.length === 0 ? (
                <p>No menu items yet</p>
              ) : (
                <div className="admin-list">
                  {menuItems.map((item) => (
                    <div key={item._id} className="admin-list-item">
                      <div>
                        <strong>{item.category}</strong>
                        <span style={{ marginLeft: '10px', fontSize: '12px', color: '#999' }}>
                          {item.url?.substring(0, 50)}...
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => handleEditMenu(item)}
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => setDeleteConfirm({ show: true, type: 'menu', id: item._id, name: item.category })}
                          style={{ padding: '6px 12px', fontSize: '12px', background: '#d32f2f' }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {activeSection === 'workshop' && (
          <>
            <div className="admin-card">
              <h3>{editingWorkshopId ? 'Edit Workshop' : 'Add Workshop'}</h3>
              <input 
                placeholder="Title" 
                value={workshopForm.title}
                onChange={e => setWorkshopForm({ ...workshopForm, title: e.target.value })} 
              />
              <textarea 
                placeholder="Description" 
                value={workshopForm.description}
                onChange={e => setWorkshopForm({ ...workshopForm, description: e.target.value })} 
              />
              <input 
                type="date"
                placeholder="Date" 
                value={workshopForm.date}
                onChange={e => setWorkshopForm({ ...workshopForm, date: e.target.value })} 
              />
              <input 
                type="number"
                placeholder="Total Seats" 
                value={workshopForm.totalSeats}
                onChange={e => setWorkshopForm({ ...workshopForm, totalSeats: e.target.value })} 
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handleWorkshopSubmit}>
                  {editingWorkshopId ? 'Update Workshop' : 'Save Workshop'}
                </button>
                {editingWorkshopId && (
                  <button onClick={cancelEdit} style={{ background: '#666' }}>Cancel</button>
                )}
              </div>
            </div>

            <div className="admin-card">
              <h3>Workshops ({workshopItems.length})</h3>
              {loadingItems ? (
                <p>Loading...</p>
              ) : workshopItems.length === 0 ? (
                <p>No workshops yet</p>
              ) : (
                <div className="admin-list">
                  {workshopItems.map((item) => (
                    <div key={item._id} className="admin-list-item">
                      <div>
                        <strong>{item.title}</strong>
                        <span style={{ marginLeft: '10px', fontSize: '12px', color: '#999' }}>
                          {new Date(item.date).toLocaleDateString()} • {item.totalSeats} seats
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => handleEditWorkshop(item)}
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => setDeleteConfirm({ show: true, type: 'workshop', id: item._id, name: item.title })}
                          style={{ padding: '6px 12px', fontSize: '12px', background: '#d32f2f' }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {activeSection === 'workshop-registrations' && (
          <>
            <div className="admin-card">
              <h3>Workshop Registrations ({workshopRegistrations.length})</h3>
              {loadingItems ? (
                <p>Loading...</p>
              ) : workshopRegistrations.length === 0 ? (
                <p>No registrations yet</p>
              ) : (
                <div style={{ marginTop: '20px', overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #2a2a35' }}>
                        <th style={{ padding: '12px', textAlign: 'left', color: '#ccc', fontSize: '0.875rem', fontWeight: '600' }}>Workshop Title</th>
                        <th style={{ padding: '12px', textAlign: 'left', color: '#ccc', fontSize: '0.875rem', fontWeight: '600' }}>Name</th>
                        <th style={{ padding: '12px', textAlign: 'left', color: '#ccc', fontSize: '0.875rem', fontWeight: '600' }}>Phone</th>
                        <th style={{ padding: '12px', textAlign: 'left', color: '#ccc', fontSize: '0.875rem', fontWeight: '600' }}>Email</th>
                        <th style={{ padding: '12px', textAlign: 'left', color: '#ccc', fontSize: '0.875rem', fontWeight: '600' }}>Date Registered</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workshopRegistrations.map((registration) => (
                        <tr 
                          key={registration._id} 
                          style={{ 
                            borderBottom: '1px solid #2a2a35',
                            transition: 'background 0.2s',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 122, 24, 0.05)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <td style={{ padding: '12px', color: '#fff', fontSize: '0.875rem' }}>
                            <strong>{registration.workshopTitle}</strong>
                          </td>
                          <td style={{ padding: '12px', color: '#ccc', fontSize: '0.875rem' }}>
                            {registration.name}
                          </td>
                          <td style={{ padding: '12px', color: '#ccc', fontSize: '0.875rem' }}>
                            {registration.phone}
                          </td>
                          <td style={{ padding: '12px', color: '#ccc', fontSize: '0.875rem' }}>
                            {registration.email || '-'}
                          </td>
                          <td style={{ padding: '12px', color: '#999', fontSize: '0.75rem' }}>
                            {new Date(registration.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {activeSection === 'art' && (
          <>
            <div className="admin-card">
              <h3>{editingArtId ? 'Edit Art' : 'Add Art'}</h3>
              <input 
                placeholder="Title" 
                value={artForm.title}
                onChange={e => setArtForm({ ...artForm, title: e.target.value })} 
              />
              <input 
                placeholder="Artist" 
                value={artForm.artistName}
                onChange={e => setArtForm({ ...artForm, artistName: e.target.value })} 
              />
              <textarea 
                placeholder="Description" 
                value={artForm.description}
                onChange={e => setArtForm({ ...artForm, description: e.target.value })} 
              />
              <input 
                type="number"
                placeholder="Price" 
                value={artForm.price}
                onChange={e => setArtForm({ ...artForm, price: e.target.value })} 
              />
              <input 
                placeholder="Image URL" 
                value={artForm.imageUrl}
                onChange={e => setArtForm({ ...artForm, imageUrl: e.target.value })} 
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handleArtSubmit}>
                  {editingArtId ? 'Update Art' : 'Save Art'}
                </button>
                {editingArtId && (
                  <button onClick={cancelEdit} style={{ background: '#666' }}>Cancel</button>
                )}
              </div>
            </div>

            <div className="admin-card">
              <h3>Art Items ({artItems.length})</h3>
              {loadingItems ? (
                <p>Loading...</p>
              ) : artItems.length === 0 ? (
                <p>No art items yet</p>
              ) : (
                <div className="admin-list">
                  {artItems.map((item) => (
                    <div key={item._id} className="admin-list-item">
                      <div>
                        <strong>{item.title}</strong>
                        <span style={{ marginLeft: '10px', fontSize: '12px', color: '#999' }}>
                          by {item.artistName} • ${item.price}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => handleEditArt(item)}
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => setDeleteConfirm({ show: true, type: 'art', id: item._id, name: item.title })}
                          style={{ padding: '6px 12px', fontSize: '12px', background: '#d32f2f' }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {activeSection === 'bookings' && (
          <>
            <div className="admin-card">
              <h3>Art Bookings ({bookings.length})</h3>
              {loadingItems ? (
                <p>Loading...</p>
              ) : bookings.length === 0 ? (
                <p>No bookings yet</p>
              ) : (
                <div style={{ marginTop: '20px', overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #2a2a35' }}>
                        <th style={{ padding: '12px', textAlign: 'left', color: '#ccc', fontSize: '0.875rem', fontWeight: '600' }}>Art Name</th>
                        <th style={{ padding: '12px', textAlign: 'left', color: '#ccc', fontSize: '0.875rem', fontWeight: '600' }}>Customer</th>
                        <th style={{ padding: '12px', textAlign: 'left', color: '#ccc', fontSize: '0.875rem', fontWeight: '600' }}>Phone</th>
                        <th style={{ padding: '12px', textAlign: 'left', color: '#ccc', fontSize: '0.875rem', fontWeight: '600' }}>Email</th>
                        <th style={{ padding: '12px', textAlign: 'left', color: '#ccc', fontSize: '0.875rem', fontWeight: '600' }}>Message</th>
                        <th style={{ padding: '12px', textAlign: 'left', color: '#ccc', fontSize: '0.875rem', fontWeight: '600' }}>Status</th>
                        <th style={{ padding: '12px', textAlign: 'left', color: '#ccc', fontSize: '0.875rem', fontWeight: '600' }}>Date</th>
                        <th style={{ padding: '12px', textAlign: 'left', color: '#ccc', fontSize: '0.875rem', fontWeight: '600' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => (
                        <tr 
                          key={booking._id} 
                          style={{ 
                            borderBottom: '1px solid #2a2a35',
                            transition: 'background 0.2s',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 122, 24, 0.05)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <td style={{ padding: '12px', color: '#fff', fontSize: '0.875rem' }}>
                            <strong>{booking.artName}</strong>
                          </td>
                          <td style={{ padding: '12px', color: '#ccc', fontSize: '0.875rem' }}>
                            {booking.userName}
                          </td>
                          <td style={{ padding: '12px', color: '#ccc', fontSize: '0.875rem' }}>
                            {booking.phone}
                          </td>
                          <td style={{ padding: '12px', color: '#ccc', fontSize: '0.875rem' }}>
                            {booking.email || '-'}
                          </td>
                          <td style={{ padding: '12px', color: '#ccc', fontSize: '0.875rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {booking.message || '-'}
                          </td>
                          <td style={{ padding: '12px' }}>
                            <span
                              style={{
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                background: 
                                  booking.status === 'ACCEPTED' 
                                    ? 'rgba(76, 175, 80, 0.2)' 
                                    : booking.status === 'REJECTED'
                                    ? 'rgba(211, 47, 47, 0.2)'
                                    : 'rgba(255, 193, 7, 0.2)',
                                color: 
                                  booking.status === 'ACCEPTED'
                                    ? '#81c784'
                                    : booking.status === 'REJECTED'
                                    ? '#ff6b6b'
                                    : '#ffc107',
                                border: `1px solid ${
                                  booking.status === 'ACCEPTED' 
                                    ? 'rgba(76, 175, 80, 0.4)' 
                                    : booking.status === 'REJECTED'
                                    ? 'rgba(211, 47, 47, 0.4)'
                                    : 'rgba(255, 193, 7, 0.4)'
                                }`,
                              }}
                            >
                              {booking.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px', color: '#999', fontSize: '0.75rem' }}>
                            {new Date(booking.createdAt).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '12px' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              {booking.status === 'PENDING' && (
                                <>
                                  <button
                                    onClick={async () => {
                                      setError('');
                                      try {
                                        await adminAcceptBooking(booking._id);
                                        fetchBookings();
                                        fetchArtItems(); // Refresh art items to show updated status
                                      } catch (err) {
                                        setError(err?.response?.data?.message || 'Failed to accept booking');
                                      }
                                    }}
                                    style={{
                                      padding: '6px 12px',
                                      fontSize: '12px',
                                      background: '#4caf50',
                                      border: 'none',
                                      borderRadius: '6px',
                                      color: 'white',
                                      cursor: 'pointer',
                                      fontWeight: '600',
                                    }}
                                  >
                                    Accept
                                  </button>
                                  <button
                                    onClick={async () => {
                                      setError('');
                                      try {
                                        await adminRejectBooking(booking._id);
                                        fetchBookings();
                                        fetchArtItems(); // Refresh art items to show updated status
                                      } catch (err) {
                                        setError(err?.response?.data?.message || 'Failed to reject booking');
                                      }
                                    }}
                                    style={{
                                      padding: '6px 12px',
                                      fontSize: '12px',
                                      background: '#d32f2f',
                                      border: 'none',
                                      borderRadius: '6px',
                                      color: 'white',
                                      cursor: 'pointer',
                                      fontWeight: '600',
                                    }}
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                              {booking.status !== 'PENDING' && (
                                <span style={{ color: '#999', fontSize: '0.75rem' }}>
                                  {booking.status === 'ACCEPTED' ? '✓ Accepted' : '✗ Rejected'}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {activeSection === 'franchise-enquiries' && (
          <>
            <div className="admin-card">
              <h3>Franchise Enquiries ({franchiseEnquiries.length})</h3>
              {loadingItems ? (
                <p>Loading...</p>
              ) : franchiseEnquiries.length === 0 ? (
                <p>No enquiries yet</p>
              ) : (
                <div style={{ marginTop: '20px', overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #2a2a35' }}>
                        <th style={{ padding: '12px', textAlign: 'left', color: '#ccc', fontSize: '0.875rem', fontWeight: '600' }}>Name</th>
                        <th style={{ padding: '12px', textAlign: 'left', color: '#ccc', fontSize: '0.875rem', fontWeight: '600' }}>Phone</th>
                        <th style={{ padding: '12px', textAlign: 'left', color: '#ccc', fontSize: '0.875rem', fontWeight: '600' }}>City</th>
                        <th style={{ padding: '12px', textAlign: 'left', color: '#ccc', fontSize: '0.875rem', fontWeight: '600' }}>Email</th>
                        <th style={{ padding: '12px', textAlign: 'left', color: '#ccc', fontSize: '0.875rem', fontWeight: '600' }}>Investment Range</th>
                        <th style={{ padding: '12px', textAlign: 'left', color: '#ccc', fontSize: '0.875rem', fontWeight: '600' }}>Message</th>
                        <th style={{ padding: '12px', textAlign: 'left', color: '#ccc', fontSize: '0.875rem', fontWeight: '600' }}>Status</th>
                        <th style={{ padding: '12px', textAlign: 'left', color: '#ccc', fontSize: '0.875rem', fontWeight: '600' }}>Date</th>
                        <th style={{ padding: '12px', textAlign: 'left', color: '#ccc', fontSize: '0.875rem', fontWeight: '600' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {franchiseEnquiries.map((enquiry) => (
                        <tr 
                          key={enquiry._id} 
                          style={{ 
                            borderBottom: '1px solid #2a2a35',
                            transition: 'background 0.2s',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 122, 24, 0.05)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <td style={{ padding: '12px', color: '#fff', fontSize: '0.875rem' }}>
                            <strong>{enquiry.fullName}</strong>
                          </td>
                          <td style={{ padding: '12px', color: '#ccc', fontSize: '0.875rem' }}>
                            {enquiry.phone}
                          </td>
                          <td style={{ padding: '12px', color: '#ccc', fontSize: '0.875rem' }}>
                            {enquiry.city}
                          </td>
                          <td style={{ padding: '12px', color: '#ccc', fontSize: '0.875rem' }}>
                            {enquiry.email || '-'}
                          </td>
                          <td style={{ padding: '12px', color: '#ccc', fontSize: '0.875rem' }}>
                            {enquiry.investmentRange || '-'}
                          </td>
                          <td style={{ padding: '12px', color: '#ccc', fontSize: '0.875rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {enquiry.message || '-'}
                          </td>
                          <td style={{ padding: '12px' }}>
                            <span
                              style={{
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                background: 
                                  enquiry.status === 'CONTACTED' 
                                    ? 'rgba(76, 175, 80, 0.2)' 
                                    : 'rgba(255, 193, 7, 0.2)',
                                color: 
                                  enquiry.status === 'CONTACTED'
                                    ? '#81c784'
                                    : '#ffc107',
                                border: `1px solid ${
                                  enquiry.status === 'CONTACTED' 
                                    ? 'rgba(76, 175, 80, 0.4)' 
                                    : 'rgba(255, 193, 7, 0.4)'
                                }`,
                              }}
                            >
                              {enquiry.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px', color: '#999', fontSize: '0.75rem' }}>
                            {new Date(enquiry.createdAt).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '12px' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              {enquiry.status === 'NEW' && (
                                <button
                                  onClick={async () => {
                                    setError('');
                                    try {
                                      await adminUpdateEnquiryStatus(enquiry._id, 'CONTACTED');
                                      fetchFranchiseEnquiries();
                                    } catch (err) {
                                      setError(err?.response?.data?.message || 'Failed to update status');
                                    }
                                  }}
                                  style={{
                                    padding: '6px 12px',
                                    fontSize: '12px',
                                    background: '#4caf50',
                                    border: 'none',
                                    borderRadius: '6px',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                  }}
                                >
                                  Mark Contacted
                                </button>
                              )}
                              {enquiry.status === 'CONTACTED' && (
                                <button
                                  onClick={async () => {
                                    setError('');
                                    try {
                                      await adminUpdateEnquiryStatus(enquiry._id, 'NEW');
                                      fetchFranchiseEnquiries();
                                    } catch (err) {
                                      setError(err?.response?.data?.message || 'Failed to update status');
                                    }
                                  }}
                                  style={{
                                    padding: '6px 12px',
                                    fontSize: '12px',
                                    background: '#ffc107',
                                    border: 'none',
                                    borderRadius: '6px',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                  }}
                                >
                                  Mark New
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {activeSection === 'orders' && (
          <>
            <div className="admin-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3>Orders ({orders.length})</h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => {
                      setOrderFilter('pending');
                      fetchOrders('pending');
                    }}
                    style={{
                      padding: '8px 16px',
                      fontSize: '14px',
                      background: orderFilter === 'pending' ? '#d86732' : '#2a2a35',
                      border: 'none',
                      borderRadius: '6px',
                      color: 'white',
                      cursor: 'pointer',
                      fontWeight: '600',
                    }}
                  >
                    Pending Orders
                  </button>
                  <button
                    onClick={() => {
                      setOrderFilter('completed');
                      fetchOrders('completed');
                    }}
                    style={{
                      padding: '8px 16px',
                      fontSize: '14px',
                      background: orderFilter === 'completed' ? '#d86732' : '#2a2a35',
                      border: 'none',
                      borderRadius: '6px',
                      color: 'white',
                      cursor: 'pointer',
                      fontWeight: '600',
                    }}
                  >
                    Completed Orders
                  </button>
                </div>
              </div>
              {loadingItems ? (
                <p>Loading...</p>
              ) : orders.length === 0 ? (
                <p>No {orderFilter} orders yet</p>
              ) : !Array.isArray(orders) ? (
                <p>Error: Invalid orders data</p>
              ) : (
                <div style={{ marginTop: '20px', overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #2a2a35' }}>
                        <th style={{ padding: '12px', textAlign: 'left', color: '#ccc', fontSize: '0.875rem', fontWeight: '600' }}>Order ID</th>
                        <th style={{ padding: '12px', textAlign: 'left', color: '#ccc', fontSize: '0.875rem', fontWeight: '600' }}>Token</th>
                        <th style={{ padding: '12px', textAlign: 'left', color: '#ccc', fontSize: '0.875rem', fontWeight: '600' }}>User</th>
                        <th style={{ padding: '12px', textAlign: 'left', color: '#ccc', fontSize: '0.875rem', fontWeight: '600' }}>Items</th>
                        <th style={{ padding: '12px', textAlign: 'left', color: '#ccc', fontSize: '0.875rem', fontWeight: '600' }}>Total</th>
                        <th style={{ padding: '12px', textAlign: 'left', color: '#ccc', fontSize: '0.875rem', fontWeight: '600' }}>Payment Method</th>
                        <th style={{ padding: '12px', textAlign: 'left', color: '#ccc', fontSize: '0.875rem', fontWeight: '600' }}>Payment Status</th>
                        <th style={{ padding: '12px', textAlign: 'left', color: '#ccc', fontSize: '0.875rem', fontWeight: '600' }}>Pickup Time</th>
                        <th style={{ padding: '12px', textAlign: 'left', color: '#ccc', fontSize: '0.875rem', fontWeight: '600' }}>Status</th>
                        <th style={{ padding: '12px', textAlign: 'left', color: '#ccc', fontSize: '0.875rem', fontWeight: '600' }}>Date</th>
                        <th style={{ padding: '12px', textAlign: 'left', color: '#ccc', fontSize: '0.875rem', fontWeight: '600' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr 
                          key={order._id} 
                          style={{ 
                            borderBottom: '1px solid #2a2a35',
                            transition: 'background 0.2s',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 122, 24, 0.05)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <td style={{ padding: '12px', color: '#fff', fontSize: '0.875rem', fontWeight: '600' }}>
                            {order.orderId}
                          </td>
                          <td style={{ padding: '12px', color: '#ff7a18', fontSize: '0.875rem', fontWeight: '600' }}>
                            {order.orderToken || '-'}
                          </td>
                          <td style={{ padding: '12px', color: '#ccc', fontSize: '0.875rem' }}>
                            {order.user?.name || order.user?.email || 'Unknown'}
                          </td>
                          <td style={{ padding: '12px', color: '#ccc', fontSize: '0.875rem' }}>
                            <div style={{ maxWidth: '200px' }}>
                              {Array.isArray(order.items) && order.items.map((item) => (
                                <div key={item.name} style={{ marginBottom: '4px' }}>
                                  {item.name} × {item.quantity}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td style={{ padding: '12px', color: '#fff', fontSize: '0.875rem', fontWeight: '600' }}>
                            ₹{order.totalAmount.toFixed(2)}
                          </td>
                          <td style={{ padding: '12px', color: '#ccc', fontSize: '0.875rem' }}>
                            {order.paymentMethod === 'PAY_NOW' ? 'Pay Now' : 'Pay at Counter'}
                          </td>
                          <td style={{ padding: '12px' }}>
                            <span
                              style={{
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                background: order.paymentStatus === 'PAID' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 193, 7, 0.2)',
                                color: order.paymentStatus === 'PAID' ? '#81c784' : '#ffc107',
                                border: `1px solid ${order.paymentStatus === 'PAID' ? 'rgba(76, 175, 80, 0.4)' : 'rgba(255, 193, 7, 0.4)'}`,
                              }}
                            >
                              {order.paymentStatus}
                            </span>
                          </td>
                          <td style={{ padding: '12px', color: '#ccc', fontSize: '0.875rem' }}>
                            {new Date(order.pickupTime).toLocaleString()}
                          </td>
                          <td style={{ padding: '12px' }}>
                            <span
                              style={{
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                background: order.status === 'COMPLETED' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 193, 7, 0.2)',
                                color: order.status === 'COMPLETED' ? '#81c784' : '#ffc107',
                                border: `1px solid ${order.status === 'COMPLETED' ? 'rgba(76, 175, 80, 0.4)' : 'rgba(255, 193, 7, 0.4)'}`,
                              }}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px', color: '#999', fontSize: '0.75rem' }}>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '12px' }}>
                            {order.status === 'PENDING' && (
                              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {/* PAY_AT_COUNTER: Show "Mark as Paid" if not yet paid */}
                                {order.paymentMethod === 'PAY_AT_COUNTER' && order.paymentStatus !== 'PAID' && (
                                  <button
                                    onClick={async () => {
                                      setError('');
                                      try {
                                        await adminMarkOrderAsPaid(order._id);
                                        fetchOrders(orderFilter);
                                      } catch (err) {
                                        setError(err?.response?.data?.message || 'Failed to mark order as paid');
                                      }
                                    }}
                                    style={{
                                      padding: '6px 12px',
                                      fontSize: '12px',
                                      background: '#2196F3',
                                      border: 'none',
                                      borderRadius: '6px',
                                      color: 'white',
                                      cursor: 'pointer',
                                      fontWeight: '600',
                                    }}
                                  >
                                    Mark as Paid
                                  </button>
                                )}
                                {/* PAY_NOW: Show "Verify & Complete" if payment unverified */}
                                {order.paymentMethod === 'PAY_NOW' && order.paymentStatus === 'PAID_UNVERIFIED' && (
                                  <button
                                    onClick={async () => {
                                      setError('');
                                      try {
                                        await adminVerifyAndCompleteOrder(order._id);
                                        setOrders(prev => prev.filter(o => o._id !== order._id));
                                      } catch (err) {
                                        setError(err?.response?.data?.message || 'Failed to verify and complete order');
                                      }
                                    }}
                                    style={{
                                      padding: '6px 12px',
                                      fontSize: '12px',
                                      background: '#4caf50',
                                      border: 'none',
                                      borderRadius: '6px',
                                      color: 'white',
                                      cursor: 'pointer',
                                      fontWeight: '600',
                                    }}
                                  >
                                    Verify & Complete
                                  </button>
                                )}
                                {/* Fallback: Generic Complete Order button */}
                                {order.paymentMethod !== 'PAY_NOW' && order.paymentStatus === 'PAID' && (
                                  <button
                                    onClick={async () => {
                                      setError('');
                                      try {
                                        await adminCompleteOrder(order._id);
                                        setOrders(prev => prev.filter(o => o._id !== order._id));
                                      } catch (err) {
                                        setError(err?.response?.data?.message || 'Failed to complete order');
                                      }
                                    }}
                                    style={{
                                      padding: '6px 12px',
                                      fontSize: '12px',
                                      background: '#4caf50',
                                      border: 'none',
                                      borderRadius: '6px',
                                      color: 'white',
                                      cursor: 'pointer',
                                      fontWeight: '600',
                                    }}
                                  >
                                    Complete Order
                                  </button>
                                )}
                              </div>
                            )}
                            {order.status === 'COMPLETED' && (
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <span style={{ color: '#999', fontSize: '0.75rem' }}>✓ Completed</span>
                                <button
                                  onClick={async () => {
                                    if (!confirm('Clear this completed order? This will delete the order record.')) return;
                                    setError('');
                                    try {
                                      await adminDeleteOrder(order._id);
                                      setOrders(prev => prev.filter(o => o._id !== order._id));
                                    } catch (err) {
                                      setError(err?.response?.data?.message || 'Failed to clear order');
                                    }
                                  }}
                                  style={{
                                    padding: '6px 10px',
                                    fontSize: '12px',
                                    background: '#d32f2f',
                                    border: 'none',
                                    borderRadius: '6px',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                  }}
                                >
                                  Clear
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirm.show && (
        <div className="admin-modal-overlay" onClick={() => setDeleteConfirm({ show: false, type: '', id: '', name: '' })}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete "{deleteConfirm.name}"?</p>
            <p style={{ fontSize: '12px', color: '#999' }}>This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={handleDelete} style={{ background: '#d32f2f' }}>Delete</button>
              <button onClick={() => setDeleteConfirm({ show: false, type: '', id: '', name: '' })} style={{ background: '#666' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default AdminDashboard;
