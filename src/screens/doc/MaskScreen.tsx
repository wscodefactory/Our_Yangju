// 받은 문서 흐름 2단계: 개인정보 가리기.
// DocContext의 canvas(원본 사진)를 화면용 <canvas>에 복사해서 보여주고,
// 드래그한 사각형을 rects로 쌓는다. 실제로 픽셀을 지우는 건 ReadingScreen에서 finalizeMask()가 한다.
// 원본 html의 #mask 섹션 + 포인터 이벤트 핸들러 세 개를 옮긴 것.
import { useEffect, useRef, type PointerEvent } from 'react';
import { Crumb } from '@/components/layout/Crumb';
import { Hint } from '@/components/ui/Notes';
import { Stack } from '@/components/ui/Tile';
import { WideButton } from '@/components/ui/WideButton';
import { useApp } from '@/context/AppContext';
import { useDoc } from '@/context/DocContext';
import type { Rect } from '@/utils/sampleNotice';

/** 이 크기(캔버스 픽셀) 이하의 상자는 탭 실수로 보고 버린다 */
const MIN_RECT_PX = 8;

/**
 * 이름·주소·번호를 드래그로 가리기.
 * 드래그 중 상자(cur)는 state가 아니라 ref에 둔다 — pointermove마다 리렌더할 이유가 없고,
 * 어차피 draw()로 캔버스에 직접 그리기 때문.
 */
export function MaskScreen() {
  const { T, go } = useApp();
  const { canvas, rects, isSample, addRect, undoRect } = useDoc();
  const viewRef = useRef<HTMLCanvasElement>(null);
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
    // 화면용 캔버스의 내부 해상도를 원본과 맞춰야 drawImage가 1:1로 떨어진다.
    // 실제 표시 크기는 CSS(.canvaswrap)가 줄이므로 좌표 변환은 pt()에서 따로 한다.
    view.width = canvas.width;
    view.height = canvas.height;
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvas, rects]);

  /**
   * 화면 픽셀 → 캔버스 픽셀.
   * 캔버스는 CSS로 축소돼 보이므로 (clientX - 캔버스 좌측) 에 (내부 너비 / 표시 너비) 비율을 곱해야
   * fillRect에 넣을 수 있는 좌표가 된다. 세로도 같은 방식.
   */
  const pt = (e: PointerEvent<HTMLCanvasElement>): [number, number] => {
    const view = e.currentTarget;
    const box = view.getBoundingClientRect();
    return [
      (e.clientX - box.left) * view.width / box.width,
      (e.clientY - box.top) * view.height / box.height,
    ];
  };

  const onDown = (e: PointerEvent<HTMLCanvasElement>) => {
    // 캡처를 걸어두면 손가락이 캔버스 밖으로 나가도 move/up이 계속 들어온다
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
    // addRect로 rects가 바뀌면 effect가 다시 그리지만, 버려진 작은 상자는 여기서 지워줘야 함
    draw();
  };

  return (
    <>
      <Crumb path={T('문서 찍기 › 가리기', 'Scan › Hide details')} />
      <h1>{T('이름·주소·번호를 가려 주세요', 'Cover your name, address and numbers')}</h1>
      <Hint>
        {T('손가락으로 드래그하면 검은 상자로 가려져요. 가린 부분은 AI에게 보내지 않아요.', 'Drag over them to draw black boxes. Covered parts are never sent to the AI.')}
        {/* 샘플은 drawSampleNotice()가 가릴 영역을 미리 rects로 넘겨준다 */}
        {isSample && ' ' + T('샘플은 이미 가려 두었어요.', 'The sample is already covered.')}
      </Hint>
      <div className="canvaswrap">
        <canvas
          ref={viewRef}
          aria-label={T('문서 사진. 드래그해서 가리기', 'Document photo. Drag to cover')}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
        />
      </div>
      <Stack mt={12}>
        <WideButton primary label={T('다 가렸어요 → 읽기', 'Done → Read it')} onClick={() => go({ k: 'reading' })} />
        <WideButton arrow={null} label={T('마지막 상자 지우기', 'Remove last box')} onClick={undoRect} />
      </Stack>
    </>
  );
}
