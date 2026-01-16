import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createOrder, getCart, addToCart, updateCart, removeFromCart, clearCart } from '../services/api';
import '../styles/Order.css';
// Category ID mapping (matching MenuViewer)
const CATEGORY_ID_MAP = {
  "Robusta Speciality Coffee": "cat_robusta",
  "Blend Coffee": "cat_blend",
  "Manual Brew": "cat_manual",
  "Non Coffee Drinks": "cat_noncoffee",
  "Savoury": "cat_food"
};
function getItemKey(item) {
  return `${item.categoryId}|${item.subCategoryId}|${item.section || "GENERAL"}|${item.name}`;
}
// Helper functions from MenuViewer
function buildSubCategoryId(categoryId, subName) {
  const clean = subName.toLowerCase().replace(/\s+/g, "_");
  if (clean === "shake") return "sub_shake";
  if (clean === "cold_tea") return "sub_tea";
  if (clean === "food_items") return "sub_food";
  if (clean === "manual_brew") return "sub_manual";
  return `sub_${categoryId.replace("cat_", "")}_${clean}`;
}

function getFinalPrice(item) {
  const base = item.prices?.[0]?.price;
  if (!base || !item.discount) {
    return { final: base, strike: null, label: null };
  }
  if (item.discount.type === "PERCENT") {
    const d = Math.round(base - (base * item.discount.value) / 100);
    return {
      final: d,
      strike: base,
      label: item.discount.label || `${item.discount.value}% OFF`
    };
  }
  if (item.discount.type === "FLAT") {
    const d = base - item.discount.value;
    return {
      final: d,
      strike: base,
      label: item.discount.label || `₹${item.discount.value} OFF`
    };
  }
  return { final: base, strike: null, label: null };
}

