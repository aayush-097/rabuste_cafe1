const CoffeeMenu = ({ coffees, loading }) => {
  return (
    <section id="menu">
      <p className="section-kicker">Coffee Menu</p>
      <div className="section-header">
        <h2 className="section-title">Signature robusta brews first.</h2>
        <span className="pill">Backend curated · MongoDB</span>
      </div>
      {loading ? (
        <p className="muted">Loading brews…</p>
      ) : (
        <div className="grid two">
          {coffees.map((c) => (
            <div className="card" key={c._id || c.name}>
              <div className="flex" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <h3>{c.name}</h3>
                {c.isSignature && <span className="tag">Signature</span>}
              </div>
              <p className="muted" style={{ margin: '8px 0 12px' }}>
                {c.description}
              </p>
              <div className="flex">
                <span className="pill">Strength: {c.strength}</span>
                {c.tags?.map((t) => (
                  <span key={t} className="tag">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default CoffeeMenu;









