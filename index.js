const { Worker, isMainThread, parentPort, threadId } = require('worker_threads');
const express = require('express');
const N_THREADS = 20;

/**
 * Make http requests with a message in query params to send
 * it to a worker thread and have it sent back to the main
 * process which will then display the message and thread
 * heap memory consumption back.
 */

if (isMainThread) {
	// Create 20 Worker threads
	const workers = [...Array(N_THREADS)].map(() => {
		// We can manipulate with environment variables of the worker threads
		const WorkerEnv = { env: { foo: 'bar' } };
		const worker = new Worker(__filename, WorkerEnv);
		worker.on('message', msg => {
			// when a worker returns a message print it on to the console
			console.log(msg);
		});

		return worker;
	});
	const app = express();
	const port = 3000;
	const threadSelector = selectThread();

	// GET http://localhost:3000/?message=abc
	app.get('/', (req, res) => {
		const params = req.query.message || 'no message sent :(';

		workers[threadSelector.next().value].postMessage(params);

		res.send(params);
	});

	app.listen(port, () => console.log(`Example app listening on port ${port}!`));
} else {
	// Send a message to the main thread.
	parentPort.on('message', message => {
		// allocate an increasing number of Megabytes
		const alloc = [...Array(2 ** 20 * threadId)].map(() => 'a');
		// simulate an async operation which takes an increasing amount of time
		setTimeout(() => {
			parentPort.postMessage(
				`Response from ${threadId}: message was ${message}, env: ${JSON.stringify(
					process.env
				)}, memory: ${JSON.stringify(process.memoryUsage().heapTotal / 2 ** 20)}` // Display heap total for each thread in MBs
			);
		}, 100 * threadId);
	});
}

function* selectThread() {
	let count = 0;
	while (true) {
		yield count++ % N_THREADS;
	}
}
