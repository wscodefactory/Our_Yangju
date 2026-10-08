// 고지서 흐름 4단계 표시. 참고용 html 의 stepper(i) 그대로 (st1~st4, 현재 칸에 aria-current).
import { useApp } from '@/context/AppContext';

const KEYS = ['st1', 'st2', 'st3', 'st4'];

export function Stepper({ step }: { step: number }) {
  const { t } = useApp();
  return (
    <ol className="stepper" aria-label={t(KEYS[step])}>
      {KEYS.map((k, j) => (
        <li key={k} className={j < step ? 'done' : j === step ? 'cur' : undefined} aria-current={j === step ? 'step' : undefined}>{t(k)}</li>
      ))}
    </ol>
  );
}
