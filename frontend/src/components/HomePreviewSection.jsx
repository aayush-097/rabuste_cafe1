import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const HomePreviewSection = ({ 
  title, 
  description, 
  visual, 
  ctaLink, 
  ctaText = "Explore", 
  backgroundImage, 
  extraContent,
  layout = 'default',
  animateTitle = false 
}) => {
  const sectionRef = useRef(null);
  const buttonRef = useRef(null);
  const orbRef = useRef(null);
  const titleRef = useRef(null);
  const questionMarkRef = useRef(null);

  useEffect(() => {
    const button = buttonRef.current;
    const orb = orbRef.current;
    if (!button || !orb) return;

    const xTo = gsap.quickTo(orb, "x", { duration: 0.25, ease: "power3.out" });
    const yTo = gsap.quickTo(orb, "y", { duration: 0.25, ease: "power3.out" });

    const move = (e) => {
      const rect = button.getBoundingClientRect();
      xTo(e.clientX - rect.left);
      yTo(e.clientY - rect.top);

      gsap.to(orb, {
        scale: 2.2,
        opacity: 1,
        duration: 0.2,
      });

      gsap.to(button, {
        scale: 1.08,
        boxShadow: "0 0 35px rgba(216,107,50,0.6)",
        duration: 0.2,
      });
    };

    const leave = () => {
      gsap.to(orb, { scale: 0, opacity: 0, duration: 0.3 });
      gsap.to(button, { scale: 1, boxShadow: "0 8px 25px rgba(216, 107, 50, 0.3)" });
    };

    button.addEventListener("mousemove", move);
    button.addEventListener("mouseleave", leave);

    return () => {
      button.removeEventListener("mousemove", move);
      button.removeEventListener("mouseleave", leave);
    };
  }, []);

  // Text animations
  useEffect(() => {
    if (!animateTitle || !titleRef.current) return;

    const titleElement = titleRef.current;
    const text = titleElement.textContent;
    const hasQuestionMark = text.includes('?');
    
    if (hasQuestionMark) {
      // Split title and question mark
      const mainText = text.replace('?', '');
      const questionMark = '?';
      
      titleElement.innerHTML = `${mainText}<span class="question-mark">${questionMark}</span>`;
      const questionMarkElement = titleElement.querySelector('.question-mark');
      
      if (questionMarkElement) {
        // Initial setup
        gsap.set(questionMarkElement, { 
          position: 'relative',
          display: 'inline-block',
          transformOrigin: 'bottom center',
          color: 'var(--accent)',
          fontWeight: '900',
          marginLeft: '4px',
          fontSize: 'inherit'
        });
        
        // Scroll trigger animation
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "top 90%",
          once: true,
          markers: false, // Set to true for debugging
          onEnter: () => {
            console.log('Animating question mark');
            gsap.fromTo(questionMarkElement, 
              { rotation: 0, y: 0, scale: 1 },
              { 
                rotation: 360, 
                y: -15, 
                scale: 1.2,
                duration: 1.5, 
                ease: "elastic.out(1, 0.3)",
                delay: 0.3
              }
            );
          }
        });
      }
    } else if (text.includes('Meets')) {
      // Special animation for "Where Coffee Meets Art"
      const words = text.split(' ');
      titleElement.innerHTML = words.map((word, index) => 
        `<span class="word word-${index}" style="display: inline-block; margin-right: 8px;">${word}</span>`
      ).join('');
      
      const wordElements = titleElement.querySelectorAll('.word');
      
      gsap.set(wordElements, { opacity: 0, y: 30 });
      
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 85%",
        once: true,
        onEnter: () => {
          gsap.to(wordElements, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: "back.out(1.7)"
          });
        }
      });
    } else {
      // Default fade-in animation
      gsap.set(titleElement, { opacity: 0, y: 30 });
      
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 85%",
        once: true,
        onEnter: () => {
          gsap.to(titleElement, {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power2.out"
          });
        }
      });
    }
  }, [animateTitle]);

  const renderTitle = () => {
    if (animateTitle) {
      return <h2 className="preview-title" ref={titleRef}>{title}</h2>;
    }
    return <h2 className="preview-title">{title}</h2>;
  };

  const renderContent = () => {
    switch (layout) {
      case 'text-heavy':
        return (
          <div className="preview-content text-heavy">
            <div className="text-side">
              {renderTitle()}
              <p className="preview-description">{description}</p>
              {extraContent && <div className="preview-extra">{extraContent}</div>}
              <Link to={ctaLink} className="preview-cta" ref={buttonRef}>
                <span className="cta-text">{ctaText}</span>
                <div className="hover-orb" ref={orbRef}></div>
              </Link>
            </div>
            {visual && <div className="visual-side">{visual}</div>}
          </div>
        );
      case 'image-focus':
        return (
          <div className="preview-content image-focus">
            {visual && <div className="visual-large">{visual}</div>}
            <div className="text-overlay">
              {renderTitle()}
              <p className="preview-description">{description}</p>
              {extraContent && <div className="preview-extra">{extraContent}</div>}
              <Link to={ctaLink} className="preview-cta" ref={buttonRef}>
                <span className="cta-text">{ctaText}</span>
                <div className="hover-orb" ref={orbRef}></div>
              </Link>
            </div>
          </div>
        );
      case 'horizontal':
        return (
          <div className="preview-content horizontal">
            <div className="left-content">
              {renderTitle()}
              <p className="preview-description">{description}</p>
              {extraContent && <div className="preview-extra">{extraContent}</div>}
            </div>
            <div className="right-content">
              {visual && <div className="visual-compact">{visual}</div>}
              <Link to={ctaLink} className="preview-cta" ref={buttonRef}>
                <span className="cta-text">{ctaText}</span>
                <div className="hover-orb" ref={orbRef}></div>
              </Link>
            </div>
          </div>
        );
      case 'split-art':
        return (
          <div className="preview-content split-art">
            <div className="art-images">
              {visual}
            </div>
            <div className="art-text">
              {renderTitle()}
              <p className="preview-description">{description}</p>
              {extraContent && <div className="preview-extra">{extraContent}</div>}
              <Link to={ctaLink} className="preview-cta" ref={buttonRef}>
                <span className="cta-text">{ctaText}</span>
                <div className="hover-orb" ref={orbRef}></div>
              </Link>
            </div>
          </div>
        );
      default:
        return (
          <div className="preview-content">
            {renderTitle()}
            <p className="preview-description">{description}</p>
            {extraContent && <div className="preview-extra">{extraContent}</div>}
            {visual && <div className="preview-visual">{visual}</div>}
            <Link to={ctaLink} className="preview-cta" ref={buttonRef}>
              <span className="cta-text">{ctaText}</span>
              <div className="hover-orb" ref={orbRef}></div>
            </Link>
          </div>
        );
    }
  };

  return (
    <div data-scroll-section ref={sectionRef}>
      <section 
        className={`home-preview-section ${layout}`}
        style={backgroundImage ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
      >
        {renderContent()}
      </section>
    </div>
  );
};

export default HomePreviewSection;