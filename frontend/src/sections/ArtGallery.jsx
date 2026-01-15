import { useState } from 'react';
import ArtModal from '../components/ArtModal';

const ArtGallery = ({ art, loading, insights }) => {
  const [selectedArt, setSelectedArt] = useState(null);
  const [isArtModalOpen, setIsArtModalOpen] = useState(false);

  const handleEnquireClick = (piece) => {
    setSelectedArt(piece);
    setIsArtModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsArtModalOpen(false);
    setSelectedArt(null);
  };

  return (
    <section id="art">
      <p className="section-kicker">Art Gallery</p>
      <div className="section-header">
        <h2 className="section-title">Limited pieces inspired by crema, light, and texture.</h2>
        <span className="pill">Backend-priced · Availability-aware</span>
      </div>
      {insights && (
        <div className="blur-panel" style={{ margin: '12px 0 18px' }}>
          <strong>Popular picks:</strong>{' '}
          <span className="muted">
            {insights.premiumArt?.map((p) => p.title).join(' · ') || 'Loading'}
          </span>
        </div>
      )}
      {loading ? (
        <p className="muted">Loading art…</p>
      ) : (
        <div className="grid three">
          {art.map((piece) => (
            <div className="card" key={piece._id || piece.title}>
              <div
                style={{
                  borderRadius: 12,
                  height: 160,
                  backgroundImage: `linear-gradient(120deg, rgba(24,18,16,0.4), rgba(24,18,16,0.9)), url(${piece.imageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  marginBottom: 12,
                }}
              />
              <div className="flex" style={{ justifyContent: 'space-between' }}>
                <h3>{piece.title}</h3>
                <span className="pill">{piece.artistName}</span>
              </div>
              <p className="muted" style={{ margin: '6px 0 10px' }}>
                {piece.description}
              </p>
              <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <span 
                  className={piece.availability === 'sold' ? 'sold' : piece.availability === 'reserved' ? 'reserved' : 'availability'}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    background: piece.availability === 'sold' 
                      ? 'rgba(211, 47, 47, 0.2)' 
                      : piece.availability === 'reserved'
                      ? 'rgba(255, 193, 7, 0.2)'
                      : 'rgba(76, 175, 80, 0.2)',
                    color: piece.availability === 'sold'
                      ? '#ff6b6b'
                      : piece.availability === 'reserved'
                      ? '#ffc107'
                      : '#81c784',
                    border: `1px solid ${piece.availability === 'sold' 
                      ? 'rgba(211, 47, 47, 0.4)' 
                      : piece.availability === 'reserved'
                      ? 'rgba(255, 193, 7, 0.4)'
                      : 'rgba(76, 175, 80, 0.4)'}`,
                  }}
                >
                  {piece.availability === 'sold' ? 'SOLD' : piece.availability === 'reserved' ? 'RESERVED' : 'AVAILABLE'}
                </span>
                <span className="pill">${piece.price}</span>
              </div>
              <button
                className="cta secondary"
                style={{ marginTop: 12 }}
                onClick={() => handleEnquireClick(piece)}
                disabled={piece.availability === 'sold'}
              >
                Enquire / Buy
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Art Modal */}
      <ArtModal 
        art={selectedArt} 
        isOpen={isArtModalOpen} 
        onClose={handleCloseModal} 
      />
    </section>
  );
};

export default ArtGallery;









