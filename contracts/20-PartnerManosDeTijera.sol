//pragma solidity 0.8.0 --> No funciona. Averiguar por qué.

pragma solidity 0.7.3;

contract PartnerManosDeTijera {

  fallback() external payable{
    assert(false);
  }
}