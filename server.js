import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const angularDistPath = path.join(__dirname, 'dist/wild-valley-food/browser');

// ✅ Full CORS fix for Angular frontend calling backend
app.use(cors({
  origin: 'https://wvf.onrender.com', // your frontend
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Accept",
    "Origin",
    "X-Requested-With",
    "targetapitype" // your custom header
  ],
}));

// Serve static files (including favicon.ico)
app.use(express.static(angularDistPath, {
  maxAge: '1y', // Cache static assets for 1 year
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    // Set proper content type for favicon
    if (filePath.endsWith('.ico')) {
      res.setHeader('Content-Type', 'image/x-icon');
    }
  }
}));

// Explicitly handle favicon.ico to prevent 500 errors
app.get('/favicon.ico', (req, res) => {
  const faviconPath = path.join(angularDistPath, 'favicon.ico');
  res.sendFile(faviconPath, (err) => {
    if (err) {
      // If favicon doesn't exist, return 204 No Content instead of 500
      res.status(204).end();
    }
  });
});

// Catch-all handler: serve index.html for all other routes (SPA routing)
app.get('/*', (req, res) => {
  const indexPath = path.join(angularDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(500).send('Internal Server Error');
    }
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
