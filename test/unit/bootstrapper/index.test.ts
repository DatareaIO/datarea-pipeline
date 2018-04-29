import AWS = require("aws-sdk-mock");
import env = require("dotenv-safe");
import { expect } from "chai";

env.config();

describe.skip("bootstrapper/index.ts", () => {
  it("should publish fetch tasks.", done => {
    let count = 0;

    AWS.mock("S3", "getObject", (params, callback) => {
      callback(null, {
        Body:
          '[{"name":"Energy Data eXchange","type":"CKAN","url":"https://edx.netl.doe.gov"}]'
      });
    });

    AWS.mock("SQS", "sendMessageBatch", (params, callback) => {
      count++;

      const message = JSON.parse(params.Entries[0].MessageBody);
      expect(message.messageType).to.equal("FetchSource");
      expect(message.name).to.equal("Energy Data eXchange");

      callback();
    });

    const handler = require("../../../src/bootstrapper");

    handler.bootstrap({}, {}, err => {
      expect(count).to.equal(1);
      done(err);
    });
  });

  afterEach(() => {
    AWS.restore();
  });
});
