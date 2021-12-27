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
      validAmount: true,
      donationAmount: 0,
      gasEstimate: 0,
      total: 0,
    };
  }

  handleChange = async (event) => {
    const donationAmount = Number(event.target.value);

    if (donationAmount <= 0) {
      this.setState({ validAmount: false });
      return;
    }
    this.setState({ validAmount: true });

    this.setState({ donationAmount: donationAmount.toString() });

    const gasEstimateGwei = await this.props.tipjar.methods
      .donate(this.props.pathHex)
      .estimateGas({ from: this.state.account, value: donationAmount });

    const gasEstimate =
      1000000000 * Web3.utils.fromWei(gasEstimateGwei.toString());

    this.setState({ gasEstimate });

    this.setState({ total: donationAmount + gasEstimate });
  };

  handleSubmit = async () => {
    const donationAmount = Web3.utils.toWei(
      this.state.donationAmount.toString()
    );
    this.props.tipjar.methods
      .donate(this.props.pathHex)
      .send({ from: this.props.account, value: donationAmount });
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
            isInvalid={!this.state.validAmount}
            onChange={this.handleChange}
          />
          <InputGroup.Text>MATIC</InputGroup.Text>
        </InputGroup>

        <InputGroup className="mb-3">
          <InputGroup.Text>Estimated Gas</InputGroup.Text>
          <FormControl value={this.state.gasEstimate.toString()} readOnly />
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

    const hexId = Web3.utils.padRight(Web3.utils.utf8ToHex(jarId), 34);

    const validId = await this.props.tipjar.methods.isValidId(hexId).call();
    this.setState({ validId });
  };

  handleSubmit = async () => {
    const hexId = Web3.utils.padRight(
      Web3.utils.utf8ToHex(this.state.jarId),
      34
    );

    await this.props.tipjar.methods
      .createTipJar(hexId)
      .send({ from: this.props.account, value: 0 });

    window.location.href = "/" + this.state.jarId;
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
            Please choose an id that is at least 3 characters and only contains
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

class EditJar extends Component {
  render() {
    return (
      <div>
        <Button
          variant="danger"
          onClick={async () => {
            await this.props.tipjar.methods
              .deleteTipJar(this.props.pathHex)
              .send({ from: this.props.account, value: 0 });

            window.location.href = "/";
          }}
        >
          Delete
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
        {this.props.path === "" ? null : (window.location.href = "/")}
        <CreateJar {...this.props} />
      </Container>
    );
  }
}

export default Main;
