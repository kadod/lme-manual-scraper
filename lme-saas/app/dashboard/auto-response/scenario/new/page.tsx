'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ScenarioFlowEditor } from '@/components/auto-response/ScenarioFlowEditor'
import { ScenarioSimulator } from '@/components/auto-response/ScenarioSimulator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline'
import { Node, Edge } from 'reactflow'
import { ScenarioNode, ScenarioEdge } from '@/types/scenario'

export default function NewScenarioPage() {
  const router = useRouter()
  const [scenarioName, setScenarioName] = useState('')
  const [description, setDescription] = useState('')
  const [startKeyword, setStartKeyword] = useState('')
  const [timeoutMinutes, setTimeoutMinutes] = useState(30)
  const [nodes, setNodes] = useState<Node[]>([
    {
      id: 'start-1',
      type: 'start',
      position: { x: 250, y: 50 },
      data: { type: 'start' },
    },
  ])
  const [edges, setEdges] = useState<Edge[]>([])
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!scenarioName.trim()) {
      alert('シナリオ名を入力してください')
      return
    }

    setIsSaving(true)

    try {
      // Convert React Flow nodes/edges to scenario format
      const scenarioNodes: ScenarioNode[] = nodes.map((node) => ({
        id: node.id,
        type: node.type as any,
        position: node.position,
        data: node.data,
      }))

      const scenarioEdges: ScenarioEdge[] = edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: typeof edge.label === 'string' ? edge.label : undefined,
      }))

      const scenario = {
        name: scenarioName,
        description,
        startKeyword,
        timeoutMinutes,
        nodes: scenarioNodes,
        edges: scenarioEdges,
        active: false,
      }

      // TODO: Implement API call to save scenario
      console.log('Saving scenario:', scenario)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      alert('シナリオを保存しました')
      router.push('/dashboard/auto-response')
    } catch (error) {
      console.error('Error saving scenario:', error)
      alert('保存に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeftIcon className="size-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">新規シナリオ作成</h1>
            <p className="text-gray-600">自動応答シナリオを作成します</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <CheckIcon className="size-4 mr-2" />
          {isSaving ? '保存中...' : '保存'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>基本設定</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">シナリオ名</Label>
              <Input
                id="name"
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
                placeholder="例: 新規会員登録フロー"
              />
            </div>
            <div>
              <Label htmlFor="keyword">開始キーワード</Label>
              <Input
                id="keyword"
                value={startKeyword}
                onChange={(e) => setStartKeyword(e.target.value)}
                placeholder="例: 登録"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="description">説明</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="シナリオの説明を入力"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="timeout">タイムアウト時間（分）</Label>
            <Input
              id="timeout"
              type="number"
              min="1"
              value={timeoutMinutes}
              onChange={(e) => setTimeoutMinutes(parseInt(e.target.value) || 30)}
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="editor" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="editor">フローエディター</TabsTrigger>
          <TabsTrigger value="simulator">シミュレーター</TabsTrigger>
        </TabsList>
        <TabsContent value="editor" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>シナリオフロー</CardTitle>
            </CardHeader>
            <CardContent>
              <ScenarioFlowEditor
                initialNodes={nodes}
                initialEdges={edges}
                onNodesChange={setNodes}
                onEdgesChange={setEdges}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="simulator" className="mt-4">
          <ScenarioSimulator
            nodes={nodes as ScenarioNode[]}
            edges={edges as ScenarioEdge[]}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
