'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ServerIcon,
  CircleStackIcon,
  ClockIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'
import { getSystemInfo } from '@/app/actions/system'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import type { SystemInfo } from '@/types/system'

interface SystemInfoCardProps {
  systemInfo: SystemInfo
}

export function SystemInfoCard({ systemInfo: initialInfo }: SystemInfoCardProps) {
  const [systemInfo, setSystemInfo] = useState(initialInfo)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const newInfo = await getSystemInfo()
      setSystemInfo(newInfo)
      setLastRefresh(new Date())
    } catch (error) {
      console.error('Failed to refresh system info:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      handleRefresh()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const storagePercentage = (systemInfo.storage.used / systemInfo.storage.total) * 100

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">システム情報</h2>
          <p className="text-sm text-gray-600 mt-1">
            最終更新:{' '}
            {formatDistanceToNow(lastRefresh, { addSuffix: true, locale: ja })}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <ArrowPathIcon className={`h-5 w-5 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          更新
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ServerIcon className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">アプリケーション</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">バージョン</span>
                <Badge variant="outline">{systemInfo.version}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">ビルド日時</span>
                <span className="font-medium">
                  {new Date(systemInfo.buildDate).toLocaleDateString('ja-JP')}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">環境</span>
                <Badge variant={systemInfo.environment === 'production' ? 'default' : 'secondary'}>
                  {systemInfo.environment}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CircleStackIcon className="h-5 w-5 text-green-600" />
              <CardTitle className="text-lg">データベース</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">プロバイダー</span>
                <span className="font-medium">{systemInfo.database.provider}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">バージョン</span>
                <span className="font-medium">{systemInfo.database.version}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">接続状態</span>
                <Badge variant={systemInfo.database.status === 'connected' ? 'default' : 'destructive'}>
                  {systemInfo.database.status === 'connected' ? '接続中' : '切断'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CircleStackIcon className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-lg">ストレージ使用量</CardTitle>
          </div>
          <CardDescription>
            {formatBytes(systemInfo.storage.used)} / {formatBytes(systemInfo.storage.total)} 使用中
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">使用率</span>
              <span className="font-medium">{storagePercentage.toFixed(1)}%</span>
            </div>
            <Progress value={storagePercentage} />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-1">
              <p className="text-xs text-gray-600">ユーザーアセット</p>
              <p className="text-sm font-medium">
                {formatBytes(systemInfo.storage.breakdown.userAssets)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-600">メディアファイル</p>
              <p className="text-sm font-medium">
                {formatBytes(systemInfo.storage.breakdown.media)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-600">エクスポートデータ</p>
              <p className="text-sm font-medium">
                {formatBytes(systemInfo.storage.breakdown.exports)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-600">バックアップ</p>
              <p className="text-sm font-medium">
                {formatBytes(systemInfo.storage.breakdown.backups)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ClockIcon className="h-5 w-5 text-orange-600" />
            <CardTitle className="text-lg">システム統計</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {systemInfo.stats.totalUsers.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 mt-1">ユーザー数</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {systemInfo.stats.totalOrganizations.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 mt-1">組織数</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">
                {systemInfo.stats.totalMessages.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 mt-1">総メッセージ数</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">
                {systemInfo.stats.totalAPIRequests.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 mt-1">今日のAPI呼び出し</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {systemInfo.uptime && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">稼働時間</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {Math.floor(systemInfo.uptime / 86400)}日{' '}
              {Math.floor((systemInfo.uptime % 86400) / 3600)}時間{' '}
              {Math.floor((systemInfo.uptime % 3600) / 60)}分
            </p>
            <p className="text-sm text-gray-600 mt-2">
              最終再起動から経過した時間
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
