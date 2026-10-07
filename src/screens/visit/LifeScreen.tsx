// "양주에서 살기" 생활 안내 입구: 주제 타일 목록(life). 누르면 LifeItemScreen으로 간다.
// 복지처럼 다른 섹션으로 보내는 타일(go)도 섞여 있다. 데이터는 LIFE(data/civic). 원본 html의 #life.
import { Crumb } from '@/components/layout/Crumb';
import { Grid, Tile } from '@/components/ui/Tile';
import { Tr } from '@/components/ui/Tr';
import { useApp } from '@/context/AppContext';
import { LIFE } from '@/data/civic';

/** 양주에서 살기: 무엇이 필요하세요? */
export function LifeScreen() {
  const { go } = useApp();
  return (
    <>
      {/* 빵부스러기 첫 칸. LifeItemScreen과 같은 문구 */}
      <Crumb path={<Tr ko="양주에서 살기" en="Living in Yangju" />} />
      <h1><Tr ko="무엇이 필요하세요?" en="What do you need?" /></h1>
      <Grid>
        {LIFE.map((topic) => (
          // go가 있으면 상세 대신 그 섹션(현재는 welfare뿐)으로 바로 보낸다
          <Tile key={topic.id} onClick={() => go(topic.go ? { k: topic.go } : { k: 'lifeitem', v: topic.id })}>
            <span className="lab" style={{ fontSize: '1.3em' }}><Tr ko={topic.name[0]} en={topic.name[1]} /></span>
          </Tile>
        ))}
      </Grid>
    </>
  );
}
