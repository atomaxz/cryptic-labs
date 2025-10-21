# Smart Contract Server for Plugin Donate Crypto 

This server runs on NodeJS with Hardhat configuration for smart contract system, this server can run on local server or VPS. This server has the function to create smart contracts using Hardhat. Before deploying a new smart contract, you must have a personal account key (Etherium), network name, and network API key url.

## Installation

Download or Clone this repository. After that you open the terminal in the project and type the command as below and enter, to install all the packages used.

```bash
npm install
```
    
## Running the server

The server can run if you type and enter

```bash
node scripts/index.js
```
## API Reference

#### Create Smart Contract

```http
  POST /createSmartContract
```

| Parameter             | Type     | Description                                     |
| :-------------------- | :------- | :---------------------------------------------- |
| `network`             | `string` | **Required**. Type of network                   |
| `url_api_key`         | `string` | **Required**. URL API KEY of network            |
| `private_key_account` | `string` | **Required**. Private Key Account from metamask |

If you run this API endpoint, you will get a JSON result like this
```json
{
    "status": true,
    "message": "Process Successfully",
    "data": {
        "address_contract": "0x71F3e30b1f00AD6201d4fBea7a223cB91B8f5614",
        "abi_json_url": "http://localhost:3000/abi_json/ABI_FILE_JSON_SMARTCONTRACT.json"
    }
}
```
## Tech Stack

**System:** NodeJS, Javascripts, ExpressJS, Hardhat
