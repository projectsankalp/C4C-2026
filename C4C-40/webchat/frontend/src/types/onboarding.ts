export interface Option {
  label: string;
  value: string;
  description: string;
  infoLink?: string;
}

export interface StateOption extends Option {
  capital: string;
  supportFocus: string;
  schemes: string[];
}

export interface OnboardingStep {
  field: string;
  type:
    | 'text'
    | 'select'
    | 'multi-select'
    | 'phone'
    | 'textarea';

  question: string;
  options?: Option[] | StateOption[];
}