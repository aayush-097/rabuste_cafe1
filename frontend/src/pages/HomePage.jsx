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
        
        // Filter and extract logo images
        const logoImages = imagesRes.data.filter((image) => {
          const isLogo = image.category?.toLowerCase() === 'logo' || 
                        image.public_id?.toLowerCase().includes('logo');
          return isLogo;
        });
        setLogos(logoImages);

        // Set menu images (non-logos)
        const menuImgs = imagesRes.data.filter((image) => {
          const isLogo = image.category?.toLowerCase() === 'logo' || 
                        image.public_id?.toLowerCase().includes('logo');
          return !isLogo;
        });
        setMenuImages(menuImgs);
      } catch (err) {
        setError('Cannot reach Rabuste API. Check backend configuration.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const primaryLogo = logos.length > 0 ? logos[0] : null;
  const secondaryLogo = logos.length > 1 ? logos[1] : null;

  // Set up GSAP scroll animations for sections
  useEffect(() => {
    const sections = gsap.utils.toArray('.page [data-scroll-section]');
    
    sections.forEach((section, index) => {
      gsap.set(section, { opacity: 0, y: 50 });
      
      ScrollTrigger.create({
        trigger: section,
        start: "top 80%",
        end: "bottom 20%",
        onEnter: () => {
          gsap.to(section, {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power2.out",
            delay: index * 0.1
          });
        },
        onLeaveBack: () => {
          gsap.to(section, {
            opacity: 0,
            y: 50,
            duration: 0.5,
            ease: "power2.in"
          });
        }
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

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
        description="Discover what makes Rabusta beans extraordinary. Known for their bold flavor, resilience, and unique characteristics that set them apart in the world of coffee."
        extraContent={
          <div>
            <p><strong>Bold & Robust:</strong> Higher caffeine content for an invigorating experience.</p>
            <p><strong>Resilient:</strong> Thrives in diverse climates, ensuring consistent quality.</p>
            <p><strong>Distinctive:</strong> Earthy notes with a smooth, full-bodied finish.</p>
          </div>
        }
        layout="text-heavy"
        visual={
          <img src="https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400" alt="Premium Coffee Beans" />
        }
        animateTitle={true}
        ctaLink="/why-robusta"
        ctaText="Learn More"
      />
      <HomePreviewSection
        title="Crafted Coffee Experiences"
        description="Indulge in the bold, robust essence of our premium Rabusta beans. Known for their intense flavor profile, higher caffeine content, and distinctive character, these beans deliver a coffee experience that's both invigorating and unforgettable."
        visual={
          menuImages.slice(0, 3).map((img, idx) => (
            <img key={idx} src={img.url} alt={`Coffee ${idx + 1}`} />
          ))
        }
        animateTitle={true}
        ctaLink="/menu"
        ctaText="View Menu"
      />
      <HomePreviewSection
        title="Where Coffee Meets Art"
        description="Where the bold spirit of Rabusta coffee inspires artistic expression. Discover curated artworks that capture the passion, creativity, and distinctive character of our coffee culture, blending visual storytelling with the robust flavors we cherish."
        visual={
          art.slice(0, 2).map((piece, idx) => (
            <img key={idx} src={piece.imageUrl} alt={`Art ${idx + 1}`} />
          ))
        }
        layout="split-art"
        animateTitle={true}
        ctaLink="/art"
        ctaText="View Arts!"
      />
      <HomePreviewSection
        title="Learn. Brew. Create."
        description="Join our immersive workshops to master the art of brewing bold Rabusta coffee. Learn techniques that highlight the bean's unique resilience and flavor, turning every session into a creative journey of discovery and craftsmanship."
        visual={
          <img src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400" alt="Coffee Workshop" />
        }
        layout="horizontal"
        ctaLink="/workshops"
        ctaText="Join Workshop"
      />
      <HomePreviewSection
        title="AI-Powered Coffee Exploration"
        description="Let artificial intelligence guide you through personalized Rabusta coffee recommendations. Experience how AI enhances the discovery of bold flavors, pairing suggestions, and creative insights tailored to your taste preferences."
        visual={
          <img src="https://images.unsplash.com/photo-1555255707-c07966088b7b?w=400" alt="AI Coffee Technology" />
        }
        ctaLink="/ai-experience"
        ctaText="Explore AI"
      />
      <HomePreviewSection
        title="Grow With Rabuste"
        description="Partner with us to bring the bold Rabusta experience to your community. Join our franchise network and build a thriving business centered around premium coffee culture, resilience, and distinctive quality."
        visual={
          <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400" alt="Coffee Shop Business" />
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


