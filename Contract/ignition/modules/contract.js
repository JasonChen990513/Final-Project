const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");


module.exports = buildModule("ContractModule", (m) => {

  const lock = m.contract("contract");

  return { lock };
});
