enum BorrowerOperation {
  openTrove,
  closeTrove,
  adjustTrove,
}

export function getTroveOperationFromBorrowerOperation(operation: BorrowerOperation): string {
  switch (operation) {
    case BorrowerOperation.openTrove:
      return 'openTrove'
    case BorrowerOperation.closeTrove:
      return 'closeTrove'
    case BorrowerOperation.adjustTrove:
      return 'adjustTrove'
  }

  // AssemblyScript can't tell we will never reach this, so it insists on a return statement
  return 'unreached'
}
