FROM nginx:latest

RUN  apt-get update && apt-get install && apt-get install openssl -y

COPY ./default.conf /etc/nginx/conf.d/default.conf

COPY ./script.sh ./script.sh

RUN chmod +x ./script.sh

CMD [ "./script.sh" ]

