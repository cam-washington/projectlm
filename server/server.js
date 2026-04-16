import { createServer } from "node:http";
import { simulateFirstImpression } from "./controllers/models/routes/middleware/utils/server.js";

const port = Number(process.env.PORT || 8080);

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "application/json; charset=utf-8"
  });

  response.end(JSON.stringify(payload));
}

async function readRequestBody(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks).toString("utf8");
}

const server = createServer(async (request, response) => {
  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
    });
    response.end();
    return;
  }

  if (request.method === "GET" && request.url === "/health") {
    sendJson(response, 200, {
      ok: true,
      service: "first-impression-studio-api"
    });
    return;
  }

  if (request.method === "POST" && request.url === "/api/first-impression/simulate") {
    try {
      const body = await readRequestBody(request);
      const payload = body ? JSON.parse(body) : {};
      const result = simulateFirstImpression(payload);
      sendJson(response, 200, result);
    } catch (error) {
      sendJson(response, 400, {
        error: "Invalid request body",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
    return;
  }

  sendJson(response, 404, {
    error: "Route not found"
  });
});

server.listen(port, () => {
  console.log(`First Impression Studio API listening on http://localhost:${port}`);
});
