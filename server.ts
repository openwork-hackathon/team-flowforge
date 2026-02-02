/**
 * Custom Next.js Server with Socket.io for WebSocket support
 * 
 * Run with: npx ts-node --project tsconfig.server.json server.ts
 * Or: node --loader ts-node/esm server.ts
 */
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { initSocketServer } from './src/lib/socket-server';

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  // Initialize Socket.io on the same server
  const io = initSocketServer(httpServer);
  console.log(`[Server] Socket.io initialized on path: ${io.path()}`);

  httpServer.listen(port, () => {
    console.log(`[Server] Ready on http://${hostname}:${port}`);
    console.log(`[Server] WebSocket available at ws://${hostname}:${port}/api/socket`);
  });
});
