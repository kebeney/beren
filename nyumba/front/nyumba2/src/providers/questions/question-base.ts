export class QuestionBase<T>{
  value?: T;
  key: string;
  label: string;
  required?: boolean;
  order: number;
  controlType: string;
  displayFormat?: string;
  pickerFormat?: string;
  hidden?: boolean = false;
  readonly? : boolean = false;
  disabled? : boolean = false;
  checked? : boolean;
  max: any;
  options?: Array<{key: string, value: any}>
  constructor(options: {
    value?: T,
    key?: string,
    label?: string,
    required?: boolean,
    order?: number,
    controlType?: string,
    displayFormat?: string,
    hidden?: boolean,
    readonly?: boolean,
    disabled?: boolean,
    checked?: boolean,
    pickerFormat?: string,
    max?: any,
    options?: Array<{key: string, value: any}>
  } = {}) {
    this.value = options.value;
    this.key = options.key || '';
    this.label = options.label || '';
    this.required = options.required;
    this.order = options.order === undefined ? 1 : options.order;
    this.controlType = options.controlType || '';
    this.hidden = options.hidden;
    this.readonly = options.readonly;
    this.disabled = options.disabled;
    this.checked = options.checked ;
    this.pickerFormat = options.pickerFormat;
    this.displayFormat = options.displayFormat;
    this.max = options.max;
    this.options = options.options
  }
}
