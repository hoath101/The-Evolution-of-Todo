# Deployment Reference

Guide to deploying Next.js 16 applications to various platforms.

## Table of Contents

- Vercel Deployment
- Docker Deployment
- Self-Hosting
- Environment Variables
- Build Optimization
- Production Checklist

## Vercel Deployment

### Quick Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Automatic Git Deployment

1. Push code to GitHub/GitLab/Bitbucket
2. Import project at vercel.com
3. Configure build settings (auto-detected)
4. Deploy

### Environment Variables

Set in Vercel dashboard:
- Settings → Environment Variables
- Add variables for Production, Preview, Development

```bash
# Or via CLI
vercel env add DATABASE_URL production
```

### Vercel Configuration

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_API_URL": "https://api.example.com"
  }
}
```

## Docker Deployment

### Dockerfile

```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  nextjs:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=mydb
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

### Build and Run

```bash
# Build
docker build -t my-nextjs-app .

# Run
docker run -p 3000:3000 my-nextjs-app

# Or with docker-compose
docker-compose up -d
```

### Next.js Configuration for Docker

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
}

module.exports = nextConfig
```

## Self-Hosting

### Node.js Server

```bash
# Build
npm run build

# Start production server
npm start

# Or with PM2
npm install -g pm2
pm2 start npm --name "nextjs-app" -- start
pm2 save
pm2 startup
```

### PM2 Configuration

```json
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'nextjs-app',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 'max',
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '1G'
  }]
}
```

```bash
pm2 start ecosystem.config.js
```

### Nginx Reverse Proxy

```nginx
# /etc/nginx/sites-available/nextjs
server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable:
```bash
sudo ln -s /etc/nginx/sites-available/nextjs /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### SSL with Let's Encrypt

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d example.com

# Auto-renewal (cron)
sudo certbot renew --dry-run
```

## Environment Variables

### .env Files

```bash
# .env.local (not committed, local dev)
DATABASE_URL="postgresql://localhost:5432/mydb"
JWT_SECRET="your-secret-key"
NEXT_PUBLIC_API_URL="http://localhost:3000/api"

# .env.production (production defaults)
NEXT_PUBLIC_API_URL="https://api.example.com"
```

### Next.js Environment Variables

```js
// next.config.js
module.exports = {
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}
```

### Client-Side Variables

Prefix with `NEXT_PUBLIC_`:

```bash
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

```tsx
// Available in browser
const apiUrl = process.env.NEXT_PUBLIC_API_URL
```

### Runtime Configuration

```tsx
// app/api/config/route.ts
export async function GET() {
  return Response.json({
    apiUrl: process.env.API_URL, // Server-side only
    publicUrl: process.env.NEXT_PUBLIC_API_URL // Available everywhere
  })
}
```

## Build Optimization

### next.config.js Optimization

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Compression
  compress: true,

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },

  // Standalone output for Docker
  output: 'standalone',

  // Experimental features
  experimental: {
    optimizePackageImports: ['package-name'],
  },

  // Bundle analyzer
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config) => {
      config.plugins.push(
        new (require('@next/bundle-analyzer'))({
          enabled: true,
        })
      )
      return config
    },
  }),
}

module.exports = nextConfig
```

### Bundle Analysis

```bash
# Install
npm install -D @next/bundle-analyzer

# Analyze
ANALYZE=true npm run build
```

### Static Export (if applicable)

```js
// next.config.js
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true, // Required for static export
  },
}
```

```bash
npm run build
# Output in 'out' directory
```

## Production Checklist

### Before Deployment

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Error tracking setup (Sentry, etc.)
- [ ] Analytics configured
- [ ] SEO metadata complete
- [ ] Performance optimized
- [ ] Security headers configured
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Logging configured

### Security Headers

```js
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
]

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}
```

### Performance Monitoring

```tsx
// app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }: Props) {
  return (
    <html lang="en">
      <body>
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}
```

### Error Tracking

```tsx
// lib/sentry.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
})
```

## Platform-Specific Guides

### AWS Amplify

```yaml
# amplify.yml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

### Netlify

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### Railway

```json
// railway.json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## Best Practices

1. **Environment Variables**: Never commit secrets
2. **Health Checks**: Implement /api/health endpoint
3. **Monitoring**: Set up error tracking and performance monitoring
4. **Caching**: Use appropriate caching strategies
5. **CDN**: Serve static assets via CDN
6. **Database**: Use connection pooling
7. **Backups**: Automated database backups
8. **Updates**: Keep dependencies updated
