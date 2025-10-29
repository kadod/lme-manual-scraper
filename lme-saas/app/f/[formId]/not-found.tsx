import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center py-8 px-4">
      <Card className="max-w-lg w-full shadow-lg">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-center text-2xl">
            フォームが見つかりません
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            このフォームは削除されたか、現在公開されていません。
          </p>
          <p className="text-sm text-muted-foreground">
            フォームの管理者にお問い合わせください。
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
