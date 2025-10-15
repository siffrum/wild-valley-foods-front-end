import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const angularDistPath = path.join(__dirname, 'dist/wild-valley-food/browser');
app.use(express.static(angularDistPath));

app.get('/*', (req, res) => {
  res.sendFile(path.join(angularDistPath, 'index.html'));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
