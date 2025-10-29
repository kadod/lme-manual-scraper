export type NodeType = 'start' | 'message' | 'question' | 'branch' | 'action' | 'end'

export type AnswerType = 'free_text' | 'single_choice' | 'multiple_choice'

export interface MessageNodeData {
  type: 'message'
  text: string
  richMessageId?: string
  delay: number // seconds
}

export interface QuestionNodeData {
  type: 'question'
  questionText: string
  answerType: AnswerType
  choices?: string[]
  timeoutMinutes: number
  timeoutAction?: 'end' | 'continue'
}

export interface BranchCondition {
  id: string
  type: 'keyword' | 'numeric_range' | 'custom_field'
  field?: string
  keywords?: string[]
  minValue?: number
  maxValue?: number
  customFieldKey?: string
  customFieldValue?: string
}

export interface BranchNodeData {
  type: 'branch'
  conditions: BranchCondition[]
  defaultBranch: boolean
}

export type ActionType = 'add_tag' | 'remove_tag' | 'add_segment' | 'remove_segment' | 'update_field' | 'start_step'

export interface ActionNodeData {
  type: 'action'
  actions: Array<{
    id: string
    actionType: ActionType
    tagId?: string
    segmentId?: string
    fieldKey?: string
    fieldValue?: string
    stepId?: string
  }>
}

export interface StartNodeData {
  type: 'start'
}

export interface EndNodeData {
  type: 'end'
}

export type ScenarioNodeData =
  | StartNodeData
  | MessageNodeData
  | QuestionNodeData
  | BranchNodeData
  | ActionNodeData
  | EndNodeData

export interface ScenarioNode {
  id: string
  type: NodeType
  position: { x: number; y: number }
  data: ScenarioNodeData
}

export interface ScenarioEdge {
  id: string
  source: string
  target: string
  label?: string
}

export interface Scenario {
  id?: string
  name: string
  description: string
  startKeyword: string
  timeoutMinutes: number
  nodes: ScenarioNode[]
  edges: ScenarioEdge[]
  active: boolean
  createdAt?: string
  updatedAt?: string
}
