'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { PlayIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import { ScenarioNode, ScenarioEdge } from '@/types/scenario'

interface Message {
  id: string
  type: 'bot' | 'user'
  text: string
  timestamp: Date
}

interface ScenarioSimulatorProps {
  nodes: ScenarioNode[]
  edges: ScenarioEdge[]
}

export function ScenarioSimulator({ nodes, edges }: ScenarioSimulatorProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [userInput, setUserInput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null)

  const startSimulation = () => {
    setMessages([])
    setIsRunning(true)

    // Find start node
    const startNode = nodes.find((n) => n.type === 'start')
    if (!startNode) {
      addBotMessage('エラー: 開始ノードが見つかりません')
      return
    }

    processNode(startNode.id)
  }

  const processNode = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId)
    if (!node) return

    setCurrentNodeId(nodeId)

    switch (node.data.type) {
      case 'start':
        // Move to next node
        const nextEdge = edges.find((e) => e.source === nodeId)
        if (nextEdge) {
          setTimeout(() => processNode(nextEdge.target), 500)
        }
        break

      case 'message':
        if (node.data.type === 'message' && node.data.text) {
          setTimeout(() => {
            if (node.data.type === 'message') {
              addBotMessage(node.data.text)
            }
            // Move to next node
            const nextEdge = edges.find((e) => e.source === nodeId)
            if (nextEdge) {
              setTimeout(() => processNode(nextEdge.target), 1000)
            }
          }, (node.data.type === 'message' ? node.data.delay || 0 : 0) * 1000)
        }
        break

      case 'question':
        if (node.data.type === 'question') {
          addBotMessage(node.data.questionText)
        }
        // Wait for user input
        break

      case 'action':
        if (node.data.type === 'action') {
          const actionText = node.data.actions
            .map((a) => `[アクション実行: ${a.actionType}]`)
            .join('\n')
          addBotMessage(actionText)
        }
        // Move to next node
        const actionNextEdge = edges.find((e) => e.source === nodeId)
        if (actionNextEdge) {
          setTimeout(() => processNode(actionNextEdge.target), 1000)
        }
        break

      case 'end':
        addBotMessage('[シナリオ終了]')
        setIsRunning(false)
        setCurrentNodeId(null)
        break
    }
  }

  const handleUserInput = () => {
    if (!userInput.trim() || !currentNodeId) return

    addUserMessage(userInput)
    setUserInput('')

    // Find next node based on current question/branch node
    const nextEdge = edges.find((e) => e.source === currentNodeId)
    if (nextEdge) {
      setTimeout(() => processNode(nextEdge.target), 500)
    }
  }

  const addBotMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        type: 'bot',
        text,
        timestamp: new Date(),
      },
    ])
  }

  const addUserMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        type: 'user',
        text,
        timestamp: new Date(),
      },
    ])
  }

  const reset = () => {
    setMessages([])
    setIsRunning(false)
    setCurrentNodeId(null)
    setUserInput('')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>シナリオシミュレーター</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={startSimulation} disabled={isRunning}>
              <PlayIcon className="size-4 mr-2" />
              シミュレーション開始
            </Button>
            <Button variant="outline" onClick={reset}>
              <ArrowPathIcon className="size-4 mr-2" />
              リセット
            </Button>
          </div>

          <ScrollArea className="h-[400px] border rounded-lg p-4 bg-gray-50">
            <div className="space-y-3">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  シミュレーションを開始してください
                </div>
              )}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      message.type === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white border'
                    }`}
                  >
                    <div className="text-sm whitespace-pre-wrap">{message.text}</div>
                    <div
                      className={`text-xs mt-1 ${
                        message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString('ja-JP')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {isRunning && currentNodeId && (
            <div className="flex gap-2">
              <Input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUserInput()}
                placeholder="返信を入力..."
                disabled={!isRunning}
              />
              <Button onClick={handleUserInput} disabled={!userInput.trim()}>
                送信
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
