# Multi-stage build for production
FROM oven/bun:1-alpine


# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package.json bun.lock* ./

# Install dependencies
RUN bun install --frozen-lockfile --production

# Copy source code
COPY . /app


# Expose port
EXPOSE 80

# Set environment variables
ENV PORT=80

# Start the application
CMD ["bun", "run", "start"]
