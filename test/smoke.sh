#!/bin/bash

# check if healthcheck returns 200
echo -n "hitting healthcheck route..."
if ! [ $(curl -sL -w "%{http_code}\\n" "https://$1" -o /dev/null) == 200 ]; then
  # healthcheck did not return 200
  echo "Healthcheck failed."
  exit 1
fi
exit 0
