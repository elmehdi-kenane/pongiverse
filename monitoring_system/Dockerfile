FROM debian:latest

RUN apt-get update && apt-get install -y openssl

RUN mkdir -p /etc/grafana

RUN openssl req -x509 -nodes -out /etc/grafana/grafana.crt -keyout \
    /etc/grafana/grafana.key -subj "/C=$COUNTRY/ST=$STATE/L=$LOCATION/O=$ORGANIZATION/OU=$OUNIT/CN=$DOMAIN/UID=$UID"

RUN groupadd grafana
RUN useradd -r -g grafana grafana

RUN chown grafana:grafana /etc/grafana/grafana.crt
RUN chown grafana:grafana /etc/grafana/grafana.key
RUN chmod 400 /etc/grafana/grafana.key /etc/grafana/grafana.crt

# Copy the configuration file
WORKDIR /monitoring_system

COPY . /monitoring_system/

RUN chmod +x setup.sh

RUN apt-get update && apt-get upgrade -y && apt-get install -y gettext

CMD ["bash", "setup.sh"]