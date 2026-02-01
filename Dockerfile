# ================================
# SellerCloudX - Railway Dockerfile
# Node.js + Python FastAPI hybrid
# ================================

# Stage 1: Node.js build
FROM node:20-slim AS node-builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY yarn.lock* ./

# Install dependencies
RUN npm ci || yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build frontend and backend
RUN npm run build || yarn build

# ================================
# Stage 2: Python setup
# ================================
FROM python:3.11-slim AS python-builder

WORKDIR /app/backend

# Copy Python requirements
COPY backend/requirements.txt ./

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# ================================
# Stage 3: Production image
# ================================
FROM node:20-slim

# Install Python
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy Node.js build
COPY --from=node-builder /app/node_modules ./node_modules
COPY --from=node-builder /app/dist ./dist
COPY --from=node-builder /app/package*.json ./

# Copy Python backend
COPY backend ./backend

# Install Python dependencies + emergentintegrations from custom URL
RUN pip3 install --no-cache-dir -r backend/requirements.txt --break-system-packages && \
    pip3 install --no-cache-dir emergentintegrations --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/ --break-system-packages

# Copy supervisor config
COPY railway-supervisor.conf /etc/supervisor/conf.d/supervisord.conf

# Set environment
ENV NODE_ENV=production
ENV PYTHONUNBUFFERED=1

# Railway sets PORT dynamically
EXPOSE 5000
EXPOSE 8001

# Start with supervisor
CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf", "-n"]
