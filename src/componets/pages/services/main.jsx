import FirstImpressionSimulator from "./app";

const heroBadges = [
  "Upload a photo",
  "Choose audience lenses",
  "Get coaching, not judgment"
];

const features = [
  {
    title: "Audience simulation",
    detail: "Score the same image through recruiter, founder, client, and peer lenses."
  },
  {
    title: "Actionable feedback",
    detail: "Translate vague first impressions into concrete retake suggestions."
  },
  {
    title: "Resume-worthy framing",
    detail: "A clear product story with UX, backend logic, and AI-adjacent thinking."
  }
];

export default function ServicesPage() {
  return (
    <main className="page-shell">
      <section className="hero">
        <div className="hero-grid">
          <div>
            <span className="eyebrow">Portfolio Project Concept No. 2</span>
            <h1>First Impression Studio</h1>
            <p>
              A full-stack first-impression simulator that helps someone understand how their
              profile photo might land with different audiences, then shows them exactly how to
              improve it.
            </p>

            <div className="hero-badges">
              {heroBadges.map((badge) => (
                <span className="pill" key={badge}>
                  {badge}
                </span>
              ))}
            </div>

            <div className="feature-grid">
              {features.map((feature) => (
                <article className="feature-card" key={feature.title}>
                  <strong>{feature.title}</strong>
                  <span>{feature.detail}</span>
                </article>
              ))}
            </div>
          </div>

          <aside className="hero-panel">
            <h3>Why this makes a strong resume project</h3>
            <ul>
              <li>It solves a relatable problem instead of looking like another generic CRUD app.</li>
              <li>It shows product judgment by avoiding sensitive face analysis and focusing on coachable cues.</li>
              <li>It can grow into real AI later by adding vision-based cue extraction to the same backend shape.</li>
            </ul>
          </aside>
        </div>
      </section>

      <FirstImpressionSimulator />
    </main>
  );
}
