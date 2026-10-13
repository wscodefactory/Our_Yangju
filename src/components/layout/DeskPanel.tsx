// PC 시연 레이아웃: 화면 폭 960px 이상이면 앱 왼쪽 빈 자리에 서비스 소개와 QR 2개를 둔다.
// QR 은 주소가 언어와 무관하니 처음 넓어졌을 때 한 번만 만들고, 소개 문구만 언어를 따라간다.
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';
import { logoFor } from '@/components/layout/Chrome';
import { Ic } from '@/components/ui/Ic';
import { useApp } from '@/context/AppContext';
import { UI } from '@/data/content';
import { appBase } from '@/utils/deeplink';

const MQ = '(min-width:960px)';

/**
 * PC 에서는 창 크기에 맞춰 앱 전체를 확대한다 (1280×800 기준 1배, 1920×1080 약 1.3배, 2560×1440 약 1.8배).
 * CSS zoom 아래에서 vw·vh 는 줄어들지 않아 가운데 정렬이 틀어지므로, 확대 뒤 뷰포트 크기를 --vw/--vh 로 넘긴다.
 */
function fitDesktop(on: boolean) {
  const root = document.documentElement;
  const z = on ? Math.min(2, Math.max(1, Math.min(innerWidth / 1180, innerHeight / 820))) : 1;
  root.style.setProperty('zoom', z === 1 ? '' : String(z));
  root.style.setProperty('--vw', on ? `${innerWidth / z}px` : '');
  root.style.setProperty('--vh', on ? `${innerHeight / z}px` : '');
}
const OPT = { type: 'svg' as const, errorCorrectionLevel: 'M' as const, margin: 0, color: { dark: '#1B1F19', light: '#FFFFFF' } };

export function DeskPanel() {
  const { lang, langChosen, t } = useApp();
  const [on, setOn] = useState(() => matchMedia(MQ).matches);
  const [qr, setQr] = useState<[string, string] | null>(null);
  useEffect(() => {
    const m = matchMedia(MQ);
    const f = () => { setOn(m.matches); fitDesktop(m.matches); };
    f();
    m.addEventListener('change', f);
    window.addEventListener('resize', f);
    return () => { m.removeEventListener('change', f); window.removeEventListener('resize', f); fitDesktop(false); };
  }, []);
  useEffect(() => {
    if (!on || qr) return;
    const base = appBase();
    Promise.all([QRCode.toString(base, OPT), QRCode.toString(`${base}?go=doc&from=qr`, OPT)])
      .then(([a, b]) => setQr([a, b]))
      .catch(() => setQr(null));
  }, [on, qr]);
  if (!on) return null;
  return (
    <aside id="desk" aria-label={t('appName')}>
      <div className="desk-in">
        <img className="desk-logo" src={logoFor(lang, langChosen)} alt={t('city')} />
        <h2>{langChosen ? t('appName') : `${UI.appName[0]} / ${UI.appName[1]}`}</h2>
        <p className="desk-lead">{t('deskLead')}</p>
        <ul className="desk-f">
          {['deskF1', 'deskF2', 'deskF3'].map((k) => <li key={k}><Ic n="check" cls="sm" /><span>{t(k)}</span></li>)}
        </ul>
        {qr && (
          <div className="desk-qr">
            {/* qrcode 가 만든 svg 문자열. 입력은 우리 주소뿐이라 그대로 넣어도 된다 */}
            <figure><div className="qr" dangerouslySetInnerHTML={{ __html: qr[0] }} /><figcaption><b>{t('deskQr1')}</b><span>{t('deskQr1D')}</span></figcaption></figure>
            <figure><div className="qr" dangerouslySetInnerHTML={{ __html: qr[1] }} /><figcaption><b>{t('deskQr2')}</b><span>{t('deskQr2D')}</span></figcaption></figure>
          </div>
        )}
        <p className="desk-note"><Ic n="info" cls="sm" /><span>{t('deskNote')}</span></p>
      </div>
    </aside>
  );
}
