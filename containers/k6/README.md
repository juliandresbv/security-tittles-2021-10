# Example of using K6 with grafana
Based on k6 example.
Includes a node.js server that will be tested

## Run node server

```bash
cd ./server
npm install
npm start
```

## Run grafana
```bash
./up.sh
```

http://localhost:3012/


In grafana it's a good idea to import a Dashboard in the right menu:
"+/import"
import via grafana.com

And import something like:
https://grafana.com/grafana/dashboards/2587
By inserting the number: 2587

If creating a graph use something like:
FROM default http_req_duration WHERE

## Run tests with k6
Test Simple Script
```bash
./test.sh     #Edit script to use or not grafana, vus, etc.
```

Test Script with modules (underscore, etc)
```bash
cd ./bundletest
npm install
cd -
./testBundle.sh   #Edit script to use or not grafana, vus, etc.
```

## Change host to do tests on
In docker-compose/k6.yaml:

TARGET_HOST=172.17.0.1:3001



## Query how many documents
```bash
kubectl exec pod/mongodborg0-ccb556fd5-p9t87 -- mongo -u root -p example mydb --eval "db.auth_state_.find().size()"
kubectl exec pod/mongodborg0-ccb556fd5-p9t87 -- mongo -u root -p example mydb --eval "db.auth_state_history.find().size()"
kubectl exec pod/mongodborg0-ccb556fd5-p9t87 -- mongo -u root -p example mydb --eval "db.auth_transaction.find().size()"

kubectl exec pod/mongodborg0-ccb556fd5-p9t87 -- mongo -u root -p example mydb --eval "db.todo_state.find().size()"
kubectl exec pod/mongodborg0-ccb556fd5-p9t87 -- mongo -u root -p example mydb --eval "db.todo_state_history.find().size()"
kubectl exec pod/mongodborg0-ccb556fd5-p9t87 -- mongo -u root -p example mydb --eval "db.todo_transaction.find().size()"



```


## References
https://k6.io/docs/results-visualization/influxdb-+-grafana
https://k6.io/blog/k6-loves-grafana
https://github.com/loadimpact/k6
https://k6.io/docs/using-k6/modules
