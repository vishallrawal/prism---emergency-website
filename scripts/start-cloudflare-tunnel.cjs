const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

const frontendUrl = process.env.FRONTEND_URL || 'http://127.0.0.1:5173';
const cloudflared = process.platform === 'win32' ? 'cloudflared.cmd' : 'cloudflared';
const urlsFile = path.resolve(process.cwd(), 'dev-urls.txt');
const qrFile = path.resolve(process.cwd(), 'dev-tunnel-qr.png');

function removeTunnelQr() {
  if (fs.existsSync(qrFile)) fs.unlinkSync(qrFile);
}

function writeUrls(tunnelUrl, tunnelStopped = false) {
  const lines = [
    'PRISM development URLs',
    `Updated: ${new Date().toLocaleString()}`,
    '',
    'Backend API:      http://localhost:5000',
    'Backend health:   http://localhost:5000/api/health',
    'API docs:         http://localhost:5000/api/docs',
    'OpenAPI JSON:     http://localhost:5000/api/openapi.json',
    'Frontend:         http://localhost:5173',
    'Admin login:      http://localhost:5173/admin',
    '',
    tunnelUrl ? `Cloudflare tunnel: ${tunnelUrl}` : (tunnelStopped ? 'Cloudflare tunnel: Stopped — run npm run dev to create a new URL.' : 'Cloudflare tunnel: Waiting for Cloudflare to create a URL…'),
    tunnelUrl ? `Tunnel admin:      ${tunnelUrl}/admin` : (tunnelStopped ? 'Tunnel admin:      Not available while the tunnel is stopped.' : 'Tunnel admin:      Waiting for the tunnel URL…'),
    '',
    'This file is automatically overwritten every time you run npm run dev.'
  ];
  fs.writeFileSync(urlsFile, `${lines.join('\n')}\n`, 'utf8');
}

removeTunnelQr();
writeUrls();

console.log(`Creating a Cloudflare Quick Tunnel for ${frontendUrl}`);
console.log(`The public URL will be saved to ${path.basename(urlsFile)} when it is ready.`);

const tunnel = spawn(cloudflared, ['tunnel', '--url', frontendUrl, '--no-autoupdate'], {
  stdio: ['ignore', 'pipe', 'pipe'],
  shell: process.platform === 'win32'
});

let tunnelUrl;
async function createTunnelQr(url) {
  try {
    await QRCode.toFile(qrFile, url, {
      width: 360,
      margin: 2,
      color: { dark: '#060913', light: '#ffffff' }
    });
    console.log(`Saved tunnel QR code to: ${qrFile}`);
  } catch (error) {
    console.error(`Could not create tunnel QR code: ${error.message}`);
  }
}

function forwardAndFindUrl(chunk, output) {
  const text = chunk.toString();
  output.write(text);
  const match = text.match(/https:\/\/[-a-z0-9]+\.trycloudflare\.com/i);
  if (match && match[0] !== tunnelUrl) {
    tunnelUrl = match[0];
    writeUrls(tunnelUrl);
    createTunnelQr(tunnelUrl);
    console.log(`\nSaved all development URLs to: ${urlsFile}\n`);
  }
}

tunnel.stdout.on('data', (chunk) => forwardAndFindUrl(chunk, process.stdout));
tunnel.stderr.on('data', (chunk) => forwardAndFindUrl(chunk, process.stderr));

tunnel.on('error', (error) => {
  console.error(`Unable to start Cloudflare Tunnel: ${error.message}`);
  process.exitCode = 1;
});

tunnel.on('exit', (code) => {
  removeTunnelQr();
  writeUrls(null, true);
  process.exitCode = code || 0;
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => tunnel.kill(signal));
}
