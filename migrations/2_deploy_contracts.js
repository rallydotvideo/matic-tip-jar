const TipJar = artifacts.require("TipJar");

module.exports = function (deployer) {
  deployer.deploy(TipJar);
};
