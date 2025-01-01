#!/bin/bash

mkdir -p /etc/nginx/ssl

openssl req -x509 -nodes -out ./etc/nginx/ssl.crt -keyout \
    ./etc/nginx/ssl.key -subj "/C=MO/ST=KH/L=KH/O=1337/OU=1337/CN=aagouzou.42.fr/UID=aagouzou"

nginx -g 'daemon off;'