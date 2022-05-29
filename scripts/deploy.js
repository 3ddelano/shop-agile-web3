const { parseEther, parseUnits } = ethers.utils;

let realData = {
    baseFee: parseEther("0.11"),
    percentFee: 75,
    managers: ["0x70997970C51812dc3A010C7d01b50e0d17dc79C8"],
    // Initial 5 items
    itemNames: [
        "Chocolate Cake",
        "Bread Loaf",
        "Vanilla Cupcake",
        "Strawberry Muffin",
        "Garlic Bread",
    ],
    itemPrices: [
        parseUnits("0.2"),
        parseUnits("0.067"),
        parseUnits("0.0559"),
        parseUnits("0.0671"),
        parseUnits("0.0223"),
    ],
    itemStocks: [-1, 200, 150, 150, 300],
    itemTastes: ["sweet", "starchy", "sweet", "sweet", "pungent"],
    itemColors: ["brown", "white", "off-white", "red", "white"],
    itemTextures: ["silky", "soft", "soft", "soft", "soft"],
    itemSizes: ["large", "medium", "small", "small", "small"],

    // Initial 5 pickupLocations
    pickLocNames: [
        "Pastry Palacio",
        "FZ Cakes",
        "Monginia",
        "Pastry Factory",
        "Yummy Eats",
    ],
    pickLocLocations: [
        "Shop No 10, Tps Vi, Milan Subway, Rizvi Nagar, Sv Road, Near Dhiraj Heritege, Santacruz (west)",
        "13, 3rd Flr, Heena Shopping Arcade, S V Rd, Below Allahbad Bank, Jogeshwari (west)",
        "214a, Fakeer M., Jain Mohammed Chawl, Opp Old Post Office, Dharavi",
        "Da-3/1, Vikas Marg Extn, Shakarpur",
        "Gate No 7, Opp.mhb Colony, Kharodi",
    ],
    pickLocCities: ["Mumbai", "Mumbai", "Mumbai", "Delhi", "Mumbai"],
    pickLocStates: [
        "Maharastra",
        "Maharastra",
        "Maharastra",
        "Delhi",
        "Maharastra",
    ],
    pickLocPhones: [
        "+919202727371",
        "+917112535346",
        "+917222768894",
        "+919222642190",
        "+919402457009",
    ],
};

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
    const shopAgileWeb3 = await ShopAgileWeb3.deploy(
        realData.baseFee,
        realData.percentFee,
        realData.itemPrices,
        realData.itemStocks,
        realData.itemNames,
        realData.pickLocNames,
        realData.pickLocLocations,
        realData.pickLocCities,
        realData.pickLocStates,
        realData.pickLocPhones
    );
    await shopAgileWeb3.deployed();

    let itemsToUpdate = [];

    for (let i = 0; i < realData.itemTastes.length; ++i) {
        itemsToUpdate.push(
            shopAgileWeb3.updateItemAttributes(
                i,
                realData.itemTastes[i],
                realData.itemColors[i],
                realData.itemTextures[i],
                realData.itemSizes[i]
            )
        );
    }

    await Promise.all(itemsToUpdate);

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
