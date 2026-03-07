const { spawn } = require('child_process');
const path = require('path');

console.log('Starting development server...');

const vitePath = path.join(__dirname, 'node_modules', '.bin', 'vite');

console.log('Vite path:', vitePath);

const vite = spawn('node', [vitePath], {
  stdio: 'inherit',
  shell: true,
  cwd: __dirname
});

vite.on('error', (error) => {
  console.error('Failed to start Vite:', error);
  process.exit(1);
});

vite.on('close', (code) => {
  if (code !== 0) {
    console.error(`Vite exited with code ${code}`);
    process.exit(code);
  }
  
  console.log('Vite development server started successfully!');
  console.log('Access the application at: http://localhost:3001');
});