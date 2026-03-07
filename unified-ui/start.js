const { spawn } = require('child_process');

console.log('Starting Vite development server...');

const vite = spawn('npx', ['vite'], {
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
});