FROM nginx:latest

RUN  apt-get update && apt-get install && apt-get install openssl -y

COPY pongiverse_me.crt /etc/nginx/
COPY pongiverse.me.key /etc/nginx/
COPY pongiverse_me.ca-bundle /etc/nginx/
RUN chmod -R 755 /usr/share/nginx/html && \
    chown -R www-data:www-data /usr/share/nginx/html

COPY ./default.conf /etc/nginx/conf.d/default.conf

COPY ./script.sh ./script.sh

RUN chmod +x ./script.sh

CMD [ "./script.sh" ]

