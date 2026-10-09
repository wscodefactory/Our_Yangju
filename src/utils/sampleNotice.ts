// 고지서 흐름의 캔버스 처리.
//  - drawSampleNotice: 시연용 가상 자동차세 고지서를 캔버스에 그린다 (사진 대신 쓰는 샘플)
//  - maskCanvas:       사용자가 지정한 영역을 검게 덮는다 (개인정보 가림)
//  - canvasToBlob / fileToCanvas: 업로드 ↔ 전송 사이의 변환
// 원본 이미지는 기기 밖으로 안 나가고, 가린 캔버스만 Blob 으로 바꿔 AI 에 보낸다는 게 이 흐름의 핵심.
// DocContext 가 호출한다.

/** 가림 영역 [x, y, w, h] (캔버스 좌표) */
export type Rect = [number, number, number, number];

/**
 * 시연용 가상 자동차세 고지서. 900x1180 캔버스에 직접 그린다.
 * 함께 돌려주는 rects 는 납세자·주소·납세번호·차량번호 값 칸의 좌표로,
 * 가리기 화면에서 "여기 가리세요" 기본 영역으로 쓰인다. row() 의 y 와 맞물려 있으니 좌표를 손대면 같이 고칠 것.
 * 글꼴은 전역 CSS 와 같은 IBM Plex Sans KR 을 미리 로드해 두는데, 안 돼도 시스템 글꼴로 그려지면 되므로 실패는 무시.
 */
export async function drawSampleNotice(): Promise<{ canvas: HTMLCanvasElement; rects: Rect[] }> {
  try { await document.fonts.load('24px "IBM Plex Sans KR"'); } catch { /* 글꼴 못 받아도 그냥 그림 */ }

  const canvas = document.createElement('canvas');
  canvas.width = 900; canvas.height = 1180;
  const g = canvas.getContext('2d')!;
  // 폰트 문자열 조립. F(크기, 굵기)
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

  // QR 은 그리지 않는다. 양주시 고지서의 QR 은 전자고지 신청용이라 "QR 납부" 로 오해될 수 있어서 (구현요청 26.10.08)

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

/** 캔버스 → JPEG Blob. 전송용이라 품질 0.9 기본. toBlob 이 null 을 주면(메모리 부족 등) reject */
export const canvasToBlob = (canvas: HTMLCanvasElement, quality = 0.8) =>
  new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('toBlob failed'))), 'image/jpeg', quality));

/**
 * 업로드한 사진을 캔버스로. 긴 변이 1200px 넘으면 비율 유지하며 줄인다.
 * 휴대폰 사진은 4000px 이 넘어서 그대로 보내면 느리고, 고지서 글자 읽기엔 1200 이면 충분했다 (전송량이 체감 시간의 큰 몫).
 * 작은 사진은 키우지 않음(Math.min(1, ...)).
 */
export async function fileToCanvas(file: File): Promise<HTMLCanvasElement> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 1200 / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bmp.width * scale); canvas.height = Math.round(bmp.height * scale);
  canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  return canvas;
}
