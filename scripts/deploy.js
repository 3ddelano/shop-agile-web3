async function main() {
  // This is just a convenience check
  if (network.name === "hardhat") {
    console.warn(
      "You are trying to deploy a contract to the Hardhat Network, which" +
        "gets automatically created and destroyed every time. Use the Hardhat" +
        " option '--network localhost'"
    );
  }

  // ethers is available in the global scope
  const [deployer] = await ethers.getSigners();
  console.log(
    "Deploying the contracts with the account:",
    await deployer.getAddress()
  );

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const ShopAgileWeb3 = await ethers.getContractFactory("ShopAgileWeb3");
  const shopAgileWeb3 = await ShopAgileWeb3.deploy();
  await shopAgileWeb3.deployed();

  console.log("ShopAgileWeb3 address:", shopAgileWeb3.address);

  // We also save the contract's artifacts and address in the frontend directory
  saveFrontendFiles(shopAgileWeb3);
}

function saveFrontendFiles(shopAgileWeb3) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../frontend/src/contracts";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + "/contract-address.json",
    JSON.stringify({ ShopAgileWeb3: shopAgileWeb3.address }, undefined, 2)
  );

  const TokenArtifact = artifacts.readArtifactSync("ShopAgileWeb3");

  fs.writeFileSync(
    contractsDir + "/ShopAgileWeb3.json",
    JSON.stringify(TokenArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
