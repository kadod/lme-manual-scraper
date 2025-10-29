export type FieldType =
  | 'short_text'
  | 'long_text'
  | 'email'
  | 'tel'
  | 'number'
  | 'url'
  | 'date'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'file';

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  description?: string;
  required: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface FormSettings {
  theme?: 'default' | 'minimal' | 'modern';
  show_progress?: boolean;
  submit_button_text?: string;
  thank_you_message?: string;
  redirect_url?: string | null;
  allow_multiple_submissions?: boolean;
}

export interface FormData {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  status: 'draft' | 'active' | 'inactive' | 'archived';
  fields: FormField[];
  settings: FormSettings;
  created_at: string;
  updated_at: string;
}

export interface FormResponse {
  id: string;
  form_id: string;
  friend_id?: string | null;
  line_user_id?: string | null;
  response_data: Record<string, any>;
  submitted_at: string;
  metadata?: Record<string, any>;
}

export interface FormSubmission {
  [fieldId: string]: any;
}

export interface FormValidationError {
  fieldId: string;
  message: string;
}
