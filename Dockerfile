# Build the Vite SPA and serve it with Caddy carrying the security headers from
# the repo's Caddyfile. Same pattern as brew.keitaemsden.com and
# bigdecisions.keitaemsden.com on this Coolify host.
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM caddy:2-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /usr/share/caddy/
EXPOSE 80
