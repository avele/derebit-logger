# Install Node.js if not installed

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
```

```bash
nvm install --lts
```

# Install Node.js packages

Should be run in the project root.

```bash
npm install
```

# Install PM2

```bash
npm install pm2 -g
```

# Create PM2 cron task

Should be run in the root of the project.

`*/30 * * * *` - is cron time for every 30 minutes

```bash
pm2 --no-autorestart --cron-restart="*/30 * * * *" start npm --name "derebit-logger" -- start
```

# Enjoy!

Results folder is located in `./results/`. First results should appear right after running pm2. Each file represents one run of script with name of UTC date of run time. Logged instruments and results folder can be configured in `./config.ts`.
