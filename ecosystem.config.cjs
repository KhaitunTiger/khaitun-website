module.exports = {
  apps: [{
    name: 'khaitun-website',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    env: {
      PORT: 3001,
      NODE_ENV: 'production'
    },
    exec_mode: 'cluster',
    instances: 'max',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
}
