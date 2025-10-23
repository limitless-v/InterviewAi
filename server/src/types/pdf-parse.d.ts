declare module 'pdf-parse/lib/pdf-parse.js' {
  interface PDFParseResult {
    numpages: number;
    numrender: number;
    info: Record<string, any>;
    metadata?: any;
    text: string;
    version: string;
  }
  function pdfParse(data: Buffer | ArrayBuffer | Uint8Array): Promise<PDFParseResult>;
  export default pdfParse;
}
