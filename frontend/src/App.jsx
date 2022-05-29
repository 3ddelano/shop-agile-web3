import { ethers } from "ethers";
import { useState, useEffect } from "react";

import { BrowserRouter, Route, Routes, Link } from "react-router-dom";

import ShopAgileWeb3Artifact from "./contracts/ShopAgileWeb3.json";
import contractAddress from "./contracts/contract-address.json";

const CONTRACT_NETWORK_ID = "31337";
const CONTRACT_NETWORK_NAME = "Hardhat localhost";

const OrderStatuses = [
    {
        name: "Ordered",
        color: "rgb(245, 158, 11)",
    },
    { name: "Completed", color: "rgb(34, 197, 94)" },
];

let _provider = undefined;

function App() {
    let [selectedAddress, setSelectedAddress] = useState("");
    let [balance, setBalance] = useState(undefined);
    let [contract, setContract] = useState(undefined);
    let [loading, setLoading] = useState(true);
    let [items, setItems] = useState([]);

    const _resetState = () => {
        setSelectedAddress("");
        setBalance(undefined);
        setTxBeingSent(undefined);
        setTransactionError(undefined);
        setNetworkError(undefined);
        setItems([]);
        _provider = undefined;
        _contract = undefined;
    };

    const _initializeEthers = async () => {
        _provider = new ethers.providers.Web3Provider(window.ethereum);
        let _contract = new ethers.Contract(
            contractAddress.ShopAgileWeb3,
            ShopAgileWeb3Artifact.abi,
            _provider //.getSigner(0)
        );
        setContract(_contract);
        window.contract = _contract;
    };

    const _initialize = async (userAddress) => {
        setSelectedAddress(userAddress);

        _initializeEthers();
        setBalance(await _provider.getBalance(userAddress));
    };

    const _checkNetwork = () => {
        if (window.ethereum.networkVersion === CONTRACT_NETWORK_ID) {
            return true;
        }
        setNetworkError("Please connect Metamask to " + CONTRACT_NETWORK_NAME);
        return false;
    };

    const _connectWallet = async () => {
        if (window.ethereum == undefined)
            return alert(
                "Wallet not detected. Please install Metamask browser extension."
            );
        const [_selectedAddress] = await window.ethereum.request({
            method: "eth_requestAccounts",
        });

        if (!_checkNetwork()) {
            return;
        }

        _initialize(_selectedAddress);

        // We reinitialize it whenever the user changes their account.
        window.ethereum.on("accountsChanged", ([newAddress]) => {
            console.log("Eth accountsChanged");
            if (newAddress === undefined) {
                return _resetState();
            }

            _initialize(newAddress);
        });

        // We reset the dapp state if the network is changed
        window.ethereum.on("chainChanged", ([networkId]) => {
            console.log("Eth chainChanged");
            _resetState();
        });
    };

    useEffect(() => {
        // Connect to ethers and get the items
        _initializeEthers();
    }, []);

    useEffect(() => {
        (async () => {
            if (!contract) return;
            setLoading(true);
            let items = await contract.getAllItems();
            setLoading(false);
            setItems(items);
        })();
    }, [contract]);

    // if (window.ethereum === undefined) return <NoWalletDetected />;

    return (
        <BrowserRouter>
            <div className="h-full w-full flex flex-col font-sans text-lg text-gray-900">
                {/* ----- Navbar ---- */}
                <div className="bg-slate-900 px-4 py-3 text-white">
                    <div className=" max-w-7xl w-full mx-auto flex justify-between items-center">
                        <div className="flex flex-1 justify-between items-center mr-4">
                            <h1 className="text-2xl font-bold">
                                <Link to="/">Shop Agile Web3</Link>
                            </h1>

                            <div>
                                <Link to="/my-orders">My Orders</Link>
                            </div>
                        </div>

                        {selectedAddress == "" ? (
                            <button
                                onClick={() => _connectWallet()}
                                className="px-4 py-2 rounded-2xl bg-yellow-500 hover:bg-yellow-600"
                            >
                                Connect Wallet
                            </button>
                        ) : (
                            <button
                                onClick={() => _resetState()}
                                className="flex gap-x-2 bg-green-500/75 hover:bg-green-500/50 px-4 py-2 rounded-2xl items-center"
                            >
                                <p>Log Out</p>
                                <p className="text-sm text-gray-200">
                                    {selectedAddress.substring(0, 5) +
                                        "..." +
                                        selectedAddress.substring(
                                            selectedAddress.length - 4,
                                            selectedAddress
                                        )}
                                </p>
                            </button>
                        )}
                    </div>
                </div>
                {/* ----- /Navbar ---- */}

                {window.ethereum == undefined && (
                    <h1 className="text-3xl">
                        Wallet not detected. Please install{" "}
                        <a
                            className="text-blue-400"
                            href="https://metamask.io"
                            target="_blank"
                            referrerPolicy="no-referrer"
                        >
                            Metamask
                        </a>{" "}
                        browser extension.
                    </h1>
                )}
                <Routes>
                    <Route
                        exact
                        path="/"
                        element={
                            //  ----- Dapp -----
                            <div className="flex-1 max-w-7xl w-full mx-auto p-2 px-4">
                                <h1 className="text-2xl font-bold mt-2 mb-4">
                                    Items For Sale
                                </h1>
                                {!!window.ethereum && loading && (
                                    <p className="font-bold">Loading...</p>
                                )}
                                {!!window.ethereum && !loading && (
                                    <div className="items grid grid-cols-3 gap-4">
                                        {items.map((item, idx) => {
                                            return (
                                                <div
                                                    key={idx}
                                                    className="bg-amber-200 rounded p-2 flex flex-col justify-between"
                                                >
                                                    <div>
                                                        <p>Name: {item.name}</p>
                                                        <p>
                                                            Price:{" "}
                                                            {ethers.utils.formatUnits(
                                                                item.price,
                                                                "ether"
                                                            )}
                                                            {" ETH"}
                                                        </p>
                                                        {item.stock.gt(-1) && (
                                                            <p>
                                                                Stock:{" "}
                                                                {item.stock.toString()}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="flex gap-2 mb-2">
                                                            <label htmlFor="count">
                                                                Quantity
                                                            </label>
                                                            <input
                                                                type="number"
                                                                value={1}
                                                            />
                                                        </div>
                                                        <button className="bg-yellow-600 text-white border-white border-2 px-2 py-0.5 rounded">
                                                            Place Order
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                            // ----- /Dapp -----
                        }
                    />
                    <Route
                        exact
                        path="/my-orders"
                        element={<MyOrders contract={contract} items={items} />}
                    />
                </Routes>

                {/* ----- Footer ---- */}
                <div className="bg-slate-900 p-4 text-white">
                    <div className="mx-auto max-w-7xl w-full">
                        <p className="mb-2">
                            DApp running on Polygon Mumbai Testnet!
                        </p>
                        <a
                            className="text-blue-500 border-b-2 border-slate-900 hover:border-blue-600 mr-2"
                            target="_blank"
                            href="https://github.com/3ddelano/shop-agile-web3"
                        >
                            Github
                        </a>
                    </div>
                </div>
                {/* ----- Footer ---- */}
            </div>
        </BrowserRouter>
    );
}

function MyOrders({ contract, items }) {
    let [loading, setLoading] = useState(true);
    let [loadingPickupLocations, setLoadingPickupLocations] = useState(true);

    let [orders, setOrders] = useState([]);
    let [pickupLocations, setPickupLocations] = useState([]);

    useEffect(() => {
        if (!contract) return;
        (async () => {
            setLoading(true);
            const orders = await contract.getMyOrders();
            setLoading(false);
            if (orders.length > 0) setOrders(orders);
        })();
    }, [contract]);

    useEffect(() => {
        if (!contract) return;
        (async () => {
            setLoadingPickupLocations(true);
            const pickupLocations = await contract.getAllPickupLocations();
            setLoadingPickupLocations(false);
            if (pickupLocations.length > 0) setPickupLocations(pickupLocations);
        })();
    }, [contract]);

    return (
        <div className="flex-1 max-w-7xl w-full mx-auto p-2 px-4">
            <h1 className="text-2xl font-bold mt-2 mb-4">My Orders</h1>
            {!!window.ethereum && (loading || items.length == 0) && (
                <p className="font-bold">Loading...</p>
            )}
            {!!window.ethereum && !loading && items.length > 0 && (
                <div className="items grid grid-cols-3 gap-4">
                    {orders.map((order, idx) => {
                        console.log("items. ", items.length);
                        let item = items[order.itemId];
                        return (
                            <div
                                key={idx}
                                className="bg-slate-100 border-2 border-slate-300 rounded p-2 flex flex-col justify-between"
                            >
                                <div>
                                    <div
                                        className="rounded-full text-xs text-white uppercase w-20 flex items-center justify-center py-0.5 tracking-wider"
                                        style={{
                                            backgroundColor:
                                                OrderStatuses[order.status]
                                                    .color,
                                        }}
                                    >
                                        {OrderStatuses[order.status].name}
                                    </div>
                                    <p>Name: {item.name}</p>
                                    <p>Quantity: {order.quantity.toString()}</p>
                                    <p>
                                        Cost:{" "}
                                        {ethers.utils.formatUnits(
                                            order.cost,
                                            "ether"
                                        )}
                                        {" ETH"}
                                    </p>
                                    <div>
                                        {!loadingPickupLocations &&
                                            pickupLocations.length > 0 && (
                                                <>
                                                    <p className="font-semibold text-gray-500 mt-2">
                                                        {OrderStatuses[
                                                            order.status
                                                        ].name !== "Completed"
                                                            ? "Collect At"
                                                            : "Collected At"}
                                                    </p>
                                                    <div>
                                                        <p>
                                                            {
                                                                pickupLocations[
                                                                    order.pickupLocationId.toNumber()
                                                                ].name
                                                            }
                                                        </p>
                                                        <p>
                                                            {
                                                                pickupLocations[
                                                                    order.pickupLocationId.toNumber()
                                                                ].location
                                                            }
                                                        </p>
                                                        <p>
                                                            {
                                                                pickupLocations[
                                                                    order.pickupLocationId.toNumber()
                                                                ].phone
                                                            }
                                                        </p>
                                                    </div>
                                                </>
                                            )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default App;
