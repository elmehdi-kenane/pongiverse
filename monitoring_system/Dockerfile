FROM debian:latest

# Copy the configuration file
WORKDIR /monitoring_system

COPY . /monitoring_system/

EXPOSE 3030
RUN chmod +x setup.sh

CMD ["sleep", "infinity"]

