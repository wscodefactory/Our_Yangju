// "받은 고지서" 흐름(doc → [mask → reading] → docConfirm → docResult)이 공유하는 상태.
// 사진 경로의 캔버스(원본·가림)와, 어느 경로로 왔든 최종으로 모이는 DocInfo 하나.
// 캔버스처럼 무거운 값이 있어 AppContext 와 분리했다.
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
  /** 시연용 가상 고지서 그림을 캔버스에 올려 가리기 화면부터 보여줄 때 */
  loadSampleCanvas: () => Promise<void>;
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

  // 샘플도 1→4단계를 차례로 밟는다 (2차 개선점검 3.5). 가림 사각형은 미리 그려져 온다
  const startSample = useCallback(async () => {
    const sample = await drawSampleNotice();
    setCanvas(sample.canvas);
    setRects(sample.rects.slice());
    setDoc({ ...SAMPLE } as DocInfo);
  }, []);
  const startManual = useCallback(() => { setCanvas(null); setRects([]); setDoc({ type: 'auto', amount: 0, due: '', epay: '', vacct: '', manual: true }); }, []);

  const loadFile = useCallback(async (file: File) => {
    const c = await fileToCanvas(file);
    setCanvas(c);
    setRects([]);
  }, []);
  const loadSampleCanvas = useCallback(async () => {
    const sample = await drawSampleNotice();
    setCanvas(sample.canvas);
    setRects(sample.rects.slice());
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

  const value: DocState = { canvas, rects, doc, setDoc, startSample, startManual, loadFile, loadSampleCanvas, addRect, undoRect, finalizeMask };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDoc(): DocState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useDoc must be used inside <DocProvider>');
  return v;
}
