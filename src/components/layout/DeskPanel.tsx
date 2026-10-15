// 960px 이상 화면의 소개 패널과 QR. 주소가 같으므로 QR은 언어 변경 시 다시 만들지 않는다.
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';
import { logoFor } from '@/components/layout/Chrome';
import { Ic } from '@/components/ui/Ic';
import { useApp } from '@/context/AppContext';
import { UI } from '@/data/content';
import { appBase } from '@/utils/deeplink';

const DESKTOP_QUERY = '(min-width:960px)';

/** zoom 적용 후의 뷰포트 크기를 CSS에 전달해 정렬 기준을 맞춘다. */
function fitDesktop(enabled: boolean) {
  const root = document.documentElement;
  const scale = enabled ? Math.min(2, Math.max(1, Math.min(innerWidth / 1180, innerHeight / 820))) : 1;
  root.style.setProperty('zoom', scale === 1 ? '' : String(scale));
  root.style.setProperty('--vw', enabled ? `${innerWidth / scale}px` : '');
  root.style.setProperty('--vh', enabled ? `${innerHeight / scale}px` : '');
}
const QR_OPTIONS = { type: 'svg' as const, errorCorrectionLevel: 'M' as const, margin: 0, color: { dark: '#1B1F19', light: '#FFFFFF' } };

export function DeskPanel() {
  const { lang, langChosen, t } = useApp();
  const [isDesktop, setIsDesktop] = useState(() => matchMedia(DESKTOP_QUERY).matches);
  const [qrCodes, setQrCodes] = useState<[string, string] | null>(null);
  useEffect(() => {
    const mediaQuery = matchMedia(DESKTOP_QUERY);
    const syncViewport = () => { setIsDesktop(mediaQuery.matches); fitDesktop(mediaQuery.matches); };
    syncViewport();
    mediaQuery.addEventListener('change', syncViewport);
    window.addEventListener('resize', syncViewport);
    return () => { mediaQuery.removeEventListener('change', syncViewport); window.removeEventListener('resize', syncViewport); fitDesktop(false); };
  }, []);
  useEffect(() => {
    if (!isDesktop || qrCodes) return;
    const base = appBase();
    Promise.all([QRCode.toString(base, QR_OPTIONS), QRCode.toString(`${base}?go=doc&from=qr`, QR_OPTIONS)])
      .then(([a, b]) => setQrCodes([a, b]))
      .catch(() => setQrCodes(null));
  }, [isDesktop, qrCodes]);
  if (!isDesktop) return null;
  return (
    <aside id="desk" aria-label={t('appName')}>
      <div className="desk-in">
        <img className="desk-logo" src={logoFor(lang, langChosen)} alt={t('city')} />
        <h2>{langChosen ? t('appName') : `${UI.appName[0]} / ${UI.appName[1]}`}</h2>
        <p className="desk-lead">{t('deskLead')}</p>
        <ul className="desk-f">
          {['deskF1', 'deskF2', 'deskF3'].map((k) => <li key={k}><Ic n="check" cls="sm" /><span>{t(k)}</span></li>)}
        </ul>
        {qrCodes && (
          <div className="desk-qr">
            {/* qrcode 가 만든 svg 문자열. 입력은 우리 주소뿐이라 그대로 넣어도 된다 */}
            <figure><div className="qr" dangerouslySetInnerHTML={{ __html: qrCodes[0] }} /><figcaption><b>{t('deskQr1')}</b><span>{t('deskQr1D')}</span></figcaption></figure>
            <figure><div className="qr" dangerouslySetInnerHTML={{ __html: qrCodes[1] }} /><figcaption><b>{t('deskQr2')}</b><span>{t('deskQr2D')}</span></figcaption></figure>
          </div>
        )}
        <p className="desk-note"><Ic n="info" cls="sm" /><span>{t('deskNote')}</span></p>
      </div>
    </aside>
  );
}
