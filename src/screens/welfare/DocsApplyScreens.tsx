// 혜택 흐름의 마지막 두 화면: 준비물 체크리스트(docs)와 신청하러 가기(apply).
// 둘 다 ItemScreen·QuizScreen 결과에서 (s, i)로 들어온다. 짧아서 한 파일에 묶었다.
import { Crumb } from '@/components/layout/Crumb';
import { CheckItemRow, ForeignNote, Note } from '@/components/ui/Bits';
import { Stack } from '@/components/ui/Tile';
import { WideButton } from '@/components/ui/WideButton';
import { useApp } from '@/context/AppContext';
import { useGuide } from '@/context/GuideContext';
import { UI } from '@/data/ui';

/**
 * 준비물 체크리스트. 체크 상태는 저장 안 함(CheckItemRow 참고).
 * 체크박스 id는 `d{j}` — 화면에 한 목록뿐이라 인덱스만으로 충분.
 */
export function DocsScreen({ s, i }: { s: string; i: number }) {
  const { L, go, stageById } = useApp();
  const b = stageById(s)?.items[i];
  if (!b) return null;
  return (
    <>
      <Crumb path={`${L(b.name)} › ${L(UI.docs)}`} />
      <h1>{L(UI.docs)}</h1>
      <div className="list">
        {b.docs.map((d, j) => <CheckItemRow key={j} id={`d${j}`}>{L(d)}</CheckItemRow>)}
      </div>
      <Stack mt={16}>
        <WideButton primary arrow={null} label={L(UI.allSet)} onClick={() => go({ k: 'apply', s, i })} />
      </Stack>
    </>
  );
}

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
