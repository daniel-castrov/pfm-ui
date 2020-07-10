export const BasicActionState = Object.freeze({
  VIEW: { canSave: false, canEdit: true, canDelete: true, isSingleDelete: true },
  VIEW_NO_DELETE: {
    canSave: false,
    canEdit: true,
    canDelete: false,
    isSingleDelete: true
  },
  EDIT: {
    canEdit: false,
    canSave: true,
    canDelete: true,
    isSingleDelete: true,
    canFunds: true
  }
});
