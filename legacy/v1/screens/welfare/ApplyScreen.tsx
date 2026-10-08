// 혜택 흐름의 마지막 화면: 신청하러 가기(apply). DocsScreen에서 (s, i)로 들어온다.
// 온라인/방문 두 레이아웃을 b.ch.t로 가른다.
import { Crumb } from '@/components/layout/Crumb';
import { ForeignNote, Note } from '@/components/ui/Notes';
import { Stack } from '@/components/ui/Tile';
import { WideButton } from '@/components/ui/WideButton';
import { useApp } from '@/context/AppContext';
import { useGuide } from '@/context/GuideContext';
import { UI } from '@/data/ui';

/**
 * 신청하러 가기. b.ch.t에 따라 온라인(복지로 등) / 방문(행정복지센터 등) 두 레이아웃.
 * 실제 링크는 걸지 않는다 — 시안이라 UI.noLink 문구로 대신. 대신 양주무관에게 문의 초안을 맡기는 버튼을 둠.
 */
export function ApplyScreen({ s, i }: { s: string; i: number }) {
  const { L, lang, stageById } = useApp();
  const { openGuide, draftInquiry } = useGuide();
  const b = stageById(s)?.items[i];
  if (!b) return null;
  const online = b.ch.t === 'online';
  return (
    <>
      <Crumb path={`${L(b.name)} › ${L(UI.apply)}`} />
      <h1>{online ? L(UI.onl) : L(UI.vis)}</h1>
      <div className="list">
        <div className="item lk">
          <span>{L(b.ch.where)}</span>
          <span className="tag">{online ? L(UI.goto) : L(UI.near)}</span>
        </div>
        {online ? (
          <div className="item">{L(UI.prep)}</div>
        ) : (
          <>
            <div className="item">{L(UI.hours)}</div>
            {/* 영어는 "Bring N documents"처럼 숫자가 뒤, 한국어는 "준비물 N개 챙기기"로 숫자가 가운데라 L()로 못 묶었다 */}
            <div className="item">{lang === 'en' ? UI.bring[1] + b.docs.length : `준비물 ${b.docs.length}개 챙기기`}</div>
          </>
        )}
      </div>
      <Stack mt={16}>
        <WideButton label={L(UI.askOff)} onClick={() => { openGuide(); draftInquiry(b); }} />
      </Stack>
      <Note>{L(UI.noLink)}</Note>
      <ForeignNote />
    </>
  );
}
