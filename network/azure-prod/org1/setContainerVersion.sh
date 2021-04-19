#!/bin/bash

TP0_V="tp1:latest"
TP1_V="tp1:latest"

ORG1_APP0_V="app1:latest"
ORG1_APP0_LB="true"
ORG1_APP1_V="app1:latest"
ORG1_APP1_LB="true"

FILE="./app/loadbalancer/up.sh"

echo "#!/bin/bash" > "$FILE"
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


FILE="./app/loadbalancer/down.sh"

echo "#!/bin/bash" > "$FILE"
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


FILE="./app/loadbalancer/getIps.sh"

echo "#!/bin/bash" > "$FILE"
echo "../../../scripts/servicesIP.sh \\" >> "$FILE"
if [[ "$ORG1_APP0_LB" == "true" ]]; then
  echo "  apporg1app0-lb \\" >> "$FILE"
else
  echo "  #apporg1app0-lb \\" >> "$FILE"
fi

if [[ "$ORG1_APP1_LB" == "true" ]]; then
  echo "  apporg1app1-lb" >> "$FILE"
else
  echo "  #apporg1app1-lb" >> "$FILE"
fi

chmod 755 "$FILE"


FILE="./sawtooth/network.yaml"
cat "${FILE}.backup"  | sed "s/le999\/tp0:1.0/le999\/${TP0_V}/g"  | sed "s/le999\/tp1:1.0/le999\/${TP1_V}/g" > "$FILE"

FILE="./app/network.yaml"
cat "${FILE}.backup"  | sed "s/le999\/org1app0:1.0/le999\/${ORG1_APP0_V}/g"  | sed "s/le999\/org1app1:1.0/le999\/${ORG1_APP1_V}/g"  > "$FILE"

FILE="./app/run1.sh"
cat "${FILE}.backup"  | sed "s/le999\/org1app0:1.0/le999\/${ORG1_APP0_V}/g"  | sed "s/le999\/org1app1:1.0/le999\/${ORG1_APP1_V}/g"  > "$FILE"
chmod 755 "$FILE"

FILE="./app/test.sh"
cat "${FILE}.backup"  | sed "s/le999\/org1app0:1.0/le999\/${ORG1_APP0_V}/g"  | sed "s/le999\/org1app1:1.0/le999\/${ORG1_APP1_V}/g"  > "$FILE"
chmod 755 "$FILE"


