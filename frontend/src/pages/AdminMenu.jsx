import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/AdminDashboard.css';

// API Base URL from environment or default
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';


const MENU_TABS = [
  "Robusta Speciality Coffee",
  "Blend Coffee",
  "Manual Brew",
  "Non Coffee Drinks",
  "Savoury"
];

const CATEGORY_ID_MAP = {
  "Robusta Speciality Coffee": "cat_robusta",
  "Blend Coffee": "cat_blend",
  "Manual Brew": "cat_manual",
  "Non Coffee Drinks": "cat_noncoffee",
  "Savoury": "cat_food"
};

function buildSubCategoryId(categoryId, subName) {
  const clean = subName.toLowerCase().replace(/\s+/g, "_");
  if (clean === "shake") return "sub_shake";
  if (clean === "cold_tea") return "sub_tea";
  if (clean === "food_items") return "sub_food";
  if (clean === "manual_brew") return "sub_manual";
  return `sub_${categoryId.replace("cat_", "")}_${clean}`;
}

const AdminMenu = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [menuData, setMenuData] = useState({
    categories: [],
    subCategories: [],
    groups: [],
    items: []
  });
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Edit state - use composite key to uniquely identify row location
  const [editingKey, setEditingKey] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    price: '',
    inStock: true,
    isActive: true
  });

  // Add new item state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addCategoryId, setAddCategoryId] = useState('');
  const [addForm, setAddForm] = useState({
    name: '',
    categoryId: '',
    subCategoryId: '',
    section: 'GENERAL',
    price: '',
    strength: 'medium',
    tags: '',
    inStock: true,
    isActive: true,
    isSignature: false
  });

  useEffect(() => {
    if (!loading && !user) navigate('/login');
    if (!loading && user?.role !== 'admin') navigate('/');
  }, [loading, user, navigate]);

  useEffect(() => {
    fetchMenuData();
  }, []);

  const fetchMenuData = async () => {
    setLoadingData(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE.replace(/\/api$/, '')}/debug/menu-full`);
      const data = await res.json();
      setMenuData(data);
    } catch (err) {
      setError('Failed to load menu data');
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleEdit = (item, categoryId, subCategoryId, section) => {
    const price = item.prices?.[0]?.price || 0;
    const inStock = item.prices?.[0]?.inStock !== false;
    const itemId = String(item._id || item.id);
    
    // Build composite key: categoryId|subCategoryId|section|itemId
    const compositeKey = `${categoryId}|${subCategoryId}|${section}|${itemId}`;
    
    setEditingKey(compositeKey);
    setEditForm({
      name: item.name || '',
      price: price.toString(),
      inStock,
      isActive: item.isActive !== false
    });
  };

const handleSaveEdit = async () => {
  if (!editingKey) return;

  setError('');
  setSuccess('');

  try {
    // Extract itemId from composite key (last part after final |)
    const parts = editingKey.split('|');
    const itemId = parts[parts.length - 1];
    
    const token = localStorage.getItem('rabuste_token');

    const res = await fetch(
      `${API_BASE}/admin/menu/item/${itemId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editForm.name,
          prices: [{
            size: 'regular',
            price: parseFloat(editForm.price) || 0,
            inStock: editForm.inStock
          }],
          isActive: editForm.isActive
        })
      }
    );

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to update item');
    }

    setSuccess('Item updated successfully');
    setEditingKey(null);
    await fetchMenuData();
    setTimeout(() => setSuccess(''), 3000);
  } catch (err) {
    setError(err.message || 'Failed to update item');
  }
};


  const handleDelete = async (itemId, itemName) => {
    if (!confirm(`Delete "${itemName}"? This cannot be undone.`)) return;

    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('rabuste_token');
      const res = await fetch(`${API_BASE}/admin/menu/item/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to delete item');
      }

      setSuccess('Item deleted successfully');
      await fetchMenuData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete item');
    }
  };

  const handleOpenAddModal = (categoryId) => {
    setAddCategoryId(categoryId);
    setAddForm({
      name: '',
      categoryId: categoryId,
      subCategoryId: '',
      section: 'GENERAL',
      price: '',
      strength: 'medium',
      tags: '',
      inStock: true,
      isActive: true,
      isSignature: false
    });
    setShowAddModal(true);
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!addForm.name || !addForm.price || !addForm.subCategoryId) {
      setError('Name, price, and subcategory are required');
      return;
    }

    try {
      // Find the subcategory by derived string ID (like MenuViewer)
      const subCategory = menuData.subCategories.find(
        sc => {
          const derivedSubId = buildSubCategoryId(addForm.categoryId, sc.name);
          return derivedSubId === addForm.subCategoryId;
        }
      );
      if (!subCategory) {
        throw new Error('Subcategory not found');
      }

      // Find or create the group (section) - match by subCategoryId ObjectId (for backend)
      const subCategoryObjectId = subCategory._id || subCategory.id;
      let group = menuData.groups.find(
        g => {
          const gSubCategoryId = g.subCategoryId?.toString();
          return gSubCategoryId === subCategoryObjectId?.toString() && g.name === addForm.section;
        }
      );

      if (!group) {
        // Create new group for this section
        const token = localStorage.getItem('rabuste_token');
        const groupRes = await fetch(`${API_BASE}/admin/menu/group`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: addForm.section,
            subCategoryId: subCategoryObjectId,
            displayOrder: 0,
            isActive: true
          })
        });

        if (!groupRes.ok) {
          const err = await groupRes.json();
          throw new Error(err.message || 'Failed to create group');
        }
        const newGroup = await groupRes.json();
        group = { _id: newGroup._id || newGroup.id };
      }

      const token = localStorage.getItem('rabuste_token');
      const tagsArray = addForm.tags ? addForm.tags.split(',').map(t => t.trim()).filter(Boolean) : [];

      const res = await fetch(`${API_BASE}/admin/menu/item`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: addForm.name,
          groupId: group._id || group.id || group,
          prices: [{
            size: 'regular',
            price: parseFloat(addForm.price) || 0,
            inStock: addForm.inStock
          }],
          isActive: addForm.isActive,
          displayOrder: 0
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to create item');
      }

      setSuccess('Item created successfully');
      setShowAddModal(false);
      await fetchMenuData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to create item');
    }
  };

  // Filter subcategories for selected category - EXACTLY like MenuViewer
  const filteredSubCategories = useMemo(() => {
    if (!selectedCategory) return [];
    
    // selectedCategory is a string like "cat_robusta" from CATEGORY_ID_MAP
    return menuData.subCategories
      .filter((s) => s.category === selectedCategory)  // EXACT match like MenuViewer line 194
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }, [selectedCategory, menuData.subCategories]);

  // Filter and group items for selected category - EXACTLY like MenuViewer
  const categoryItems = useMemo(() => {
    if (!selectedCategory) return [];
    
    const categoryId = selectedCategory; // string like "cat_robusta"
    const seenItemIds = new Set();
    const result = [];
    
    filteredSubCategories.forEach(subCategory => {
      const subId = buildSubCategoryId(categoryId, subCategory.name);  // EXACT like MenuViewer line 197
      
      // Filter items EXACTLY like MenuViewer lines 199-203
      const items = menuData.items.filter(
        (i) =>
          i.categoryId === categoryId &&  // STRING comparison
          i.subCategoryId === subId        // STRING comparison
      );

      if (!items.length) return;

      // Group by section EXACTLY like MenuViewer lines 207-211
      const sections = items.reduce((acc, item) => {
        acc[item.section || "GENERAL"] ??= [];
        acc[item.section || "GENERAL"].push(item);
        return acc;
      }, {});

      // Create result structure
      Object.entries(sections).forEach(([section, sectionItems]) => {
        // Only add items not seen before (safety check)
        const uniqueItems = sectionItems.filter(item => {
          const itemId = item._id?.toString() || item.id?.toString();
          if (itemId && seenItemIds.has(itemId)) return false;
          if (itemId) seenItemIds.add(itemId);
          return true;
        });

        if (uniqueItems.length > 0) {
          result.push({
            subCategoryId: subId,
            subCategoryName: subCategory.name,
            section: section,
            items: uniqueItems.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
          });
        }
      });
    });

    return result;
  }, [selectedCategory, filteredSubCategories, menuData.items]);
  
  // Get available subcategories for add form - use STRING category field
  const availableSubCategories = useMemo(() => {
    if (!addForm.categoryId) return [];
    
    // addForm.categoryId is a string like "cat_robusta" from CATEGORY_ID_MAP
    return menuData.subCategories
      .filter((s) => s.category === addForm.categoryId)  // STRING comparison like MenuViewer
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }, [addForm.categoryId, menuData.subCategories]);

  if (loading || !user || user.role !== 'admin') return null;

  return (
    <div className="admin-section">
      <header className="admin-header">
        <h2>Menu Management</h2>
        <button className="admin-back-btn" onClick={() => navigate('/admin')} aria-label="Back to Dashboard">
          ← Back to Dashboard
        </button>
      </header>

      <main className="admin-content" style={{ maxWidth: '1400px' }}>
        {error && <div className="admin-error">{error}</div>}
        {success && <div style={{ 
          background: 'rgba(22, 101, 52, 0.4)', 
          border: '1px solid rgba(74, 222, 128, 0.6)',
          color: '#bbf7d0',
          padding: '12px 16px',
          borderRadius: '10px',
          marginBottom: '20px'
        }}>{success}</div>}

        {/* Category Dropdown */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px',
            fontSize: '0.875rem',
            color: '#ccc',
            fontWeight: 500
          }}>
            Select Category
          </label>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="input"
            style={{ 
              width: '100%',
              maxWidth: '400px',
              padding: '12px 16px',
              fontSize: '1rem'
            }}
          >
            <option value="">-- Select a category --</option>
            {MENU_TABS.map(tab => (
              <option key={tab} value={CATEGORY_ID_MAP[tab]}>
                {tab}
              </option>
            ))}
          </select>
        </div>

        {loadingData ? (
          <p className="muted">Loading menu...</p>
        ) : !selectedCategory ? (
          <p className="muted">Please select a category to view menu items.</p>
        ) : categoryItems.length === 0 ? (
          <div>
            <p className="muted" style={{ marginBottom: '16px' }}>
              No items found for this category.
            </p>
            {/* Debug info - remove after testing */}
            {process.env.NODE_ENV === 'development' && (
              <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '8px' }}>
                Debug: selectedCategory={selectedCategory}, 
                subCategories={filteredSubCategories.length}, 
                items={menuData.items.length}
              </div>
            )}
            <button
              className="cta secondary"
              onClick={() => {
                setAddForm({
                  name: '',
                  categoryId: selectedCategory,
                  subCategoryId: '',
                  section: 'GENERAL',
                  price: '',
                  strength: 'medium',
                  tags: '',
                  inStock: true,
                  isActive: true,
                  isSignature: false
                });
                setShowAddModal(true);
              }}
              style={{ padding: '8px 16px', fontSize: '0.875rem' }}
            >
              + Add New Item
            </button>
          </div>
        ) : (
          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h3 style={{ 
                fontFamily: 'var(--font-heading)',
                fontSize: '1.5rem',
                fontWeight: 600
              }}>{MENU_TABS.find(t => CATEGORY_ID_MAP[t] === selectedCategory)}</h3>
              <button
                className="cta secondary"
                onClick={() => {
                  setAddForm({
                    name: '',
                    categoryId: selectedCategory,
                    subCategoryId: '',
                    section: 'GENERAL',
                    price: '',
                    strength: 'medium',
                    tags: '',
                    inStock: true,
                    isActive: true,
                    isSignature: false
                  });
                  setShowAddModal(true);
                }}
                style={{ padding: '8px 16px', fontSize: '0.875rem' }}
              >
                + Add New Item
              </button>
            </div>

            {/* Group by subcategory, then by section - EXACTLY like MenuViewer structure */}
            {filteredSubCategories.map(subCategory => {
              const subId = buildSubCategoryId(selectedCategory, subCategory.name);
              const subCategoryData = categoryItems.filter(d => d.subCategoryId === subId);
              
              if (subCategoryData.length === 0) return null;

              return (
                <div key={subId} style={{ marginBottom: '32px' }}>
                  <h4 style={{ 
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.125rem',
                    marginBottom: '16px',
                    color: 'var(--accent-soft)',
                    textTransform: 'uppercase'
                  }}>{subCategory.name}</h4>

                  {subCategoryData.map(({ section, items }) => {
                    const sectionKey = `${subId}-${section}`;
                    return (
                    <div key={sectionKey} style={{ 
                      marginBottom: '24px',
                      padding: '20px',
                      background: 'rgba(24, 18, 16, 0.6)',
                      borderRadius: '12px',
                      border: '1px solid rgba(216, 107, 50, 0.2)'
                    }}>
                      <p style={{ 
                        fontSize: '0.875rem',
                        color: 'var(--muted)',
                        marginBottom: '16px',
                        fontWeight: 500
                      }}>Section: {section}</p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {items.map(item => {
                          // Get stable item ID
                          const itemId = String(item._id || item.id);
                          
                          // Build composite key for this row: categoryId|subCategoryId|section|itemId
                          const rowKey = `${selectedCategory}|${subId}|${section}|${itemId}`;
                          
                          // Only this exact row should be in edit mode
                          const isEditing = editingKey === rowKey;
                          
                          // ALWAYS compute from item properties (never from editForm)
                          const itemPrice = item.prices?.[0]?.price || 0;
                          const itemInStock = item.prices?.[0]?.inStock !== false;
                          const itemName = item.name || '';
                          const itemIsActive = item.isActive !== false;

                          return (
                            <div
                              key={rowKey}
                              style={{
                                display: 'flex',
                                gap: '12px',
                                alignItems: 'center',
                                padding: '12px',
                                background: 'rgba(15, 12, 10, 0.8)',
                                borderRadius: '8px',
                                opacity: itemIsActive ? 1 : 0.5,
                                border: '1px solid rgba(216, 107, 50, 0.15)'
                              }}
                            >
                              {isEditing ? (
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '100%', flexWrap: 'wrap' }}>
                                  <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                    style={{ flex: 1, padding: '8px', borderRadius: '6px' }}
                                    className="input"
                                  />
                                  <input
                                    type="number"
                                    value={editForm.price}
                                    onChange={e => setEditForm({ ...editForm, price: e.target.value })}
                                    placeholder="Price"
                                    style={{ width: '100px', padding: '8px', borderRadius: '6px' }}
                                    className="input"
                                  />
                                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <input
                                      type="checkbox"
                                      checked={editForm.inStock}
                                      onChange={e => setEditForm({ ...editForm, inStock: e.target.checked })}
                                    />
                                    <span style={{ fontSize: '0.875rem' }}>In Stock</span>
                                  </label>
                                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <input
                                      type="checkbox"
                                      checked={editForm.isActive}
                                      onChange={e => setEditForm({ ...editForm, isActive: e.target.checked })}
                                    />
                                    <span style={{ fontSize: '0.875rem' }}>Active</span>
                                  </label>
                                  <button
                                    onClick={handleSaveEdit}
                                    className="cta"
                                    style={{ padding: '8px 16px', fontSize: '0.875rem' }}
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingKey(null)}
                                    className="cta secondary"
                                    style={{ padding: '8px 16px', fontSize: '0.875rem' }}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '100%' }}>
                                  <div style={{ flex: 1 }}>
                                    <strong>{itemName}</strong>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--muted)', marginTop: '4px' }}>
                                      ₹{itemPrice} {!itemInStock && '• Out of Stock'} {!itemIsActive && '• Inactive'}
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleEdit(item, selectedCategory, subId, section)}
                                    className="cta secondary"
                                    style={{ padding: '6px 12px', fontSize: '0.8125rem' }}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDelete(itemId, itemName)}
                                    style={{
                                      padding: '6px 12px',
                                      fontSize: '0.8125rem',
                                      background: 'rgba(211, 47, 47, 0.2)',
                                      border: '1px solid #d32f2f',
                                      color: '#ff6b6b',
                                      borderRadius: '6px',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}

        {/* Add Item Modal */}
        {showAddModal && (
          <div className="admin-modal-overlay" onClick={() => {
            setShowAddModal(false);
            setAddForm({
              name: '',
              categoryId: '',
              subCategoryId: '',
              section: 'GENERAL',
              price: '',
              strength: 'medium',
              tags: '',
              inStock: true,
              isActive: true,
              isSignature: false
            });
          }}>
            <div className="admin-modal" onClick={e => e.stopPropagation()}>
              <h3>➕ Add New Menu Item</h3>
              
              <form onSubmit={handleAddItem} className="admin-form">
                <label>
                  Name *
                  <input
                    type="text"
                    value={addForm.name}
                    onChange={e => setAddForm({ ...addForm, name: e.target.value })}
                    required
                    className="input"
                  />
                </label>

                <label>
                  Category
                  <select
                    value={addForm.categoryId}
                    onChange={e => {
                      setAddForm({ ...addForm, categoryId: e.target.value, subCategoryId: '' });
                    }}
                    className="input"
                  >
                    <option value="">Select Category</option>
                    {MENU_TABS.map(tab => (
                      <option key={tab} value={CATEGORY_ID_MAP[tab]}>
                        {tab}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Subcategory *
                  <select
                    value={addForm.subCategoryId}
                    onChange={e => setAddForm({ ...addForm, subCategoryId: e.target.value })}
                    required
                    className="input"
                    disabled={!addForm.categoryId}
                  >
                    <option value="">Select Subcategory</option>
                    {availableSubCategories.map(sc => {
                      const derivedSubId = buildSubCategoryId(addForm.categoryId, sc.name);
                      return (
                        <option key={derivedSubId} value={derivedSubId}>
                          {sc.name}
                        </option>
                      );
                    })}
                  </select>
                </label>

                <label>
                  Section
                  <input
                    type="text"
                    value={addForm.section}
                    onChange={e => setAddForm({ ...addForm, section: e.target.value })}
                    placeholder="GENERAL"
                    className="input"
                  />
                </label>

                <label>
                  Price *
                  <input
                    type="number"
                    value={addForm.price}
                    onChange={e => setAddForm({ ...addForm, price: e.target.value })}
                    required
                    min="0"
                    step="0.01"
                    className="input"
                  />
                </label>

                <label>
                  Strength
                  <select
                    value={addForm.strength}
                    onChange={e => setAddForm({ ...addForm, strength: e.target.value })}
                    className="input"
                  >
                    <option value="light">Light</option>
                    <option value="medium">Medium</option>
                    <option value="strong">Strong</option>
                  </select>
                </label>

                <label>
                  Tags (comma separated)
                  <input
                    type="text"
                    value={addForm.tags}
                    onChange={e => setAddForm({ ...addForm, tags: e.target.value })}
                    placeholder="bold, cold, signature"
                    className="input"
                  />
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={addForm.inStock}
                    onChange={e => setAddForm({ ...addForm, inStock: e.target.checked })}
                  />
                  In Stock
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={addForm.isActive}
                    onChange={e => setAddForm({ ...addForm, isActive: e.target.checked })}
                  />
                  Is Active
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={addForm.isSignature}
                    onChange={e => setAddForm({ ...addForm, isSignature: e.target.checked })}
                  />
                  Is Signature
                </label>

                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                  <button type="submit" className="cta">
                    Create Item
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setAddForm({
                        name: '',
                        categoryId: '',
                        subCategoryId: '',
                        section: 'GENERAL',
                        price: '',
                        strength: 'medium',
                        tags: '',
                        inStock: true,
                        isActive: true,
                        isSignature: false
                      });
                    }}
                    className="cta secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminMenu;

