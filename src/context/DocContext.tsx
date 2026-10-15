// 고지서 사진, 가림 영역, 확인한 내용을 관리한다. 이미지 상태는 AppContext와 분리한다.
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { SAMPLE } from '@/data/content';
import type { DocInfo } from '@/types';
import { canvasToBlob, drawSampleNotice, fileToCanvas, maskCanvas, type Rect } from '@/utils/sampleNotice';

export interface DocState {
  /** 현재 캔버스 (가리기 전 원본 또는 가린 결과). 사진 경로에서만 있음 */
  canvas: HTMLCanvasElement | null;
  /** 사용자가 그린 가림 사각형. finalizeMask 에서 캔버스에 구워지면 비움 */
  rects: Rect[];
  /** 확인·결과 화면이 보는 고지서 정보 */
  doc: DocInfo | null;
  setDoc: (d: DocInfo | null) => void;
  /** 샘플 고지서: 미리 가려진 가상 고지서 캔버스 + SAMPLE 값. 가리기 단계를 거쳐 확인 화면으로 (AI 호출 없음) */
  startSample: () => Promise<void>;
  /** 직접 입력: 빈 고지서 */
  startManual: () => void;
  /** 사진 파일 → 캔버스 (가리기 화면으로) */
  loadFile: (f: File) => Promise<void>;
  addRect: (r: Rect) => void;
  undoRect: () => void;
  /** 가린 캔버스를 확정하고 JPEG Blob 반환. 이 뒤로 원본 픽셀은 없다 */
  finalizeMask: () => Promise<Blob>;
}

const Ctx = createContext<DocState | null>(null);

export function DocProvider({ children }: { children: ReactNode }) {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [rects, setRects] = useState<Rect[]>([]);
  const [doc, setDoc] = useState<DocInfo | null>(null);

  // 샘플도 사진과 같은 단계를 차례로 밟는다. 가림 사각형은 미리 그려져 온다
  const startSample = useCallback(async () => {
    const sample = await drawSampleNotice();
    setCanvas(sample.canvas);
    setRects(sample.rects);
    setDoc({ ...SAMPLE } as DocInfo);
  }, []);
  const startManual = useCallback(() => {
    setCanvas(null);
    setRects([]);
    setDoc({ type: 'auto', amount: 0, due: '', epay: '', vacct: '', manual: true });
  }, []);

  // 직전에 샘플·직접 입력을 거쳤으면 doc 에 sample/manual 이 남아 MaskScreen 이 AI 읽기를 건너뛴다 → 새 사진은 doc 을 비운다
  const loadFile = useCallback(async (file: File) => {
    setCanvas(await fileToCanvas(file));
    setRects([]);
    setDoc(null);
  }, []);

  const addRect = useCallback((r: Rect) => setRects((prev) => [...prev, r]), []);
  const undoRect = useCallback(() => setRects((prev) => prev.slice(0, -1)), []);

  // 가린 뒤의 이미지만 AI 로 보내는 게 이 흐름의 핵심이라 일부러 되돌릴 수 없게 했다
  const finalizeMask = useCallback(async () => {
    if (!canvas) throw new Error('no canvas');
    const masked = maskCanvas(canvas, rects);
    setCanvas(masked);
    setRects([]);
    return canvasToBlob(masked);
  }, [canvas, rects]);

  const value: DocState = { canvas, rects, doc, setDoc, startSample, startManual, loadFile, addRect, undoRect, finalizeMask };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDoc(): DocState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useDoc must be used inside <DocProvider>');
  return v;
}
