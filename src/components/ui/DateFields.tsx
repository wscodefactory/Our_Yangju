// 연·월·일 세 칸 날짜 입력. <input type="date"> 는 브라우저 달력이 기기 언어(한국어 크롬이면 "연도-월-일")로 고정돼
// 앱 언어를 따르지 않아서, 라벨을 우리 문구로 붙일 수 있는 숫자 칸으로 대신한다. 값은 'YYYY-MM-DD' 또는 '' 로 돌려준다.
import { forwardRef, useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';

interface Props {
  value: string;
  onChange: (ymd: string) => void;
  invalid?: boolean;
  idPrefix: string;
}

const pad = (s: string) => s.padStart(2, '0');
const split = (v: string): [string, string, string] => { const [y = '', m = '', d = ''] = v ? v.split('-') : []; return [y, m, d]; };
/** 세 칸이 다 차고 실제 날짜일 때만 YYYY-MM-DD, 아니면 '' (검증은 호출부가 '' 로 본다) */
const join = (y: string, m: string, d: string) => {
  const Y = Number(y), M = Number(m), D = Number(d);
  const dt = new Date(Y, M - 1, D);
  const ok = y.length === 4 && m && d && dt.getFullYear() === Y && dt.getMonth() === M - 1 && dt.getDate() === D;
  return ok ? `${y}-${pad(m)}-${pad(d)}` : '';
};

export const DateFields = forwardRef<HTMLInputElement, Props>(function DateFields({ value, onChange, invalid, idPrefix }, ref) {
  const { t } = useApp();
  // 입력 중인 조각은 여기서 들고 있어야 한다. 합친 값만 바깥에 두면 "2"만 쳐도 ''가 돼서 칸이 비어 버린다
  const [parts, setParts] = useState(() => split(value));
  useEffect(() => { if (value !== join(...parts)) setParts(split(value)); /* eslint-disable-line react-hooks/exhaustive-deps */ }, [value]);
  const set = (i: 0 | 1 | 2, max: number) => (raw: string) => {
    const next = [...parts] as [string, string, string];
    next[i] = raw.replace(/\D/g, '').slice(0, max);
    setParts(next);
    onChange(join(...next));
  };
  const field = (key: 'year' | 'month' | 'day', i: 0 | 1 | 2, max: number, r?: typeof ref) => (
    <label className="datef">
      <span>{t(key)}</span>
      <input id={`${idPrefix}-${key}`} ref={r} inputMode="numeric" autoComplete="off" value={parts[i]} maxLength={max} aria-invalid={invalid}
        placeholder={key === 'year' ? 'YYYY' : key === 'month' ? 'MM' : 'DD'} onChange={(e) => set(i, max)(e.target.value)} />
    </label>
  );
  return (
    <div className="dategrid">
      {field('year', 0, 4, ref)}
      {field('month', 1, 2)}
      {field('day', 2, 2)}
    </div>
  );
});
