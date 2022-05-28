import ConnectWallet from "./ConnectWallet";
import Loading from "./Loading";
import TransactionErrorMessage from "./TransactionErrorMessage";
import WaitingForTransactionMessage from "./WaitingForTransactionMessage";

// const ERROR_CODE_TX_REJECTED_BY_USER = 4001;

const Dapp = () => {
    // const _getRpcErrorMessage = (error) => {
    //     if (error.data) {
    //         return error.data.message;
    //     }
    //     return error.message;
    // };

    // const _dismissTransactionError = () => {
    //     setTransactionError(undefined);
    // };

    // const _dismissNetworkError = () => {
    //     setNetworkError(undefined);
    // };

    useEffect(() => {
        // setItems([
        //     {
        //         name: "Chocolate Cake",
        //         price: { type: "BigNumber", hex: "0x1bc16d674ec80000" },
        //         quantity: { type: "BigNumber", hex: "-0x01" },
        //         taste: "sweet",
        //         color: "brown",
        //         texture: "silky",
        //         size: "large",
        //     },
        //     {
        //         name: "Bread Loaf",
        //         price: { type: "BigNumber", hex: "0x094c51733f830000" },
        //         quantity: { type: "BigNumber", hex: "0xc8" },
        //         taste: "starchy",
        //         color: "white",
        //         texture: "soft",
        //         size: "medium",
        //     },
        //     {
        //         name: "Vanilla Cupcake",
        //         price: { type: "BigNumber", hex: "0x07c1f789cd718000" },
        //         quantity: { type: "BigNumber", hex: "0x96" },
        //         taste: "sweet",
        //         color: "off-white",
        //         texture: "soft",
        //         size: "small",
        //     },
        //     {
        //         name: "Strawberry Muffin",
        //         price: { type: "BigNumber", hex: "0x094fdef1e4498000" },
        //         quantity: { type: "BigNumber", hex: "0x96" },
        //         taste: "sweet",
        //         color: "red",
        //         texture: "soft",
        //         size: "small",
        //     },
        //     {
        //         name: "Garlic Bread",
        //         price: { type: "BigNumber", hex: "0x0318415188e98000" },
        //         quantity: { type: "BigNumber", hex: "0x012c" },
        //         taste: "pungent",
        //         color: "white",
        //         texture: "soft",
        //         size: "small",
        //     },
        // ]);
    }, []);

    // ------------------------------
    // --------- Render -------------
    // ------------------------------

    // if (!selectedAddress) {
    //     return (
    //         <ConnectWallet
    //             connectWallet={() => _connectWallet()}
    //             networkError={networkError}
    //             dismiss={() => _dismissNetworkError()}
    //         />
    //     );
    // }

    // if (!balance) {
    //     return <Loading />;
    // }
    // selectedAddress.substring(0, 5) +    "..." +    selectedAddress.substring(selectedAddress.length - 4);
};

export default Dapp;
