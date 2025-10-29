'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DataExportForm } from '@/components/settings/DataExportForm'
import { DataImportForm } from '@/components/settings/DataImportForm'
import { APIKeysList } from '@/components/settings/APIKeysList'
import { AuditLogsTable } from '@/components/settings/AuditLogsTable'
import { SystemInfoCard } from '@/components/settings/SystemInfoCard'
import type { APIKey, AuditLog, SystemInfo } from '@/types/system'

interface SystemUtilitiesClientProps {
  apiKeys: APIKey[]
  initialLogs: {
    logs: AuditLog[]
    total: number
    page: number
    limit: number
  }
  systemInfo: SystemInfo
}

export function SystemUtilitiesClient({
  apiKeys,
  initialLogs,
  systemInfo,
}: SystemUtilitiesClientProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">システムユーティリティ</h1>
        <p className="text-gray-600 mt-2">
          データのエクスポート/インポート、APIキー管理、監査ログの確認を行えます
        </p>
      </div>

      <Tabs defaultValue="export" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="export">エクスポート</TabsTrigger>
          <TabsTrigger value="import">インポート</TabsTrigger>
          <TabsTrigger value="api-keys">APIキー</TabsTrigger>
          <TabsTrigger value="audit-logs">監査ログ</TabsTrigger>
          <TabsTrigger value="system-info">システム情報</TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>データエクスポート</CardTitle>
              <CardDescription>
                選択したデータを指定の形式でエクスポートします
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataExportForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>データインポート</CardTitle>
              <CardDescription>
                CSVまたはJSONファイルからデータをインポートします
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataImportForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api-keys" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>APIキー管理</CardTitle>
              <CardDescription>
                外部アプリケーションからのアクセスに使用するAPIキーを管理します
              </CardDescription>
            </CardHeader>
            <CardContent>
              <APIKeysList apiKeys={apiKeys} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit-logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>監査ログ</CardTitle>
              <CardDescription>
                システム内のすべてのアクションが記録されています
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AuditLogsTable initialLogs={initialLogs} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system-info" className="space-y-6">
          <SystemInfoCard systemInfo={systemInfo} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
