module.exports = {
    apps: [
        {
            name: 'hexalabs-marketplace',
            script: 'node_modules/next/dist/bin/next',
            args: 'start',
            instances: 4, // 4 worker processes
            exec_mode: 'cluster',
            env: {
                NODE_ENV: 'production',
                PORT: 3000,
            },
            // Auto-restart configuration
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',

            // Logging
            error_file: './logs/pm2-error.log',
            out_file: './logs/pm2-out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

            // Advanced settings
            min_uptime: '10s',
            max_restarts: 10,
            restart_delay: 4000,

            // Performance monitoring
            instance_var: 'INSTANCE_ID',

            // Graceful shutdown
            kill_timeout: 5000,
            listen_timeout: 3000,
            shutdown_with_message: true,
        },
    ],
};
