'use client'

import { useEffect, useRef, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import cloud from 'd3-cloud'

interface Word {
  text: string
  value: number
}

interface WordCloudProps {
  words: Word[]
  fieldLabel: string
}

export function WordCloud({ words, fieldLabel }: WordCloudProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 })

  useEffect(() => {
    // Update dimensions based on container size
    if (containerRef.current) {
      const { width } = containerRef.current.getBoundingClientRect()
      setDimensions({ width, height: Math.max(400, width * 0.6) })
    }
  }, [])

  useEffect(() => {
    if (!svgRef.current || words.length === 0) return

    const svg = svgRef.current
    const { width, height } = dimensions

    // Clear previous content
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild)
    }

    // Calculate font sizes
    const maxValue = Math.max(...words.map(w => w.value))
    const minValue = Math.min(...words.map(w => w.value))
    const fontSizeScale = (value: number) => {
      const normalized = (value - minValue) / (maxValue - minValue || 1)
      return 12 + normalized * 48 // Font size range: 12-60
    }

    // Generate word cloud layout
    const layout = cloud()
      .size([width, height])
      .words(
        words.map(w => ({
          text: w.text,
          size: fontSizeScale(w.value),
          value: w.value
        }))
      )
      .padding(5)
      .rotate(() => (Math.random() > 0.5 ? 0 : 90))
      .font('Inter, system-ui, sans-serif')
      .fontSize(d => d.size!)
      .on('end', draw)

    layout.start()

    function draw(words: any[]) {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      g.setAttribute('transform', `translate(${width / 2},${height / 2})`)

      words.forEach(word => {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
        text.setAttribute('text-anchor', 'middle')
        text.setAttribute(
          'transform',
          `translate(${word.x},${word.y})rotate(${word.rotate})`
        )
        text.setAttribute('font-size', String(word.size))
        text.setAttribute('font-family', 'Inter, system-ui, sans-serif')
        text.setAttribute('font-weight', '600')

        // Color based on frequency
        const opacity = 0.4 + (word.value / maxValue) * 0.6
        text.setAttribute('fill', `rgba(59, 130, 246, ${opacity})`)

        text.textContent = word.text

        // Add hover effect
        text.style.cursor = 'pointer'
        text.style.transition = 'all 0.2s ease'

        text.addEventListener('mouseenter', () => {
          text.setAttribute('fill', '#1D4ED8')
          text.setAttribute('font-size', String(word.size * 1.1))
        })

        text.addEventListener('mouseleave', () => {
          text.setAttribute('fill', `rgba(59, 130, 246, ${opacity})`)
          text.setAttribute('font-size', String(word.size))
        })

        // Add title for tooltip
        const title = document.createElementNS('http://www.w3.org/2000/svg', 'title')
        title.textContent = `${word.text}: ${word.value}回`
        text.appendChild(title)

        g.appendChild(text)
      })

      svg.appendChild(g)
    }
  }, [words, dimensions])

  if (words.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{fieldLabel} - ワードクラウド</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-gray-500">
            テキスト回答がまだありません
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{fieldLabel} - ワードクラウド</CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={containerRef} className="w-full">
          <svg
            ref={svgRef}
            width={dimensions.width}
            height={dimensions.height}
            className="w-full h-auto"
          />
        </div>
        <div className="mt-4 text-sm text-gray-600">
          頻出単語トップ10
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {words.slice(0, 10).map((word, index) => (
            <div
              key={index}
              className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg"
            >
              <span className="font-medium">{word.text}</span>
              <span className="text-blue-600 font-bold">{word.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
