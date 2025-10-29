import {
  EnvelopeIcon,
  PhoneIcon,
  HashtagIcon,
  DocumentTextIcon,
  ListBulletIcon,
  CheckCircleIcon,
  Square3Stack3DIcon,
  CalendarIcon,
  ClockIcon,
  DocumentArrowUpIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import { FieldType } from '@/types/form';

export interface FieldConfig {
  type: FieldType;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  defaultPlaceholder: string;
  description: string;
  supportsOptions: boolean;
  defaultValidation?: string[];
}

export const fieldConfigs: Record<FieldType, FieldConfig> = {
  text: {
    type: 'text',
    label: 'テキスト',
    icon: PencilIcon,
    defaultPlaceholder: '入力してください',
    description: '1行テキストフィールド',
    supportsOptions: false,
    defaultValidation: ['required', 'minLength', 'maxLength', 'pattern'],
  },
  email: {
    type: 'email',
    label: 'メール',
    icon: EnvelopeIcon,
    defaultPlaceholder: 'example@email.com',
    description: 'メールアドレス入力',
    supportsOptions: false,
    defaultValidation: ['required', 'pattern'],
  },
  tel: {
    type: 'tel',
    label: '電話番号',
    icon: PhoneIcon,
    defaultPlaceholder: '000-0000-0000',
    description: '電話番号入力',
    supportsOptions: false,
    defaultValidation: ['required', 'pattern'],
  },
  number: {
    type: 'number',
    label: '数値',
    icon: HashtagIcon,
    defaultPlaceholder: '0',
    description: '数値入力',
    supportsOptions: false,
    defaultValidation: ['required', 'min', 'max'],
  },
  textarea: {
    type: 'textarea',
    label: 'テキストエリア',
    icon: DocumentTextIcon,
    defaultPlaceholder: '詳細を入力してください',
    description: '複数行テキストフィールド',
    supportsOptions: false,
    defaultValidation: ['required', 'minLength', 'maxLength'],
  },
  select: {
    type: 'select',
    label: 'セレクト',
    icon: ListBulletIcon,
    defaultPlaceholder: '選択してください',
    description: 'ドロップダウン選択',
    supportsOptions: true,
    defaultValidation: ['required'],
  },
  radio: {
    type: 'radio',
    label: 'ラジオボタン',
    icon: CheckCircleIcon,
    defaultPlaceholder: '',
    description: '単一選択',
    supportsOptions: true,
    defaultValidation: ['required'],
  },
  checkbox: {
    type: 'checkbox',
    label: 'チェックボックス',
    icon: Square3Stack3DIcon,
    defaultPlaceholder: '',
    description: '複数選択',
    supportsOptions: true,
    defaultValidation: ['required'],
  },
  date: {
    type: 'date',
    label: '日付',
    icon: CalendarIcon,
    defaultPlaceholder: 'YYYY-MM-DD',
    description: '日付選択',
    supportsOptions: false,
    defaultValidation: ['required'],
  },
  time: {
    type: 'time',
    label: '時刻',
    icon: ClockIcon,
    defaultPlaceholder: 'HH:MM',
    description: '時刻選択',
    supportsOptions: false,
    defaultValidation: ['required'],
  },
  file: {
    type: 'file',
    label: 'ファイル',
    icon: DocumentArrowUpIcon,
    defaultPlaceholder: '',
    description: 'ファイルアップロード',
    supportsOptions: false,
    defaultValidation: ['required'],
  },
};
