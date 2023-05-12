import { Contract } from "spacetraders-sdk";

function getShortDesc(contract: Contract) {}
function getTotalPayment(contract: Contract) {
  return contract.terms.payment.onAccepted + contract.terms.payment.onFulfilled;
}

export { getShortDesc, getTotalPayment };
