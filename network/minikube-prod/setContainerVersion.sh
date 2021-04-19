#!/bin/bash

TP0_V="tp1_todo:1.0"
TP1_V="tpauth_todo:1.0"

ORG0_APP0_V="app_todo:1.0"
ORG0_APP0_LB="true"
ORG0_APP1_V="app_ledger_sync_todo:1.0"
ORG0_APP1_LB="false"
ORG1_APP0_V="app_todo:1.0"
ORG1_APP0_LB="true"
ORG1_APP1_V="app_ledger_sync_todo:1.0"
ORG1_APP1_LB="false"

FILE="./app/loadbalancer/up.sh"

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


FILE="./app/loadbalancer/down.sh"

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


FILE="./app/loadbalancer/getIps.sh"

echo "#!/bin/bash" > "$FILE"
echo "../../../scripts/servicesIP.sh \\" >> "$FILE"
if [[ "$ORG0_APP0_LB" == "true" ]]; then
  echo "  apporg0app0-lb \\" >> "$FILE"
else
  echo "  #apporg0app0-lb \\" >> "$FILE"
fi

if [[ "$ORG0_APP1_LB" == "true" ]]; then
  echo "  apporg0app1-lb \\" >> "$FILE"
else
  echo "  #apporg0app1-lb \\" >> "$FILE"
fi

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
cat "${FILE}.backup"  | sed "s/le999\/org0app0:1.0/le999\/${ORG0_APP0_V}/g"  | sed "s/le999\/org0app1:1.0/le999\/${ORG0_APP1_V}/g"  | sed "s/le999\/org1app0:1.0/le999\/${ORG1_APP0_V}/g"  | sed "s/le999\/org1app1:1.0/le999\/${ORG1_APP1_V}/g"  > "$FILE"

FILE="./app/run1.sh"
cat "${FILE}.backup"  | sed "s/le999\/org0app0:1.0/le999\/${ORG0_APP0_V}/g"  | sed "s/le999\/org0app1:1.0/le999\/${ORG0_APP1_V}/g"  | sed "s/le999\/org1app0:1.0/le999\/${ORG1_APP0_V}/g"  | sed "s/le999\/org1app1:1.0/le999\/${ORG1_APP1_V}/g"  > "$FILE"
chmod 755 "$FILE"

FILE="./app/test.sh"
cat "${FILE}.backup"  | sed "s/le999\/org0app0:1.0/le999\/${ORG0_APP0_V}/g"  | sed "s/le999\/org0app1:1.0/le999\/${ORG0_APP1_V}/g"  | sed "s/le999\/org1app0:1.0/le999\/${ORG1_APP0_V}/g"  | sed "s/le999\/org1app1:1.0/le999\/${ORG1_APP1_V}/g"  > "$FILE"
chmod 755 "$FILE"


