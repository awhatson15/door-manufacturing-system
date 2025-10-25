# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm install && npm cache clean --force

# Bust cache to ensure fresh build
ARG BUILD_DATE=unknown
RUN echo "Build date: ${BUILD_DATE}"

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Install dependencies for Puppeteer with better error handling
RUN apk update && apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    --allow-untrusted || \
    apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Tell Puppeteer to skip installing Chromium since we installed it manually
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Create app directory
WORKDIR /app

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy built application
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist

# Copy package files
COPY --chown=appuser:appgroup package*.json ./

# Copy source files needed for migrations
COPY --from=builder --chown=appuser:appgroup /app/src/database ./src/database
COPY --from=builder --chown=appuser:appgroup /app/tsconfig.json ./tsconfig.json

# Install production dependencies + migration tools
RUN npm install --omit=dev --no-audit --no-fund && \
    npm install ts-node tsconfig-paths --no-save --no-audit --no-fund && \
    npm cache clean --force

# Create uploads directory
RUN mkdir -p uploads && chown appuser:appgroup uploads

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => { process.exit(1) })" || exit 1

# Start the application
CMD ["node", "dist/main"]
