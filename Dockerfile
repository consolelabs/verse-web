FROM nginx:latest

COPY apps/ /usr/share/nginx/html/apps/

COPY nginx.conf /etc/nginx/nginx.conf
