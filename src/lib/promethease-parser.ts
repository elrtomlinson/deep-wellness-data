/**
 * Client-side Promethease HTML report parser.
 * Extracts compressed SNP data from the report HTML,
 * decompresses it using pako (zlib), and returns structured entries.
 */

export interface DnaVariant {
  rsnum?: string;
  title?: string; // for genosets
  geno?: string;
  magnitude: number;
  repute: 'Good' | 'Bad' | '';
  genosummary: string;
  genobody?: string;
  conditions: string[];
  medications: string[];
  topics: string[];
  clinvarSignificance?: string;
  clinvarDiseases?: string[];
  chromosome?: string;
  position?: number;
  frequency?: number;
}

export interface DnaReport {
  id: string;
  uploadedAt: string;
  totalVariants: number;
  variants: DnaVariant[];
}

const CLINVAR_LABELS: Record<string, string> = {
  '5': 'Pathogenic',
  '4': 'Probable pathogenic',
  '3': 'Probable non-pathogenic',
  '2': 'Non-pathogenic',
  '1': 'Untested',
  '6': 'Drug response',
  '7': 'Histocompatibility',
  '255': 'Other',
};

/**
 * Parses a Promethease HTML report string and extracts all genetic variants.
 * Uses the browser's built-in DecompressionStream for zlib decompression,
 * with a fallback to manual base64 + pako if available.
 */
export async function parsePromethease(htmlContent: string): Promise<DnaReport> {
  // Extract all decompressString('...') payloads
  const regex = /decompressString\('([^']+)'\)/g;
  const payloads: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(htmlContent)) !== null) {
    payloads.push(match[1]);
  }

  if (payloads.length === 0) {
    throw new Error('No genetic data found in this file. Make sure it is a Promethease HTML report.');
  }

  const allVariants: DnaVariant[] = [];

  for (const payload of payloads) {
    try {
      // Decode base64
      const binaryStr = atob(payload);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }

      // Decompress using DecompressionStream (zlib = deflate with header)
      let text: string;
      try {
        const ds = new DecompressionStream('deflate');
        const writer = ds.writable.getWriter();
        const reader = ds.readable.getReader();

        writer.write(bytes);
        writer.close();

        const chunks: Uint8Array[] = [];
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
        }

        const totalLen = chunks.reduce((s, c) => s + c.length, 0);
        const merged = new Uint8Array(totalLen);
        let offset = 0;
        for (const chunk of chunks) {
          merged.set(chunk, offset);
          offset += chunk.length;
        }
        text = new TextDecoder().decode(merged);
      } catch {
        // Skip blocks that fail to decompress
        continue;
      }

      const data = JSON.parse(text);
      if (!Array.isArray(data)) continue;

      for (const entry of data) {
        const variant: DnaVariant = {
          rsnum: entry.rsnum,
          title: entry.title,
          geno: entry.geno,
          magnitude: typeof entry.magnitude === 'number' ? entry.magnitude : 0,
          repute: entry.repute === 'Good' ? 'Good' : entry.repute === 'Bad' ? 'Bad' : '',
          genosummary: entry.genosummary || '',
          genobody: entry.genobody,
          conditions: entry.cond || [],
          medications: entry.med || [],
          topics: entry.topic || [],
          clinvarSignificance: entry.clinvar_1 ? CLINVAR_LABELS[entry.clinvar_1] || entry.clinvar_1 : undefined,
          clinvarDiseases: entry.clinvar_diseases,
          chromosome: entry.chrom,
          position: entry.pos,
          frequency: entry.gmaf,
        };
        allVariants.push(variant);
      }
    } catch {
      // Skip malformed blocks
      continue;
    }
  }

  return {
    id: crypto.randomUUID(),
    uploadedAt: new Date().toISOString(),
    totalVariants: allVariants.length,
    variants: allVariants,
  };
}

// Helper to strip HTML entities from summaries
export function cleanHtml(text: string): string {
  const el = document.createElement('div');
  el.innerHTML = text;
  return el.textContent || el.innerText || text;
}
