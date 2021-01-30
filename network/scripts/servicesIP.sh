#!/bin/bash

declare -A services
declare -A serviceIPS

while [[ $# -gt 0 ]]; do
  echo "Waiting for $1"
  count=$((count + 1))
  services["$1"]="false"
  shift
done

if [[ "$count" == 0 ]]; then
  echo "no services specified"
  exit 0
fi

RES=$(kubectl get services -o go-template \
  --template='{{range .items}}{{if .status.loadBalancer.ingress }}{{.metadata.name}}{{"\t"}}{{ (index .status.loadBalancer.ingress 0).ip }}{{"\t"}}{{.spec.type}}{{"\n"}}{{end}}{{end}}')

# echo "$RES"


finish="false"

while [[ "$finish" == "false" ]]; do

  while read line ; do
    name=$(echo "$line"     | sed 's/^\(\S\+\)\s*\(\S*\)\s*\(\S*\)/\1/g')
    sip=$(echo "$line"      | sed 's/^\(\S\+\)\s*\(\S*\)\s*\(\S*\)/\2/g')
    stype=$(echo "$line"    | sed 's/^\(\S\+\)\s*\(\S*\)\s*\(\S*\)/\3/g')

    for e in "${!services[@]}"; do
      if [[ $(echo "$name" | grep -c "^${e}") == 1 ]]; then
        services["$e"]="true"
        serviceIPS["$e"]="$sip"
      fi
    done

    echo "$name  $sip"
    
  done <<< "$RES"

  all_up="true"
  for e in "${!services[@]}"; do
    if [[ "${services["$e"]}" == "false" ]]; then
      all_up="false"
    fi
  done

  if [[ "$all_up" == "true" ]]; then
    finish="true"
    echo "all up"
    continue
  else
    echo "waiting"
    sleep 2
  fi

  RES=$(kubectl get services -o go-template \
  --template='{{range .items}}{{if .status.loadBalancer.ingress }}{{.metadata.name}}{{"\t"}}{{ (index .status.loadBalancer.ingress 0).ip }}{{"\t"}}{{.spec.type}}{{"\n"}}{{end}}{{end}}')

done


for e in "${!serviceIPS[@]}"; do
    echo "$e ${serviceIPS["$e"]}" >> services.txt
done