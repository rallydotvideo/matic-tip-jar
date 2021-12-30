const { assert } = require("chai");

const TipJar = artifacts.require("TipJar");
const truffleAssert = require("truffle-assertions");
/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("TipJar", (accounts) => {
  let instance;

  it("deploys successfully", async () => {
    instance = await TipJar.deployed();
    const address = await instance.address;

    assert.notEqual(address, 0x0);
    assert.notEqual(address, "");
    assert.notEqual(address, null);
    assert.notEqual(address, undefined);
  });

  it("allows creating TipJar", async function () {
    let jarId = web3.utils.padRight(web3.utils.utf8ToHex("123abc"), 34);

    await instance.createTipJar(jarId);

    assert.equal(await instance.isJar(jarId), true);
    assert.equal(
      (await instance.jar(jarId)).id,
      web3.utils.padRight(web3.utils.utf8ToHex("123abc"), 64)
    );
    assert.equal((await instance.jar(jarId)).balance, 0);
    assert.equal((await instance.jar(jarId)).owner, accounts[0]);
  });

  it("reverts invalid TipJar creation", async function () {
    let jarId = web3.utils.padRight(web3.utils.utf8ToHex("a"), 34);

    await truffleAssert.reverts(instance.createTipJar(jarId));
  });

  it("allows donating in TipJar", async function () {
    let jarId = web3.utils.padRight(web3.utils.utf8ToHex("123abc"), 34);

    await instance.donate(jarId, {
      from: accounts[1],
      value: 1000,
    });

    assert.equal(await instance.isJar(jarId), true);
    assert.equal((await instance.jar(jarId)).balance, 1000);
    assert.equal((await instance.jar(jarId)).owner, accounts[0]);
  });

  it("allows owner to withdraw", async function () {
    let jarId = web3.utils.padRight(web3.utils.utf8ToHex("123abc"), 34);

    await instance.withdraw(jarId, accounts[0], 500, {
      from: accounts[0],
    });

    assert.equal(await instance.isJar(jarId), true);
    assert.equal((await instance.jar(jarId)).balance, 500);
    assert.equal((await instance.jar(jarId)).owner, accounts[0]);
  });

  it("reverts non-owner attempting to withdraw", async function () {
    let jarId = web3.utils.padRight(web3.utils.utf8ToHex("123abc"), 34);

    await truffleAssert.reverts(
      instance.withdraw(jarId, accounts[1], 500, {
        from: accounts[1],
      })
    );

    assert.equal(await instance.isJar(jarId), true);
    assert.equal((await instance.jar(jarId)).balance, 500);
    assert.equal((await instance.jar(jarId)).owner, accounts[0]);
  });

  it("allows owner to transfer", async function () {
    let jarId = web3.utils.padRight(web3.utils.utf8ToHex("123abc"), 34);

    await instance.transferTipJar(jarId, accounts[2], {
      from: accounts[0],
    });

    assert.equal(await instance.isJar(jarId), true);
    assert.equal((await instance.jar(jarId)).balance, 500);
    assert.equal((await instance.jar(jarId)).owner, accounts[2]);
  });

  it("reverts previous owner trying to withdraw", async function () {
    let jarId = web3.utils.padRight(web3.utils.utf8ToHex("123abc"), 34);

    await truffleAssert.reverts(
      instance.withdraw(jarId, accounts[0], 500, {
        from: accounts[0],
      })
    );

    assert.equal(await instance.isJar(jarId), true);
    assert.equal((await instance.jar(jarId)).balance, 500);
    assert.equal((await instance.jar(jarId)).owner, accounts[2]);
  });

  it("allows new owner to withdraw", async function () {
    let jarId = web3.utils.padRight(web3.utils.utf8ToHex("123abc"), 34);

    await instance.withdraw(jarId, accounts[2], 250, {
      from: accounts[2],
    });

    assert.equal(await instance.isJar(jarId), true);
    assert.equal((await instance.jar(jarId)).balance, 250);
    assert.equal((await instance.jar(jarId)).owner, accounts[2]);
  });

  it("prevents owner from deleting when remaining balance", async function () {
    let jarId = web3.utils.padRight(web3.utils.utf8ToHex("123abc"), 34);

    await truffleAssert.reverts(
      instance.deleteTipJar(jarId, {
        from: accounts[2],
      })
    );

    assert.equal(await instance.isJar(jarId), true);
    assert.equal((await instance.jar(jarId)).balance, 250);
    assert.equal((await instance.jar(jarId)).owner, accounts[2]);
  });

  it("prevents non-owner from deleting", async function () {
    let jarId = web3.utils.padRight(web3.utils.utf8ToHex("123abc"), 34);

    await instance.withdraw(jarId, accounts[0], 250, { from: accounts[2] });

    await truffleAssert.reverts(
      instance.deleteTipJar(jarId, {
        from: accounts[0],
      })
    );

    assert.equal(await instance.isJar(jarId), true);
    assert.equal((await instance.jar(jarId)).balance, 0);
    assert.equal((await instance.jar(jarId)).owner, accounts[2]);
  });

  it("allows owner to delete", async function () {
    let jarId = web3.utils.padRight(web3.utils.utf8ToHex("123abc"), 34);

    await instance.deleteTipJar(jarId, {
      from: accounts[2],
    });

    assert.equal(await instance.isJar(jarId), false);
  });
});
