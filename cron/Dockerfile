FROM alpine

RUN apk add --no-cache curl postgresql-client tzdata

COPY crontab /etc/crontabs/root

CMD ["crond", "-f", "-l", "2"]
