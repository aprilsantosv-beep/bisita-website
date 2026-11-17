/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Static assets pathing for /public/assets
  const publicAssetsPath = path.resolve(__dirname, 'public/assets');
  app.use('/assets', express.static(publicAssetsPath));

  // API Status & MySQL/Node Database Metadata endpoint
  app.get('/api/db/status', (_req, res) => {
    res.json({
      status: 'ONLINE',
      engine: 'Node.js Express + Relational MySQL Data Model',
      database: 'bisita_tourism_sdss',
      timestamp: new Date().toISOString(),
      tables: ['tourist_spots', 'tourist_feedback_reviews', 'surveys', 'gis_layers', 'system_users'],
      supportedLGUs: ['Iligan City', 'Cagayan de Oro City', 'Tangub City'],
    });
  });

  // Check dev or prod
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BisiTa! SDSS Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
