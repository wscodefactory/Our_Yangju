// 홈. 언어를 고른 뒤 처음 보는 화면이고 Header의 브랜드를 눌러도 여기로 온다.
// 세 개의 큰 입구(시청 민원 / 받은 종이 / 양주에서 살기) + 작은 링크(행사·소개·언어) + 담당자 모드 진입.
// 문구는 전부 <Tr>라서 카드 언어가 zh/vi/ne면 번역돼 보인다.
import type { ReactNode } from 'react';
import { Tr } from '@/components/ui/Tr';
import { useApp } from '@/context/AppContext';
import { SectionIcon, TaskIconSvg } from '@/data/icons';
import { LANG_NAME } from '@/data/tax';
import { UI } from '@/data/ui';

interface DoorProps { icon: ReactNode; lab: ReactNode; k: ReactNode; onClick: () => void }
/** 홈 화면의 큰 입구 버튼. lab이 제목, k가 그 아래 작은 설명줄 */
function Door({ icon, lab, k, onClick }: DoorProps) {
  return (
    <button type="button" className="door" onClick={onClick}>
      {icon}
      <span>
        <span className="lab">{lab}</span>
        <span className="k">{k}</span>
      </span>
      <span className="arr">→</span>
    </button>
  );
}

/** 홈: "오늘 무슨 일로 오셨나요?" */
export function HomeScreen() {
  const { L, T, cl, go } = useApp();
  return (
    <>
      <p className="greet">
        <span className="av" aria-hidden="true">무</span>
        <Tr ko="안녕하세요, 양주무관이에요." en="Hi, I am the Yangju Guide." />
      </p>
      <h1><Tr ko="오늘 무슨 일로 오셨나요?" en="What brings you here today?" /></h1>
      <div className="doors">
        <Door
          icon={<TaskIconSvg.id />}
          lab={<Tr ko="시청·주민센터에 왔어요" en="I am at the city office" />}
          k={<Tr ko="이사·등록·보험·자녀… 어디서, 무엇을 들고, 어떻게" en="Moving, registration, insurance, kids… where, what to bring, how" />}
          onClick={() => go({ k: 'visit' })}
        />
        <Door
          icon={<SectionIcon.letter />}
          lab={<Tr ko="받은 종이가 있어요" en="I got a letter or bill" />}
          k={<Tr ko="찍으면 내 언어로 지금 할 일을 알려드려요" en="Take a photo and I will tell you what to do" />}
          onClick={() => go({ k: 'doc' })}
        />
        <Door
          icon={<TaskIconSvg.home />}
          lab={<Tr ko="양주에서 살기" en="Living in Yangju" />}
          k={<Tr ko="긴급 전화 · 쓰레기 · 병원 · 버스 · 일 · 지원" en="Emergency · trash · hospital · bus · work · support" />}
          onClick={() => go({ k: 'life' })}
        />
      </div>
      {/* 복지 혜택 입구는 여기 없다. '양주에서 살기' 안의 지원 항목에서 welfare로 넘어가는 구조 */}
      <div className="more">
        <button type="button" onClick={() => go({ k: 'events' })}>{L(UI.secEv)}</button>
        <button type="button" onClick={() => go({ k: 'about' })}>{L(UI.secAbout)}</button>
        {/* 지금 카드 언어 이름을 보여주고 누르면 언어 선택으로. ✎는 "바꿀 수 있다"는 표시 */}
        <button type="button" onClick={() => go({ k: 'lang' })}>{LANG_NAME[cl]} ✎</button>
      </div>
      {/* 시연용 담당자 화면 진입. 실제 서비스라면 별도 로그인 뒤에 있어야 할 자리 */}
      <button type="button" className="adminlink" onClick={() => go({ k: 'admin', tab: 'reg' })}>
        {T('담당자 창구 모드 (시연)', 'Officer counter mode (demo)')}
      </button>
    </>
  );
}
