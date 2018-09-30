FROM httpd:2.4-alpine

COPY dist/ /usr/local/apache2/htdocs/
COPY docker_config/httpd.conf /usr/local/apache2/conf/httpd.conf