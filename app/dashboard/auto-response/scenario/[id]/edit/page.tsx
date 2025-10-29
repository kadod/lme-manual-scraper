'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
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
import { ScenarioNode, ScenarioEdge, Scenario } from '@/types/scenario'

export default function EditScenarioPage() {
  const router = useRouter()
  const params = useParams()
  const scenarioId = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [scenarioName, setScenarioName] = useState('')
  const [description, setDescription] = useState('')
  const [startKeyword, setStartKeyword] = useState('')
  const [timeoutMinutes, setTimeoutMinutes] = useState(30)
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadScenario()
  }, [scenarioId])

  const loadScenario = async () => {
    try {
      // TODO: Implement API call to fetch scenario
      // For now, use mock data
      await new Promise((resolve) => setTimeout(resolve, 500))

      const mockScenario: Scenario = {
        id: scenarioId,
        name: 'サンプルシナリオ',
        description: 'これはサンプルのシナリオです',
        startKeyword: 'スタート',
        timeoutMinutes: 30,
        nodes: [
          {
            id: 'start-1',
            type: 'start',
            position: { x: 250, y: 50 },
            data: { type: 'start' },
          },
          {
            id: 'message-1',
            type: 'message',
            position: { x: 250, y: 150 },
            data: {
              type: 'message',
              text: 'こんにちは！',
              delay: 0,
            },
          },
        ],
        edges: [
          {
            id: 'e1',
            source: 'start-1',
            target: 'message-1',
          },
        ],
        active: false,
      }

      setScenarioName(mockScenario.name)
      setDescription(mockScenario.description)
      setStartKeyword(mockScenario.startKeyword)
      setTimeoutMinutes(mockScenario.timeoutMinutes)
      setNodes(mockScenario.nodes as Node[])
      setEdges(mockScenario.edges as Edge[])
    } catch (error) {
      console.error('Error loading scenario:', error)
      alert('シナリオの読み込みに失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

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
        id: scenarioId,
        name: scenarioName,
        description,
        startKeyword,
        timeoutMinutes,
        nodes: scenarioNodes,
        edges: scenarioEdges,
        active: false,
      }

      // TODO: Implement API call to update scenario
      console.log('Updating scenario:', scenario)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      alert('シナリオを更新しました')
      router.push('/dashboard/auto-response')
    } catch (error) {
      console.error('Error updating scenario:', error)
      alert('更新に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    )
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
            <h1 className="text-3xl font-bold">シナリオ編集</h1>
            <p className="text-gray-600">シナリオの内容を編集します</p>
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
