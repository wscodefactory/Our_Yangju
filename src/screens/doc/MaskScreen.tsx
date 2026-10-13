// 고지서 흐름 2단계: 개인정보 가리기.
// DocContext 의 canvas(원본 사진)를 화면용 <canvas>에 복사해 보여주고, 드래그한 사각형을 rects 로 쌓는다.
// 실제로 픽셀을 지우는 건 ReadingScreen 에서 finalizeMask() 가 한다.
import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { BottomBar, Title } from '@/components/layout/Chrome';
import { Ic } from '@/components/ui/Ic';
import { useApp } from '@/context/AppContext';
import { useDoc } from '@/context/DocContext';
import { getAi } from '@/services/ai';
import { DETECT_PII_PROMPT } from '@/services/prompts';
import { canvasToBlob, downscale, type Rect } from '@/utils/sampleNotice';
import { Stepper } from './Stepper';

/** 이 크기(캔버스 픽셀) 이하의 상자는 탭 실수로 보고 버린다 */
const MIN_RECT_PX = 8;

/**
 * 드래그 중 상자(cur)는 state 가 아니라 ref — pointermove 마다 리렌더할 이유가 없고, draw() 로 캔버스에 직접 그린다.
 */
/** Gemini 가 돌려주는 상자 (0~1000 정규화, [ymin, xmin, ymax, xmax]) */
interface PiiBox { label?: string; box_2d?: number[] }

export function MaskScreen() {
  const { t, go, toast } = useApp();
  const { canvas, rects, addRect, undoRect, doc } = useDoc();
  const viewRef = useRef<HTMLCanvasElement>(null);
  const [detecting, setDetecting] = useState(false);
  const canDetect = !!getAi()?.supportsImages;

  /**
   * AI 가릴 곳 찾기. 긴 변 640px 사본을 보내 위치만 받고(글자 내용은 출력 금지), 캔버스 좌표로 바꿔 상자를 추가한다.
   * 상자 둘레에 4% 여유를 둬서 글자 끝이 삐져나오지 않게. 사용자가 확인하고 빠진 곳은 직접 가린다.
   */
  const detect = async () => {
    const ai = getAi();
    if (!ai || !canvas) return;
    setDetecting(true);
    try {
      const blob = await canvasToBlob(downscale(canvas, 640), 0.7);
      const r = await ai.json<{ boxes?: PiiBox[] }>(DETECT_PII_PROMPT, { image: blob });
      const boxes = (r.boxes || []).filter((b) => Array.isArray(b.box_2d) && b.box_2d.length === 4);
      boxes.forEach((b) => {
        const [y0, x0, y1, x1] = b.box_2d!.map((v) => Math.max(0, Math.min(1000, v)) / 1000);
        const pad = 0.04;
        const x = Math.max(0, (x0 - pad * (x1 - x0)) * canvas.width);
        const y = Math.max(0, (y0 - pad * (y1 - y0)) * canvas.height);
        const w = Math.min(canvas.width - x, (x1 - x0) * (1 + 2 * pad) * canvas.width);
        const h = Math.min(canvas.height - y, (y1 - y0) * (1 + 2 * pad) * canvas.height);
        if (w > MIN_RECT_PX && h > MIN_RECT_PX) addRect([x, y, w, h]);
      });
      toast(boxes.length ? t('autoMaskFound', { n: boxes.length }) : t('autoMaskNone'));
    } catch {
      toast(t('autoMaskFail'));
    } finally {
      setDetecting(false);
    }
  };
  const dragStart = useRef<[number, number] | null>(null);
  const cur = useRef<Rect | null>(null);

  // 원본 캔버스를 깔고, 확정된 상자 + 드래그 중인 상자를 검게 덮는다
  const draw = () => {
    const view = viewRef.current;
    if (!view || !canvas) return;
    const g = view.getContext('2d')!;
    g.drawImage(canvas, 0, 0);
    g.fillStyle = '#000';
    [...rects, ...(cur.current ? [cur.current] : [])].forEach((r) => g.fillRect(r[0], r[1], r[2], r[3]));
  };

  useEffect(() => {
    const view = viewRef.current;
    if (!view || !canvas) return;
    // 내부 해상도를 원본과 맞춰야 drawImage 가 1:1. 표시 크기는 CSS(.canvaswrap)가 줄이고 좌표 변환은 pt() 가 한다
    view.width = canvas.width;
    view.height = canvas.height;
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvas, rects]);

  /** 화면 픽셀 → 캔버스 픽셀 (CSS 축소 비율 보정) */
  const pt = (e: PointerEvent<HTMLCanvasElement>): [number, number] => {
    const view = e.currentTarget;
    const box = view.getBoundingClientRect();
    return [
      (e.clientX - box.left) * view.width / box.width,
      (e.clientY - box.top) * view.height / box.height,
    ];
  };

  const onDown = (e: PointerEvent<HTMLCanvasElement>) => {
    // 캡처를 걸어두면 손가락이 캔버스 밖으로 나가도 move/up 이 계속 들어온다
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStart.current = pt(e);
  };

  const onMove = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!dragStart.current) return;
    const p = pt(e);
    const s = dragStart.current;
    // 어느 방향으로 드래그하든 [좌상단 x, y, 너비, 높이]로 정규화
    cur.current = [Math.min(s[0], p[0]), Math.min(s[1], p[1]), Math.abs(p[0] - s[0]), Math.abs(p[1] - s[1])];
    draw();
  };

  const onUp = () => {
    const finished = cur.current;
    if (finished && finished[2] > MIN_RECT_PX && finished[3] > MIN_RECT_PX) addRect(finished);
    cur.current = null;
    dragStart.current = null;
    draw(); // 버려진 작은 상자는 여기서 지워야 함
  };

  return (
    <>
      <Title>{t('st2')}</Title>
      <Stepper step={1} />
      <p className="lead">
        {t('maskLead')}
      </p>
      <div className="canvaswrap">
        <canvas
          ref={viewRef}
          aria-label={t('maskCanvas')}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
        />
      </div>
      <div className="stack" style={{ marginTop: 12 }}>
        {/* AI 로 가릴 곳 찾기: 저해상도 사본으로 위치만 받고, 전송은 여전히 가린 사진만. 샘플은 이미 가려져 있어 숨김 */}
        {canDetect && !doc?.sample && (
          <>
            <button type="button" className="btn secondary" disabled={detecting} onClick={() => void detect()}>
              <Ic n="shield" cls="sm" />{detecting ? t('autoMaskBusy') : t('autoMask')}
            </button>
            <p className="muted" style={{ margin: 0 }}>{t('autoMaskNote')}</p>
          </>
        )}
        {rects.length > 0 && <button type="button" className="btn secondary" onClick={undoRect}>{t('maskUndo')}</button>}
      </div>
      <BottomBar>
        <button type="button" className="btn primary" onClick={() => go(doc?.sample ? { k: 'docConfirm' } : { k: 'reading' })}>{t('maskDone')}</button>
      </BottomBar>
    </>
  );
}
