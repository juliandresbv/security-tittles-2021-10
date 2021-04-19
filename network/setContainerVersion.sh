#!/bin/bash

TP0_V="tp1:latest"
TP1_V="tp1:latest"

ORG0_APP0_V="app1:latest"
ORG0_APP0_LB="true"
ORG0_APP1_V="app1:latest"
ORG0_APP1_LB="true"
ORG1_APP0_V="app1:latest"
ORG1_APP0_LB="true"
ORG1_APP1_V="app1:latest"
ORG1_APP1_LB="true"

FILE="./minikube-prod/app/loadbalancer/up.sh"

echo "#!/bin/bash" > "$FILE"
if [[ "$ORG0_APP0_LB" == "true" ]]; then
  echo "kubectl -f ./org0app0.yaml apply" >> "$FILE"
else
  echo "#kubectl -f ./org0app0.yaml apply" >> "$FILE"
fi
if [[ "$ORG0_APP1_LB" == "true" ]]; then
  echo "kubectl -f ./org0app1.yaml apply" >> "$FILE"
else
  echo "#kubectl -f ./org0app1.yaml apply" >> "$FILE"
fi
if [[ "$ORG1_APP0_LB" == "true" ]]; then
  echo "kubectl -f ./org1app0.yaml apply" >> "$FILE"
else
  echo "#kubectl -f ./org1app0.yaml apply" >> "$FILE"
fi
if [[ "$ORG1_APP1_LB" == "true" ]]; then
  echo "kubectl -f ./org1app1.yaml apply" >> "$FILE"
else
  echo "#kubectl -f ./org1app1.yaml apply" >> "$FILE"
fi
chmod 755 "$FILE"


FILE="./minikube-prod/app/loadbalancer/down.sh"

echo "#!/bin/bash" > "$FILE"
if [[ "$ORG0_APP0_LB" == "true" ]]; then
  echo "kubectl -f ./org0app0.yaml delete" >> "$FILE"
else
  echo "#kubectl -f ./org0app0.yaml delete" >> "$FILE"
fi
if [[ "$ORG0_APP1_LB" == "true" ]]; then
  echo "kubectl -f ./org0app1.yaml delete" >> "$FILE"
else
  echo "#kubectl -f ./org0app1.yaml delete" >> "$FILE"
fi
if [[ "$ORG1_APP0_LB" == "true" ]]; then
  echo "kubectl -f ./org1app0.yaml delete" >> "$FILE"
else
  echo "#kubectl -f ./org1app0.yaml delete" >> "$FILE"
fi
if [[ "$ORG1_APP1_LB" == "true" ]]; then
  echo "kubectl -f ./org1app1.yaml delete" >> "$FILE"
else
  echo "#kubectl -f ./org1app1.yaml delete" >> "$FILE"
fi
chmod 755 "$FILE"


#minikube-prod

FILE="./minikube-prod/sawtooth/network.yaml"
cat "${FILE}.backup"  | sed "s/le999\/tp0:1.0/le999\/${TP0_V}/g"  | sed "s/le999\/tp1:1.0/le999\/${TP1_V}/g" > "$FILE"

FILE="./minikube-prod/app/network.yaml"
cat "${FILE}.backup"  | sed "s/le999\/org0app0:1.0/le999\/${ORG0_APP0_V}/g"  | sed "s/le999\/org0app1:1.0/le999\/${ORG0_APP1_V}/g"  | sed "s/le999\/org1app0:1.0/le999\/${ORG1_APP0_V}/g"  | sed "s/le999\/org1app1:1.0/le999\/${ORG1_APP1_V}/g"  > "$FILE"

FILE="./minikube-prod/app/run1.sh"
cat "${FILE}.backup"  | sed "s/le999\/org0app0:1.0/le999\/${ORG0_APP0_V}/g"  | sed "s/le999\/org0app1:1.0/le999\/${ORG0_APP1_V}/g"  | sed "s/le999\/org1app0:1.0/le999\/${ORG1_APP0_V}/g"  | sed "s/le999\/org1app1:1.0/le999\/${ORG1_APP1_V}/g"  > "$FILE"
chmod 755 "$FILE"

FILE="./minikube-prod/app/test.sh"
cat "${FILE}.backup"  | sed "s/le999\/org0app0:1.0/le999\/${ORG0_APP0_V}/g"  | sed "s/le999\/org0app1:1.0/le999\/${ORG0_APP1_V}/g"  | sed "s/le999\/org1app0:1.0/le999\/${ORG1_APP0_V}/g"  | sed "s/le999\/org1app1:1.0/le999\/${ORG1_APP1_V}/g"  > "$FILE"
chmod 755 "$FILE"

#azure
FILE="./azure/sawtooth/network.yaml"
cat "${FILE}.backup"  | sed "s/le999\/tp0:1.0/le999\/${TP0_V}/g"  | sed "s/le999\/tp1:1.0/le999\/${TP1_V}/g" > "$FILE"

