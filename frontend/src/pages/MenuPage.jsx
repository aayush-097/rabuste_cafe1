import { useEffect, useState } from 'react';
import { fetchCoffee, fetchMenuImages } from '../services/api';
import CoffeeMenu from '../sections/CoffeeMenu';
import Footer from '../sections/Footer';
import MenuImageSlider from '../components/MenuImageSlider';
import MenuViewer from './MenuViewer'; // make sure the path is correct

const MenuPage = () => {
  const [coffee, setCoffee] = useState([]);
  const [menuImages, setMenuImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState('images'); // 'images' or 'menu'

  useEffect(() => {
    const load = async () => {
      try {
        const [coffeeRes, menuImagesRes] = await Promise.all([
          fetchCoffee(),
          fetchMenuImages(),
        ]);
        setCoffee(coffeeRes.data);

        // Filter out logo images
        const flatArray = menuImagesRes.data;
        const filteredArray = flatArray.filter((image) => {
          const isLogo =
            image.category?.toLowerCase() === 'logo' ||
            image.public_id?.toLowerCase().includes('logo');
          return !isLogo;
        });

        // Group filtered array by category
        const grouped = {};
        filteredArray.forEach((image) => {
          if (!grouped[image.category]) {
            grouped[image.category] = [];
          }
          grouped[image.category].push({ url: image.url });
        });
        setMenuImages(grouped);
      } catch (err) {
        setError(
          'Cannot reach Rabuste API. Check backend configuration.'
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="page">
      {error && <div className="toast error">{error}</div>}

      {/* ---------- VIEW TOGGLE BUTTONS ---------- */}
      <div className="view-toggle" style={{ margin: '20px 0', textAlign: 'center' }}>
        <button
          onClick={() => setView('images')}
          className={view === 'images' ? 'active' : ''}
          style={{ marginRight: '10px', padding: '8px 16px' }}
        >
          View Menu Images
        </button>
        <button
          onClick={() => setView('menu')}
          className={view === 'menu' ? 'active' : ''}
          style={{ padding: '8px 16px' }}
        >
          View Menu
        </button>
      </div>

      {/* ---------- CONDITIONAL RENDERING ---------- */}
      {view === 'images' && Object.keys(menuImages).length > 0 && (
        <section style={{ paddingTop: '40px' }}>
          {Object.entries(menuImages).map(([category, images]) => (
            <MenuImageSlider key={category} images={images} categoryName={category} />
          ))}
        </section>
      )}

      {view === 'menu' && <MenuViewer coffees={coffee} loading={loading} />}

      {/* Keep CoffeeMenu if you want it outside or remove if MenuViewer replaces it */}
      {view === 'images' && <CoffeeMenu coffees={coffee} loading={loading} />}
      
      <Footer />
    </div>
  );
};

export default MenuPage;
