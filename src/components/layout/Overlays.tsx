// 시트·전체 화면 라우터. AppContext.overlay 하나를 보고 알맞은 시트를 띄운다 (한 번에 하나).
import { Sheet } from '@/components/layout/Chrome';
import { ChatSheet } from '@/components/guide/ChatSheet';
import { NoticeSheet } from '@/components/doc/NoticeSheet';
import { LangOptions } from '@/components/ui/LangOptions';
import { FullShow } from '@/components/visit/FullShow';
import { NoteSheet } from '@/components/welfare/NoteSheet';
import { useApp } from '@/context/AppContext';

export function Overlays() {
  const { overlay, closeOverlay, t } = useApp();
  if (!overlay) return null;
  switch (overlay.k) {
    case 'lang':
      return (
        <Sheet id="lang-h" title={t('chooseLang')} icon="globe" onClose={closeOverlay}>
          <LangOptions />
          <p className="muted" style={{ margin: '14px 2px 0' }}>{t('langNote')}</p>
        </Sheet>
      );
    case 'chat': return <ChatSheet />;
    case 'notice': return <NoticeSheet />;
    case 'note': return <NoteSheet id={overlay.id} />;
    case 'full': return <FullShow id={overlay.id} />;
  }
}
