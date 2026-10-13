// PC 시연 레이아웃 (3차 개선제안 6장): 화면 폭 960px 이상이면 앱 왼쪽에 서비스 소개와 QR 2개를 둔다.
// 앱 폭은 휴대폰 그대로 두고 빈 왼쪽만 쓴다. QR 은 한 번만 만들고(주소는 언어와 무관) 소개 문구만 언어를 따라간다.
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';
import { logoFor } from '@/components/layout/Chrome';
import { Ic } from '@/components/ui/Ic';
import { useApp } from '@/context/AppContext';
import { UI } from '@/data/content';
import { appBase } from '@/utils/deeplink';

const MQ = '(min-width:960px)';
const OPT = { type: 'svg' as const, errorCorrectionLevel: 'M' as const, margin: 0, color: { dark: '#1B1F19', light: '#FFFFFF' } };

export function DeskPanel() {
  const { lang, langChosen, t } = useApp();
  const [on, setOn] = useState(() => matchMedia(MQ).matches);
  const [qr, setQr] = useState<[string, string] | null>(null);
  useEffect(() => {
    const m = matchMedia(MQ);
    const f = () => setOn(m.matches);
    m.addEventListener('change', f);
    return () => m.removeEventListener('change', f);
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
            {/* qrcode 가 만든 svg 문자열. 외부 입력이 아니라 우리 주소뿐 */}
            <figure><div className="qr" dangerouslySetInnerHTML={{ __html: qr[0] }} /><figcaption><b>{t('deskQr1')}</b><span>{t('deskQr1D')}</span></figcaption></figure>
            <figure><div className="qr" dangerouslySetInnerHTML={{ __html: qr[1] }} /><figcaption><b>{t('deskQr2')}</b><span>{t('deskQr2D')}</span></figcaption></figure>
          </div>
        )}
        <p className="desk-note"><Ic n="info" cls="sm" /><span>{t('deskNote')}</span></p>
      </div>
    </aside>
  );
}
