import { ethers } from "ethers";
import { useState, useEffect } from "react";

// import NoWalletDetected from "./components/NoWalletDetected";
import ShopAgileWeb3Artifact from "./contracts/ShopAgileWeb3.json";
import contractAddress from "./contracts/contract-address.json";

const CONTRACT_NETWORK_ID = "31337";
const CONTRACT_NETWORK_NAME = "Hardhat localhost";
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
            _provider.getSigner(0)
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
            let items = await contract.getAllItems();
            setLoading(false);
            setItems(items);
            console.log(items);
        })();
    }, [contract]);

    // if (window.ethereum === undefined) return <NoWalletDetected />;

    return (
        <div className="h-full w-full flex flex-col font-sans text-lg text-gray-900">
            {/* ----- Navbar ---- */}
            <div className="bg-slate-900 px-4 py-3 text-white">
                <div className=" max-w-7xl w-full mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold">
                        <a href="/">Shop Agile Web3</a>
                    </h1>

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

            {/* ----- Dapp ---- */}
            <div className="flex-1 bg-gray-100 max-w-7xl w-full mx-auto p-2 px-4">
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
                {!!window.ethereum && loading && (
                    <p className="font-bold">Loading...</p>
                )}

                {!!window.ethereum && !loading && (
                    <div className="items grid grid-cols-3 gap-4">
                        {items.map((item, idx) => {
                            return (
                                <div
                                    key={idx}
                                    className="bg-amber-200 rounded p-2"
                                >
                                    <p>Name: {item.name}</p>
                                    <p>Price: {item.price.toString()}</p>
                                    {item.stock.gt(-1) && (
                                        <p>Stock: {item.stock.toString()}</p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            {/* ----- /Dapp ---- */}
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
                    {/* <a
                    href=""
                    className="text-blue-500 border-b-2 border-slate-600 hover:border-blue-600"
                >
                    View on EtherScan
                </a> */}
                </div>
            </div>
            {/* ----- Footer ---- */}
        </div>
    );
}

export default App;
