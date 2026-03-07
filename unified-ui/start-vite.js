const { createServer } = require('vite');

const server = createServer({
  configFile: './vite.config.ts',
  server: {
    port: 3001,
    host: '0.0.0.0',
    strictPort: true
  }
});

console.log('Starting Vite development server on http://localhost:3001');

server.listen();