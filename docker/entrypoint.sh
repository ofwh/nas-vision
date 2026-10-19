#!/bin/sh
set -eu

cd /migrate
npm run db:migrate

cd /app
exec "$@"
