# =============================================================================
# EcoSense Frontend Dockerfile
# Multi-stage build for production-ready React + TypeScript application
# =============================================================================

# Stage 1: Build the React application
FROM node:20 AS build

WORKDIR /app

# Install dependencies first (better layer caching)
# Note: We need ALL dependencies (including devDependencies) for the build
# because TypeScript, Vite, and other build tools are devDependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build arguments for environment variables
ARG VITE_API_BASE_URL=http://localhost:5000
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build the application
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:1.27-alpine

# Labels for container metadata
LABEL maintainer="EcoSense Team"
LABEL description="EcoSense Frontend - Waste Management & Recycling Tracker UI"
LABEL version="1.0.0"

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Create non-root user for security
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]