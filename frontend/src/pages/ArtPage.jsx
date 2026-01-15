import { useEffect, useState } from 'react';
import { fetchArt, fetchInsights } from '../services/api';
import ArtGallery from '../sections/ArtGallery';
import Footer from '../sections/Footer';

const ArtPage = () => {
  const [art, setArt] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [aRes, iRes] = await Promise.all([
          fetchArt(),
          fetchInsights(),
        ]);
        setArt(aRes.data);
        setInsights(iRes.data);
      } catch (err) {
        setError('Cannot reach Rabuste API. Check backend configuration.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="page">
      {error && <div className="toast error">{error}</div>}
      <ArtGallery art={art} loading={loading} insights={insights} />
      <Footer />
    </div>
  );
};

export default ArtPage;









