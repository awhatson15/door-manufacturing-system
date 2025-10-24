# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies with improved flags
RUN npm install --no-audit --no-fund && npm cache clean --force

# Copy source code and public directory
COPY . .

# Ensure public directory exists
RUN mkdir -p public

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app directory
WORKDIR /app

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy built application
COPY --from=builder --chown=appuser:appgroup /app/.next ./.next
COPY --from=builder --chown=appuser:appgroup /app/package.json ./package.json
COPY --from=builder --chown=appuser:appgroup /app/next.config.js ./
COPY --from=builder --chown=appuser:appgroup /app/public ./public

# Install only production dependencies
RUN npm install --omit=dev --no-audit --no-fund && npm cache clean --force

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://backend:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start the application with dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node_modules/.bin/next", "start"]
