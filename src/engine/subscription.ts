import delay = require("delay");
import { IJob } from "./services/job-queue";
import * as handlers from "./job-handlers";
import * as sources from "./utils/sources";

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
    // wait for 1s
    await delay(1000);
  }
}

export async function end() {
  subscribed = false;
}

async function handleJob(job, dependencies) {
  let sourceType;

  switch (job.type) {
    case "FetchSource":
      sourceType = job.data.sourceType.toLowerCase();

      return handlers.fetchSources(
        sources[sourceType].getSourceUrls,
        dependencies.queue.push,
        job
      );
    case "FetchDataset":
      sourceType = job.data.sourceType.toLowerCase();

      return handlers.fetchDatasets(
        sources[sourceType].getDatasets,
        dependencies.es.exists,
        dependencies.queue.push,
        job
      );
    case "UpdateIndex":
      return handlers.updateIndex(dependencies.es.index, job);
    default:
      throw new Error(`Unrecognized job type: ${job.type}`);
  }
}
