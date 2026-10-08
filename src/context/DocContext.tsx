// "받은 문서" 흐름(doc → mask → reading → confirm/manual → card → taxq → counsel)이 화면을 넘나들며
// 공유하는 상태. 원본 html에선 docCanvas, docRects, docData 같은 전역 변수였다.
// AppContext와 분리한 이유: 이 상태는 고지서 화면 묶음에서만 쓰이고, 캔버스 객체처럼
// 무거운 값이 들어 있어서 앱 전체 리렌더에 섞고 싶지 않았다.
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import type { DocData } from '@/types';
import { canvasToBlob, drawSampleNotice, fileToCanvas, maskCanvas, type Rect } from '@/utils/sampleNotice';

/** 받은 문서(고지서) 흐름의 상태: 사진 → 가리기 → 읽기 → 확인 → 할 일 카드 */
export interface DocState {
  /** 현재 보여줄 캔버스 (가리기 전 원본 또는 가린 뒤 결과) */
  canvas: HTMLCanvasElement | null;
  /** 사용자가 그린 가림 사각형들. finalizeMask에서 캔버스에 구워지면 비움 */
  rects: Rect[];
  /** 샘플 고지서로 시작했는지. true면 AI 호출 없이 sampleData()로 바로 넘어간다 */
  isSample: boolean;
  /** AI(또는 샘플/수동 입력)가 읽어낸 결과. confirm/card/taxq/counsel 화면이 본다 */
  data: DocData | null;
  /** 세금 질문 화면 마지막 질문(한국어 메모용) */
  lastQ: string;

  startSample: () => Promise<void>;
  loadFile: (f: File) => Promise<void>;
  addRect: (r: Rect) => void;
  undoRect: () => void;
  /** 가린 캔버스를 확정하고 JPEG Blob 반환 */
  finalizeMask: () => Promise<Blob>;
  setData: (d: DocData | null) => void;
  setLastQ: (q: string) => void;
  /** 샘플 고지서를 AI 없이 읽은 결과 */
  sampleData: () => DocData;
}

const Ctx = createContext<DocState | null>(null);

export function DocProvider({ children }: { children: ReactNode }) {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [rects, setRects] = useState<Rect[]>([]);
  const [isSample, setIsSample] = useState(false);
  const [data, setData] = useState<DocData | null>(null);
  const [lastQ, setLastQ] = useState('');

  // 샘플은 가림 사각형이 미리 그려져서 온다 (이름·주소 자리). 사용자가 undo로 지울 수 있게 복사해 둠
  const startSample = useCallback(async () => {
    const sample = await drawSampleNotice();
    setCanvas(sample.canvas);
    setRects(sample.rects.slice());
    setIsSample(true);
  }, []);

  // 실제 사진은 가림 없이 시작. EXIF 회전 등은 fileToCanvas 쪽에서 처리
  const loadFile = useCallback(async (file: File) => {
    const c = await fileToCanvas(file);
    setCanvas(c);
    setRects([]);
    setIsSample(false);
  }, []);

  const addRect = useCallback((r: Rect) => setRects((prev) => [...prev, r]), []);
  const undoRect = useCallback(() => setRects((prev) => prev.slice(0, -1)), []);

  /**
   * 사각형을 캔버스에 실제로 칠해 버리고 그 결과를 Blob으로 돌려준다.
   * 이 뒤로는 원본 픽셀이 없다 — 가린 뒤의 이미지만 AI로 보내는 게 이 흐름의 핵심이라 일부러 되돌릴 수 없게 했다.
   * ReadingScreen에서 호출하며, canvas가 없으면(새로고침 등) 던져서 호출부가 back() 한다.
   */
  const finalizeMask = useCallback(async () => {
    if (!canvas) throw new Error('no canvas');
    const masked = maskCanvas(canvas, rects);
    setCanvas(masked);
    setRects([]);
    return canvasToBlob(masked);
  }, [canvas, rects]);

  // 샘플 고지서(drawSampleNotice가 그리는 그 그림)에 적힌 값과 맞춰 둔 고정 결과.
  // 전화번호는 가상이라고 명시. 날짜를 바꾸면 샘플 그림 쪽도 같이 바꿔야 한다.
  const sampleData = useCallback((): DocData => ({
    doc_type: 'tax_notice',
    tax_name: { ko: '자동차세 (12월 정기분)', en: 'Automobile tax (December)', vi: 'Thuế ô tô (kỳ tháng 12)', ne: 'सवारी कर (डिसेम्बर)', zh: '汽车税（12月定期）' },
    amount_won: 143000,
    due_date: '2026-12-31',
    phone_on_doc: '031-8082-0000 (가상)',
    epay_no: '1163-0202-6120-0043-21',
    vacct: '농협 790-9999-1234-567 (가상)',
    amount_quote: '143,000 원',
    due_quote: '2026. 12. 31.',
    confidence: 'high',
  }), []);

  const value: DocState = {
    canvas, rects, isSample, data, lastQ,
    startSample, loadFile, addRect, undoRect, finalizeMask, setData, setLastQ,
    sampleData,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDoc(): DocState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useDoc must be used inside <DocProvider>');
  return v;
}
