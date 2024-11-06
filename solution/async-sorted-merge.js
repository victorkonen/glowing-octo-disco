"use strict";
const Heap = require('heap-js').Heap;

// Print all entries, across all of the *async* sources, in chronological order.

module.exports = async (logSources, printer) => {
  //create a custom heap that compares the date of the logs
  const logHeap = new Heap((a, b) => a.log.date - b.log.date);

  //populate the heap with the first log from each log source
  //need to wait until a log from each source is pushed to the heap before processing them
  await Promise.all(logSources.map(async (logSource, logSourceIndex) => {
    const log = await logSource.popAsync();
    if (log) {
      logHeap.push({
        log: log,
        logSourceIndex: logSourceIndex,
        //set up the next log promise from the log source to kick that off
        nextLogPromise: logSource.popAsync()
      });
    }
  }));

  //process the logs in the heap, pushing the next log from the log source as a log is processed
  while (!logHeap.isEmpty()) {
    const { log, logSourceIndex, nextLogPromise } = logHeap.pop();
    printer.print(log);

    //need to wait until the next log is pushed to the heap before proceeding
    const nextLog = await nextLogPromise;
    if (nextLog) {
      logHeap.push({
        log: nextLog,
        logSourceIndex: logSourceIndex,
        //set up the next log promise from the log source to kick that off
        nextLogPromise: logSources[logSourceIndex].popAsync()
      });
    }
  }

  printer.done();
  console.log("Async sort complete.");
};
