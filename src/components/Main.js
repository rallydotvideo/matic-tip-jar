import React, { Component } from "react";
import Web3 from "web3";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";

import "./App.css";

class CreateJar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      validId: true,
    };
  }

  handleChange = async (event) => {
    const jarId = event.target.value;
    this.setState({ jarId });

    const hexId = Web3.utils.padRight(Web3.utils.utf8ToHex(jarId), 34);

    const validId = await this.props.tipjar.methods.isValidId(hexId).call();
    const usedId = await this.props.tipjar.methods.isJar(hexId).call();
    this.setState({ validId: validId && !usedId });
  };

  handleSubmit = async () => {
    const hexId = Web3.utils.padRight(
      Web3.utils.utf8ToHex(this.state.jarId),
      34
    );

    await this.props.tipjar.methods
      .createTipJar(hexId)
      .send({ from: this.props.account, value: 0 });

    window.location.href = "/matic-tip-jar/" + this.state.jarId;
  };

  render() {
    return (
      <div>
        <h2>{this.props.account}</h2>

        <InputGroup className="mb-3">
          <InputGroup.Text>Jar Id</InputGroup.Text>
          <FormControl
            type="text"
            placeholder="Enter a Jar Id"
            isInvalid={!this.state.validId}
            onChange={this.handleChange}
          />
          <FormControl.Feedback type="invalid">
            Please choose an unused id that is at least 3 characters and only
            contains letters and numbers
          </FormControl.Feedback>
        </InputGroup>

        <Button variant="primary" onClick={this.handleSubmit}>
          Create
        </Button>
        {}
      </div>
    );
  }
}

class DonationField extends Component {
  constructor(props) {
    super(props);
    this.state = {
      donationAmount: Web3.utils.toBN(0),
      validDonationAmount: true,

      totalGasEstimate: Web3.utils.toBN(0),
      total: Web3.utils.toBN(0),
    };
  }

  handleChange = async (event) => {
    let donationAmount = null;
    try {
      donationAmount = Web3.utils.toWei(event.target.value);
      donationAmount = Web3.utils.toBN(donationAmount);
    } catch (err) {
      this.setState({ validDonationAmount: false });
      return;
    }

    this.setState({ validDonationAmount: true });

    this.setState({ donationAmount });

    let gasEstimate = await this.props.tipjar.methods // Total gas used for transaction
      .donate(this.props.pathHex)
      .estimateGas({
        from: this.state.account,
        amount: this.state.donationAmount,
      });
    gasEstimate = Web3.utils.toBN(gasEstimate);

    let gasPrice = await this.props.web3.eth.getGasPrice(); // Current gas price in Wei
    gasPrice = Web3.utils.toBN(gasPrice);

    const totalGasEstimate = gasEstimate.mul(gasPrice);

    this.setState({ totalGasEstimate });

    this.setState({ total: donationAmount.add(totalGasEstimate) });
  };

  handleSubmit = async () => {
    await this.props.tipjar.methods.donate(this.props.pathHex).send({
      from: this.props.account,
      value: this.state.donationAmount,
    });

    window.location.reload(false);
  };

  render() {
    return (
      <div>
        <h1>{this.props.path}</h1>

        <h4>{this.props.account}</h4>

        <InputGroup className="mb-3">
          <InputGroup.Text>Donation</InputGroup.Text>
          <FormControl
            type="number"
            placeholder="Amount to donate"
            isInvalid={!this.state.validDonationAmount}
            onChange={this.handleChange}
          />
          <InputGroup.Text>MATIC</InputGroup.Text>
        </InputGroup>

        <InputGroup className="mb-3">
          <InputGroup.Text>Estimated Gas</InputGroup.Text>
          <FormControl
            value={Web3.utils.fromWei(this.state.totalGasEstimate)}
            readOnly
          />
          <InputGroup.Text>MATIC</InputGroup.Text>
        </InputGroup>

        <InputGroup className="mb-3">
          <InputGroup.Text>Total</InputGroup.Text>
          <FormControl value={Web3.utils.fromWei(this.state.total)} readOnly />
          <InputGroup.Text>MATIC</InputGroup.Text>
        </InputGroup>

        <Button variant="primary" onClick={this.handleSubmit}>
          Donate
        </Button>
        {}
      </div>
    );
  }
}

