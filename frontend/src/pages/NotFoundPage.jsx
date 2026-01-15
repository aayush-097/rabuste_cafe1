import { Link } from 'react-router-dom';
import Footer from '../sections/Footer';

const NotFoundPage = () => {
  return (
    <div className="page">
      <section style={{ textAlign: 'center', paddingTop: '120px' }}>
        <h1 className="section-title" style={{ fontSize: '64px', marginBottom: '16px' }}>
          404
        </h1>
        <p className="section-kicker">Page Not Found</p>
        <p className="muted" style={{ marginBottom: '32px', maxWidth: '500px', margin: '16px auto 32px' }}>
          The page you're looking for doesn't exist. Let's get you back to some great coffee.
        </p>
        <Link to="/" className="cta">
          Back to Home
        </Link>
      </section>
      <Footer />
    </div>
  );
};

export default NotFoundPage;









