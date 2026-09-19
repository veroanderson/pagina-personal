import { execFileSync } from 'child_process';

export interface DiskUsage {
  totalBytes: number;
  usedBytes: number;
  availableBytes: number;
}

// Usa `df` (presente en la imagen base alpine) en vez de fs.statfs para no
// depender de una API de Node todavía experimental en algunas versiones.
export function getDiskUsage(path: string): DiskUsage {
  const output = execFileSync('df', ['-k', path], { encoding: 'utf-8' });
  const line = output.trim().split('\n').pop() ?? '';
  const parts = line.trim().split(/\s+/);
  // Formato de `df -k`: Filesystem 1K-blocks Used Available Use% Mounted-on
  const totalKb = Number(parts[1]);
  const usedKb = Number(parts[2]);
  const availableKb = Number(parts[3]);

  return {
    totalBytes: totalKb * 1024,
    usedBytes: usedKb * 1024,
    availableBytes: availableKb * 1024,
  };
}
