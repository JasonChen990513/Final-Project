const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");


module.exports = buildModule("FinalProjectToken1155Module", (m) => {

  const lock = m.contract("FinalProjectToken1155");

  return { lock };
});
