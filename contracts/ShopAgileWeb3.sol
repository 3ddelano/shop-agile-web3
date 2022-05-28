// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Counters.sol";

import "hardhat/console.sol";

contract ShopAgileWeb3 {
    using Counters for Counters.Counter;

    event OrderPlaced(
        uint indexed orderId,
        address indexed user,
        uint itemId,
        uint quantity,
        uint pickupLocationId
    );

    event OrderCollected(uint indexed orderId);

    event ItemAdded(uint itemId, Item item);
    event ItemAttributesUpdated(
        uint indexed itemId,
        string taste,
        string color,
        string texture,
        string size
    );
    event ManagerAssigned(address indexed manager);
    event ManagerDeassigned(address indexed manager);

    struct Item {
        string name;
        uint price;
        int stock;
        // Attributes
        string taste;
        string color;
        string texture;
        string size;
    }

    struct Order {
        address user;
        uint itemId;
        uint quantity;
        uint pickupLocationId;
        OrderStatus status;
    }

    enum OrderStatus {
        Ordered,
        Collected
    }

    struct PickupLocation {
        string name;
        string location;
        string city;
        string state;
        string phone;
    }

    address payable public owner;
    mapping(address => bool) public isManager;

    // Number from 1-100 denoting the percetage of the order cost as fee
    uint8 public percentFee;
    uint public baseFee;

    Item[] public items;
    PickupLocation[] public pickupLocations;
    mapping(address => uint[]) public addressToOrderIds;
    mapping(uint => Order) public idToOrder;

    // Privates
    Counters.Counter private _orderIds;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action.");
        _;
    }

    modifier onlyManager() {
        require(
            isManager[msg.sender],
            "Only managers can perform this action."
        );
        _;
    }

    constructor(
        uint _baseFee,
        uint8 _percentFee,
        // Initial items
        uint[] memory itemPrices,
        int[] memory itemStocks,
        string[] memory itemNames,
        // Initial pickupLocations
        string[] memory pickupLocationNames,
        string[] memory pickupLocationLocations,
        string[] memory pickupLocationCities,
        string[] memory pickupLocationStates,
        string[] memory pickupLocationPhones
    ) {
        baseFee = _baseFee;
        percentFee = _percentFee;
        owner = payable(msg.sender);
        isManager[msg.sender] = true;

        for (uint i = 0; i < itemNames.length; ++i) {
            Item memory item = Item({
                name: itemNames[i],
                price: itemPrices[i],
                stock: itemStocks[i],
                taste: "",
                color: "",
                texture: "",
                size: ""
            });
            items.push(item);
        }

        for (uint i = 0; i < pickupLocationNames.length; ++i) {
            PickupLocation memory pickupLocation = PickupLocation({
                name: pickupLocationNames[i],
                location: pickupLocationLocations[i],
                city: pickupLocationCities[i],
                state: pickupLocationStates[i],
                phone: pickupLocationPhones[i]
            });
            pickupLocations.push(pickupLocation);
        }
    }

    function getAllItems() public view returns (Item[] memory) {
        return items;
    }

    function getAllPickupLocations()
        public
        view
        returns (PickupLocation[] memory)
    {
        return pickupLocations;
    }

    function getMyOrders() public view returns (Order[] memory) {
        uint length = addressToOrderIds[msg.sender].length;
        Order[] memory orders = new Order[](length);
        for (uint i = 0; i < length; ++i) {
            orders[i] = idToOrder[addressToOrderIds[msg.sender][i]];
        }
        return orders;
    }

    function placeOrder(
        uint itemId,
        uint quantity,
        uint pickupLocationId
    ) public payable {
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
        if (item.stock > -1) {
            // Check item has enough stock for the order
            require(item.stock >= int(quantity), "Not enough items in stock.");
        }

        uint cost = ((item.price * quantity * percentFee) / 100) + baseFee;
        console.log("Amount to pay is %s", cost);
        // Check if balance is sufficient
        require(msg.value == cost, "Pay the correct amount for order.");

        // Place the order
        Order memory order = Order({
            user: msg.sender,
            itemId: itemId,
            quantity: quantity,
            pickupLocationId: pickupLocationId,
            status: OrderStatus.Ordered
        });

        // Update stock of the item
        items[itemId].stock -= int(quantity);

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
    }

    function addItem(
        string memory name,
        uint price,
        int stock,
        string memory taste,
        string memory color,
        string memory texture,
        string memory size
    ) public onlyManager {
        Item memory item = Item({
            name: name,
            price: price,
            stock: stock,
            taste: taste,
            color: color,
            texture: texture,
            size: size
        });
        items.push(item);

        emit ItemAdded(items.length - 1, item);
    }

    function updateItemAttributes(
        uint itemId,
        string memory taste,
        string memory color,
        string memory texture,
        string memory size
    ) public onlyManager {
        require(itemId < items.length, "Invalid itemId.");
        Item memory item = items[itemId];
        item.taste = taste;
        item.color = color;
        item.texture = texture;
        item.size = size;

        items[itemId] = item;

        emit ItemAttributesUpdated(itemId, taste, color, texture, size);
    }

    function collectOrder(uint orderId) public onlyManager {
        require(
            idToOrder[orderId].status != OrderStatus.Collected,
            "Order is already collected."
        );
        idToOrder[orderId].status = OrderStatus.Collected;
        emit OrderCollected(orderId);
    }

    function assignManagers(address[] memory _managers) public onlyOwner {
        for (uint i = 0; i < _managers.length; ++i) {
            address addr = _managers[i];
            if (isManager[addr]) continue;
            isManager[addr] = true;
            emit ManagerAssigned(addr);
        }
    }

    function unassignManager(address _addr) public onlyOwner {
        require(isManager[_addr], "Address is not a manager.");
        isManager[_addr] = false;
        emit ManagerDeassigned(_addr);
    }

    function assignManager(address _manager) public onlyOwner {
        require(!isManager[_manager], "Address is already a manager.");
        isManager[_manager] = true;
        emit ManagerAssigned(_manager);
    }

    function withdraw() public onlyOwner {
        require(msg.sender == owner, "Only the owner can withdraw.");
        owner.transfer(address(this).balance);
    }

    receive() external payable {
        // Do nothing
    }

    fallback() external payable {
        // Do nothing
    }
}
