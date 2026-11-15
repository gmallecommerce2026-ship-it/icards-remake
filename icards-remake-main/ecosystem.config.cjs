// pm2 cho FE (cổng 3002):  pm2 start ecosystem.config.cjs && pm2 save
module.exports = {
  apps: [{ name: 'icards-web', cwd: __dirname, script: 'node_modules/next/dist/bin/next', args: 'start -p 3002', env: { NODE_ENV: 'production' } }],
};
