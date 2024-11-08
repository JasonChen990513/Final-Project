const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");


module.exports = buildModule("FinalProjectToken20Module", (m) => {

  const lock = m.contract("FinalProjectToken20");

  return { lock };
});
