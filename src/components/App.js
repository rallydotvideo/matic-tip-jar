import React, { Component } from "react";
import TipJar from "../abis/TipJar.json";
import Web3 from "web3";
import "./App.css";
import Main from "./Main";
import Spinner from "react-bootstrap/Spinner";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      account: null,
      tipjar: null,
      loading: true,
      jarId: window.location.pathname.replace("/", ""),
      hexId: Web3.utils.toHex(window.location.pathname.replace("/", "")),
    };
    this.loadThings();
  }

  async loadThings() {
    await this.initWeb3();
    await this.getData();
    this.setState({ loading: false });
  }

  async initWeb3() {
    //Ensures user has an Ethereum wallet on their website
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
    } else {
      window.alert("No wallet idiot");
    }

    const web3 = window.web3;

    // Adds the user's address to the state
    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });

    // Ensures the contract was published to the current network
    const networkId = await web3.eth.net.getId();
    const networkData = TipJar.networks[networkId];
    if (networkData) {
      const tipjar = new web3.eth.Contract(TipJar.abi, networkData.address);
      this.setState({ tipjar: tipjar });

      //const isJar = await tipjar.methods.isJar(0x7b).call();
      //this.setState({ isJar });
    } else {
      // If contract is not on current network, then request switch to Polygon
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x89" }],
        });
        window.reload(false);
      } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: "0x89",
                  chainName: "Polygon Mainnet",
                  rpcUrl: "https://polygon-rpc.com/",
                  nativeCurrency: {
                    name: "Matic",
                    symbol: "MATIC",
                    decimals: 18,
                  },
                },
              ],
            });
          } catch (addError) {
            // handle "add" error
          }
        }
        // handle other "switch" errors
      }
    }
  }

  async getData() {
    const isJar = await this.state.tipjar.methods
      .isJar(this.state.hexId)
      .call();
    this.setState({ isJar });

    const allowedId = await this.state.tipjar.methods
      .allowedId(this.state.hexId)
      .call();
    this.setState({ allowedId });
  }

  render() {
    return (
      <div>
        {this.state.loading ? (
          <div id="loader" className="text-center mt-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Waiting for Ethereum</span>
            </Spinner>
          </div>
        ) : (
          <div id="loader" className="text-center mt-5">
            <p>Main</p>
            <Main {...this.state} />
          </div>
        )}
      </div>
    );
  }
}

export default App;
