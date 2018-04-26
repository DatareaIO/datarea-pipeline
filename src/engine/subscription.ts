import delay = require("delay");
import { IJob } from "./services/job-queue";
import * as handlers from "./job-handlers";

let subscribed = false;

export async function start(dependencies) {
  subscribed = true;

  const queue = dependencies.queue;

  while (subscribed) {
    try {
      const jobs: IJob[] = await queue.pull();

      if (jobs.length > 0) {
        for (const job of jobs) {
          await handleJob(job, dependencies);
        }
      }
    } catch (error) {
      console.error("Unable to pull and process datasets:", error);
    }

    // wait for 10s
    await delay(10000);
  }
}

export async function end() {
  subscribed = false;
}

async function handleJob(job, dependencies) {
  switch (job.type) {
    case "FetchSource":
      return handlers.fetchSources(dependencies.queue.push, job);
    case "FetchDataset":
      return handlers.fetchDatasets(
        dependencies.queue.push,
        dependencies.es.exists,
        job
      );
    case "updateIndex":
      return handlers.updateIndex(dependencies.es.index, job);
    default:
      throw new Error(`Unrecognized job type: ${job.type}`);
  }
}
