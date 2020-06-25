import { ICellEditorParams } from '@ag-grid-community/all-modules';
import { AllowedCharacters } from './AllowedCharacters';

export class NumericCellEditor {
  /**
   * Use this method for creating numeric cell editors. Do not copy-and-paste to add or modify functionality.
   * If necessary add parameters to
   * the `create()` method. Avoid creating new numeric cell editors.
   *
   * To understand better how the parameters work please read
   * https://medium.com/dailyjs/named-and-optional-arguments-in-javascript-using-es6-destructuring-292a683d5b4e
   *
   * Ideally this would be the one and only class for this purpose.
   *
   * Component parameters:
   * - min?: number | (params) => number
   * - max?: number | (params) => number
   */
  static create({
    allowedCharacters = AllowedCharacters.DIGITS_AND_MINUS_AND_DECIMAL_POINT,
    // Often it is preferable to return UNDEFINED when the user types '0' in order to equate the result
    // as with the case as if nothing was ever typed in the cell.
    // Reasons:
    // 1. The NumericCellEditor could return 0 and a formatter could convert it to ''.
    // This could be undesirable because would it result in different values
    // stored in the database in the case when nothing was ever typed in this cell and the case when 0
    // was types which would be seen as the same by the user. This
    // increases the likelihood of bugs.
    // 2. Reduces the need to use formatters.
    returnUndefinedOnZero = false
  } = {}) {
    function isCharNumeric(charStr) {
      const regEx = new RegExp(allowedCharacters);
      return !!regEx.test(charStr);
    }
    function isKeyPressedNumeric(event) {
      const charCode = getCharCodeFromEvent(event);
      const charStr = String.fromCharCode(charCode);

      return isCharNumeric(charStr);
    }
    function getCharCodeFromEvent(event) {
      event = event;
      return typeof event.which === 'undefined' ? event.keyCode : event.which;
    }

    function NumericCellEditorJS() {}

    NumericCellEditorJS.prototype.initLimit = function (cellEditorParams: ICellEditorParams, limiterString: string) {
      if (!['min', 'max'].includes(limiterString)) {
        throw new Error('wrong cellRendererParam ' + limiterString);
      }

      if (cellEditorParams && cellEditorParams[limiterString]) {
        const limiter = cellEditorParams[limiterString];
        if (typeof limiter === 'function') {
          this[limiterString] = limiter;
        } else {
          this[limiterString] = () => limiter; // must be an NgbStruct value
        }
      } else {
        this[limiterString] = () => null;
      }
    };

    NumericCellEditorJS.prototype.init = function (params) {
      this.params = params;
      this.initLimit(params.colDef.cellRendererParams, 'min');
      this.initLimit(params.colDef.cellRendererParams, 'max');

      this.focusAfterAttached = params.cellStartedEdit;
      this.eInput = document.createElement('input');
      this.eInput.style.width = '100%';
      this.eInput.style.height = '100%';
      this.eInput.value = isCharNumeric(params.charPress) ? params.charPress : params.value;
      const that = this;
      this.eInput.addEventListener('keypress', event => {
        const charCode = getCharCodeFromEvent(event);
        const charStr = String.fromCharCode(charCode);

        const prevVal = event.target.value;
        if (
          (charStr === '-' && prevVal.length > 0) ||
          (charStr === '.' && prevVal.indexOf(charStr) !== -1) ||
          !isKeyPressedNumeric(event)
        ) {
          that.eInput.focus();
          if (event.preventDefault) {
            event.preventDefault();
          }
        }
      });
    };

    NumericCellEditorJS.prototype.getGui = function () {
      if (this.eInput.value === 'undefined') {
        this.eInput.value = '';
      }
      return this.eInput;
    };

    NumericCellEditorJS.prototype.afterGuiAttached = function () {
      if (this.focusAfterAttached) {
        this.eInput.focus();
        this.eInput.select();
      }
    };

    NumericCellEditorJS.prototype.isCancelBeforeStart = function () {
      return this.cancelBeforeStart;
    };

    NumericCellEditorJS.prototype.isCancelAfterEnd = () => {};

    NumericCellEditorJS.prototype.getValue = function () {
      const value = +this.eInput.value;
      if (
        isNaN(value) ||
        (this.min(this.params) !== null && value < this.min(this.params)) ||
        (this.max(this.params) !== null && value > this.max(this.params)) ||
        (returnUndefinedOnZero && value === 0)
      ) {
        return undefined;
      } else {
        return value + '';
      }
    };

    NumericCellEditorJS.prototype.focusIn = function () {
      const eInput = this.getGui();
      eInput.focus();
      eInput.select();
    };

    NumericCellEditorJS.prototype.focusOut = () => {};
    return NumericCellEditorJS;
  }
}
