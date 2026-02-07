# Use official Node.js runtime as a parent image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source files
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S authuser -u 1001

# Change ownership of the app directory
RUN chown -R authuser:nodejs /app

# Switch to non-root user
USER authuser

# Expose port
EXPOSE 4000

# Set environment variables
ENV NODE_ENV=production

# Run the application
CMD ["node", "server.js"]