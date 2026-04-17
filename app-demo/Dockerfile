FROM alpine:3
RUN apk add --no-cache tzdata
COPY log-generator.sh /log-generator.sh
RUN chmod +x /log-generator.sh
CMD ["/log-generator.sh"]
