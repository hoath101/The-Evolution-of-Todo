# Multi-stage build for Next.js application

# Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

# Install dumb-init to handle signals properly
RUN apk add --no-cache dumb-init

# Set working directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs &&\
    adduser -S nextjs -u 1001

# Copy package files
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy the built application from the builder stage
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/tsconfig.json ./

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set environment variables with defaults
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NODE_ENV=production

# Use dumb-init to handle graceful shutdowns
ENTRYPOINT ["dumb-init"]

# Start the Next.js application
CMD ["npm", "start"]