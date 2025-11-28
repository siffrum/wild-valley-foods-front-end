# Stage 1: Angular Build
FROM node:20 AS build
WORKDIR /app

COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project source
COPY . .

# Build Angular for production
RUN npm run build-prod

# Stage 2: Serve with Nginx
FROM nginx:stable-alpine

# Copy built Angular files
COPY --from=build /app/dist/wild-valley-food/browser /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
