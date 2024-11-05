"use strict";
const Heap = require('heap-js').Heap;

// Print all entries, across all of the sources, in chronological order.

module.exports = (logSources, printer) => {
  //create a custom heap that compares the date of the logs
  const logHeap = new Heap((a, b) => a.log.date - b.log.date);

  //populate the heap with the first log from each log source
  logSources.forEach((logSource, logSourceIndex) => {
    const log = logSource.pop();
    if (log) {
      logHeap.push({ log, logSourceIndex });
    }
  });

  //process the logs in the heap, pushing the next log from the log source as a log is processed
  while (!logHeap.isEmpty()) {
    const { log, logSourceIndex } = logHeap.pop();
    printer.print(log);

    const nextLog = logSources[logSourceIndex].pop();
    if (nextLog) {
      logHeap.push({ log: nextLog, logSourceIndex });
    }
  }

  printer.done();
  return console.log("Sync sort complete.");
};
