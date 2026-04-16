import { useEffect, useState } from "react";

const audienceCatalog = [
  {
    key: "recruiter",
    label: "Recruiters",
    focus: "hireability, polish, and trust in under 10 seconds"
  },
  {
    key: "founder",
    label: "Founders",
    focus: "initiative, clarity, and startup energy"
  },
  {
    key: "client",
    label: "Clients",
    focus: "credibility, calm, and relationship confidence"
  },
  {
    key: "collaborator",
    label: "Peers",
    focus: "approachability, teamwork, and momentum"
  }
];

const signalCatalog = [
  {
    key: "confidence",
    label: "Confidence",
    helper: "Eye level, posture, framing, and composure."
  },
  {
    key: "warmth",
    label: "Warmth",
    helper: "Expression, openness, and perceived approachability."
  },
  {
    key: "polish",
    label: "Polish",
    helper: "Lighting, crop, wardrobe, and background quality."
  },
  {
    key: "creativity",
    label: "Creativity",
    helper: "Distinctiveness, style, and visual personality."
  },
  {
    key: "energy",
    label: "Energy",
    helper: "Liveliness, contrast, and momentum in the frame."
  }
];

const contextOptions = [
  "LinkedIn headshot",
  "Portfolio profile photo",
  "Networking event profile",
  "Founder bio photo",
  "Client-facing team page"
];

const goalSuggestions = [
  "Credible and approachable for recruiters",
  "Sharp enough for clients but still warm",
  "Founder energy without looking chaotic",
  "Collaborative and creative for a product role"
];

const defaultSignals = {
  confidence: 72,
  warmth: 68,
  polish: 78,
  creativity: 54,
  energy: 63
};

const fallbackWeights = {
  recruiter: {
    confidence: 0.26,
    warmth: 0.18,
    polish: 0.33,
    creativity: 0.07,
    energy: 0.16
  },
  founder: {
    confidence: 0.24,
    warmth: 0.14,
    polish: 0.13,
    creativity: 0.26,
    energy: 0.23
  },
  client: {
    confidence: 0.24,
    warmth: 0.2,
    polish: 0.32,
    creativity: 0.07,
    energy: 0.17
  },
  collaborator: {
    confidence: 0.18,
    warmth: 0.3,
    polish: 0.12,
    creativity: 0.14,
    energy: 0.26
  }
};

const signalDescriptors = {
  confidence: {
    high: "decisive",
    mid: "steady",
    low: "hesitant"
  },
  warmth: {
    high: "approachable",
    mid: "pleasant",
    low: "distant"
  },
  polish: {
    high: "professional",
    mid: "put together",
    low: "rough around the edges"
  },
  creativity: {
    high: "distinctive",
    mid: "tasteful",
    low: "safe"
  },
  energy: {
    high: "dynamic",
    mid: "calm",
    low: "flat"
  }
};

const coachingLibrary = {
  confidence: {
    cue: "Bring the camera to eye level and square your shoulders.",
    reason: "Confidence reads fastest when the framing looks intentional."
  },
  warmth: {
    cue: "Relax the mouth, soften the eyes, and add a small natural smile.",
    reason: "Warmth reduces intimidation and makes people imagine working with you."
  },
  polish: {
    cue: "Use cleaner lighting, a tighter crop, and a less distracting background.",
    reason: "Polish signals care, readiness, and attention to detail."
  },
  creativity: {
    cue: "Add one intentional style choice like color, texture, or a more interesting setting.",
    reason: "Creativity lands better when there is one memorable visual decision."
  },
  energy: {
    cue: "Increase contrast, lift the light, and choose a more active pose.",
    reason: "A little movement or brightness makes the image feel more alive."
  }
};

function toggleAudience(currentAudiences, key) {
  if (currentAudiences.includes(key)) {
    return currentAudiences.filter((item) => item !== key);
  }

  return [...currentAudiences, key];
}

