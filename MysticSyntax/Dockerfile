FROM php:7.4-apache

MAINTAINER Nightcore

RUN apt-get update 
RUN docker-php-ext-install mysqli
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"
RUN a2enmod rewrite

WORKDIR /var/www/html
COPY ./src /var/www/html/

EXPOSE 80