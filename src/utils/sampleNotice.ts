// 샘플 고지서 생성, 이미지 축소와 가림 처리. 자동 위치 찾기용 사본은 MaskScreen에서 별도로 전송한다.

/** 가림 영역 [x, y, w, h] (캔버스 좌표) */
export type Rect = [number, number, number, number];

/** 가상 고지서와 기본 가림 영역. 표의 행 좌표를 바꿀 때는 반환하는 가림 좌표도 맞춘다. */
export async function drawSampleNotice(): Promise<{ canvas: HTMLCanvasElement; rects: Rect[] }> {
  try { await document.fonts.load('24px "IBM Plex Sans KR"'); } catch { /* 글꼴 못 받아도 그냥 그림 */ }

  const canvas = document.createElement('canvas');
  canvas.width = 900; canvas.height = 1180;
  const g = canvas.getContext('2d')!;
  const F = (size: number, weight?: number) => `${weight || 400} ${size}px "IBM Plex Sans KR","Apple SD Gothic Neo","Malgun Gothic",sans-serif`;

  // 배경과 상단 띠, 발신 기관
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, 900, 1180);
  g.fillStyle = '#f6d3e4'; g.fillRect(0, 0, 900, 14);
  g.fillStyle = '#1d4f91'; g.font = F(30, 700); g.fillText('양주시장', 48, 78);
  g.fillStyle = '#555'; g.font = F(18); g.fillText('경기도 양주시 부흥로 1533 (시연용 가상 고지서)', 48, 108);
  g.fillStyle = '#1d4f91'; g.font = F(34, 700); g.fillText('2026년 12월 정기분 자동차세 납부고지서', 48, 180);
  g.fillStyle = '#333'; g.font = F(18); g.fillText('Automobile Tax Payment Notice (Dec. 2026)  /  汽车税纳税通知书', 48, 212);

  // 표 한 줄: 회색(강조는 분홍) 띠 위에 항목명 / 값. 값은 x=300 부터 시작하고 이게 아래 rects 의 x(296)와 맞물림
  const row = (y: number, label: string, value: string, highlight?: boolean) => {
    g.fillStyle = highlight ? '#fdeef5' : '#f5f6f8'; g.fillRect(48, y, 804, 62);
    g.fillStyle = '#444'; g.font = F(20, 600); g.fillText(label, 68, y + 39);
    g.fillStyle = '#111'; g.font = F(24, highlight ? 700 : 400); g.fillText(value, 300, y + 40);
  };
  // 위 4줄은 개인정보(가림 대상), 아래 4줄은 AI 가 읽어야 할 금액·기한·전자납부번호·가상계좌
  // (전자납부번호·가상계좌는 고지서 전용 번호라 가리지 않는다. 값은 테스트 고지서 143,000원 기준)
  row(260, '납세자 / Taxpayer', '김영희 (KIM YEONGHUI)');
  row(332, '주소 / Address', '경기도 양주시 남면 상수로 123, 101호');
  row(404, '납세번호 / Tax No.', '41630-2026-12-0004321');
  row(476, '과세대상 / Vehicle', '12가 3456 (승용 1,598cc)');
  row(560, '납부금액 / Amount', '143,000 원', true);
  row(632, '납부기한 / Due date', '2026. 12. 31.', true);
  row(704, '전자납부번호 / e-Pay No.', '1163-0202-6120-0043-21', true);
  row(776, '가상계좌 / Virtual acct', '농협 790-9999-1234-567 (가상)', true);

  // 납부 방법 안내
  g.fillStyle = '#1d4f91'; g.font = F(22, 700); g.fillText('납부 방법 / How to pay', 48, 880);
  g.fillStyle = '#222'; g.font = F(19);
  ['• 위택스(www.wetax.go.kr) 전자납부번호 조회 — 계좌·카드·간편결제', '• 은행 앱에서 가상계좌 이체', '• 은행 ATM·무인공과금기 / 전화 ARS 142211', '• 외국어 통역 상담 1345  /  담당부서 031-8082-0000 (가상)']
    .forEach((line, i) => g.fillText(line, 60, 912 + i * 34));

  // QR 은 그리지 않는다. 양주시 고지서의 QR 은 전자고지 신청용이라 "QR 납부" 로 오해될 수 있어서

  g.fillStyle = '#999'; g.font = F(15); g.fillText('※ 이 고지서는 공모전 시연을 위해 만든 가상 문서입니다.', 48, 1150);

  // 개인정보 4줄의 값 칸. row 의 y + 6, 높이 50 으로 띠 안쪽에 들어가게
  return { canvas, rects: [[296, 266, 540, 50], [296, 338, 540, 50], [296, 410, 540, 50], [296, 482, 540, 50]] };
}

/** 원본 캔버스를 복사한 뒤 rects 를 검은 상자로 덮은 새 캔버스. 원본은 건드리지 않는다 */
export function maskCanvas(src: HTMLCanvasElement, rects: Rect[]): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = src.width; canvas.height = src.height;
  const g = canvas.getContext('2d')!;
  g.drawImage(src, 0, 0);
  g.fillStyle = '#000';
  rects.forEach((r) => g.fillRect(r[0], r[1], r[2], r[3]));
  return canvas;
}

/** 긴 변을 max 이하로 줄인 사본. 축소만 하므로 개인정보를 가리는 처리는 아니다. */
export function downscale(src: HTMLCanvasElement, max: number): HTMLCanvasElement {
  const scale = Math.min(1, max / Math.max(src.width, src.height));
  const c = document.createElement('canvas');
  c.width = Math.round(src.width * scale); c.height = Math.round(src.height * scale);
  c.getContext('2d')!.drawImage(src, 0, 0, c.width, c.height);
  return c;
}

/** 캔버스 → JPEG Blob. toBlob 이 null 을 주면(메모리 부족 등) reject */
export const canvasToBlob = (canvas: HTMLCanvasElement, quality = 0.8) =>
  new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('toBlob failed'))), 'image/jpeg', quality));

/** 사진을 비율대로 최대 1200px로 줄인다. 작은 이미지는 확대하지 않는다. */
export async function fileToCanvas(file: File): Promise<HTMLCanvasElement> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 1200 / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bmp.width * scale); canvas.height = Math.round(bmp.height * scale);
  canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  return canvas;
}
