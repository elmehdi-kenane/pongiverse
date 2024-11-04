#!/bin/bash

cd /backend

# mkdir -p /etc/django/ssl

apt install openssl -y

openssl req -x509 -nodes -out ./ft_trans/src/inception.crt -keyout \
    ./ft_trans/src/inception.key -subj "/C=MO/ST=KH/L=KH/O=1337/OU=1337/CN=aagouzou.42.fr/UID=aagouzou"

python3 -m venv venv

source ./venv/bin/activate

cd ./ft_trans/src

python3 -m pip install --upgrade pip

pip3 install -r requirements.txt

pip3 install django-sslserver

python3 ./manage.py makemigrations mainApp myapp Profile Notifications chat friends

python3 ./manage.py migrate

python3 ./manage.py runsslserver --certificate ./inception.crt --key ./inception.key 0.0.0.0:8000 