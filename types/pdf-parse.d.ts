declare module 'pdf-parse' {
    export interface PDFParseResult {
      text: string;
      // оставляем остальное опциональным, чтобы не тащить лишние типы
      info?: Record<string, unknown>;
      metadata?: unknown;
      version?: string;
    }
  
    function pdfParse(data: Buffer | Uint8Array | ArrayBuffer): Promise<PDFParseResult>;
    export default pdfParse;
  }
  