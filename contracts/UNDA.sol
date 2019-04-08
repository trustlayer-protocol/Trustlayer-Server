/**
 * UNDA is an on-chain "Universal NDA" that allows anyone to prospectively adopt standard NDA terms to:
 * join "Trustlayer" protocol for rapid NDA adoption with other adoptees;
 * make secure records of their 'paired' NDAs generated through Trustlayer Nodes...
                              	 
                             	*  * 	*   *   
                              	*  *   *  *   
             	___---___---                	---___---___
       	___---___---        	E N T E R      	---___---___
 	___---___---              	Trustlayer          	---___---___
__---___---_________________________________________________________---___---__
===============================================================================
 \__/=====\__/   \__/=====\__/   \__/=====\__/   \__/=====\__/   \__/=====\__/
	|||||||     	|||||||     	|||||||     	|||||||     	|||||||
	|||||||     	|||||||     	|||||||     	|||||||     	|||||||
	|||||||     	|||||||     	|||||||     	|||||||     	|||||||
	|||||||     	|||||||     	|||||||     	|||||||     	|||||||
	|||||||     	|||||||     	|||||||     	|||||||     	|||||||
	|||||||     	|||||||     	|||||||     	|||||||     	|||||||
	|||||||     	|||||||     	|||||||     	|||||||     	|||||||
	|||||||     	|||||||     	|||||||     	|||||||     	|||||||
   ZZZZZZZZZ   	ZZZZZZZZZ   	ZZZZZZZZZ   	ZZZZZZZZZ   	ZZZZZZZZZ
  ===========================================================================
__|_________________________________________________________________________|__
_|___________________________________________________________________________|_
|_____________________________________________________________________________|
_______________________________________________________________________________
 */


pragma solidity ^0.5.0;

/**
 * @title Ownable
 * @dev The Ownable contract has an owner address, and provides basic authorization control
 * functions, this simplifies the implementation of "user permissions".
 */
contract Ownable {
	address private _owner;

	event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

	/**
 	* @dev The Ownable constructor sets the original `owner` of the contract to the sender
 	* account.
 	*/
	constructor () internal {
    	_owner = msg.sender;
    	emit OwnershipTransferred(address(0), _owner);
	}

	/**
 	* @return the address of the owner.
 	*/
	function owner() public view returns (address) {
    	return _owner;
	}

	/**
 	* @dev Throws if called by any account other than the owner.
 	*/
	modifier onlyOwner() {
    	require(isOwner());
    	_;
	}

	/**
 	* @return true if `msg.sender` is the owner of the contract.
 	*/
	function isOwner() public view returns (bool) {
    	return msg.sender == _owner;
	}

	/**
 	* @dev Allows the current owner to relinquish control of the contract.
 	* It will not be possible to call the functions with the `onlyOwner`
 	* modifier anymore.
 	* @notice Renouncing ownership will leave the contract without an owner,
 	* thereby removing any functionality that is only available to the owner.
 	*/
	function renounceOwnership() public onlyOwner {
    	emit OwnershipTransferred(_owner, address(0));
    	_owner = address(0);
	}

	/**
 	* @dev Allows the current owner to transfer control of the contract to a newOwner.
 	* @param newOwner The address to transfer ownership to.
 	*/
	function transferOwnership(address newOwner) public onlyOwner {
    	_transferOwnership(newOwner);
	}

	/**
 	* @dev Transfers control of the contract to a newOwner.
 	* @param newOwner The address to transfer ownership to.
 	*/
	function _transferOwnership(address newOwner) internal {
    	require(newOwner != address(0));
    	emit OwnershipTransferred(_owner, newOwner);
    	_owner = newOwner;
	}
}

contract UNDA is Ownable {
	/* Define ‘UNDAterms’ for prospective adoptions */
	string public Title;
	string public Version;
	string public Author;
	string public License;
	string public UNDAterms;
	string public Web2URL;
	string public UNDArevocation;
	string public NDApairing;
    
	/* This runs when the contract is executed and adds initial UNDA descriptions */
	constructor(string memory _Title, string memory _Version, string memory _Author, string memory _License, string memory _UNDAterms, string memory _Web2URL) public {
    	Title = _Title;
    	Version = _Version;
    	Author = _Author;
    	License = _License;
    	UNDAterms = _UNDAterms;
    	Web2URL = _Web2URL;
	}

	/* Reads 'UNDAterms' from constructor */
	function ReadUNDAterms() public view returns (string memory) {
    	return UNDAterms;
	}
    
	/* Calls latest adoption hash to 'UNDAterms' */
	function AdoptUNDAterms() public {
	}

	function PairNDAtoUNDAterms(string memory _NDApairing) public {
    	NDApairing = _NDApairing;
	}
    
	/* Adds latest readable revocation of UNDA 'terms' adoption; can add 'revocation string message', e.g. adoption hash */
	function RevokeAdoptionOfUNDA(string memory _UNDArevocation) onlyOwner public {
    	UNDArevocation = _UNDArevocation;
	}
}
