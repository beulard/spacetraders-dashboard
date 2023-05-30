/**
 * Get the system symbol from the full symbol
 * e.g. get X1-ABCD from X1-ABCD-1337D
 * @param fullSymbol
 */
function getSystemSymbol(fullSymbol: string) {
  return fullSymbol.split("-").splice(0, 2).join("-");
}

function alphabeticSorter(a: string, b: string) {
  if (a > b) return 1;
  if (b > a) return -1;
  return 0;
}

export { getSystemSymbol, alphabeticSorter };
