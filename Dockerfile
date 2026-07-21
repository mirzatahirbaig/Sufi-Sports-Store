# Stage 1: Build Angular application
FROM node:22-alpine AS build
WORKDIR /app

# Install dependencies based on package-lock.json
COPY package.json package-lock.json ./
RUN npm ci

# Copy source files and build production bundle
COPY . .
RUN npm run build -- --configuration production

# Stage 2: Serve built static files with Nginx
FROM nginx:alpine AS final

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Remove default Nginx static files and copy Angular dist output
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist/sufi-sports-store/browser /usr/share/nginx/html

# Grant ownership to unprivileged nginx user for security best practice
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

USER nginx

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
