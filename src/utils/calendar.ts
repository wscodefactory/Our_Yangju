// 납부 기한을 종일 일정과 3일 전 알림이 있는 .ics 파일로 내려받는다.

const escapeIcs = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
const compactDate = (s: string) => s.replace(/-/g, '');
// 종일 일정의 DTEND 는 다음날(배타). toISOString 은 UTC 라 한국 시간대에서 하루가 밀리므로 로컬 날짜 조각으로 만든다
const nextDay = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  const dt = new Date(y, m - 1, d + 1);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
};

export function buildIcs(title: string, due: string, description: string): string {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Our Yangju//Tax due//KO', 'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${compactDate(due)}-${Math.random().toString(36).slice(2)}@our-yangju`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${compactDate(due)}`,
    `DTEND;VALUE=DATE:${compactDate(nextDay(due))}`,
    `SUMMARY:${escapeIcs(title)}`,
    `DESCRIPTION:${escapeIcs(description)}`,
    'BEGIN:VALARM', 'TRIGGER:-P3D', 'ACTION:DISPLAY', `DESCRIPTION:${escapeIcs(title)}`, 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
}

/** .ics 내려받기. iOS 사파리는 다운로드 대신 달력 추가 화면을 바로 연다 */
export function downloadIcs(filename: string, ics: string) {
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = filename; document.body.appendChild(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