function roundScore(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function getSignalDescriptor(key, score) {
  const descriptorSet = signalDescriptors[key];

  if (score >= 78) {
    return descriptorSet.high;
  }

  if (score >= 62) {
    return descriptorSet.mid;
  }

  return descriptorSet.low;
}

function rankSignals(signals) {
  return [...signalCatalog]
    .map((signal) => ({
      ...signal,
      score: signals[signal.key]
    }))
    .sort((left, right) => right.score - left.score);
}

function buildAudienceReport(audienceKey, signals, goal, context) {
  const weights = fallbackWeights[audienceKey] ?? fallbackWeights.recruiter;
  const audience = audienceCatalog.find((item) => item.key === audienceKey) ?? audienceCatalog[0];
  const rankedSignals = rankSignals(signals);
  const prioritized = [...rankedSignals].sort(
    (left, right) => signals[right.key] * weights[right.key] - signals[left.key] * weights[left.key]
  );
  const topSignal = prioritized[0];
  const supportSignal = prioritized[1];
  const riskSignal =
    [...prioritized].reverse().find((item) => weights[item.key] >= 0.14) ??
    prioritized[prioritized.length - 1];
  const score = roundScore(
    Object.entries(weights).reduce((total, [key, weight]) => total + signals[key] * weight, 0)
  );

  let verdict = "Strong fit";

  if (score < 60) {
    verdict = "Needs a stronger first read";
  } else if (score < 75) {
    verdict = "Promising with a few gaps";
  }

  const headline = `${audience.label} will probably read this as ${getSignalDescriptor(
    topSignal.key,
    topSignal.score
  )} and ${getSignalDescriptor(supportSignal.key, supportSignal.score)}.`;

  const caution =
    riskSignal.score < 66
      ? `${audience.label} may hesitate if the photo feels too ${getSignalDescriptor(riskSignal.key, 40)} for a ${context.toLowerCase()} setting.`
      : `${audience.label} should still see enough balance for a ${goal.toLowerCase()} goal.`;

  return {
    key: audience.key,
    label: audience.label,
    score,
    verdict,
    summary: `${headline} ${caution}`,
    strengths: [
      `${topSignal.label} is doing the heavy lifting for this audience.`,
      `${supportSignal.label} gives the shot a more believable first impression.`
    ],
    risks: [
      `${riskSignal.label} is the easiest lever to improve next.`,
      coachingLibrary[riskSignal.key].reason
    ],
    suggestions: [
      coachingLibrary[riskSignal.key].cue,
      coachingLibrary[supportSignal.key].cue
    ]
  };
}

function createFallbackReport(payload) {
  const audiences = payload.audiences.length ? payload.audiences : ["recruiter", "client", "collaborator"];
  const reports = audiences.map((audienceKey) =>
    buildAudienceReport(audienceKey, payload.signals, payload.goal, payload.context)
  );
  const rankedSignals = rankSignals(payload.signals);
  const weakestSignals = [...rankedSignals].reverse().slice(0, 3);
  const strongestSignals = rankedSignals.slice(0, 3);
  const overallScore = roundScore(reports.reduce((total, report) => total + report.score, 0) / reports.length);

  return {
    source: "local-fallback",
    overallScore,
    summary: {
      title: overallScore >= 75 ? "You already have a marketable first read." : "The concept is strong, but the photo needs a sharper signal.",
      description: `This ${payload.context.toLowerCase()} currently reads most strongly as ${strongestSignals
        .map((signal) => getSignalDescriptor(signal.key, signal.score))
        .join(", ")}.`
    },
    strengths: strongestSignals.map(
      (signal) => `${signal.label} feels ${getSignalDescriptor(signal.key, signal.score)} right away.`
    ),
    opportunities: weakestSignals.map(
      (signal) => `${signal.label} could be pushed harder if you want a more convincing ${payload.goal.toLowerCase()} result.`
    ),
    nextShotPlan: weakestSignals.map(
      (signal) => `${coachingLibrary[signal.key].cue} ${coachingLibrary[signal.key].reason}`
    ),
    keywords: strongestSignals.map((signal) => getSignalDescriptor(signal.key, signal.score)),
    audiences: reports
  };
}

export default function FirstImpressionSimulator() {
  const [photoFile, setPhotoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [fileInputKey, setFileInputKey] = useState(0);
  const [context, setContext] = useState(contextOptions[0]);
  const [goal, setGoal] = useState(goalSuggestions[0]);
  const [audiences, setAudiences] = useState(["recruiter", "client", "collaborator"]);
  const [signals, setSignals] = useState(() => ({ ...defaultSignals }));
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisMode, setAnalysisMode] = useState("Waiting for input");

  useEffect(() => {
    if (!photoFile) {
      setPreviewUrl("");
      return undefined;
    }

    const nextUrl = URL.createObjectURL(photoFile);
    setPreviewUrl(nextUrl);

    return () => URL.revokeObjectURL(nextUrl);
  }, [photoFile]);

  function updateSignal(key, value) {
    setSignals((currentSignals) => ({
      ...currentSignals,
      [key]: Number(value)
    }));
  }

  function resetDemo() {
    setPhotoFile(null);
    setFileInputKey((currentValue) => currentValue + 1);
    setContext(contextOptions[0]);
    setGoal(goalSuggestions[0]);
    setAudiences(["recruiter", "client", "collaborator"]);
    setSignals({ ...defaultSignals });
    setReport(null);
    setAnalysisMode("Waiting for input");
  }

  async function runSimulation() {
    const payload = {
      photoName: photoFile?.name ?? "untitled-photo",
      context,
      goal,
      audiences,
      signals
    };

    setIsLoading(true);

    try {
      const response = await fetch("/api/first-impression/simulate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const nextReport = await response.json();
      setReport(nextReport);
      setAnalysisMode("Live API");
    } catch (error) {
      setReport(createFallbackReport(payload));
      setAnalysisMode("Demo fallback");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="simulator-section">
      <div className="simulator-header">
        <div>
          <h2 className="section-title">Simulate the first read before anyone else does</h2>
          <p>
            Upload a photo, choose the audiences you care about, and tune the presentation
            signals that shape a first impression. The current build avoids sensitive image
            inferences and stays focused on coachable visual cues.
          </p>
        </div>
        <div className="status-chip">{analysisMode}</div>
      </div>

      <div className="simulator-grid">
        <div className="simulator-card">
          <div className="card-title-row">
            <div>
              <h3>1. Upload the photo</h3>
              <p>Use any headshot, profile image, or team-page photo.</p>
            </div>
          </div>

          <div className="preview-frame">
            {previewUrl ? (
              <img src={previewUrl} alt="Uploaded preview for first impression simulation" />
            ) : (
              <div className="preview-placeholder">
                <div>
                  <strong>Drop in a photo to anchor the simulation</strong>
                  <span>
                    The image preview is real. The perception scoring is based on the presentation
                    signals you set below, so it stays transparent and coachable.
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="upload-actions">
            <label className="upload-label" htmlFor="photo-upload">
              Choose Photo
            </label>
            <input
              key={fileInputKey}
              id="photo-upload"
              className="hidden-input"
              type="file"
              accept="image/*"
              onChange={(event) => setPhotoFile(event.target.files?.[0] ?? null)}
            />
            <button className="secondary-button" type="button" onClick={resetDemo}>
              Reset Demo
            </button>
          </div>

          <p className="helper-copy">
            Resume angle: this product works because it combines UX, lightweight AI product
            thinking, and practical coaching rather than trying to make creepy identity guesses.
          </p>
        </div>

        <div className="simulator-card">
          <div className="card-title-row">
            <div>
              <h3>2. Tell the simulator what success looks like</h3>
              <p>Choose the context, the audience, and the vibe you want to land.</p>
            </div>
          </div>

          <div className="form-grid">
            <div className="field-group">
              <label htmlFor="context-select">Context</label>
              <select
                id="context-select"
                value={context}
                onChange={(event) => setContext(event.target.value)}
              >
                {contextOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="field-group">
              <label htmlFor="photo-name">Photo label</label>
              <input
                id="photo-name"
                type="text"
                value={photoFile?.name ?? "No file selected yet"}
                readOnly
              />
            </div>

            <div className="field-group field-span">
              <label htmlFor="goal-textarea">Target impression</label>
              <textarea
                id="goal-textarea"
                value={goal}
                onChange={(event) => setGoal(event.target.value)}
                placeholder="Example: credible, warm, and client-ready without looking too corporate."
              />
              <div className="quick-start-row">
                {goalSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    className={`goal-chip ${goal === suggestion ? "active" : ""}`}
                    onClick={() => setGoal(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            <div className="field-group field-span">
              <span className="field-legend">Audience lenses</span>
              <div className="audience-chip-row">
                {audienceCatalog.map((audience) => (
                  <button
                    key={audience.key}
                    type="button"
                    className={`audience-chip ${audiences.includes(audience.key) ? "active" : ""}`}
                    onClick={() => setAudiences((current) => toggleAudience(current, audience.key))}
                  >
                    {audience.label}
                  </button>
                ))}
              </div>
              <span className="helper-copy">
                Pick as many as you want. Each audience scores the same photo differently.
              </span>
            </div>

            <div className="field-group field-span">
              <span className="field-legend">Presentation signals</span>
              <div className="signal-stack">
                {signalCatalog.map((signal) => (
                  <div className="signal-row" key={signal.key}>
                    <div className="signal-topline">
                      <div>
                        <strong>{signal.label}</strong>
                        <p className="signal-helper">{signal.helper}</p>
                      </div>
                      <span>{signals[signal.key]}/100</span>
                    </div>
                    <input
                      type="range"
                      min="25"
                      max="95"
                      value={signals[signal.key]}
                      onChange={(event) => updateSignal(signal.key, event.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="actions-row">
            <button
              className="cta-button"
              type="button"
              onClick={runSimulation}
              disabled={isLoading || !photoFile}
            >
              {isLoading ? "Simulating..." : "Run Impression Simulation"}
            </button>
            <span className="helper-copy">
              {photoFile
                ? "The front end prefers the API and gracefully falls back to local scoring in demo mode."
                : "Upload a photo first, then run the simulation."}
            </span>
          </div>
        </div>
      </div>

      {report ? (
        <div className="results-grid">
          <div className="results-topline">
            <div className="results-highlight">
              <h3>{report.summary.title}</h3>
              <p>{report.summary.description}</p>
              <div className="report-keywords">
                {report.keywords.map((keyword) => (
                  <span className="keyword-pill" key={keyword}>
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            <div className="score-card">
              <span className="score-label">Overall readiness</span>
              <span className="score-value">{report.overallScore}</span>
              <span className="muted">out of 100 for your chosen audience mix</span>
            </div>
          </div>

          <div className="insight-grid">
            <article className="insight-card">
              <h4>What is working</h4>
              <ul className="plain-list">
                {report.strengths.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            <article className="insight-card">
              <h4>What to improve</h4>
              <ul className="plain-list">
                {report.opportunities.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </div>

          <div className="audience-grid">
            {report.audiences.map((audience) => (
              <article className="audience-card" key={audience.key}>
                <header>
                  <div>
                    <h4>{audience.label}</h4>
                    <p>{audience.summary}</p>
                  </div>
                  <span className="audience-score">{audience.score}</span>
                </header>

                <div className="verdict-row">
                  <span className="verdict-pill">{audience.verdict}</span>
                </div>

                <ul className="plain-list">
                  {audience.suggestions.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <div className="note-card">
            <h4>Retake plan</h4>
            <ul className="plain-list">
              {report.nextShotPlan.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="footer-note">
              This project is much stronger on a resume because the output is concrete: it gives
              audience-by-audience reads and explains what to change next.
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
