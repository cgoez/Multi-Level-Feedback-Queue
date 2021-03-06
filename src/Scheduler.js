const Queue = require("./Queue");
const { QueueType, PRIORITY_LEVELS } = require("./constants/index");

// A class representing the scheduler
// It holds a single blocking queue for blocking processes and three running queues
// for non-blocking processes
class Scheduler {
  constructor() {
    this.clock = Date.now();
    this.blockingQueue = new Queue(this, 50, 0, QueueType.BLOCKING_QUEUE);
    this.runningQueues = [];
    // Initialize all the CPU running queues
    for (let i = 0; i < PRIORITY_LEVELS; i++) {
      this.runningQueues[i] = new Queue(
        this,
        10 + i * 20,
        i,
        QueueType.CPU_QUEUE
      );
    }
  }

  // Executes the scheduler in an infinite loop as long as there are processes in any of the queues
  // Calculate the time slice for the next iteration of the scheduler by subtracting the current
  // time from the clock property. Don't forget to update the clock property afterwards.
  // On every iteration of the scheduler, if the blocking queue is not empty, blocking work
  // should be done. Once the blocking work has been done, perform some CPU work in the same iteration.
  run() {
    // while (true) {
    //   // Log current time
    //   const currTime = Date.now();
    //   // Take difference from currTime and last loop iteration
    //   const workTime = currTime - this.clock;

    //   // Update clock
    //   this.clock = currTime;

    //   // Check block queue to see if there are any processes
    //   if (!this.blockingQueue.isEmpty()) {
    //     this.blockingQueue.doBlockingWork(workTime);
    //   }

    //   // Do some work on running queues
    //   for (let i = 0; i < PRIORITY_LEVELS; i++) {
    //     const queue = this.runningQueues[i];

    //     if (!queue.isEmpty()) {
    //       queue.doCPUWork(workTime);
    //       break;
    //     }
    //   }
    //   // Check if all queues are empty
    //   if (this.allQueuesEmpty()) {
    //     break;
    //   }
    // }
  }

  allQueuesEmpty() {
    return (
      this.runningQueues.every(queue => queue.isEmpty()) &&
      this.blockingQueue.isEmpty()
    );
  }

  addNewProcess(process) {
    this.runningQueues[0].enqueue(process);
  }

  // The scheduler's interrupt handler that receives a queue, a process, and an interrupt string constant
  // Should handle PROCESS_BLOCKED, PROCESS_READY, and LOWER_PRIORITY interrupts.
  handleInterrupt(queue, process, interrupt) {
    switch (interrupt) {
      case "PROCESS_BLOCKED":
        // Add process to blockingQueue
        this.blockingQueue.enqueue(process);
        break;
      case "PROCESS_READY":
        // Add process to runningQueues
        this.addNewProcess(process);
        break;
      case "LOWER_PRIORITY":
        if (queue.getQueueType() === QueueType.CPU_QUEUE) {
          // Lower priority
          // Determine priority level of next queue
          const priorityLevel = Math.min(
            PRIORITY_LEVELS - 1,
            queue.getPriorityLevel() + 1
          );
          this.runningQueues[priorityLevel].enqueue(process);
        } else {
          this.blockingQueue.enqueue(process);
        }
        break;
    }
  }

  // Private function used for testing; DO NOT MODIFY
  _getCPUQueue(priorityLevel) {
    return this.runningQueues[priorityLevel];
  }

  // Private function used for testing; DO NOT MODIFY
  _getBlockingQueue() {
    return this.blockingQueue;
  }
}

module.exports = Scheduler;
