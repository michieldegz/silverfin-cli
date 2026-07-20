# ---- build stage ----
FROM node:22-bookworm-slim AS build
WORKDIR /app

# Toolchain for compiling better-sqlite3 if a prebuilt binary isn't available
# for this arch (arm64 on the Pi).
RUN apt-get update && apt-get install -y --no-install-recommends \
	python3 make g++ ca-certificates \
	&& rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build && npm prune --omit=dev

# ---- runtime stage ----
FROM node:22-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Copy the built server, production node_modules, and package manifest.
COPY --from=build /app/build ./build
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

EXPOSE 3000
# Data (SQLite file) lives on a mounted volume — see docker-compose.yml.
VOLUME ["/data"]

CMD ["node", "build"]
