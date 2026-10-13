// 홈 화면에 추가 안내 시트 (3차 개선제안 4장). 안드로이드 크롬은 설치창이 바로 뜨므로 여기는 아이폰과 설치창이 없는 브라우저용.
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
