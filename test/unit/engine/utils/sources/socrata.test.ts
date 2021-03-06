import {
  getSourceUrls,
  getDatasets
} from "../../../../../src/engine/utils/sources/socrata";
import { expect } from "chai";

describe("engine/utils/sources/socrata", function() {
  this.timeout(10000);

  it("should harvest Socrata network.", async () => {
    const urls = await getSourceUrls();
    const datasets = await getDatasets({ url: urls[0] });

    expect(datasets).to.have.length.above(0);
    expect(datasets[0].dcat).to.be.an("object");
    expect(datasets[0].checksum).to.be.a("string");
    expect(datasets[0].original).to.be.an("object");
  });
});
