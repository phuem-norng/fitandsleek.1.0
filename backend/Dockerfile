# Use PHP with Apache for easier deployment
FROM php:8.2-apache

# 1. Install system dependencies for PostgreSQL and ZIP
RUN apt-get update && apt-get install -y \
    libpq-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    && docker-php-ext-install pdo pdo_pgsql zip

# 2. Enable Apache mod_rewrite (Required for Laravel routes to work)
RUN a2enmod rewrite

# 3. Set working directory
WORKDIR /var/www/html

# 4. Copy backend files
COPY . .

# 5. Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
RUN composer install --no-dev --optimize-autoloader

# 6. Set correct permissions for Laravel
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# 7. Configure Apache for Render (Change port 80 to 10000)
RUN sed -i 's/80/10000/g' /etc/apache2/sites-available/000-default.conf /etc/apache2/ports.conf
# Point Apache to Laravel's public folder
RUN sed -i 's|/var/www/html|/var/www/html/public|g' /etc/apache2/sites-available/000-default.conf

EXPOSE 10000

# កែសម្រួលត្រង់នេះ៖ ប្រើ Shell ដើម្បីរត់ Migration មុននឹងបើក Server
CMD ["sh", "-c", "php artisan migrate --force && apache2-foreground"]
