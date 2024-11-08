const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");


module.exports = buildModule("FinalProjectToken721Module", (m) => {

  const lock = m.contract("FinalProjectToken721");

  return { lock };
});
