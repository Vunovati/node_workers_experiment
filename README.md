# node_workers_experiment
experimenting with node workers - learning

Make http requests with a message in query params to send
it to a worker thread and have it sent back to the main
process which will then display the message and thread
heap memory consumption back.

# Usage 

```
npm install
npm start
```

make a GET http request to 
```
http://localhost:3000/?message=abc
```
