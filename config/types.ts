/**
 * KonaI-Agent 자동화 타입 정의
 */

export type InteractionAction = 'click' | 'type' | 'hover' | 'wait' | 'scroll' | 'select' | 'clear';

export interface Interaction {
  action: InteractionAction;
  selector?: string;
  value?: string;
  duration?: number;
  x?: number;
  y?: number;
}

export interface StateConfig {
  stateId: string;
  stateName: string;
  description?: string;
  waitFor?: string;
  waitForAfter?: string; // interactions 실행 후 대기할 선택자
  delay?: number;
  interactions?: Interaction[];
  injectState?: Record<string, unknown>;
}

export interface ScreenConfig {
  id: string;
  name: string;
  nameEn: string;
  route: string;
  component: string;
  requiresAuth?: boolean;
  states: StateConfig[];
}

export interface AuthConfig {
  email: string;
  password: string;
}

export interface WaitDefaults {
  networkIdle: number;
  afterInteraction: number;
  afterNavigation: number;
}

export interface ScreenStatesConfig {
  version: string;
  screens: ScreenConfig[];
  defaultAuth: AuthConfig;
  waitDefaults: WaitDefaults;
}

export interface CaptureResult {
  screenId: string;
  stateId: string;
  screenshotPath: string;
  capturedAt: string;
  viewport: { width: number; height: number };
  locale: string;
  success: boolean;
  error?: string;
}

export interface CaptureManifest {
  version: string;
  generatedAt: string;
  locale: string;
  totalScreens: number;
  totalStates: number;
  results: CaptureResult[];
}

export interface SpecHeader {
  screenId: string;
  screenName?: string;
  version: string;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface RelatedScreen {
  screenId: string;
  screenName: string;
  relationship?: 'parent' | 'child' | 'sibling' | 'popup' | 'link';
}

export interface SpecOverview {
  description: string;
  accessPath: string;
  relatedScreens: RelatedScreen[];
  businessRules?: string;
}

export interface LayoutArea {
  areaId: string;
  areaName: string;
  type: 'header' | 'search' | 'grid' | 'form' | 'button' | 'tab' | 'tree' | 'chart' | 'custom';
  description?: string;
  order?: number;
}

export interface SpecLayout {
  screenshotPath: string;
  areas: LayoutArea[];
}

export interface ScreenSpec {
  header: SpecHeader;
  overview: SpecOverview;
  layout: SpecLayout;
  inputFields: InputField[];
  buttons: ButtonSpec[];
  gridColumns: GridColumn[];
  events: EventSpec[];
  messages: MessageSpec[];
  changeHistory: ChangeHistoryEntry[];
}

export interface ValidationRule {
  pattern?: string;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  message?: string;
  customRule?: string;
}

export interface InputField {
  fieldId?: string;
  fieldName: string;
  fieldNameEn: string;
  dataType: 'string' | 'number' | 'integer' | 'date' | 'datetime' | 'time' | 'boolean' | 'select' | 'multiselect' | 'file' | 'textarea';
  length: number;
  required: boolean;
  defaultValue: unknown;
  validation: ValidationRule;
  placeholder?: string;
  selectOptions?: Array<{ value: string; label: string }>;
  areaId?: string;
  order?: number;
  remarks?: string;
}

export interface ButtonSpec {
  buttonId?: string;
  buttonName: string;
  eventType: 'click' | 'submit' | 'reset' | 'link';
  action: string;
  permissions: string[];
  apiEndpoint?: string;
  httpMethod?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  confirmMessage?: string;
  successMessage?: string;
  areaId?: string;
  order?: number;
}

export interface GridColumn {
  columnId?: string;
  columnName: string;
  columnNameEn: string;
  dataType: 'string' | 'number' | 'integer' | 'date' | 'datetime' | 'boolean' | 'link' | 'button' | 'checkbox' | 'image';
  align: 'left' | 'center' | 'right';
  remarks: string;
  width?: number;
  minWidth?: number;
  sortable?: boolean;
  filterable?: boolean;
  editable?: boolean;
  hidden?: boolean;
  format?: string;
  renderer?: string;
  order?: number;
}

export interface EventSpec {
  eventId: string;
  eventName: string;
  triggerType: 'onClick' | 'onChange' | 'onFocus' | 'onBlur' | 'onLoad' | 'onSubmit' | 'onSelect' | 'onRowClick' | 'onRowDblClick' | 'onCellEdit' | 'onKeyDown' | 'onKeyUp' | 'custom';
  targetId?: string;
  targetType?: 'field' | 'button' | 'grid' | 'row' | 'cell' | 'screen';
  handler: string;
  sequence?: number;
  condition?: string;
  relatedEvents?: string[];
}

export interface MessageSpec {
  messageId: string;
  messageType: 'info' | 'success' | 'warning' | 'error' | 'confirm';
  messageText: string;
  useCase?: string;
  parameters?: string[];
}

export interface ChangeHistoryEntry {
  version: string;
  changedAt: string;
  changedBy: string;
  changeType: 'create' | 'update' | 'delete' | 'refactor';
  description: string;
  affectedItems?: string[];
}