FILE="./azure/app/network.yaml"
cat "${FILE}.backup"  | sed "s/le999\/org0app0:1.0/le999\/${ORG0_APP0_V}/g"  | sed "s/le999\/org0app1:1.0/le999\/${ORG0_APP1_V}/g"  | sed "s/le999\/org1app0:1.0/le999\/${ORG1_APP0_V}/g"  | sed "s/le999\/org1app1:1.0/le999\/${ORG1_APP1_V}/g"  > "$FILE"

FILE="./azure/app/run1.sh"
cat "${FILE}.backup"  | sed "s/le999\/org0app0:1.0/le999\/${ORG0_APP0_V}/g"  | sed "s/le999\/org0app1:1.0/le999\/${ORG0_APP1_V}/g"  | sed "s/le999\/org1app0:1.0/le999\/${ORG1_APP0_V}/g"  | sed "s/le999\/org1app1:1.0/le999\/${ORG1_APP1_V}/g"  > "$FILE"
chmod 755 "$FILE"

FILE="./azure/app/test.sh"
cat "${FILE}.backup"  | sed "s/le999\/org0app0:1.0/le999\/${ORG0_APP0_V}/g"  | sed "s/le999\/org0app1:1.0/le999\/${ORG0_APP1_V}/g"  | sed "s/le999\/org1app0:1.0/le999\/${ORG1_APP0_V}/g"  | sed "s/le999\/org1app1:1.0/le999\/${ORG1_APP1_V}/g"  > "$FILE"
chmod 755 "$FILE"

#azure-prod
FILE="./azure-prod/org0/sawtooth/network.yaml"
cat "${FILE}.backup"  | sed "s/le999\/tp0:1.0/le999\/${TP0_V}/g"  | sed "s/le999\/tp1:1.0/le999\/${TP1_V}/g" > "$FILE"

FILE="./azure-prod/org0/app/network.yaml"
cat "${FILE}.backup"  | sed "s/le999\/org0app0:1.0/le999\/${ORG0_APP0_V}/g"  | sed "s/le999\/org0app1:1.0/le999\/${ORG0_APP1_V}/g"  | sed "s/le999\/org1app0:1.0/le999\/${ORG1_APP0_V}/g"  | sed "s/le999\/org1app1:1.0/le999\/${ORG1_APP1_V}/g"  > "$FILE"

FILE="./azure-prod/org0/app/run1.sh"
cat "${FILE}.backup"  | sed "s/le999\/org0app0:1.0/le999\/${ORG0_APP0_V}/g"  | sed "s/le999\/org0app1:1.0/le999\/${ORG0_APP1_V}/g"  | sed "s/le999\/org1app0:1.0/le999\/${ORG1_APP0_V}/g"  | sed "s/le999\/org1app1:1.0/le999\/${ORG1_APP1_V}/g"  > "$FILE"
chmod 755 "$FILE"

FILE="./azure-prod/org0/app/test.sh"
cat "${FILE}.backup"  | sed "s/le999\/org0app0:1.0/le999\/${ORG0_APP0_V}/g"  | sed "s/le999\/org0app1:1.0/le999\/${ORG0_APP1_V}/g"  | sed "s/le999\/org1app0:1.0/le999\/${ORG1_APP0_V}/g"  | sed "s/le999\/org1app1:1.0/le999\/${ORG1_APP1_V}/g"  > "$FILE"
chmod 755 "$FILE"

FILE="./azure-prod/org1/sawtooth/network.yaml"
cat "${FILE}.backup"  | sed "s/le999\/tp0:1.0/le999\/${TP0_V}/g"  | sed "s/le999\/tp1:1.0/le999\/${TP1_V}/g" > "$FILE"

FILE="./azure-prod/org1/app/network.yaml"
cat "${FILE}.backup"  | sed "s/le999\/org0app0:1.0/le999\/${ORG0_APP0_V}/g"  | sed "s/le999\/org0app1:1.0/le999\/${ORG0_APP1_V}/g"  | sed "s/le999\/org1app0:1.0/le999\/${ORG1_APP0_V}/g"  | sed "s/le999\/org1app1:1.0/le999\/${ORG1_APP1_V}/g"  > "$FILE"

FILE="./azure-prod/org1/app/run1.sh"
cat "${FILE}.backup"  | sed "s/le999\/org0app0:1.0/le999\/${ORG0_APP0_V}/g"  | sed "s/le999\/org0app1:1.0/le999\/${ORG0_APP1_V}/g"  | sed "s/le999\/org1app0:1.0/le999\/${ORG1_APP0_V}/g"  | sed "s/le999\/org1app1:1.0/le999\/${ORG1_APP1_V}/g"  > "$FILE"
chmod 755 "$FILE"

FILE="./azure-prod/org1/app/test.sh"
cat "${FILE}.backup"  | sed "s/le999\/org0app0:1.0/le999\/${ORG0_APP0_V}/g"  | sed "s/le999\/org0app1:1.0/le999\/${ORG0_APP1_V}/g"  | sed "s/le999\/org1app0:1.0/le999\/${ORG1_APP0_V}/g"  | sed "s/le999\/org1app1:1.0/le999\/${ORG1_APP1_V}/g"  > "$FILE"
chmod 755 "$FILE"



