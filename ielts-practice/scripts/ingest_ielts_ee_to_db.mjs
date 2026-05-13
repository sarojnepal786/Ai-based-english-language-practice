import fs from 'fs/promises';
import path from 'path';
import pg from 'pg';

const { Client } = pg;

const ROOT_FOLDER = process.argv[2] || '/Users/saroj/Documents/ielts/ee';
const MAX_TEXT_LENGTH = 2_000_000;

const dbConfig = {
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT || 5433),
  user: process.env.PGUSER || 'ielts123',
  password: process.env.PGPASSWORD || 'ielts123',
  database: process.env.PGDATABASE || 'ieltsdb'
};

const isPdf = (filePath) => path.extname(filePath).toLowerCase() === '.pdf';

let pdfParseFn;

const walkFiles = async (dirPath) => {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(fullPath)));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
};

const extractPdfText = async (filePath) => {
  try {
    if (!pdfParseFn) {
      const pdfParseModule = await import('pdf-parse');
      pdfParseFn = pdfParseModule.default || pdfParseModule;
    }

    const buffer = await fs.readFile(filePath);
    const parsed = await pdfParseFn(buffer);
    return (parsed.text || '').slice(0, MAX_TEXT_LENGTH);
  } catch (error) {
    return `[[PDF extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}]]`;
  }
};

const run = async () => {
  const client = new Client(dbConfig);
  await client.connect();

  await client.query(`
    CREATE TABLE IF NOT EXISTS i (
      id BIGSERIAL PRIMARY KEY,
      file_path TEXT UNIQUE NOT NULL,
      file_name TEXT NOT NULL,
      extension TEXT NOT NULL,
      file_size_bytes BIGINT NOT NULL,
      extracted_text TEXT,
      source_folder TEXT NOT NULL,
      imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  const files = (await walkFiles(ROOT_FOLDER)).filter(isPdf);
  let imported = 0;

  for (const filePath of files) {
    const stats = await fs.stat(filePath);
    const extension = '.pdf';
    const fileName = path.basename(filePath);
    const extractedText = await extractPdfText(filePath);

    await client.query(
      `
      INSERT INTO i (file_path, file_name, extension, file_size_bytes, extracted_text, source_folder)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (file_path)
      DO UPDATE SET
        file_name = EXCLUDED.file_name,
        extension = EXCLUDED.extension,
        file_size_bytes = EXCLUDED.file_size_bytes,
        extracted_text = EXCLUDED.extracted_text,
        source_folder = EXCLUDED.source_folder,
        imported_at = NOW();
      `,
      [filePath, fileName, extension, stats.size, extractedText, ROOT_FOLDER]
    );

    imported += 1;
  }

  const { rows } = await client.query('SELECT COUNT(*)::INT AS total FROM i;');
  await client.end();

  console.log(`Imported/updated ${imported} files from ${ROOT_FOLDER}`);
  console.log(`Table i now contains ${rows[0].total} rows`);
};

run().catch((error) => {
  console.error('Ingestion failed:', error);
  process.exit(1);
});
