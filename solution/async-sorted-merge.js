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
      logHeap.push({log, logSourceIndex});
    }
  }));

  //process the logs in the heap, pushing the next log from the log source as a log is processed
  while (!logHeap.isEmpty()) {
    const { log, logSourceIndex } = logHeap.pop();
    printer.print(log);

    //need to wait until the next log is pushed to the heap before proceeding
    const nextLog = await logSources[logSourceIndex].popAsync();
    if (nextLog) {
      logHeap.push({ log: nextLog, logSourceIndex });
    }
  }

  printer.done();
  console.log("Async sort complete.");
};
