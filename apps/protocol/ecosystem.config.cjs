
module.exports = {
    apps: [
        {
            name: "veritas-router",
            script: "./scripts/router_agent.js",
            watch: true,
            env: {
                NODE_ENV: "production",
            }
        },
        {
            name: "veritas-treasurer",
            script: "./scripts/treasurer_agent.js",
            watch: true,
            env: {
                NODE_ENV: "production",
            }
        },
        {
            name: "veritas-hunter",
            script: "./scripts/hunter_agent.js",
            watch: false, // Don't restart on file change for hunter (stateful)
            env: {
                NODE_ENV: "production",
            }
        },
        // Add other agents here as needed
    ]
};
