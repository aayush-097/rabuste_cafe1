import { useState, useEffect, useRef } from 'react';
import '../styles/menuSlider.css';

const MenuImageSlider = ({ images, categoryName }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef(null);

  // Auto-slide every 3.5 seconds
  useEffect(() => {
    if (images.length <= 1) return;

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3500);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [images.length]);

  const goToPrevious = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    // Restart auto-slide after manual navigation
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3500);
  };

  const goToNext = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setCurrentIndex((prev) => (prev + 1) % images.length);
    // Restart auto-slide after manual navigation
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3500);
  };

  if (!images || images.length === 0) {
    return null;
  }

  const formatCategoryName = (name) => {
    return name
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="menu-category-slider">
      <h2 className="menu-category-title">{formatCategoryName(categoryName)}</h2>
      <div className="slider-container">
        {images.length > 1 && (
          <button className="slider-arrow slider-arrow-left" onClick={goToPrevious} aria-label="Previous image">
            ‹
          </button>
        )}
        <div className="slider-wrapper">
          <div
            className="slider-track"
            style={{
              transform: `translateX(-${currentIndex * 100}%)`,
            }}
          >
            {images.map((image, index) => (
              <div key={index} className="slider-slide">
                <img src={image.url} alt={`${categoryName} ${index + 1}`} className="slider-image" />
              </div>
            ))}
          </div>
        </div>
        {images.length > 1 && (
          <button className="slider-arrow slider-arrow-right" onClick={goToNext} aria-label="Next image">
            ›
          </button>
        )}
      </div>
      {images.length > 1 && (
        <div className="slider-dots">
          {images.map((_, index) => (
            <button
              key={index}
              className={`slider-dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => {
                if (intervalRef.current) clearInterval(intervalRef.current);
                setCurrentIndex(index);
                intervalRef.current = setInterval(() => {
                  setCurrentIndex((prev) => (prev + 1) % images.length);
                }, 3500);
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MenuImageSlider;








