#!/usr/bin/env bash

WHITE='\033[1;37m'
NC='\033[0m'

# Define environment variables...
export APP_PORT=${APP_PORT:-8888}
export APP_SERVICE=${APP_SERVICE:-"sciki"}
export WWWUSER=${WWWUSER:-$UID}
export WWWGROUP=${WWWGROUP:-$(id -g)}

RANDOM_PASSWORD=$(date +%s | sha256sum | base64 | head -c 20)

if [ ! -d ./database/mysql ]; then
  mkdir -p ./database/mysql
fi

if [ ! -d ./database/redis ]; then
  mkdir -p ./database/redis
fi

# Ensure that Docker is running...
if ! docker info >/dev/null 2>&1; then
  echo -e "${WHITE}Docker is not running.${NC}" >&2

  exit 1
fi

if [ $# -gt 0 ]; then

  # Source .env file
  if [ -f ./src/.env ]; then
    source ./src/.env
    export DB_PASSWORD
    export DB_DATABASE
    export DB_USERNAME
  fi

  if [ "$1" == "up" ]; then
    shift 1

    if [ ! -f ./.deployed ]; then
      source ./deploy.conf
      sed "s/%SCIKI_DOMAIN%/${SCIKI_DOMAIN}/" ./src/.env.deploy |
        sed "s/%PHENSIM_KEY%/${PHENSIM_KEY}/" |
        sed "s/%DB_PASSWORD%/${RANDOM_PASSWORD}/" |
        sed "s/%MAIL_HOST%/${MAIL_HOST}/" |
        sed "s/%MAIL_PORT%/${MAIL_PORT}/" |
        sed "s/%MAIL_USERNAME%/${MAIL_USERNAME}/" |
        sed "s/%MAIL_PASSWORD%/${MAIL_PASSWORD}/" |
        sed "s/%MAIL_ENCRYPTION%/${MAIL_ENCRYPTION}/" |
        sed "s/%MAIL_FROM_ADDRESS%/${MAIL_FROM_ADDRESS}/" >./src/.env

      if [ ! -f ./src/.env ]; then
        echo -e "${WHITE}Unable to create .env file${NC}" >&2

        exit 1
      else
        source ./src/.env
        export DB_PASSWORD
        export DB_DATABASE
        export DB_USERNAME
      fi
    fi

    if ! docker-compose up -d; then
      echo -e "${WHITE}Unable to start all containers${NC}" >&2

      exit 1
    fi

  elif [ "$1" == "deploy" ]; then
    echo -e "${WHITE}Deploying PHENSIM${NC}" >&2
    if ! docker-compose exec -u sciki "$APP_SERVICE" composer install --no-dev; then
      echo -e "${WHITE}Unable to install PHP dependencies${NC}" >&2

      exit 1
    fi

    if ! docker-compose exec -u sciki "$APP_SERVICE" php artisan key:generate --force; then
      echo -e "${WHITE}Unable to generate secret key${NC}" >&2

      exit 1
    fi

    if ! docker-compose exec -u sciki "$APP_SERVICE" php artisan migrate:fresh --seed --force; then
      echo -e "${WHITE}Unable to migrate database${NC}" >&2

      exit 1
    fi

    if ! docker-compose exec -u sciki "$APP_SERVICE" npm install; then
      echo -e "${WHITE}Unable to install node dependencies${NC}" >&2

      exit 1
    fi

    if ! docker-compose exec -u sciki "$APP_SERVICE" npm run prod; then
      echo -e "${WHITE}Unable to build frontend interface${NC}" >&2

      exit 1
    fi

    touch ./.deployed

  elif [ "$1" == "composer" ]; then
    shift 1

    docker-compose exec -u sciki "$APP_SERVICE" composer "$@"

  elif [ "$1" == "artisan" ] || [ "$1" == "art" ]; then
    shift 1

    docker-compose exec -u sciki "$APP_SERVICE" php artisan "$@"

  elif [ "$1" == "tinker" ]; then
    shift 1

    docker-compose exec -u sciki "$APP_SERVICE" php artisan tinker

  elif [ "$1" == "shell" ] || [ "$1" == "bash" ]; then
    shift 1

    docker-compose exec -u sciki "$APP_SERVICE" bash

  elif [ "$1" == "root-shell" ]; then
    shift 1

    docker-compose exec "$APP_SERVICE" bash

  elif [ "$1" == "schedule" ]; then
    shift 1

    docker-compose exec -u sciki "$APP_SERVICE" php artisan schedule:run

  elif [ "$1" == "refresh" ]; then
    shift 1

    if ! docker-compose exec -u sciki "$APP_SERVICE" npm install; then
      echo -e "${WHITE}Unable to install node dependencies${NC}" >&2

      exit 1
    fi

    if ! docker-compose exec -u sciki "$APP_SERVICE" npm run prod; then
      echo -e "${WHITE}Unable to build frontend interface${NC}" >&2

      exit 1
    fi

  else

    docker-compose "$@"

  fi

else

  docker-compose ps

fi
