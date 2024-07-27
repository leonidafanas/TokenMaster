// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract TokenMaster is ERC721 {
    address public owner;
    uint256 public totalOccasions;
    uint256 public totalSupply;

    struct Occasion {
        uint256 id;
        string name;
        uint256 cost;
        uint256 tickets;
        uint256 maxTickets;
        string date;
        string time;
        string location;
    }

    mapping (uint256 => Occasion) occasions;
    mapping (uint256 => mapping(address => bool)) public hasBought; //this mapping checks if this uint256 occassion'_id' has been acquired by this particular address: 'true' or 'false'
    mapping (uint256 => mapping(uint256 => address)) public seatTaken; //mapping seatTaken _uint _seat with address (msg.sender)
    mapping (uint256 => uint256[]) seatsTaken; //Array seatsTaken takes uint256 'occassion _id' and mapping it with uint256 '_seat' as taken seat!

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
    
    constructor(
        string memory _name,
        string memory _symbol
        ) ERC721(_name, _symbol){
            owner = msg.sender;
    } 

    function list(
        string memory _name,
        uint256 _cost,
        uint256 _maxTickets,
        string memory _date,
        string memory _time,
        string memory _location
         ) public onlyOwner{
            totalOccasions++;
            occasions[totalOccasions] = Occasion(
                    totalOccasions,
                    _name,
                    _cost,
                    _maxTickets,
                    _maxTickets,
                    _date,
                    _time,
                    _location
                    );
    }

    function mint(uint256 _id, uint256 _seat) public payable { //this function 'mint' tokenId, which is NFT token with id(totalSupply), and sends it to msg.sender
        //Require that _id is not 0 or less than total occasions...
        require(_id !=0);
        require(_id <= totalOccasions);

        //Require that ETH sent is greater than cost
        require(msg.value >= occasions[_id].cost);

        //Require that seat is not taken, and the seat exists...
        require(seatTaken[_id][_seat] == address(0));
        require(_seat <= occasions[_id].maxTickets);


        occasions[_id].tickets-=1; //<--Update tickets available (in occasion with id = _id)
        hasBought[_id][msg.sender] = true; //<--Update buying status
        seatTaken[_id][_seat] = msg.sender; //<-- Assign seat to sender of this function
        seatsTaken[_id].push(_seat); //<-- Update seats currently taken (pushes _seat # of the seat to the array [] named 'seatsTaken') 

        totalSupply++;
        _safeMint(msg.sender, totalSupply);
    }

    function getOccasion(uint256 _id) public view returns (Occasion memory) {
        return occasions[_id];
    }

    function getSeatsTaken(uint256 _id) public view returns (uint256[] memory) {
        return seatsTaken[_id];
    }

    function withdraw() public onlyOwner {
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success);
    }

}
