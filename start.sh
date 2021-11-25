#!/usr/bin/env bash
BASEDIR=$(dirname $(realpath "$0"))
cd "$BASEDIR"

Node server.js &
Open "http://localhost:28550"
