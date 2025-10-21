const main = async () => {
  const SmartContract = await hre.ethers.getContractFactory("SmartContract");
  const deploySmartContract = await SmartContract.deploy();

  await deploySmartContract.deployed();
  console.log(deploySmartContract.address);
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

runMain();
