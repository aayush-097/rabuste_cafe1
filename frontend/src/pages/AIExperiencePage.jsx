import { useEffect, useState } from 'react';
import { fetchCoffee } from '../services/api';
import AIExperience from '../sections/AIExperience';
import Footer from '../sections/Footer';

const AIExperiencePage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        await fetchCoffee();
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
      <AIExperience />
      <Footer />
    </div>
  );
};

export default AIExperiencePage;



