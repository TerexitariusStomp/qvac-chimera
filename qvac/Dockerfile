# Dockerfile for QVAC Chimera Wiki + P2P Node
FROM node:20-bookworm

WORKDIR /app

# Install build tools for native modules (hypercore, hyperswarm, leveldb, etc.)
RUN apt-get update && apt-get install -y --no-install-recommends \
    git python3 make g++ bash curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# ─── Backend deps ───
COPY package*.json ./
RUN npm install

# ─── Frontend deps & build ───
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install
COPY frontend/ ./frontend/
RUN cd frontend && npm run build

# ─── Copy source & config ───
COPY src/ ./src/
COPY config.json ./
COPY deploy-vps.sh ./

# ─── Data volume mount point ───
RUN mkdir -p /app/llmwiki-data/wiki /app/llmwiki-data/index

# Environment
ENV NODE_ENV=production
ENV PORT=3002

# Expose wiki web server port
EXPOSE 3002

# Health check on wiki API
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -fs http://localhost:3002/api/status || exit 1

# Start
CMD ["node", "src/index.js"]
