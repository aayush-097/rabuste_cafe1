import { useEffect, useState } from 'react';
import {
  fetchArt,
  fetchCoffee,
  fetchInsights,
  fetchWorkshops,
  fetchMenuImages,
} from '../services/api';
import Hero from '../sections/Hero';
import Footer from '../sections/Footer';
import HomePreviewSection from '../components/HomePreviewSection';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const HomePage = () => {
  const [coffee, setCoffee] = useState([]);
  const [art, setArt] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [insights, setInsights] = useState(null);
  const [logos, setLogos] = useState([]);
  const [menuImages, setMenuImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /* ================= DATA LOAD ================= */
  useEffect(() => {
    const load = async () => {
      try {
        const [cRes, aRes, wRes, iRes, imagesRes] = await Promise.all([
          fetchCoffee(),
          fetchArt(),
          fetchWorkshops(),
          fetchInsights(),
          fetchMenuImages(),
        ]);

        setCoffee(cRes.data);
        setArt(aRes.data);
        setWorkshops(wRes.data);
        setInsights(iRes.data);

        const logoImages = imagesRes.data.filter(
          (image) =>
            image.category?.toLowerCase() === 'logo' ||
            image.public_id?.toLowerCase().includes('logo')
        );

        setLogos(logoImages);

        const menuImgs = imagesRes.data.filter(
          (image) =>
            image.category?.toLowerCase() !== 'logo' &&
            !image.public_id?.toLowerCase().includes('logo')
        );

        setMenuImages(menuImgs);
      } catch (err) {
        setError('Cannot reach Rabuste API. Start backend at http://localhost:5000');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  /* ================= GSAP SCROLL (MOBILE SAFE) ================= */
  {/*useEffect(() => {
    const sections = gsap.utils.toArray('.page [data-scroll-section]');

    sections.forEach((section, index) => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top 90%', // ✅ mobile friendly
        once: true,       // ✅ CRITICAL
        onEnter: () => {
          gsap.fromTo(
            section,
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: 'power2.out',
              delay: index * 0.05,
            }
          );
        },
      });
    });

    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, []);*/}
  /* ================= GSAP SCROLL (FIXED) ================= */
useEffect(() => {
  // Only run if not loading
  if (loading) return;

  const sections = gsap.utils.toArray('.page [data-scroll-section]');

  sections.forEach((section, index) => {
    gsap.set(section, { opacity: 0, y: 30 }); // Pre-set state to avoid flashes

    ScrollTrigger.create({
      trigger: section,
      start: 'top 85%', 
      once: true,
      invalidateOnRefresh: true, // Forces re-calc on refresh
      onEnter: () => {
        gsap.to(section, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          delay: index * 0.05,
        });
      },
    });
  });

  return () => ScrollTrigger.getAll().forEach(t => t.kill());
}, [loading]); // Change dependency to loading

  /* ================= REFRESH AFTER LOAD (CRITICAL) ================= */
  {/*useEffect(() => {
    if (!loading) {
      ScrollTrigger.refresh();
    }
  }, [loading]);*/}
  /* ================= REFRESH AFTER LOAD ================= */
useEffect(() => {
  if (!loading) {
    // Wait a split second for the DOM to actually paint the images
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 500);
    return () => clearTimeout(timer);
  }
}, [loading, coffee, art]); // Refresh when main data arrays change

  const primaryLogo = logos[0] || null;
  const secondaryLogo = logos[1] || null;

  return (
    <div className="page">
      {error && <div className="toast error">{error}</div>}

      <Hero primaryLogo={primaryLogo} />

      {secondaryLogo && (
        <div data-scroll-section>
          <section style={{ padding: '32px 18px', textAlign: 'center' }}>
            <img
              src={secondaryLogo.url}
              alt="Rabuste Logo"
              className="secondary-logo"
            />
          </section>
        </div>
      )}

      <HomePreviewSection
        title="Why Rabusta?"
        description="Discover what makes Rabusta beans extraordinary."
        extraContent={
          <div>
            <p><strong>Bold & Robust:</strong> Higher caffeine content.</p>
            <p><strong>Resilient:</strong> Thrives in diverse climates.</p>
            <p><strong>Distinctive:</strong> Earthy notes & smooth finish.</p>
          </div>
        }
        layout="text-heavy"
        visual={
          <img
            src="https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400"
            alt="Premium Coffee Beans"
          />
        }
        animateTitle
        ctaLink="/why-robusta"
        ctaText="Learn More"
      />

      <HomePreviewSection
        title="Crafted Coffee Experiences"
        description="Indulge in the bold, robust essence of our premium Rabusta beans."
        visual={menuImages.slice(0, 3).map((img, i) => (
          <img key={i} src={img.url} alt={`Coffee ${i + 1}`} />
        ))}
        animateTitle
        ctaLink="/menu"
        ctaText="View Menu"
      />

      <HomePreviewSection
        title="Where Coffee Meets Art"
        description="Discover curated artworks inspired by coffee culture."
        visual={art.slice(0, 2).map((p, i) => (
          <img key={i} src={p.imageUrl} alt={`Art ${i + 1}`} />
        ))}
        layout="split-art"
        animateTitle
        ctaLink="/art"
        ctaText="View Arts!"
      />

      <HomePreviewSection
        title="Learn. Brew. Create."
        description="Join immersive workshops to master coffee brewing."
        visual={
          <img
            src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400"
            alt="Workshop"
          />
        }
        layout="horizontal"
        ctaLink="/workshops"
        ctaText="Join Workshop"
      />

      <HomePreviewSection
        title="AI-Powered Coffee Exploration"
        description="Personalized AI-driven coffee recommendations."
        visual={
          <img
            src="https://images.unsplash.com/photo-1555255707-c07966088b7b?w=400"
            alt="AI Coffee"
          />
        }
        ctaLink="/ai-experience"
        ctaText="Explore AI"
      />

      <HomePreviewSection
        title="Grow With Rabuste"
        description="Join our franchise network and grow together."
        visual={
          <img
            src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400"
            alt="Franchise"
          />
        }
        layout="text-heavy"
        ctaLink="/franchise"
        ctaText="Learn More"
      />

      <div data-scroll-section>
        <Footer />
      </div>
    </div>
  );
};

export default HomePage;