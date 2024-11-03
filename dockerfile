FROM debian:latest

RUN apt-get update && apt-get upgrade && apt-get install nodejs npm -y && apt-get install curl -y

RUN npm install -g n -y && n lts -y

RUN mkdir /frontend

COPY frontend/ /frontend/

COPY ./script.sh /

RUN chmod +x /script.sh

CMD ["/script.sh"]