const Order = () => {
  const [menuData, setMenuData] = useState({
    categories: [],
    subCategories: [],
    items: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [pickupTime, setPickupTime] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [orderConfirmation, setOrderConfirmation] = useState(null);
  const [currentOrder, setCurrentOrder] = useState(null);

  // Load current order from localStorage per-user
  useEffect(() => {
    const storageKey = user ? `currentOrder_${user._id || user.id || user.email}` : null;
    if (!storageKey) {
      setCurrentOrder(null);
      return;
    }
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setCurrentOrder(JSON.parse(saved));
      } catch (err) {
        console.error('Failed to load current order:', err);
        setCurrentOrder(null);
      }
    } else {
      setCurrentOrder(null);
    }
  }, [user]);
  useEffect(() => {
  if (!user) {
    setCart([]);
    return;
  }

  const loadCart = async () => {
    try {
      const res = await getCart();
      const data = res.data.data;

      const mapped = (data.items || []).map(ci => ({
        itemId: typeof ci.item === 'object' ? ci.item._id : ci.item,
        name: typeof ci.item === 'object' ? ci.item.name : ci.name,
        price: typeof ci.item === 'object'
          ? ci.item.prices?.[0]?.price || 0
          : ci.price || 0,
        quantity: ci.quantity
      }));

      setCart(mapped);
    } catch (err) {
      console.error('Failed to load cart', err);
    }
  };

  loadCart();
}, [user]);

  // Fetch menu data
useEffect(() => {
  const fetchMenu = async () => {
    try {
      const apiBase = import.meta.env.VITE_API_BASE;

      console.log("🔍 VITE_API_BASE =", apiBase);

      if (!apiBase) {
        console.error("❌ VITE_API_BASE is missing");
        setError("Backend URL not configured");
        return;
      }

      // remove /api if present and hit debug endpoint
      const backendBase = apiBase.replace(/\/api$/, '');
      const url = `${backendBase}/debug/menu-full`;

      console.log("🌍 Fetching menu from:", url);

      const res = await fetch(url);

      console.log("📡 Response status:", res.status);
      if (!res.ok) throw new Error("HTTP " + res.status);

      const data = await res.json();

      console.log('📥 MENU DATA FETCHED:');
      console.log('  Categories:', data.categories?.length);
      console.log('  SubCategories:', data.subCategories?.length);
      console.log('  Items:', data.items?.length);
      if (data.items?.length > 0) {
        console.log('  First item:', data.items[0]);
      }

      setMenuData(data);

      // ✅ ORIGINAL LOGIC — UNCHANGED
      if (data.categories && data.categories.length > 0) {
        const firstCat =
          data.categories.find(c => c.isActive !== false) || data.categories[0];

        const categoryName = firstCat.name;
        const categoryStringId =
          CATEGORY_ID_MAP[categoryName] ||
          categoryName.toLowerCase().replace(/\s+/g, '_');

        setSelectedCategory(categoryStringId);
      }

    } catch (err) {
      setError('Failed to load menu. Please try again later.');
      console.error("❌ Menu fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchMenu();
}, []);

  // Reset subcategory when category changes
  useEffect(() => {
    setSelectedSubCategory('');
  }, [selectedCategory]);

  // Get available subcategories for selected category
  // Handle both ObjectId reference (categoryId) and string (category) formats
  // MenuViewer line 194 uses s.category === categoryId (string)
  // But backend model uses categoryId as ObjectId - menu-full may transform it
  const selectedCategoryObj = menuData.categories.find(cat => {
    const catName = cat.name;
    const catStringId = CATEGORY_ID_MAP[catName] || catName.toLowerCase().replace(/\s+/g, '_');
    return catStringId === selectedCategory;
  });

  const availableSubCategories = menuData.subCategories
    .filter((s) => {
      // Try string comparison first (MenuViewer style)
      if (s.category === selectedCategory) return true;
      // Try ObjectId comparison (backend model style)
      const subCatRef = s.categoryId?._id || s.categoryId || s.category?._id || s.category;
      const catRef = selectedCategoryObj?._id || selectedCategoryObj?.id;
      if (subCatRef && catRef) {
        return String(subCatRef) === String(catRef);
      }
      // Try category name match as fallback
      if (selectedCategoryObj && s.category?.name) {
        return s.category.name === selectedCategoryObj.name;
      }
      return false;
    })
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  // Get items grouped by subcategory and section (EXACT MenuViewer structure)
  // MenuViewer lines 193-211: subcategory → section → items
  const itemsBySubCategory = availableSubCategories.map((sub) => {
    const subId = buildSubCategoryId(selectedCategory, sub.name);

    const items = menuData.items.filter(
      (i) =>
        i.categoryId === selectedCategory && // STRING comparison
        i.subCategoryId === subId // STRING comparison
    );
    
    // DEBUG: Log first occurrence to see if items have _id
    if (items.length > 0 && subId === "sub_robusta_cold") {
      console.log('✨ FILTERED ITEMS FOR', subId, ':', items.length, 'items');
      console.log('  First item:', items[0]);
      console.log('  First item._id:', items[0]._id);
    }

    if (!items.length) return null;

    // Group by section EXACTLY like MenuViewer lines 207-211
    const sections = items.reduce((acc, item) => {
      acc[item.section || "GENERAL"] ??= [];
      acc[item.section || "GENERAL"].push(item);
      return acc;
    }, {});

    return {
      subId,
      subName: sub.name,
      sections: Object.entries(sections).map(([section, sectionItems]) => ({
        section,
        items: sectionItems.filter(item => item.isActive !== false)
      })).filter(sec => sec.items.length > 0)
    };
  }).filter(Boolean);

  // Get category display name
  const getCategoryName = (categoryId) => {
    const cat = menuData.categories.find(c => (c._id || c.id) === categoryId);
    return cat?.name || 'Unknown';
  };

  // Get subcategory display name
  const getSubCategoryName = (subCategoryId) => {
    const sub = menuData.subCategories.find(s => (s._id || s.id) === subCategoryId);
    return sub?.name || 'Unknown';
  };
const normalizeCart = (resData) => {
  console.log('normalizeCart input:', resData); // DEBUG
  
  const cart =
    resData?.data?.cart ||
    resData?.cart ||
    resData?.data ||
    resData;

  console.log('extracted cart:', cart); // DEBUG
  console.log('cart items:', cart?.items); // DEBUG

  return (cart?.items || []).map(ci => ({
    itemId: typeof ci.item === 'object' ? ci.item._id : ci.item,
    name: typeof ci.item === 'object' ? ci.item.name : ci.name,
    price:
      typeof ci.item === 'object'
        ? ci.item.prices?.[0]?.price || 0
        : ci.price || 0,
    quantity: ci.quantity
  }));
};

  // Add item to cart (persisted)
  const handleAddToCart = async (item) => {
  if (!user) {
    setError('Please login to order');
    return;
  }

  try {
    setError('');
    
    // Use item.id (from debug/menu-full) or fallback to _id
    const itemId = item.id || item._id;
    console.log('🛒 handleAddToCart called with item:', {
      name: item.name,
      id: item.id,
      _id: item._id,
      resolved_itemId: itemId
    });

    if (!itemId) {
      setError('Invalid item - missing ID');
      return;
    }

    // ✅ DEFINE res HERE
    const res = await addToCart({
      itemId: itemId,
      quantity: 1
    });

    // ✅ DEBUG LOG (now valid)
    console.log('ADD TO CART RESPONSE:', res.data);

    // ✅ Update cart properly
    const normalized = normalizeCart(res.data);
    console.log('Normalized cart:', normalized);
    setCart(normalized);

  } catch (err) {
    console.error('Add to cart error:', err);
    setError(err?.response?.data?.message || 'Failed to add to cart');
  }
};

  {/*const handleAddToCart = async (item) => {
    if (!user) {
      setError('Please login to order');
      return;
    }
    const itemId = item.id || item._id;
    if (!itemId) return setError('Invalid item');
    try {
      setError('');
      const res = await addToCart({ itemId, quantity: 1 });
      const data = res.data.data;
      // Map backend cart format to frontend cart shape
      const mapped = (data.items || []).map(ci => {
        const menu = ci.item || {};
        const price = menu.prices && menu.prices[0] ? menu.prices[0].price : 0;
        return { itemId: menu._id || ci.item, name: menu.name || ci.name, price, quantity: ci.quantity };
      });
      setCart(mapped);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to add to cart');
    }
  };*/}

  // Update cart item quantity
  const updateQuantity = async (itemId, delta) => {
    if (!user) return setError('Please login to order');
    try {
      const existing = cart.find(c => String(c.itemId) === String(itemId));
      if (!existing) return;
      const newQty = existing.quantity + delta;
      if (newQty <= 0) {
        const res = await updateCart({ itemId, quantity: 0 });
        const normalized = normalizeCart(res.data);
        setCart(normalized);
        return;
      }
      const res = await updateCart({ itemId, quantity: newQty });
      const normalized = normalizeCart(res.data);
      setCart(normalized);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update cart');
    }
  };

  // Remove item from cart
  const handleRemoveFromCart = async (itemId) => {
    if (!user) return setError('Please login to order');
    try {
      const res = await removeFromCart(itemId);
      const normalized = normalizeCart(res.data);
      setCart(normalized);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to remove item');
    }
  };

  // Calculate total
  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Handle payment choice
  const handlePaymentChoice = async (paymentMethod) => {
    if (!pickupTime) {
      setError('Please select a pickup time');
      return;
    }

    // Validate pickup time is in the future
    const pickupDate = new Date(pickupTime);
    if (pickupDate <= new Date()) {
      setError('Pickup time must be in the future');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const orderData = {
        items: cart.map(item => ({
          itemId: item.itemId,
          quantity: item.quantity,
        })),
        paymentMethod,
        pickupTime: pickupDate.toISOString(),
      };

      console.log('📦 Sending order data:', orderData);
      const res = await createOrder(orderData);
      console.log('✅ Order response:', res.data);
      
      if (!res.data.order) {
        console.error('❌ No order in response:', res.data);
        setError('Order created but response is invalid. Please contact support.');
        return;
      }
      
      if (!res.data.order.orderId && !res.data.order.orderToken) {
        console.error('❌ Order missing both orderId and orderToken:', res.data.order);
        setError('Order created but missing ID. Please refresh or contact support.');
        return;
      }
      
      // Save order to localStorage for persistence (per-user key)
      try {
        const storageKey = user ? `currentOrder_${user._id || user.id || user.email}` : 'currentOrder_guest';
        localStorage.setItem(storageKey, JSON.stringify(res.data.order));
      } catch (err) {
        console.error('Failed to save current order to localStorage', err);
      }

      setOrderConfirmation(res.data.order);
      setCurrentOrder(res.data.order);
      setOrderSubmitted(true);
      setShowPaymentModal(false);
      setCart([]);
      setPickupTime('');
      await clearCart().catch(() => {});
    } catch (err) {
      console.error('❌ Order creation error:', err);
      setError(err?.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Reset order confirmation
  const handleNewOrder = () => {
    setOrderSubmitted(false);
    setOrderConfirmation(null);
    setError('');
  };

  if (loading) {
    return (
      <div className="order-page">
        <div className="order-loading">Loading menu...</div>
      </div>
    );
  }

  if (orderSubmitted && orderConfirmation) {
    return (
      <div className="order-page">
        <div className="order-confirmation">
          <h2>✅ Order Placed Successfully!</h2>
          <div className="confirmation-details">
            {orderConfirmation.orderToken && (
              <div style={{ 
                backgroundColor: '#fff3cd', 
                padding: '15px', 
                borderRadius: '8px', 
                marginBottom: '15px',
                border: '2px solid #ff9800'
              }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '0.9em', color: '#666' }}>Your Order Token (Show to Counter):</p>
                <p style={{ margin: '0', fontSize: '2em', fontWeight: 'bold', color: '#ff9800', fontFamily: 'monospace' }}>
                  {orderConfirmation.orderToken}
                </p>
              </div>
            )}
            {orderConfirmation.orderId && (
              <p><strong>Order ID:</strong> {orderConfirmation.orderId}</p>
            )}
            <p><strong>Payment Method:</strong> {orderConfirmation.paymentMethod === 'PAY_AT_COUNTER' ? 'Pay at Counter' : 'Pay Now (Online)'}</p>
            <p><strong>Status:</strong> {orderConfirmation.status}</p>
            <p><strong>Payment Status:</strong> {orderConfirmation.paymentStatus}</p>
            <p><strong>Pickup Time:</strong> {new Date(orderConfirmation.pickupTime).toLocaleString()}</p>
            <p><strong>Total Amount:</strong> ₹{orderConfirmation.totalAmount.toFixed(2)}</p>
            <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
              <p style={{ margin: '0', fontSize: '0.85em', color: '#666' }}>
                {orderConfirmation.paymentMethod === 'PAY_AT_COUNTER' 
                  ? '💳 Show the token above at the counter to complete payment'
                  : '📱 Scan QR code or complete online payment'}
              </p>
            </div>
          </div>
          <button onClick={handleNewOrder} className="btn-primary">
            Place New Order
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="order-page">
      <h1>Place Your Order</h1>
      {error && <div className="order-error">{error}</div>}

      <div className="order-container">
        {/* MENU SECTION */}
        <div className="order-menu-section">
          <h2>Menu</h2>
          
          {/* Category Dropdown */}
          <div className="order-filters">
            <div className="filter-group">
              <label>Category:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="order-select"
              >
                <option value="">Select Category</option>
                {menuData.categories
                  .filter(cat => cat.isActive !== false)
                  .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                  .map((cat) => {
                    const catStringId = CATEGORY_ID_MAP[cat.name] || cat.name.toLowerCase().replace(/\s+/g, '_');
                    return (
                      <option key={cat._id || cat.id} value={catStringId}>
                        {cat.name}
                      </option>
                    );
                  })}
              </select>
            </div>

            {/* Subcategory Dropdown */}
            {selectedCategory && availableSubCategories.length > 0 && (
              <div className="filter-group">
                <label>Subcategory:</label>
                <select
                  value={selectedSubCategory}
                  onChange={(e) => setSelectedSubCategory(e.target.value)}
                  className="order-select"
                >
                  <option value="">All Subcategories</option>
                  {availableSubCategories.map((sub) => {
                    const subId = buildSubCategoryId(selectedCategory, sub.name);
                    const subKey = sub._id || sub.id || subId;
                    return (
                      <option key={subKey} value={subId}>
                        {sub.name}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}
          </div>

          {/* Items Display - EXACT MenuViewer structure: subcategory → section → items */}
          {selectedCategory && (
            <div className="order-items-container">
              {itemsBySubCategory.length === 0 ? (
                <p className="no-items">No items available. Select a category and subcategory.</p>
              ) : (
                itemsBySubCategory
                  .filter((subCatData) => {
                    // If subcategory is selected, filter to only that subcategory
                    // Otherwise show all subcategories for the category
                    return !selectedSubCategory || subCatData.subId === selectedSubCategory;
                  })
                  .map((subCatData) => {
                    const subCatKey = subCatData.subId || `${selectedCategory}-${subCatData.subName}`;
                    
                    return (
                      <div key={subCatKey} className="order-subcategory-group">
                        <h3 className="order-subcategory-title">{subCatData.subName.toUpperCase()}</h3>
                        
                        {subCatData.sections.map((sectionData) => {
                          const sectionKey = `${subCatKey}-${sectionData.section}`;
                          
                          return (
                            <div key={sectionKey} className="order-section-group">
                              <h4 className="order-section-title">{sectionData.section}</h4>
                              
                              <div className="order-items-grid">
                                {sectionData.items.map((item, itemIdx) => {
                                  const { final, strike, label } = getFinalPrice(item);
                                  // EXACT MenuViewer stock check (line 244-246)
                                  const inStock = item.inStock !== false;
                                  // EXACT MenuViewer key (line 229: item.id) - prefer item.id
                                  const itemId = item.id || item._id;
                                  //if (!itemId) {
                                  //  console.warn('Item missing id:', item);
                                  //}
                                  // Composite key as specified: categoryId|subId|section|itemId
                                  // Use item.id (MenuViewer style) or fallback to _id, then to index-based key
                                  const compositeKey = itemId 
                                    ? `${selectedCategory}|${subCatData.subId}|${sectionData.section}|${String(itemId)}`
                                    : `${selectedCategory}|${subCatData.subId}|${sectionData.section}|idx-${itemIdx}`;

                                  return (
                                    <div key={compositeKey} className="order-item-card">
                                      <div className="item-info">
                                        <h3>{item.name}</h3>
                                        <div className="item-price">
                                          {strike && (
                                            <span className="price-strike">₹{strike}</span>
                                          )}
                                          <span className="price-final">₹{final ?? "—"}</span>
                                          {label && <span className="price-discount">{label}</span>}
                                        </div>
                                        <div className="item-availability">
                                          <span className={inStock ? 'stock-in' : 'stock-out'}>
                                            {inStock ? 'IN STOCK' : 'OUT OF STOCK'}
                                          </span>
                                        </div>
                                      </div>
                                      {/*<button
                                        onClick={() => handleAddToCart(item)}
                                        disabled={!inStock || final === undefined || final === null || item.isActive === false}
                                        className="btn-add-cart"
                                        style={{
                                          opacity: item.isActive === false ? 0.4 : 1
                                        }}
                                      >
                                        Add to Cart
                                      </button>*/}
                                      <button
  onClick={() => handleAddToCart(item)}
  disabled={!user || !inStock || item.isActive === false}
  className="btn-add-cart"
>
  {!user ? 'Login to Order' : 'Add to Cart'}
</button>

                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })
              )}
            </div>
          )}
        </div>

        {/* CART SECTION */}
        <div className="order-cart-section">
          <h2>Cart</h2>
          
          {cart.length === 0 ? (
            <div className="cart-empty">
              <p>Your cart is empty</p>
              <p className="cart-hint">Select items from the menu to add to cart</p>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {cart.map((item, idx) => {
                  // Use composite key for cart items
                  const cartKey = item.itemId ? String(item.itemId) : `cart-${idx}`;
                  return (
                  <div key={cartKey} className="cart-item">
                    <div className="cart-item-info">
                      <h4>{item.name}</h4>
                      <p className="cart-item-price">₹{item.price.toFixed(2)} × {item.quantity} = ₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <div className="cart-item-actions">
                      <button
                        onClick={() => updateQuantity(item.itemId, -1)}
                        className="btn-quantity"
                      >
                        −
                      </button>
                      <span className="cart-quantity">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.itemId, 1)}
                        className="btn-quantity"
                      >
                        +
                      </button>
                      <button
                        onClick={() => handleRemoveFromCart(item.itemId)}
                        className="btn-remove"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  );
                })}
              </div>

              <div className="cart-summary">
                <div className="cart-total">
                  <strong>Total: ₹{totalAmount.toFixed(2)}</strong>
                </div>

                <div className="cart-pickup-time">
                  <label>Pickup Time (Required):</label>
                  <input
                    type="datetime-local"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    className="order-input"
                    required
                  />
                </div>

                <button
                  onClick={() => setShowPaymentModal(true)}
                  disabled={!pickupTime || submitting}
                  className="btn-pay"
                >
                  {submitting ? 'Processing...' : 'Pay & Place Order'}
                </button>
              </div>
            </>
          )}

          {/* CURRENT ORDER SECTION - PERSISTENT DISPLAY */}
          {currentOrder && (
            <div className="current-order-section" style={{ marginTop: '30px', padding: '20px', backgroundColor: 'rgba(129, 199, 132, 0.15)', borderRadius: '12px', border: '2px solid #81c784' }}>
              <h3 style={{ color: '#81c784', marginBottom: '15px', fontSize: '1.2rem', fontWeight: '600' }}>✅ Current Order Details</h3>
              
              {currentOrder.orderToken && (
                <div style={{ 
                  backgroundColor: '#fff3cd', 
                  padding: '15px', 
                  borderRadius: '8px', 
                  marginBottom: '15px',
                  border: '2px solid #ff9800'
                }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '0.9em', color: '#666' }}>Order Token (Show to Counter):</p>
                  <p style={{ margin: '0', fontSize: '1.8em', fontWeight: 'bold', color: '#ff9800', fontFamily: 'monospace', letterSpacing: '2px' }}>
                    {currentOrder.orderToken}
                  </p>
                </div>
              )}
              
              <div style={{ fontSize: '0.95em', color: '#f5efe8' }}>
                {currentOrder.orderId && (
                  <p style={{ margin: '8px 0' }}><strong style={{ color: '#81c784' }}>Order ID:</strong> {currentOrder.orderId}</p>
                )}
                <p style={{ margin: '8px 0' }}><strong style={{ color: '#81c784' }}>Payment Method:</strong> {currentOrder.paymentMethod === 'PAY_AT_COUNTER' ? '💳 Pay at Counter' : '📱 Pay Now (Online)'}</p>
                <p style={{ margin: '8px 0' }}><strong style={{ color: '#81c784' }}>Pickup Time:</strong> {new Date(currentOrder.pickupTime).toLocaleString()}</p>
                <p style={{ margin: '8px 0' }}><strong style={{ color: '#81c784' }}>Total Amount:</strong> ₹{currentOrder.totalAmount.toFixed(2)}</p>
                <p style={{ margin: '8px 0' }}><strong style={{ color: '#81c784' }}>Status:</strong> {currentOrder.status}</p>
              </div>

              <button
                onClick={() => {
                  setCurrentOrder(null);
                  try {
                    const storageKey = user ? `currentOrder_${user._id || user.id || user.email}` : 'currentOrder_guest';
                    localStorage.removeItem(storageKey);
                  } catch (err) {
                    console.error('Failed to remove current order from localStorage', err);
                  }
                }}
                style={{
                  marginTop: '15px',
                  padding: '10px 20px',
                  backgroundColor: '#666',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9em',
                  fontWeight: '600'
                }}
              >
                Clear Order
              </button>
            </div>
          )}
        </div>
      </div>

      {/* PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="payment-modal-overlay" onClick={() => !submitting && setShowPaymentModal(false)}>
          <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Choose Payment Method</h2>
            <div className="payment-options">
              <button
                onClick={() => handlePaymentChoice('PAY_NOW')}
                disabled={submitting}
                className="payment-option-btn"
              >
                <span className="payment-option-title">Pay Now</span>
                <p className="payment-option-desc">Scan QR code to pay online</p>
                {false && (
                  <img 
                    src="/dummy-qr.png" 
                    alt="QR Code" 
                    className="qr-code"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
              </button>
              <button
                onClick={() => handlePaymentChoice('PAY_AT_COUNTER')}
                disabled={submitting}
                className="payment-option-btn"
              >
                <span className="payment-option-title">Pay at Counter</span>
                <p className="payment-option-desc">Pay when you pickup your order</p>
              </button>
            </div>
            {submitting && (
              <div className="payment-loading">Processing your order...</div>
            )}
            <button
              onClick={() => setShowPaymentModal(false)}
              disabled={submitting}
              className="btn-cancel"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Order;
