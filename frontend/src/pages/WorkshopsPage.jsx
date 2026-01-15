import { useEffect, useState } from 'react';
import { fetchWorkshops } from '../services/api';
import Workshops from '../sections/Workshops';
import Footer from '../sections/Footer';

const WorkshopsPage = () => {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchWorkshops();
        setWorkshops(res.data);
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
      <Workshops workshops={workshops} loading={loading} />
      <Footer />
    </div>
  );
};

export default WorkshopsPage;









