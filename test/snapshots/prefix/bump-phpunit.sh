#!/bin/bash

# This script is a part of the ideasonpurpose/docker-phpunit-watch project
# https://github.com/ideasonpurpose/docker-phpunit-watch
#
# Version: 0.9.4
#
# For now, manually update the PHPUnit version in phpunit-version.json before running
#
# This script does a few things:
# - Updates the PHPUnit version in Dockerfile
# - Updates the PHPUnit version in README.md
#
# The phpunit-version.json file should be commited to Git. The push-to-dockerhub
# GitHub Action uses this file to generate tag names for the Docker Image.

# style helpers
RESET="\033[0m"
BOLD="\033[1m"
RED="\033[31m"
GREEN="\033[32m"
GOLD="\033[33m"
BLUE="\033[34m"
MAGENTA="\033[35m"
CYAN="\033[36m"

PHPUNIT_LATEST=$(jq -r '.phpunit' /app/phpunit-version.json)

echo -e "✏️   Updating ${GOLD}Dockerfile${RESET} to ${CYAN}phpunit-${PHPUNIT_LATEST}.phar${RESET}"
sed -i "s/phpunit.de\/phpunit-.*phar/phpunit.de\/phpunit-${PHPUNIT_LATEST}.phar/" /app/Dockerfile

echo -e "✏️   Updating ${GOLD}README.md${RESET} to ${CYAN}v${PHPUNIT_LATEST}${RESET}"
sed -E -i "s/^<\!-- PHPUNIT_VERSION -->- PHPUnit.+$/<\!-- PHPUNIT_VERSION -->- PHPUnit ${PHPUNIT_LATEST}/" /app/README.md
