# Multistage Dockerfile for Node.js app (production)
# Use official Node LTS image for build and runtime

FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package.json package-lock.json* ./

# Install production dependencies only
RUN npm install --production --silent

# Copy application source
COPY . .

# If you build any assets for production, run build steps here (uncomment if needed)
# RUN npm run tailwind

# Final smaller image
FROM node:18-alpine
WORKDIR /app

# Environment
ENV NODE_ENV=production
ENV PORT=3006

# Copy installed modules and app from builder
COPY --from=builder /app /app

# Use a non-root user for security
USER node

EXPOSE 3006

# Start the app
CMD ["node", "app.js"]
