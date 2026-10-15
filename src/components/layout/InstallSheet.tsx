// 설치창을 지원하지 않는 브라우저에 홈 화면 추가 방법을 안내한다.
import { useState } from 'react';
import { Sheet, isIos } from '@/components/layout/Chrome';
import { Seg } from '@/components/ui/Bits';
import { useApp } from '@/context/AppContext';

type Os = 'ios' | 'and';

export function InstallSheet() {
  const { t, closeOverlay } = useApp();
  const [os, setOs] = useState<Os>(() => (isIos() ? 'ios' : 'and'));
  const steps = os === 'ios' ? ['iosA', 'iosB', 'iosC'] : ['andA', 'andB', 'andC'];
  return (
    <Sheet id="install-h" title={t('guideT')} icon="download" onClose={closeOverlay}>
      <p className="muted" style={{ margin: '0 0 12px' }}>{t('guideLead')}</p>
      <Seg<Os> items={[['ios', 'iPhone'], ['and', 'Android']]} value={os} onChange={setOs} />
      <ol className="steps" style={{ marginTop: 14 }}>
        {steps.map((k) => <li key={k}><span>{t(k)}</span></li>)}
      </ol>
      {os === 'and' && <p className="muted" style={{ marginTop: 12 }}>{t('andInApp')}</p>}
    </Sheet>
  );
}
