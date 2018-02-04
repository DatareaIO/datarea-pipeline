import { createHash } from "crypto";
import { Dataset } from "w3c-dcat";
import * as _ from "lodash";

export function removeNull(dataset) {
  for (let key in dataset) {
    if (!dataset[key]) {
      delete dataset[key];
    } else if (typeof dataset[key] === "object") {
      removeNull(dataset[key]);
    }
  }

  return dataset;
}

export function chunkBySize(datasets, size) {
  const chunks = [];
  let currentSize = 0;
  let currentChunk = [];

  for (let dataset of datasets) {
    const textSize = claculateSize(JSON.stringify(dataset));

    if (textSize + currentSize < size) {
      currentChunk.push(dataset);
      currentSize += textSize;
    } else {
      chunks.push(currentChunk);

      currentSize = 0;
      currentChunk = [];
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  return chunks;
}

export function deduplicate(dynamodb, datasets) {
  const params = {
    RequestItems: {}
  };

  params.RequestItems[process.env.DYNAMODB_CHECKSUM] = {
    Keys: [],
    ProjectionExpression: "identifier, checksum"
  };

  for (let dataset of datasets) {
    params.RequestItems[process.env.DYNAMODB_CHECKSUM].Keys.push({
      identifier: {
        S: dataset.dcat.identifier
      }
    });
  }

  return dynamodb
    .batchGetItem(params)
    .promise()
    .then(result => {
      const indexed = _.keyBy(
        result.Responses[process.env.DYNAMODB_CHECKSUM],
        "identifier.S"
      );

      return _.filter(
        datasets,
        d => d.checksum !== _.get(indexed[d.dcat.identifier], "checksum.S")
      );
    });
}

export function wrapDataset(type, dataset) {
  const collection = {
    type: type.toLowerCase(),
    dcat: Dataset.from(type.toLowerCase(), dataset).toJSON(),
    checksum: sha256(JSON.stringify(dataset)),
    original: dataset
  };

  return removeNull(collection);
}

/**
 * Create checksum in SHA-256.
 * @param  {any}    data data
 * @return {string}      SHA-256 checksum
 */
function sha256(data: string): string {
  const hash = createHash("sha256");
  hash.update(data);

  return hash.digest("base64");
}

function claculateSize(s) {
  return Buffer.from(s).length;
}