class EditJar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      withdrawAddress: "",
      withdrawAmount: Web3.utils.toBN(0),

      validWithdrawAddress: true,
      validWithdrawAmount: true,

      transferAddress: "",

      validTransferAddress: true,
    };
  }

  handleWithdrawAddressChange = async (event) => {
    const withdrawAddress = event.target.value;

    this.setState({ withdrawAddress });
    this.setState({
      validWithdrawAddress: Web3.utils.isAddress(withdrawAddress),
    });
  };

  handleWithdrawAmountChange = async (event) => {
    let withdrawAmount = null;
    try {
      withdrawAmount = Web3.utils.toWei(event.target.value);
      withdrawAmount = Web3.utils.toBN(withdrawAmount);
      this.setState({
        validWithdrawAmount:
          withdrawAmount.lte(this.props.balance) && withdrawAmount.gt(0),
      });
    } catch (err) {
      this.setState({ validWithdrawAmount: false });
      return;
    }

    this.setState({ withdrawAmount });

    console.log(withdrawAmount.lte(this.props.balance) && withdrawAmount.gt(0));
  };

  handleWithdrawSubmit = async () => {
    await this.props.tipjar.methods
      .withdraw(
        this.props.pathHex,
        this.state.withdrawAddress,
        this.state.withdrawAmount
      )
      .send({ from: this.props.account, value: 0 });

    window.location.reload(false);
  };

  handleTransferAddressChange = async (event) => {
    const transferAddress = event.target.value;

    this.setState({ transferAddress });
    this.setState({
      validTransferAddress: Web3.utils.isAddress(transferAddress),
    });
  };

  handleTransferSubmit = async () => {
    await this.props.tipjar.methods
      .transferTipJar(this.props.pathHex, this.state.transferAddress)
      .send({ from: this.props.account, value: 0 });
    window.location.reload(false);
  };

  render() {
    return (
      <div>
        <hr />
        <p>Current Balance: {Web3.utils.fromWei(this.props.balance)}</p>

        <InputGroup className="mb-3">
          <InputGroup.Text>Withdrawal Address</InputGroup.Text>

          <FormControl
            type="text"
            placeholder="Address"
            isInvalid={!this.state.validWithdrawAddress}
            onChange={this.handleWithdrawAddressChange}
          />

          <InputGroup.Text>Amount</InputGroup.Text>

          <FormControl
            type="number"
            placeholder="Amount"
            isInvalid={!this.state.validWithdrawAmount}
            onChange={this.handleWithdrawAmountChange}
          />

          <Button
            onClick={this.handleWithdrawSubmit}
            disabled={
              !this.state.validWithdrawAddress ||
              this.state.withdrawAddress === "" ||
              !this.state.validWithdrawAmount ||
              this.state.withdrawAmount.isZero()
            }
          >
            Withdraw
          </Button>
        </InputGroup>

        <InputGroup className="mb-3">
          <InputGroup.Text>New Owner</InputGroup.Text>

          <FormControl
            type="text"
            placeholder="Address"
            isInvalid={!this.state.validTransferAddress}
            onChange={this.handleTransferAddressChange}
          />

          <Button
            onClick={this.handleTransferSubmit}
            disabled={
              !this.state.validTransferAddress ||
              this.state.transferAddress === ""
            }
          >
            Transfer Jar
          </Button>
        </InputGroup>

        <Button
          variant="danger"
          onClick={async () => {
            await this.props.tipjar.methods
              .deleteTipJar(this.props.pathHex)
              .send({ from: this.props.account, value: 0 });

            window.location.href = "/matic-tip-jar/";
          }}
          disabled={this.props.balance > 0}
        >
          Delete Tip Jar
        </Button>
      </div>
    );
  }
}

class Main extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return this.props.isJar ? (
      <Container>
        <DonationField {...this.props} />
        {this.props.isOwner ? <EditJar {...this.props} /> : null}
      </Container>
    ) : (
      <Container>
        {this.props.path === "" ? (
          <CreateJar {...this.props} />
        ) : (
          (window.location.href = "/matic-tip-jar/")
        )}
      </Container>
    );
  }
}

export default Main;
