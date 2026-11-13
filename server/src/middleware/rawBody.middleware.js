// src/middleware/rawBody.middleware.js
export function captureRawBody(req, res, next) {
  if (req.originalUrl.includes("/webhook") && req.method === "POST") {
    let chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      req.rawBody = raw;
      try {
        req.body = raw ? JSON.parse(raw) : {};
      } catch {
        req.body = {};
      }
      next();
    });
    req.on("error", next);
  } else {
    next();
  }
}