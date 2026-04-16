const audienceProfiles = {
  recruiter: {
    label: "Recruiters",
    weights: {
      confidence: 0.26,
      warmth: 0.18,
      polish: 0.33,
      creativity: 0.07,
      energy: 0.16
    }
  },
  founder: {
    label: "Founders",
    weights: {
      confidence: 0.24,
      warmth: 0.14,
      polish: 0.13,
      creativity: 0.26,
      energy: 0.23
    }
  },
  client: {
    label: "Clients",
    weights: {
      confidence: 0.24,
      warmth: 0.2,
      polish: 0.32,
      creativity: 0.07,
      energy: 0.17
    }
  },
  collaborator: {
    label: "Peers",
    weights: {
      confidence: 0.18,
      warmth: 0.3,
      polish: 0.12,
      creativity: 0.14,
      energy: 0.26
    }
  }
};

const signalMeta = {
  confidence: {
    label: "Confidence",
    descriptors: {
      high: "decisive",
      mid: "steady",
      low: "hesitant"
    },
    coaching:
      "Raise the camera to eye level, open the shoulders, and avoid a compressed pose."
  },
  warmth: {
    label: "Warmth",
    descriptors: {
      high: "approachable",
      mid: "pleasant",
      low: "distant"
    },
    coaching:
      "Use softer eye contact and a small natural smile so the image feels more human."
  },
  polish: {
    label: "Polish",
    descriptors: {
      high: "professional",
      mid: "put together",
      low: "rough around the edges"
    },
    coaching:
      "Clean up the crop, simplify the background, and use more intentional lighting."
  },
  creativity: {
    label: "Creativity",
    descriptors: {
      high: "distinctive",
      mid: "tasteful",
      low: "safe"
    },
    coaching:
      "Introduce one memorable style choice like color, composition, or a more intentional setting."
  },
  energy: {
    label: "Energy",
    descriptors: {
      high: "dynamic",
      mid: "calm",
      low: "flat"
    },
    coaching:
      "Add contrast, brighter light, and a slightly more active posture to wake the frame up."
  }
};

function clampScore(value) {
  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(numericValue)));
}

function getDescriptor(signalKey, score) {
  const descriptors = signalMeta[signalKey].descriptors;

  if (score >= 78) {
    return descriptors.high;
  }

  if (score >= 62) {
    return descriptors.mid;
  }

  return descriptors.low;
}

function sanitizeSignals(inputSignals = {}) {
  return Object.keys(signalMeta).reduce((accumulator, key) => {
    accumulator[key] = clampScore(inputSignals[key] ?? 0);
    return accumulator;
  }, {});
}

function rankSignals(signals) {
  return Object.entries(signalMeta)
    .map(([key, value]) => ({
      key,
      label: value.label,
      score: signals[key]
    }))
    .sort((left, right) => right.score - left.score);
}

function getAudienceReport(audienceKey, signals, context, goal) {
  const audience = audienceProfiles[audienceKey] ?? audienceProfiles.recruiter;
  const rankedSignals = rankSignals(signals);
  const weightedPriority = [...rankedSignals].sort(
    (left, right) =>
      signals[right.key] * audience.weights[right.key] - signals[left.key] * audience.weights[left.key]
  );
  const primary = weightedPriority[0];
  const support = weightedPriority[1];
  const risk =
    [...weightedPriority].reverse().find((item) => audience.weights[item.key] >= 0.14) ??
    weightedPriority[weightedPriority.length - 1];
  const score = clampScore(
    Object.entries(audience.weights).reduce((total, [key, weight]) => total + signals[key] * weight, 0)
  );

  let verdict = "Strong fit";

  if (score < 60) {
    verdict = "Needs a stronger first read";
  } else if (score < 75) {
    verdict = "Promising with a few gaps";
  }

  return {
    key: audienceKey,
    label: audience.label,
    score,
    verdict,
    summary: `${audience.label} will likely read this as ${getDescriptor(
      primary.key,
      primary.score
    )} and ${getDescriptor(support.key, support.score)}. ${
      risk.score < 66
        ? `${signalMeta[risk.key].label} is the biggest thing keeping the ${context.toLowerCase()} from fully supporting a ${goal.toLowerCase()} outcome.`
        : `The image has enough balance to support a ${goal.toLowerCase()} outcome without feeling forced.`
    }`,
    strengths: [
      `${signalMeta[primary.key].label} is carrying most of the first impression here.`,
      `${signalMeta[support.key].label} helps the image feel believable rather than overly staged.`
    ],
    risks: [
      `${signalMeta[risk.key].label} is the easiest improvement lever for this audience.`,
      signalMeta[risk.key].coaching
    ],
    suggestions: [
      signalMeta[risk.key].coaching,
      signalMeta[support.key].coaching
    ]
  };
}

export function simulateFirstImpression(payload = {}) {
  const context = payload.context || "LinkedIn headshot";
  const goal = payload.goal || "credible and approachable";
  const signals = sanitizeSignals(payload.signals);
  const audiences =
    Array.isArray(payload.audiences) && payload.audiences.length
      ? payload.audiences.filter((key) => audienceProfiles[key])
      : ["recruiter", "client", "collaborator"];
  const reports = audiences.map((audienceKey) => getAudienceReport(audienceKey, signals, context, goal));
  const rankedSignals = rankSignals(signals);
  const strongestSignals = rankedSignals.slice(0, 3);
  const weakestSignals = [...rankedSignals].reverse().slice(0, 3);
  const overallScore = clampScore(reports.reduce((total, report) => total + report.score, 0) / reports.length);

  return {
    source: "server-engine",
    simulatedAt: new Date().toISOString(),
    context,
    goal,
    overallScore,
    summary: {
      title:
        overallScore >= 75
          ? "The photo already lands with a convincing first read."
          : "The foundation is solid, but the presentation needs a stronger signal.",
      description: `Across your selected audiences, the image reads most strongly as ${strongestSignals
        .map((signal) => getDescriptor(signal.key, signal.score))
        .join(", ")}.`
    },
    strengths: strongestSignals.map(
      (signal) =>
        `${signal.label} currently reads as ${getDescriptor(signal.key, signal.score)} and gives the photo useful momentum.`
    ),
    opportunities: weakestSignals.map(
      (signal) =>
        `${signal.label} is the clearest opportunity if you want the photo to feel more aligned with "${goal}".`
    ),
    nextShotPlan: weakestSignals.map(
      (signal) => `${signalMeta[signal.key].coaching} This is the fastest upgrade path for ${signal.label.toLowerCase()}.`
    ),
    keywords: strongestSignals.map((signal) => getDescriptor(signal.key, signal.score)),
    audiences: reports,
    note:
      "This simulation is designed around presentation cues and does not attempt to infer sensitive traits or identity from the uploaded image."
  };
}
