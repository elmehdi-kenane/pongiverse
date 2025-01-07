#!/bin/bash

mkdir -p /etc/nginx/ssl

openssl req -x509 -nodes -out ./etc/nginx/ssl.crt -keyout \
    ./etc/nginx/ssl.key -subj "/C=$COUNTRY/ST=$STATE/L=$LOCATION/O=$ORGANIZATION/OU=$OUNIT/CN=$DOMAIN/UID=$UID"

nginx -g 'daemon off;'