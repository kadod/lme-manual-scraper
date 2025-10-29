import { CrossAnalysisBuilder } from '@/components/analytics/CrossAnalysisBuilder'
import { performCrossAnalysis } from '@/app/actions/cross-analysis'
import { Squares2X2Icon } from '@heroicons/react/24/outline'

export const metadata = {
  title: 'クロス分析 | Analytics',
  description: 'データのクロス分析と可視化'
}

export default function CrossAnalysisPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Squares2X2Icon className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold">クロス分析</h1>
          </div>
          <p className="text-gray-600">
            複数の指標を組み合わせてデータの相関関係や傾向を分析します
          </p>
        </div>
      </div>

      {/* Analysis Builder */}
      <CrossAnalysisBuilder onAnalyze={performCrossAnalysis} />
    </div>
  )
}
