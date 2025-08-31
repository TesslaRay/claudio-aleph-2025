import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ClaudioLegalAgreementModule", (m) => {
  // Claudio's address for creating legal agreements
  const claudioAddress = m.getParameter("claudioAddress", "0x9126dFc267577aa963B36cD138004414ba90E35C");
  
  const claudioLegalAgreement = m.contract("ClaudioLegalAgreement", [claudioAddress]);

  return { claudioLegalAgreement };
});
