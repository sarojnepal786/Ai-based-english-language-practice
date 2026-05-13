import pg from 'pg'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

const { Pool } = pg

const createDbPool = () =>
  new Pool({
    host: process.env.PGHOST || 'localhost',
    port: Number(process.env.PGPORT || 5433),
    user: process.env.PGUSER || 'ielts123',
    password: process.env.PGPASSWORD || 'ielts123',
    database: process.env.PGDATABASE || 'ieltsdb'
  })

type PdfRow = {
  id: number
  file_name: string
  file_path: string
  extracted_text: string | null
  file_size_bytes: string | number
  imported_at: string
}

const normalizeWhitespace = (value: string) => value.replace(/\s+/g, ' ').trim()

const makeSummary = (text: string | null) => {
  const normalized = normalizeWhitespace(text || '')
  if (!normalized) {
    return 'Text extraction was empty for this PDF. Re-run ingestion for this file if needed.'
  }
  return normalized.slice(0, 320)
}

const toEstimatedDuration = (text: string | null) => {
  const words = normalizeWhitespace(text || '').split(' ').filter(Boolean).length
  const minutes = Math.max(15, Math.ceil(words / 180))
  return `${minutes} min`
}

const curriculumApiPlugin = (): Plugin => {
  const pool = createDbPool()

  return {
    name: 'curriculum-api',
    configureServer(server) {
      server.middlewares.use('/api/curriculum', async (req, res, next) => {
        if (req.method !== 'GET') {
          next()
          return
        }

        try {
          const { rows } = await pool.query<PdfRow>(
            `
            SELECT id, file_name, file_path, extracted_text, file_size_bytes, imported_at
            FROM i
            WHERE extension = '.pdf'
            ORDER BY imported_at DESC, file_name ASC
            LIMIT 400;
            `
          )

          const modules = rows.map((row: PdfRow, index: number) => {
            const fullText = normalizeWhitespace(row.extracted_text || '')
            const words = fullText.split(' ').filter(Boolean).length
            return {
              id: index + 1,
              title: row.file_name.replace(/\.pdf$/i, ''),
              duration: toEstimatedDuration(row.extracted_text),
              content: fullText,
              summary: makeSummary(row.extracted_text),
              fullContent: fullText,
              wordCount: words,
              readingTime: Math.max(5, Math.ceil(words / 200)),
              objectives: [
                'Read and understand key concepts from this document.',
                'Identify and highlight important information.',
                'Apply concepts through practical exercises.'
              ],
              materials: [
                `PDF Source: ${row.file_name}`,
                `Word Count: ${words.toLocaleString()} words`,
                `Estimated Read Time: ${Math.max(5, Math.ceil(words / 200))} minutes`,
                `Source Path: ${row.file_path}`
              ],
              assignments: [
                'Read the document and highlight key points.',
                'Write a 150-word summary capturing main ideas.',
                'Create 3 comprehension questions from the content.',
                'Explain how this content applies to IELTS/language learning.'
              ]
            }
          })

          const response = {
            source: 'postgres',
            course: {
              id: 'db-curriculum',
              title: 'Database PDF Curriculum',
              description:
                'Auto-generated modules from all ingested IELTS PDF files in PostgreSQL table i.',
              instructor: 'AI Curriculum Engine',
              level: 'Advanced',
              duration: `${modules.length} modules`,
              thumbnail:
                'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400',
              enrolled: 1,
              rating: 4.9,
              modules
            }
          }

          res.setHeader('Content-Type', 'application/json')
          res.statusCode = 200
          res.end(JSON.stringify(response))
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown server error'
          res.setHeader('Content-Type', 'application/json')
          res.statusCode = 500
          res.end(
            JSON.stringify({
              source: 'postgres',
              error: message
            })
          )
        }
      })
    },
    async closeBundle() {
      await pool.end()
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), curriculumApiPlugin()]
})
