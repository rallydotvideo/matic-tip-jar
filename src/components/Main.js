import React, { Component } from "react";
import Web3 from "web3";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";

import "./App.css";

class DonationField extends Component {
  constructor(props) {
    super(props);
    this.state = {
      donationAmount: 0,
      gasEstimate: 0,
      total: 0,
    };
  }

  handleChange = async (event) => {
    const donationAmount = Number(event.target.value);
    this.setState({ donationAmount });

    const gasEstimateGwei = await this.props.tipjar.methods
      .donate(this.props.hexId)
      .estimateGas();

    const gasEstimate =
      1000000000 * Web3.utils.fromWei(gasEstimateGwei.toString());

    this.setState({ total: donationAmount + gasEstimate });
  };

  handleSubmit = async () => {
    const donationAmount = Web3.utils
      .toWei(this.state.donationAmount.toString())
      .toString();
    this.props.tipjar.methods
      .donate(this.props.hexId)
      .send({ from: this.props.account, value: donationAmount });
  };

  render() {
    return (
      <div>
        <h1>{window.location.pathname.replace("/", "")}</h1>
        <h2>{this.props.account}</h2>
        <InputGroup className="mb-3">
          <InputGroup.Text>Donation</InputGroup.Text>
          <FormControl
            type="number"
            placeholder="Amount to donate"
            value={this.state.donationAmount}
            onChange={this.handleChange}
          />
          <InputGroup.Text>MATIC</InputGroup.Text>
        </InputGroup>
        <InputGroup className="mb-3">
          <InputGroup.Text>Estimated Gas</InputGroup.Text>
          <FormControl value={this.state.gasEstimate} readOnly />
          <InputGroup.Text>MATIC</InputGroup.Text>
        </InputGroup>
        <InputGroup className="mb-3">
          <InputGroup.Text>Total</InputGroup.Text>
          <FormControl value={this.state.total.toString()} readOnly />
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

    const hexId = Web3.utils.utf8ToHex(jarId);

    const validId = await this.props.tipjar.methods.allowedId(hexId).call();
    this.setState({ validId });
  };

  handleSubmit = async () => {
    const hexId = Web3.utils.utf8ToHex(this.state.jarId);
    console.log(this.state.jarId);
    console.log(hexId);

    this.props.tipjar.methods
      .createTipJar(hexId)
      .send({ from: this.props.account, value: 0 });
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
            value={this.state.formJarId}
            onChange={this.handleChange}
          />
          <InputGroup.Text>MATIC</InputGroup.Text>
          <FormControl.Feedback type="invalid">
            Please choose an Id that is atleast 3 characters and only contains
            letters and numbers
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

class Main extends Component {
  constructor(props) {
    super(props);
    //this.setState({ isJar: true });
  }

  render() {
    return this.props.isJar ? (
      <Container>
        <DonationField {...this.props} />
        <p>isJar: {this.props.isJar.toString()}</p>
        <p>allowedId: {this.props.allowedId.toString()}</p>
      </Container>
    ) : (
      <Container>
        <CreateJar {...this.props} />
      </Container>
    );
  }
}

export default Main;
