/**
 * Get the system symbol from the full symbol
 * e.g. get X1-ABCD from X1-ABCD-1337D
 * @param fullSymbol
 */
function getSystemSymbol(fullSymbol: string) {
  return fullSymbol.split("-").splice(0, 2).join("-");
}

export { getSystemSymbol };
