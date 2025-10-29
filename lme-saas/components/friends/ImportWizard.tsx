'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
} from '@heroicons/react/24/outline'
import { FileUploader } from './FileUploader'
import { ColumnMapper } from './ColumnMapper'
import { ImportPreview } from './ImportPreview'
import { ImportProgress } from './ImportProgress'
import { parseCSV, detectColumns, suggestColumnMapping } from '@/lib/csv-parser'
import { validateImportData, importFriends } from '@/app/actions/import'
import { ImportStep, CSVColumn, ColumnMapping, ImportPreviewRow, ImportResult } from '@/types/import'

interface ImportWizardProps {
  organizationId: string
  channelId: string
}

const STEPS: { id: ImportStep; label: string; description: string }[] = [
  { id: 'upload', label: 'ファイルアップロード', description: 'CSVファイルを選択' },
  { id: 'mapping', label: 'カラムマッピング', description: '列の対応付け' },
  { id: 'preview', label: 'プレビュー', description: 'データ確認' },
  { id: 'import', label: 'インポート', description: 'データ取込' },
  { id: 'complete', label: '完了', description: 'インポート完了' },
]

export function ImportWizard({ organizationId, channelId }: ImportWizardProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<ImportStep>('upload')
  const [fileName, setFileName] = useState<string>('')
  const [csvData, setCsvData] = useState<string[][] | null>(null)
  const [columns, setColumns] = useState<CSVColumn[]>([])
  const [mapping, setMapping] = useState<ColumnMapping>({})
  const [previewData, setPreviewData] = useState<ImportPreviewRow[]>([])
  const [errorCount, setErrorCount] = useState(0)
  const [isImporting, setIsImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)

  const handleFileSelect = useCallback(
    async (file: File, content: string) => {
      try {
        setFileName(file.name)

        // Parse CSV
        const parsed = parseCSV(content)
        if (parsed.length < 2) {
          alert('CSVファイルにデータが含まれていません')
          return
        }

        setCsvData(parsed)

        // Detect columns
        const detectedColumns = detectColumns(parsed)
        setColumns(detectedColumns)

        // Suggest mapping
        const suggestedMapping = suggestColumnMapping(detectedColumns)
        setMapping(suggestedMapping)

        // Move to next step
        setCurrentStep('mapping')
      } catch (error) {
        console.error('CSV parse error:', error)
        alert('CSVファイルの解析に失敗しました')
      }
    },
    []
  )

  const handleMappingChange = useCallback((newMapping: ColumnMapping) => {
    setMapping(newMapping)
  }, [])

  const handleNextFromMapping = useCallback(async () => {
    if (!csvData) return

    // Validate required fields
    if (mapping.line_user_id === undefined || mapping.display_name === undefined) {
      alert('LINE User IDと表示名のマッピングは必須です')
      return
    }

    try {
      // Validate data
      const { previewData: preview, validationErrors } = await validateImportData(
        csvData,
        mapping
      )

      setPreviewData(preview)
      setErrorCount(validationErrors.length)
      setCurrentStep('preview')
    } catch (error) {
      console.error('Validation error:', error)
      alert('データの検証中にエラーが発生しました')
    }
  }, [csvData, mapping])

  const handleStartImport = useCallback(async () => {
    if (!csvData) return

    setCurrentStep('import')
    setIsImporting(true)
    setImportProgress(0)

    try {
      // Simulate progress (actual import is in batches)
      const progressInterval = setInterval(() => {
        setImportProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval)
            return 95
          }
          return prev + 5
        })
      }, 200)

      // Execute import
      const result = await importFriends(csvData, mapping, organizationId, channelId)

      clearInterval(progressInterval)
      setImportProgress(100)
      setImportResult(result)
      setIsImporting(false)
      setCurrentStep('complete')
    } catch (error) {
      console.error('Import error:', error)
      setIsImporting(false)
      alert('インポート中にエラーが発生しました')
    }
  }, [csvData, mapping, organizationId, channelId])

  const handleComplete = useCallback(() => {
    router.push('/dashboard/friends')
    router.refresh()
  }, [router])

  const handleRetry = useCallback(() => {
    setCurrentStep('upload')
    setCsvData(null)
    setColumns([])
    setMapping({})
    setPreviewData([])
    setErrorCount(0)
    setImportResult(null)
    setImportProgress(0)
  }, [])

  const handleBack = useCallback(() => {
    const stepIndex = STEPS.findIndex((s) => s.id === currentStep)
    if (stepIndex > 0) {
      setCurrentStep(STEPS[stepIndex - 1].id)
    }
  }, [currentStep])

  const canProceed = () => {
    switch (currentStep) {
      case 'upload':
        return csvData !== null
      case 'mapping':
        return mapping.line_user_id !== undefined && mapping.display_name !== undefined
      case 'preview':
        return errorCount === 0 || csvData !== null
      default:
        return false
    }
  }

  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep)

  return (
    <div className="space-y-6">
      {/* Stepper */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                      index < currentStepIndex
                        ? 'border-green-500 bg-green-500 text-white'
                        : index === currentStepIndex
                        ? 'border-blue-500 bg-blue-500 text-white'
                        : 'border-gray-300 bg-white text-gray-400'
                    }`}
                  >
                    {index < currentStepIndex ? (
                      <CheckIcon className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-semibold">{index + 1}</span>
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <p
                      className={`text-sm font-medium ${
                        index <= currentStepIndex
                          ? 'text-gray-900'
                          : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`mx-4 h-0.5 w-16 transition-colors ${
                      index < currentStepIndex ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <div className="min-h-[400px]">
        {currentStep === 'upload' && (
          <FileUploader onFileSelect={handleFileSelect} />
        )}

        {currentStep === 'mapping' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">カラムマッピング</h3>
                <p className="text-sm text-muted-foreground">
                  ファイル: {fileName} ({csvData?.length ? csvData.length - 1 : 0}行)
                </p>
              </div>
            </div>
            <ColumnMapper
              columns={columns}
              mapping={mapping}
              onMappingChange={handleMappingChange}
            />
          </div>
        )}

        {currentStep === 'preview' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">データプレビュー</h3>
                <p className="text-sm text-muted-foreground">
                  インポート前の最終確認
                </p>
              </div>
              {errorCount === 0 && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  全てのデータが有効です
                </Badge>
              )}
            </div>
            <ImportPreview
              previewData={previewData}
              totalRows={csvData ? csvData.length - 1 : 0}
              errorCount={errorCount}
            />
          </div>
        )}

        {(currentStep === 'import' || currentStep === 'complete') && (
          <ImportProgress
            isImporting={isImporting}
            progress={importProgress}
            result={importResult}
            onRetry={handleRetry}
            onComplete={handleComplete}
          />
        )}
      </div>

      {/* Navigation */}
      {currentStep !== 'complete' && currentStep !== 'import' && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 'upload'}
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            戻る
          </Button>

          {currentStep === 'preview' ? (
            <Button
              onClick={handleStartImport}
              disabled={!canProceed()}
              size="lg"
              className="min-w-[200px]"
            >
              インポート開始
              <ArrowRightIcon className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={currentStep === 'mapping' ? handleNextFromMapping : undefined}
              disabled={!canProceed()}
            >
              次へ
              <ArrowRightIcon className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
