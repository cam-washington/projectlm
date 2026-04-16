# First Impression Studio

First Impression Studio is a portfolio-ready full-stack concept that lets someone upload a photo, choose the audience they care about, and simulate how that image might read across different professional contexts.

The product angle is intentionally safer and more useful than "judge my face" apps. It focuses on presentation signals someone can actually control:

- confidence
- warmth
- polish
- creativity
- energy

The app turns those signals into audience-specific feedback for recruiters, founders, clients, collaborators, and community-facing roles. It also generates a simple improvement plan so the result feels actionable instead of gimmicky.

## Why This Works Well On A Resume

- Clear product thinking: it solves a memorable first-impression problem.
- Full-stack shape: React client plus a backend simulation API.
- Ethical framing: it avoids sensitive inferences and stays grounded in presentation coaching.
- Demo-friendly: the client falls back to a local simulation if the API is unavailable.

## Suggested Stack

- React + Vite on the client
- Node HTTP server on the backend
- A deterministic simulation engine today
- Optional future upgrade to a vision model for cue extraction

## Running It

This workspace does not currently have Node installed in the environment I was working in, so I could not run or verify the app locally. Once Node is available:

1. In `client`, install dependencies with `npm install`.
2. Start the API in `server` with `npm run dev`.
3. Start the client in `client` with `npm run dev`.

The Vite dev server is configured to proxy `/api` requests to `http://localhost:8080`.

## Future Upgrade Ideas

- Add OpenAI vision analysis to pre-fill the signal sliders from the uploaded photo.
- Save past photo runs so users can compare iterations over time.
- Add role presets such as "customer success", "designer", and "account executive".
- Generate tailored retake checklists for LinkedIn, portfolio, and speaking-event headshots.
