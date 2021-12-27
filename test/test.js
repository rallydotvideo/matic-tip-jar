const TipJar = artifacts.require("./TipJar.sol");

require("chai").use(require("chai-as-promised")).should();

contract("TipJar", ([deployer, author]) => {
  let TipJar;

  before(async () => {
    TipJar = await TipJar.deployed();
  });

  describe("deployment", async () => {
    it("deploys successfully", async () => {
      const address = await TipJar.address;
      assert.notEqual(address, 0x0);
      assert.notEqual(address, "");
      assert.notEqual(address, null);
      assert.notEqual(address, undefined);
    });

    it("has a name", async () => {
      const name = await TipJar.name();
      assert.equal(name, "TipJar");
    });
  });
});
