#!/bin/sh

if [ ! -f ".env" ]; then
  cp .env.example .env
fi

if [ "$NODE_ENV" = "production" ] ; then
  yarn start
else
  yarn watch
fi
