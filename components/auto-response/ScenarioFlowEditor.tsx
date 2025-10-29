'use client'

import { useCallback, useState } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  NodeTypes,
  Panel,
} from 'reactflow'
import 'reactflow/dist/style.css'

import { StartNode } from './nodes/StartNode'
import { EndNode } from './nodes/EndNode'
import { MessageNode } from './nodes/MessageNode'
import { QuestionNode } from './nodes/QuestionNode'
import { BranchNode } from './nodes/BranchNode'
import { ActionNode } from './nodes/ActionNode'
import { NodeEditorDialog } from './NodeEditorDialog'
import { Button } from '@/components/ui/button'
import { ScenarioNodeData, NodeType } from '@/types/scenario'
import {
  PlusIcon,
  ChatBubbleBottomCenterTextIcon,
  QuestionMarkCircleIcon,
  ArrowPathIcon,
  BoltIcon,
  StopIcon,
} from '@heroicons/react/24/outline'

const nodeTypes: NodeTypes = {
  start: StartNode,
  end: EndNode,
  message: MessageNode,
  question: QuestionNode,
  branch: BranchNode,
  action: ActionNode,
}

interface ScenarioFlowEditorProps {
  initialNodes?: Node[]
  initialEdges?: Edge[]
  onNodesChange?: (nodes: Node[]) => void
  onEdgesChange?: (edges: Edge[]) => void
}

export function ScenarioFlowEditor({
  initialNodes = [],
  initialEdges = [],
  onNodesChange,
  onEdgesChange,
}: ScenarioFlowEditorProps) {
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(initialEdges)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => {
        const newEdges = addEdge(connection, eds)
        onEdgesChange?.(newEdges)
        return newEdges
      })
    },
    [setEdges, onEdgesChange]
  )

  const addNode = useCallback(
    (type: NodeType) => {
      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position: {
          x: Math.random() * 300 + 100,
          y: Math.random() * 300 + 100,
        },
        data: getDefaultNodeData(type),
      }

      setNodes((nds) => {
        const updated = [...nds, newNode]
        onNodesChange?.(updated)
        return updated
      })
    },
    [setNodes, onNodesChange]
  )

  const handleNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    if (node.type !== 'start' && node.type !== 'end') {
      setSelectedNode(node)
      setEditorOpen(true)
    }
  }, [])

  const handleNodeSave = useCallback(
    (data: ScenarioNodeData) => {
      if (!selectedNode) return

      setNodes((nds) => {
        const updated = nds.map((node) =>
          node.id === selectedNode.id ? { ...node, data } : node
        )
        onNodesChange?.(updated)
        return updated
      })
      setSelectedNode(null)
    },
    [selectedNode, setNodes, onNodesChange]
  )

  return (
    <div className="h-[600px] border rounded-lg bg-gray-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={(changes) => {
          onNodesChangeInternal(changes)
          onNodesChange?.(nodes)
        }}
        onEdgesChange={(changes) => {
          onEdgesChangeInternal(changes)
          onEdgesChange?.(edges)
        }}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
        <Panel position="top-left" className="bg-white p-2 rounded-lg shadow-md space-y-2">
          <div className="font-semibold text-sm mb-2">ノード追加</div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addNode('message')}
            className="w-full justify-start"
          >
            <ChatBubbleBottomCenterTextIcon className="size-4 mr-2" />
            メッセージ
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addNode('question')}
            className="w-full justify-start"
          >
            <QuestionMarkCircleIcon className="size-4 mr-2" />
            質問
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addNode('branch')}
            className="w-full justify-start"
          >
            <ArrowPathIcon className="size-4 mr-2" />
            分岐
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addNode('action')}
            className="w-full justify-start"
          >
            <BoltIcon className="size-4 mr-2" />
            アクション
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addNode('end')}
            className="w-full justify-start"
          >
            <StopIcon className="size-4 mr-2" />
            終了
          </Button>
        </Panel>
      </ReactFlow>

      <NodeEditorDialog
        open={editorOpen}
        onClose={() => {
          setEditorOpen(false)
          setSelectedNode(null)
        }}
        nodeData={selectedNode?.data || null}
        onSave={handleNodeSave}
      />
    </div>
  )
}

function getDefaultNodeData(type: NodeType): ScenarioNodeData {
  switch (type) {
    case 'start':
      return { type: 'start' }
    case 'message':
      return { type: 'message', text: '', delay: 0 }
    case 'question':
      return {
        type: 'question',
        questionText: '',
        answerType: 'free_text',
        timeoutMinutes: 5,
      }
    case 'branch':
      return { type: 'branch', conditions: [], defaultBranch: false }
    case 'action':
      return { type: 'action', actions: [] }
    case 'end':
      return { type: 'end' }
    default:
      return { type: 'start' }
  }
}
