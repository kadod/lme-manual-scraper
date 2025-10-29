'use client'

import { useCallback, useMemo } from 'react'
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Card } from '@/components/ui/card'
import { CampaignStep } from './StepBuilder'

interface CampaignFlowChartProps {
  steps: CampaignStep[]
  triggerType: string
}

const triggerLabels: Record<string, string> = {
  friend_add: '友だち追加',
  tag_add: 'タグ追加',
  form_submit: 'フォーム送信',
  manual: '手動登録',
}

export function CampaignFlowChart({ steps, triggerType }: CampaignFlowChartProps) {
  const createNodes = useCallback((): Node[] => {
    const nodes: Node[] = []

    // Start node (trigger)
    nodes.push({
      id: 'trigger',
      type: 'input',
      data: {
        label: (
          <div className="text-center">
            <div className="font-bold">トリガー</div>
            <div className="text-sm">{triggerLabels[triggerType] || triggerType}</div>
          </div>
        )
      },
      position: { x: 250, y: 0 },
      style: {
        background: '#3b82f6',
        color: 'white',
        border: '2px solid #2563eb',
        borderRadius: '8px',
        padding: '10px 20px',
        fontSize: '14px',
      },
    })

    // Step nodes
    steps.forEach((step, index) => {
      const delayUnit = step.delay_unit === 'minutes' ? '分' : step.delay_unit === 'hours' ? '時間' : '日'
      const delayLabel = index === 0 ? '即座' : `${step.delay_value}${delayUnit}後`

      nodes.push({
        id: step.id,
        data: {
          label: (
            <div className="text-center">
              <div className="font-bold">{step.name}</div>
              <div className="text-xs text-muted-foreground mt-1">{delayLabel}</div>
              <div className="text-xs mt-1">
                {step.message_type === 'text' ? 'テキスト' : step.message_type}
              </div>
            </div>
          )
        },
        position: { x: 250, y: 150 + index * 150 },
        style: {
          background: 'white',
          border: '2px solid #e5e7eb',
          borderRadius: '8px',
          padding: '10px 20px',
          fontSize: '13px',
          minWidth: '200px',
        },
      })
    })

    // End node
    if (steps.length > 0) {
      nodes.push({
        id: 'end',
        type: 'output',
        data: {
          label: (
            <div className="text-center">
              <div className="font-bold">完了</div>
            </div>
          )
        },
        position: { x: 250, y: 150 + steps.length * 150 },
        style: {
          background: '#10b981',
          color: 'white',
          border: '2px solid #059669',
          borderRadius: '8px',
          padding: '10px 20px',
          fontSize: '14px',
        },
      })
    }

    return nodes
  }, [steps, triggerType])

  const createEdges = useCallback((): Edge[] => {
    const edges: Edge[] = []

    // Edge from trigger to first step
    if (steps.length > 0) {
      edges.push({
        id: 'trigger-to-first',
        source: 'trigger',
        target: steps[0].id,
        type: 'smoothstep',
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
      })
    }

    // Edges between steps
    steps.forEach((step, index) => {
      if (index < steps.length - 1) {
        edges.push({
          id: `${step.id}-to-${steps[index + 1].id}`,
          source: step.id,
          target: steps[index + 1].id,
          type: 'smoothstep',
          animated: true,
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
        })
      }
    })

    // Edge from last step to end
    if (steps.length > 0) {
      edges.push({
        id: 'last-to-end',
        source: steps[steps.length - 1].id,
        target: 'end',
        type: 'smoothstep',
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
      })
    }

    return edges
  }, [steps])

  const nodes = useMemo(() => createNodes(), [createNodes])
  const edges = useMemo(() => createEdges(), [createEdges])

  const [nodesState, , onNodesChange] = useNodesState(nodes)
  const [edgesState, , onEdgesChange] = useEdgesState(edges)

  if (steps.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center text-muted-foreground">
          <p>ステップを追加すると、フローチャートが表示されます</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-0 overflow-hidden" style={{ height: '500px' }}>
      <ReactFlow
        nodes={nodesState}
        edges={edgesState}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        attributionPosition="bottom-left"
      >
        <Background />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            if (node.type === 'input') return '#3b82f6'
            if (node.type === 'output') return '#10b981'
            return '#e5e7eb'
          }}
          nodeStrokeWidth={3}
          zoomable
          pannable
        />
      </ReactFlow>
    </Card>
  )
}
