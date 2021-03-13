#!/bin/bash

TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmb28iOiJiYXIiLCJpYXQiOjE2MTU2NTQxOTAsImV4cCI6MTYxNTY1NDI1MH0.llerYXhSugFJH49MBGppiGGN2fJ_NHYH1KFjdr0l8GU"
curl http://localhost:3001/api -H "Authorization: ${TOKEN}"
