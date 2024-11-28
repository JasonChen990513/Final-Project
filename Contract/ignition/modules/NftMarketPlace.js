const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");


module.exports = buildModule("ContractModule", (m) => {

  const erc20TokenAddress = "0xE94AEF0234b3cDA3201a5b82852a522fee1513c8";
  const erc721TokenAddress = "0x33AFe777f3eF363615417C2f5488486BB5cC4400"; 
  const erc1155TokenAddress = "0x998C87E3735056dA1a667c8a3843803061a760f3"; 


  const lock = m.contract("NftMarketPlace",[
    erc20TokenAddress,
    erc721TokenAddress,
    erc1155TokenAddress
  ]);

  return { lock };
});
