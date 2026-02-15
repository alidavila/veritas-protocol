import { spawn } from 'child_process';
import path from 'path';

const agents = [
    { name: 'Gateway', script: 'scripts/x402_gateway.js', color: '\x1b[36m' }, // Cyan
    { name: 'Hunter', script: 'scripts/hunter_agent.js', color: '\x1b[32m' },  // Green
    { name: 'Treasurer', script: 'scripts/treasurer_agent.js', color: '\x1b[33m' }, // Yellow
    { name: 'Sentinel', script: 'scripts/sentinel_agent.js', color: '\x1b[31m' }  // Red
];

console.log("🎻 Veritast Protocol Orchestra Styling...\n");

agents.forEach(agent => {
    const p = spawn('node', [agent.script], { stdio: 'pipe' });

    p.stdout.on('data', (data) => {
        const lines = data.toString().split('\n');
        lines.forEach(line => {
            if (line.trim()) {
                console.log(`${agent.color}[${agent.name}]\x1b[0m ${line}`);
            }
        });
    });

    p.stderr.on('data', (data) => {
        console.error(`${agent.color}[${agent.name} ERROR]\x1b[0m ${data}`);
    });

    console.log(`✅ Started ${agent.name} (PID: ${p.pid})`);
});

// Keep alive
process.stdin.resume();
