export default function About() {
  return (
    <section id="about">
      <div className="about-grid">
        <div className="reveal">
          <p className="sec-label">About me</p>
          <h2 className="about-headline">
            Problem
            <br />
            Solver &amp;
            <br />
            Story Teller
          </h2>
          <p className="about-body">
            I'm a 200-level Computer Science undergraduate at the University of
            Lagos, Nigeria. I solve problems with AI and modern tools — and I
            tell stories through interactive webpages. I don't just build things.
            I build things that feel like something.
          </p>
          <span className="about-cta">
            Download CV <span>↗</span>
          </span>
        </div>
        <div className="about-right reveal reveal-d2">
          <div className="stat-card-row">
            <div className="stat-card">
              <div className="stat-card-num">200L</div>
              <div className="stat-card-label">CS · UNILAG</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-num">AI</div>
              <div className="stat-card-label">Driven Builder</div>
            </div>
          </div>
          <div className="stat-card-row" style={{ marginTop: '2px' }}>
            <div className="stat-card">
              <div className="stat-card-num">8+</div>
              <div className="stat-card-label">Tech Skills</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-num">NG</div>
              <div className="stat-card-label">Lagos Based</div>
            </div>
          </div>
        </div>
      </div>
      <span className="sec-num">.02</span>
    </section>
  );
}
