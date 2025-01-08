FROM debian:latest

# Copy the configuration file
WORKDIR /monitoring_system

COPY . /monitoring_system/

RUN chmod +x setup.sh

RUN apt-get update && apt-get upgrade -y && apt-get install -y gettext

CMD ["bash", "setup.sh"]