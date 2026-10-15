// 사용자가 지정한 가림 영역을 표시한다. 실제 이미지 적용은 읽기 단계의 finalizeMask에서 처리한다.
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
/** AI 상자 둘레에 두는 여유 (상자 크기 대비). 글자 끝이 삐져나오지 않게 */
const MASK_PADDING_RATIO = 0.04;

/** AI 가 돌려주는 상자 (0~1000 정규화, [ymin, xmin, ymax, xmax]) */
interface PiiBox { label?: string; box_2d?: number[] }

export function MaskScreen() {
  const { t, go, toast } = useApp();
  const { canvas, rects, addRect, undoRect, doc } = useDoc();
  const viewRef = useRef<HTMLCanvasElement>(null);
  const [detecting, setDetecting] = useState(false);
  const canDetectPersonalInfo = !!getAi()?.supportsImages;
  // 드래그 중에는 ref와 캔버스만 갱신해 pointermove마다 렌더하지 않는다.
  const dragStart = useRef<[number, number] | null>(null);
  const dragRect = useRef<Rect | null>(null);

  // 가림 전 사진을 640px로 줄여 위치를 요청한다. 기존 가림 영역은 이 사본에 적용되지 않는다.
  const detectPersonalInfo = async () => {
    const ai = getAi();
    if (!ai || !canvas) return;
    setDetecting(true);
    try {
      const blob = await canvasToBlob(downscale(canvas, 640), 0.7);
      const detection = await ai.json<{ boxes?: PiiBox[] }>(DETECT_PII_PROMPT, { image: blob });
      let foundCount = 0;
      for (const detectedBox of detection.boxes ?? []) {
        if (!Array.isArray(detectedBox.box_2d) || detectedBox.box_2d.length !== 4) continue;
        foundCount++;
        const [y0, x0, y1, x1] = detectedBox.box_2d.map((v) => Math.max(0, Math.min(1000, v)) / 1000);
        const x = Math.max(0, (x0 - MASK_PADDING_RATIO * (x1 - x0)) * canvas.width);
        const y = Math.max(0, (y0 - MASK_PADDING_RATIO * (y1 - y0)) * canvas.height);
        const w = Math.min(canvas.width - x, (x1 - x0) * (1 + 2 * MASK_PADDING_RATIO) * canvas.width);
        const h = Math.min(canvas.height - y, (y1 - y0) * (1 + 2 * MASK_PADDING_RATIO) * canvas.height);
        if (w > MIN_RECT_PX && h > MIN_RECT_PX) addRect([x, y, w, h]);
      }
      toast(foundCount ? t('autoMaskFound', { n: foundCount }) : t('autoMaskNone'));
    } catch {
      toast(t('autoMaskFail'));
    } finally {
      setDetecting(false);
    }
  };

  // 원본 캔버스를 깔고, 확정된 상자 + 드래그 중인 상자를 검게 덮는다
  const draw = () => {
    const view = viewRef.current;
    if (!view || !canvas) return;
    const g = view.getContext('2d')!;
    g.drawImage(canvas, 0, 0);
    g.fillStyle = '#000';
    [...rects, ...(dragRect.current ? [dragRect.current] : [])].forEach((r) => g.fillRect(r[0], r[1], r[2], r[3]));
  };

  useEffect(() => {
    const view = viewRef.current;
    if (!view || !canvas) return;
    // 내부 해상도를 원본과 맞춰야 drawImage 가 1:1. 표시 크기는 CSS(.canvaswrap)가 줄이고 좌표 변환은 canvasPoint()에서 한다
    view.width = canvas.width;
    view.height = canvas.height;
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvas, rects]);

  /** 화면 픽셀 → 캔버스 픽셀 (CSS 축소 비율 보정) */
  const canvasPoint = (e: PointerEvent<HTMLCanvasElement>): [number, number] => {
    const view = e.currentTarget;
    const box = view.getBoundingClientRect();
    return [
      (e.clientX - box.left) * view.width / box.width,
      (e.clientY - box.top) * view.height / box.height,
    ];
  };

  const startDrag = (e: PointerEvent<HTMLCanvasElement>) => {
    // 캡처를 걸어두면 손가락이 캔버스 밖으로 나가도 move/up 이 계속 들어온다
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStart.current = canvasPoint(e);
  };

  const updateDrag = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!dragStart.current) return;
    const p = canvasPoint(e);
    const s = dragStart.current;
    // 어느 방향으로 드래그하든 [좌상단 x, y, 너비, 높이]로 정규화
    dragRect.current = [Math.min(s[0], p[0]), Math.min(s[1], p[1]), Math.abs(p[0] - s[0]), Math.abs(p[1] - s[1])];
    draw();
  };

  // commit=false 는 pointercancel (브라우저가 제스처를 가져간 경우): 그리던 상자를 버린다
  const endDrag = (commit: boolean) => {
    const finished = dragRect.current;
    if (commit && finished && finished[2] > MIN_RECT_PX && finished[3] > MIN_RECT_PX) addRect(finished);
    dragRect.current = null;
    dragStart.current = null;
    draw(); // 버려진 상자는 여기서 지워야 한다
  };

  return (
    <>
      <Title>{t('st2')}</Title>
      <Stepper step={1} />
      <p className="lead">{t('maskLead')}</p>
      <div className="canvaswrap">
        <canvas
          ref={viewRef}
          aria-label={t('maskCanvas')}
          onPointerDown={startDrag}
          onPointerMove={updateDrag}
          onPointerUp={() => endDrag(true)}
          onPointerCancel={() => endDrag(false)}
        />
      </div>
      <div className="stack" style={{ marginTop: 12 }}>
        {/* 자동 찾기는 가림 전 사본을 전송한다. 샘플에서는 표시하지 않는다. */}
        {canDetectPersonalInfo && !doc?.sample && (
          <>
            <button type="button" className="btn secondary" disabled={detecting} onClick={() => void detectPersonalInfo()}>
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
