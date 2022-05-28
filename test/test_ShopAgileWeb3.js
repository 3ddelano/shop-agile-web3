const chai = require("chai");
const { expect } = chai;
const { ethers } = require("hardhat");

let testData = {
    baseFee: ethers.utils.parseEther("0.11"),
    percentFee: 75,
    managers: ["0x70997970C51812dc3A010C7d01b50e0d17dc79C8"],
    // Initial 5 items
    itemNames: [
        "Chocolate Cake",
        "Bread Loaf",
        "Vanilla Cupcake",
        "Strawberry Muffin",
        "Chocolate Chip Cookie",
    ],
    itemPrices: [
        ethers.utils.parseUnits("5"),
        ethers.utils.parseUnits("0.67"),
        ethers.utils.parseUnits("0.559"),
        ethers.utils.parseUnits("0.671"),
        ethers.utils.parseUnits("0.223"),
    ],
    itemStocks: [-1, 200, 150, 150, 300],
    itemIpfsURIs: ["URL1", "URL2", "URL3", "URL4", "URL5"],
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

describe("ShopAgileWeb3 contract", function () {
    let ShopAgileWeb3;
    let shopAgileWeb3;
    let owner;
    let manager1;
    let managerToMake;
    let user1;
    let user2;

    let successOrderCost = ethers.BigNumber.from("1115000000000000000");
    let successPlaceOrderParams = [
        1,
        2,
        1,
        {
            value: successOrderCost,
        },
    ];

    beforeEach(async function () {
        hre.tracer.enabled = false;
        hre.tracer.gasCost = false;
        ShopAgileWeb3 = await ethers.getContractFactory("ShopAgileWeb3");
        [owner, manager1, managerToMake, user1, user2] =
            await ethers.getSigners();

        shopAgileWeb3 = new GasTracker(
            await ShopAgileWeb3.deploy(
                testData.baseFee,
                testData.percentFee,
                testData.itemPrices,
                testData.itemStocks,
                testData.itemNames,
                testData.itemIpfsURIs,
                testData.pickLocNames,
                testData.pickLocLocations,
                testData.pickLocCities,
                testData.pickLocStates,
                testData.pickLocPhones
            ),
            {
                logAfterTx: true,
            }
        );

        await shopAgileWeb3.deployed();
        await shopAgileWeb3.assignManagers(testData.managers);
        hre.tracer.enabled = true;
        hre.tracer.gasCost = true;
    });

    describe("deployment", async () => {
        it("should set the right owner", async () => {
            expect(await shopAgileWeb3.owner()).to.equal(owner.address);
        });

        it("should add the owner as a manager", async () => {
            expect(await shopAgileWeb3.isManager(owner.address)).to.be.true;
        });

        it("should set the base and percent fees", async () => {
            let baseFee = (await shopAgileWeb3.baseFee()).toString();
            let percentFee = (await shopAgileWeb3.percentFee()).toString();
            expect(baseFee.length).to.be.greaterThan(0);
            expect(percentFee.length).to.be.greaterThan(0);
            expect(baseFee).to.equal(testData.baseFee.toString());
            expect(percentFee).to.equal(testData.percentFee.toString());
        });

        it("should set the initial items (getAllItems)", async () => {
            let items = await shopAgileWeb3.getAllItems();
            expect(items.length == testData.itemNames.length);
            expect(items[0].name).to.equal(testData.itemNames[0]);
            expect(items[0].ipfsURI).to.equal(testData.itemIpfsURIs[0]);
            expect(items[1].name).to.equal(testData.itemNames[1]);
            expect(items[1].ipfsURI).to.equal(testData.itemIpfsURIs[1]);
        });

        it("should set the initial pickup locations (getAllPickupLocations)", async () => {
            let pickLocs = await shopAgileWeb3.getAllPickupLocations();
            expect(pickLocs.length == testData.pickLocNames.length);
            expect(pickLocs[0].name).to.equal(testData.pickLocNames[0]);
            expect(pickLocs[0].phone).to.equal(testData.pickLocPhones[0]);
            expect(pickLocs[1].name).to.equal(testData.pickLocNames[1]);
            expect(pickLocs[1].phone).to.equal(testData.pickLocPhones[1]);
        });
    });

    describe("placeOrder", async () => {
        it("should revert if invalid itemId", async () => {
            await expect(
                shopAgileWeb3.placeOrder(testData.itemNames.length, 1, 1)
            ).to.be.revertedWith("Invalid itemId.");
        });

        it("should revert if quantity < 1", async () => {
            await expect(
                shopAgileWeb3.placeOrder(0, 0, 1, {
                    value: ethers.utils.parseEther("6.86"),
                })
            ).to.be.revertedWith("Quantity must be greater than 0.");
        });

        it("should revert if invalid pickupLocationId", async () => {
            await expect(
                shopAgileWeb3.placeOrder(0, 1, testData.pickLocNames.length)
            ).to.be.revertedWith("Invalid pickupLocationId.");
        });

        it("should revert if item out of stock", async () => {
            await expect(
                shopAgileWeb3.placeOrder(1, testData.itemStocks[1] + 1, 0)
            ).to.be.revertedWith("Not enough items in stock.");
        });

        it("should accept order of stockless item", async () => {
            await expect(
                shopAgileWeb3.placeOrder(0, 500, 0, {
                    value: ethers.utils.parseUnits(
                        "1875110000000000000000",
                        "wei"
                    ),
                })
            )
                .to.emit(shopAgileWeb3, "OrderPlaced")
                .withArgs(1, owner.address, 0, 500, 0);
        });

        it("should place order succesfully", async () => {
            let stockBefore = (await shopAgileWeb3.items(1)).stock;
            let balanceBefore = await owner.getBalance();
            let successOrderCost = ethers.BigNumber.from("1115000000000000000");

            await expect(
                shopAgileWeb3.placeOrder(1, 2, 1, {
                    value: successOrderCost,
                })
            )
                .to.emit(shopAgileWeb3, "OrderPlaced")
                .withArgs(1, owner.address, 1, 2, 1);

            let savedOrder = await shopAgileWeb3.idToOrder(1);

            // should update idToOrder
            expect(savedOrder.user.toString()).to.equal(
                owner.address.toString()
            );
            expect(savedOrder.itemId.toString()).to.equal("1");
            expect(savedOrder.quantity.toString()).to.equal("2");
            expect(savedOrder.pickupLocationId.toString()).to.equal("1");

            expect(savedOrder.status).to.equal(
                0,
                "should set status to Ordered"
            );

            let myOrders = await shopAgileWeb3.getMyOrders();
            // should update addressToOrderIds
            expect(myOrders.length).to.equal(1);
            expect(myOrders[0].user).to.equal(savedOrder.user);
            expect(myOrders[0].itemId.toString()).to.equal(
                savedOrder.itemId.toString()
            );

            let stockAfter = (await shopAgileWeb3.items(1)).stock;
            expect(stockBefore.sub(stockAfter).toString()).to.eq(
                "2",
                "should update item's stock"
            );

            let balanceAfter = await owner.getBalance();
            // should update debit user's balance
            expect(balanceBefore.sub(balanceAfter).gt(successOrderCost)).to.be
                .true;
        });
    });

    describe("assignManagers", async () => {
        it("should assign managers successfully", async () => {
            expect(await shopAgileWeb3.isManager(manager1.address)).to.be.true;
        });
    });

    describe("assignManager", async () => {
        it("should assign manager successfully", async () => {
            let isManagerBefore = await shopAgileWeb3.isManager(
                managerToMake.address
            );

            await expect(
                shopAgileWeb3.assignManager(managerToMake.address),
                "should emit the ManagerAssigned event"
            )
                .to.emit(shopAgileWeb3, "ManagerAssigned")
                .withArgs(managerToMake.address);

            let isManagerAfter = await shopAgileWeb3.isManager(
                managerToMake.address
            );
            expect(isManagerBefore).to.be.false;
            expect(isManagerAfter).to.be.true;
        });

        it("should only work when called by the owner", async () => {
            await expect(
                shopAgileWeb3
                    .connect(managerToMake)
                    .assignManager(managerToMake.address)
            ).to.be.revertedWith("Only the owner can perform this action.");
        });

        it("should revert if already manager", async () => {
            await expect(
                shopAgileWeb3.assignManager(manager1.address)
            ).to.be.revertedWith("Address is already a manager.");
        });
    });

    describe("unassignManager", async () => {
        it("should unassign manager successfully", async () => {
            let isManagerBefore = await shopAgileWeb3.isManager(
                manager1.address
            );

            await expect(
                shopAgileWeb3.unassignManager(manager1.address),
                "should emit the ManagerDeassigned event"
            )
                .to.emit(shopAgileWeb3, "ManagerDeassigned")
                .withArgs(manager1.address);

            let isManagerAfter = await shopAgileWeb3.isManager(
                manager1.address
            );
            expect(isManagerBefore).to.be.true;
            expect(isManagerAfter).to.be.false;
        });

        it("should only work when called by the owner", async () => {
            await expect(
                shopAgileWeb3
                    .connect(manager1)
                    .unassignManager(manager1.address)
            ).to.be.revertedWith("Only the owner can perform this action.");
        });

        it("should revert if not manager", async () => {
            await expect(
                shopAgileWeb3.unassignManager(managerToMake.address)
            ).to.be.revertedWith("Address is not a manager.");
        });
    });

    describe("collectOrder", async () => {
        it("should revert if not manager", async () => {
            await expect(
                shopAgileWeb3.connect(user1).collectOrder(1)
            ).to.be.revertedWith("Only managers can perform this action.");
        });

        it("should collect order successfully", async () => {
            await expect(
                shopAgileWeb3.placeOrder(...successPlaceOrderParams),
                "should emit OrderPlaced"
            )
                .to.emit(shopAgileWeb3, "OrderPlaced")
                .withArgs(1, owner.address, 1, 2, 1);

            await expect(
                shopAgileWeb3.collectOrder(1),
                "should emit OrderCollected"
            )
                .to.emit(shopAgileWeb3, "OrderCollected")
                .withArgs(1);

            let savedOrder = await shopAgileWeb3.idToOrder(1);
            expect(
                savedOrder.status,
                "should set the order status to Collected"
            ).to.equal(1);
        });

        it("should revert if order is already collected", async () => {
            await expect(shopAgileWeb3.placeOrder(...successPlaceOrderParams))
                .to.emit(shopAgileWeb3, "OrderPlaced")
                .withArgs(1, owner.address, 1, 2, 1);

            await expect(shopAgileWeb3.collectOrder(1))
                .to.emit(shopAgileWeb3, "OrderCollected")
                .withArgs(1);

            await expect(shopAgileWeb3.collectOrder(1)).to.be.revertedWith(
                "Order is already collected."
            );
        });
    });

    describe("withdraw", async () => {
        it("should revert if not owner", async () => {
            await expect(
                shopAgileWeb3.connect(manager1).withdraw()
            ).to.be.revertedWith("Only the owner can perform this action.");
        });

        it("should withdraw successfully", async () => {
            await expect(shopAgileWeb3.placeOrder(...successPlaceOrderParams))
                .to.emit(shopAgileWeb3, "OrderPlaced")
                .withArgs(1, owner.address, 1, 2, 1);

            await expect(shopAgileWeb3.collectOrder(1))
                .to.emit(shopAgileWeb3, "OrderCollected")
                .withArgs(1);

            let balanceBefore = await owner.getBalance();

            await shopAgileWeb3.withdraw();

            let balanceAfter = await owner.getBalance();

            console.log(balanceBefore);
            console.log(balanceAfter);

            console.log(balanceAfter.sub(balanceBefore));

            let creditedAmount = successOrderCost.sub(
                balanceAfter.sub(balanceBefore)
            );

            expect(balanceAfter.gt(balanceBefore), "should credit some amount")
                .to.be.true;

            expect(
                creditedAmount.gt(ethers.BigNumber.from("40000000000000")),
                "credited amount should be close to the order's cost"
            ).to.be.true;
        });
    });
});
