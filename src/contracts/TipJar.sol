pragma solidity ^0.5.0;

contract TipJar {
    mapping(bytes => bool) public isJar;
    mapping(bytes => Jar) public jar;

    struct Jar {
        bytes id;
        address owner;
        uint256 balance;
    }

    event jarCreation(
        bytes jarId,
        address owner
    );

    event donation(
        bytes jarId,
        address sender,
        uint256 amount
    );

    event withdrawal(
        bytes jarId,
        address receiver,
        uint256 amount
    );

    // Ensures a jar exists with the id
    modifier validJar(bytes memory id) {
        require(isJar[id]);
        _;
    }

    // Ensure the message sender owns the tipjar
    modifier onlyOwner(bytes memory id) {
        require(msg.sender == jar[id].owner);
        _;
    }

    constructor() public {
    }

    /** @dev Function to determine if an jar Id is allowed
      * @param id potential jar id
      */
    function allowedId(bytes memory id) public pure returns (bool) {
        //bytes memory bStr = bytes(str);
        if (id.length < 3){
            return false;
        }
        for (uint i = 0; i < id.length; i++) {
            if (id[i] >= "a" && id[i] <= "z") {
                continue;
            } else if (id[i] >= "A" && id[i] <= "z") {
                continue;
            } else if (id[i] >= "0" && id[i] <= "9"){
                continue;
            } else {
                return false;
            }
        }
        return true;
    }

    /** @dev Creates a tip jar with the specified id and the message sender as the owner
      * @param id jar id
      */
    function createTipJar(bytes memory id) public {
        require(allowedId(id)); // Ensures Id is valid
        require (!isJar[id]); // Ensures Id hasn't been used yet

        isJar[id] = true;
        jar[id] = Jar ({
            id:id,
            owner:msg.sender,
            balance:0
        });

        emit jarCreation(id, msg.sender);
    }

    /** @dev Sends an amount to the jar id
      * @param id jar id
      */
    function donate(bytes calldata id) external payable validJar(id) {
        jar[id].balance += msg.value;

        emit donation(id, msg.sender, msg.value);
    }

    /** @dev Withdraws a specified amount to the receiver address
      * @param id jar id to withdraw from
      * @param receiver address to send to
      * @param amount amount to withdraw
      */
    function withdraw(bytes memory id, address payable receiver, uint amount) public validJar(id) onlyOwner(id){
        require (jar[id].balance >= amount);
        jar[id].balance -= amount;
        receiver.transfer(amount);

        emit withdrawal(id, receiver, amount);
    }
}