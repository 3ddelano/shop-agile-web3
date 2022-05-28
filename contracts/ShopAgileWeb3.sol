// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Counters.sol";
// import "@openzeppelin/contracts/utils/Strings.sol";
// import "@openzeppelin/contracts/utils/Base64.sol";

import "hardhat/console.sol";

contract ShopAgileWeb3 {
    using Counters for Counters.Counter;

    event OrderPlaced(
        uint indexed orderId,
        address indexed userId,
        uint itemId,
        uint quantity,
        uint pickupLocationId
    );
    event OrderCollected(uint indexed orderId);

    // ----------
    // Item
    // ----------
    struct Item {
        string name;
        uint price;
        int quantityInStock;
        string ipfsURI;
        // string imageURI;
        // string description;
        // uint[] ratings;
    }

    // ----------
    // Order
    // ----------
    enum OrderStatus {
        Ordered,
        Pending,
        Collected
    }

    struct Order {
        address userAddress;
        uint itemId;
        uint quantity;
        uint pickupLocationId;
        OrderStatus status;
    }

    struct PickupLocation {
        string name;
        string location;
        string description;
        string contactNumber;
    }

    address payable public owner;
    address[] public managers;

    // Number from 1-100 denoting the percetage of the order cost as fee
    uint8 public percentFee;
    // Number denoting the base fee on each transaction
    uint public baseFee;

    // Maps the orders of a given user
    mapping(address => uint[]) public addressToOrderIds;
    Counters.Counter private _orderIds;
    Counters.Counter private _itemIds;

    // Maps the orderId to an Order
    mapping(uint => Order) public idToOrder;

    PickupLocation[] public pickupLocations;

    Item[] public items;

    constructor(uint _baseFee, uint8 _percentFee) {
        baseFee = _baseFee;
        percentFee = _percentFee;
        owner = payable(msg.sender);
    }

    function placeOrder(
        uint itemId,
        uint quantity,
        uint pickupLocationId
    ) public payable returns (uint orderId) {
        // Check if valid item
        require(itemId < items.length, "Invalid itemId.");
        require(quantity >= 1, "Quantity must be greater than 0.");
        // Check if valid pickuplocation
        require(
            pickupLocationId < pickupLocations.length,
            "Invalid pickupLocationId."
        );

        // Fetch item information
        Item memory item = items[itemId];

        // Check if item is a stock based item
        if (item.quantityInStock > -1) {
            // Check item has enough stock for the order
            require(
                item.quantityInStock >= int(quantity),
                "Not enough items in stock."
            );
        }

        uint cost = ((item.price * quantity * percentFee) / 100) + baseFee;
        // Check if balance is sufficient
        require(msg.value >= cost, "Insufficient balance to place order.");

        // Place the order
        Order memory order = Order({
            userAddress: msg.sender,
            itemId: itemId,
            quantity: quantity,
            pickupLocationId: pickupLocationId,
            status: OrderStatus.Ordered
        });

        _orderIds.increment();
        uint newOrderId = _orderIds.current();
        idToOrder[newOrderId] = order;
        // Add the order to the user's orders
        addressToOrderIds[msg.sender].push(newOrderId);
        emit OrderPlaced(
            newOrderId,
            msg.sender,
            itemId,
            quantity,
            pickupLocationId
        );

        return newOrderId;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    modifier onlyMangager() {
        bool isManager = false;

        for (uint i = 0; i < managers.length; i++) {
            if (msg.sender == managers[i]) {
                isManager = true;
                break;
            }
        }

        require(isManager, "You need to be a manager.");
        _;
    }

    function collectOrder(uint orderId) public onlyMangager {
        require(
            idToOrder[orderId].status == OrderStatus.Pending,
            "Order is not pending."
        );
        idToOrder[orderId].status = OrderStatus.Collected;
        emit OrderCollected(orderId);
    }
}
