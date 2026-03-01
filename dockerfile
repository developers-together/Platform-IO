# Stage 1: Build the Svelte Frontend using the latest Node Alpine image
FROM node:alpine AS frontend
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Build the Laravel Backend using the latest PHP FPM Alpine image
FROM php:fpm-alpine
WORKDIR /var/www/html

# Install system dependencies and PHP extensions required for Laravel & MySQL
RUN apk add --no-cache zip unzip curl supervisor \
    && docker-php-ext-install pdo pdo_mysql pcntl

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy Laravel files
COPY . .

# Copy built Svelte assets from the frontend stage
COPY --from=frontend /app/public/build ./public/build

# Install PHP dependencies
RUN composer install --optimize-autoloader --no-dev

# Set permissions so Laravel can write to storage
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Expose PHP-FPM port
EXPOSE 9000
CMD ["php-fpm"]
