const { expect } = require("chai");

describe("ShopAgileWeb3 contract", function () {
  let ShopAgileWeb3;
  let shopAgileWeb3;
  let owner;

  beforeEach(async function () {
    ShopAgileWeb3 = await ethers.getContractFactory("ShopAgileWeb3");
    [owner] = await ethers.getSigners();

    shopAgileWeb3 = await ShopAgileWeb3.deploy();

    await shopAgileWeb3.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await shopAgileWeb3.owner()).to.equal(owner.address);
    });
  });
});
