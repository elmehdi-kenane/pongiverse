#!/bin/bash

cd /backend


python3 -m venv venv

source ./venv/bin/activate


python3 -m pip install --upgrade pip

pip3 install -r requirements.txt

python3 manage.py createsuperuser --username admin --email admin@example.com --noinput && echo "from myapp.models import customuser; customuser.objects.filter(username='admin').update(password='admin')" | python manage.py shell

python3 ./manage.py makemigrations mainApp myapp Profile Notifications chat friends navBar

python3 ./manage.py migrate


python3 ./manage.py runserver 0.0.0.0:8000
