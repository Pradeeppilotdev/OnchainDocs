const hre = require("hardhat");

async function main() {
  const DocumentSBT = await hre.ethers.getContractFactory("DocumentSBT");
  const documentSBT = await DocumentSBT.deploy();

  await documentSBT.deployed();

  console.log("DocumentSBT deployed to:", documentSBT.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 