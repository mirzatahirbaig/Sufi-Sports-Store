# Stage 1: Build Angular application
FROM node:22-alpine AS build
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

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

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
