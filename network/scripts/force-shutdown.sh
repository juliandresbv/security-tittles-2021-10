#!/bin/bash

declare -A pods

count=0

while [[ $# -gt 0 ]]; do
  echo "To delete $1"
  count=$((count + 1))
  pods["$1"]="false"
  shift
done

if [[ "$count" == 0 ]]; then
  echo "no pods specified"
  exit 0
fi

RES=$(kubectl get pods -o go-template \
  --template='{{range .items}}{{.metadata.name}}{{"\n"}}{{end}}')
# echo "$RES"

finish="false"

while read line ; do
  name=$(echo "$line" | sed 's/^\(\S\+\)\s*\(\S*\)/\1/g')
  
  for e in "${!pods[@]}"; do
    if [[ $(echo "$name" | grep -c "^${e}") == 1 ]]; then
      kubectl delete "pod/${name}" --grace-period=0 --force
      echo "pod/$name"
    fi
  done
  
done <<< "$RES"

echo "All deleted"