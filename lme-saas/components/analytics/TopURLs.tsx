'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { LinkIcon } from '@heroicons/react/24/outline'

interface TopURL {
  id: string
  original_url: string
  short_code: string
  click_count: number
  unique_click_count: number
  created_at: string
}

interface TopURLsProps {
  urls: TopURL[]
}

function truncateURL(url: string, maxLength: number = 40): string {
  if (url.length <= maxLength) return url
  return url.substring(0, maxLength) + '...'
}

export function TopURLs({ urls }: TopURLsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>人気URL TOP5</CardTitle>
        <CardDescription>クリック数の多いURL</CardDescription>
      </CardHeader>
      <CardContent>
        {urls.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            データがありません
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>URL</TableHead>
                <TableHead className="text-right">総クリック数</TableHead>
                <TableHead className="text-right">ユニーククリック</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {urls.map((url, index) => (
                <TableRow key={url.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                        {index + 1}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                          <LinkIcon className="h-3 w-3 text-gray-400" />
                          <span className="text-sm font-medium">
                            {truncateURL(url.original_url)}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          /{url.short_code}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      {url.click_count.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      {url.unique_click_count.toLocaleString()}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
