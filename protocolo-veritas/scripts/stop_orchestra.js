// Stop all agent processes
// Run this to shut down the Orchestra

import { exec } from 'child_process';

console.log("🛑 Shutting down Veritas Orchestra...\n");

// Kill all node processes running our scripts
const processes = [
    'x402_gateway.js',
    'hunter_agent.js',
    'treasurer_agent.js',
    'sentinel_agent.js',
    'start_orchestra.js'
];

processes.forEach(script => {
    // Windows command to find and kill processes
    exec(`powershell "Get-WmiObject Win32_Process -Filter \\"CommandLine LIKE '%${script}%'\\" | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }"`, (error, stdout, stderr) => {
        if (error) {
            console.log(`   ⚠️ No ${script} process found (likely already stopped)`);
        } else {
            console.log(`   ✅ Killed ${script}`);
        }
    });
});

// Also kill port 3000 (Gateway)
exec('powershell "$tcp = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue; if ($tcp) { Stop-Process -Id $tcp.OwningProcess -Force }"', (error) => {
    if (!error) console.log("   ✅ Freed port 3000");
});

console.log("\n🔇 Orchestra shutdown complete.\n");
console.log("To restart: node scripts/start_orchestra.js");
