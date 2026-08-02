# Stage 1: Build static React + Vite bundle
FROM node:18-alpine AS build

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Serve built assets using Nginx
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

# Custom Nginx configuration with API reverse proxy and SPA fallback routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
