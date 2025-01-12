#!/bin/bash

# Navigate to the project directory
cd /backend || { echo "Directory /backend does not exist."; exit 1; }

# Create a virtual environment if it doesn't already exist
if [ -d "venv" ]; then
    rm -fr venv
fi

python3 -m venv venv

# Activate the virtual environment
source ./venv/bin/activate || { echo "Failed to activate virtual environment."; exit 1; }

# Upgrade pip
python3 -m pip install --upgrade pip || { echo "Failed to upgrade pip."; exit 1; }

# Install requirements
pip3 install -r requirements.txt || { echo "Failed to install requirements."; exit 1; }

# Run Django commands
python3 ./manage.py makemigrations mainApp myapp Profile Notifications chat friends navBar || { echo "Makemigrations failed."; exit 1; }
python3 ./manage.py migrate || { echo "Migrations failed."; exit 1; }


# Run the development server
python3 ./manage.py runserver 0.0.0.0:8000 || { echo "Failed to start the server."; exit 1; }
