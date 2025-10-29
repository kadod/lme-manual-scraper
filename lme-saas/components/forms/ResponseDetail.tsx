'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ResponseDetailProps {
  response: {
    id: string
    answers: Record<string, any>
    submitted_at: string
    friend?: {
      id: string
      display_name: string
      picture_url: string | null
      line_user_id: string
      status_message?: string | null
    }
    form?: {
      id: string
      title: string
      questions: any[]
    }
  }
}

export function ResponseDetail({ response }: ResponseDetailProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date)
  }

  const renderAnswer = (question: any, answer: any) => {
    if (!answer) {
      return <span className="text-muted-foreground">回答なし</span>
    }

    if (Array.isArray(answer)) {
      return (
        <div className="flex flex-wrap gap-2">
          {answer.map((item, index) => (
            <Badge key={index} variant="secondary">
              {String(item)}
            </Badge>
          ))}
        </div>
      )
    }

    if (typeof answer === 'object') {
      return (
        <pre className="rounded-md bg-muted p-3 text-sm">
          {JSON.stringify(answer, null, 2)}
        </pre>
      )
    }

    if (question.type === 'file' && typeof answer === 'string') {
      return (
        <a
          href={answer}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          添付ファイルを開く
        </a>
      )
    }

    return <p className="whitespace-pre-wrap">{String(answer)}</p>
  }

  return (
    <div className="space-y-6">
      {/* Respondent Info */}
      <Card>
        <CardHeader>
          <CardTitle>回答者情報</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={response.friend?.picture_url || undefined} />
              <AvatarFallback className="text-lg">
                {response.friend?.display_name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">名前</p>
                <p className="font-medium">
                  {response.friend?.display_name || 'Unknown'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">LINE User ID</p>
                <p className="font-mono text-sm">
                  {response.friend?.line_user_id || 'N/A'}
                </p>
              </div>
              {response.friend?.status_message && (
                <div>
                  <p className="text-sm text-muted-foreground">ステータスメッセージ</p>
                  <p className="text-sm">{response.friend.status_message}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">回答日時</p>
                <p className="text-sm">{formatDate(response.submitted_at)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Answers */}
      <Card>
        <CardHeader>
          <CardTitle>回答内容</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {response.form?.questions && response.form.questions.length > 0 ? (
              response.form.questions.map((question: any, index: number) => (
                <div key={question.id || index} className="border-b pb-4 last:border-b-0 last:pb-0">
                  <div className="mb-2">
                    <p className="font-medium">
                      {question.title || question.label || `質問 ${index + 1}`}
                    </p>
                    {question.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {question.description}
                      </p>
                    )}
                    <Badge variant="outline" className="mt-2">
                      {question.type || 'text'}
                    </Badge>
                  </div>
                  <div className="mt-3">
                    {renderAnswer(question, response.answers[question.id])}
                  </div>
                </div>
              ))
            ) : (
              <div className="space-y-4">
                {Object.entries(response.answers).map(([key, value]) => (
                  <div key={key} className="border-b pb-4 last:border-b-0 last:pb-0">
                    <p className="font-medium mb-2">{key}</p>
                    <div>{renderAnswer({}, value)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Response Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>回答メタデータ</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-muted-foreground">Response ID</dt>
              <dd className="font-mono mt-1">{response.id}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Form ID</dt>
              <dd className="font-mono mt-1">{response.form?.id || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Friend ID</dt>
              <dd className="font-mono mt-1">{response.friend?.id || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">回答日時</dt>
              <dd className="mt-1">{formatDate(response.submitted_at)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}
