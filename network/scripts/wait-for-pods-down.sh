#!/bin/bash

declare -A pods

count=0

while [[ $# -gt 0 ]]; do
  echo "Waiting for $1"
  count=$((count + 1))
  pods["$1"]="false"
  shift
done

if [[ "$count" == 0 ]]; then
  echo "no pods specified"
  exit 0
fi

# kubectl get pods -o json | jq ".items[].status.containerStatuses[].ready"
# kubectl get pods -o=jsonpath='{range .items[*]}{.metadata}{end}'

RES=$(kubectl get pods -o go-template \
  --template='{{range .items}}{{.metadata.name}}{{"\t"}}{{range .status.containerStatuses}}{{.ready}}{{","}}{{end}}{{"\n"}}{{else}}{{end}}')

# echo "$RES"

finish="false"

while [[ "$finish" == "false" ]]; do

  while read line ; do
    name=$(echo "$line" | sed 's/^\(\S\+\)\s*\(\S*\)/\1/g')
    stat=$(echo "$line" | sed 's/^\(\S\+\)\s*\(\S*\)/\2/g')

    for e in "${!pods[@]}"; do
      if [[ $(echo "$name" | grep -c "^${e}") == 1 ]]; then
        pods["$e"]="true"
      fi
    done

    if [[ "$stat" == "" ]]; then
      continue
    fi

    num_ready=$(echo "$stat" | grep -o 'true' | wc -l )
    num_not_ready=$(echo "$stat" | grep -o 'false' | wc -l )
    echo "$name  $num_ready/$(( $num_ready + $num_not_ready ))"
    
  done <<< "$RES"
  
  any_up="false"
  for e in "${!pods[@]}"; do
    if [[ "${pods["$e"]}" == "true" ]]; then
      any_up="true"
    fi
  done
  

  if [[ "$any_up" == "false" ]]; then
    finish="true"
    continue
  else
    echo "waiting"
    sleep 2
  fi
  

  RES=$(kubectl get pods -o go-template \
    --template='{{range .items}}{{.metadata.name}}{{"\t"}}{{range .status.containerStatuses}}{{.ready}}{{","}}{{end}}{{"\n"}}{{else}}{{end}}')
  for e in "${!pods[@]}"; do
    pods["$e"]="false"
  done

done

echo "All down"


# Usefull links
#https://kubernetes.io/docs/tasks/access-application-cluster/list-all-running-container-images/
#https://golang.org/pkg/text/template/
#jq https://jqplay.org/
#https://stackoverflow.com/questions/58992774/how-to-get-list-of-pods-which-are-ready
