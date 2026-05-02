-- Create table for PDF document metadata (links to R2, not blobs)
CREATE TABLE IF NOT EXISTS pdf_documents (
  id TEXT PRIMARY KEY,
  report_id TEXT NOT NULL,
  r2_url TEXT NOT NULL,
  client_email TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (report_id) REFERENCES audits(id)
);

-- Index for fast lookups by report_id
CREATE INDEX IF NOT EXISTS pdf_documents_report_id_idx ON pdf_documents(report_id);