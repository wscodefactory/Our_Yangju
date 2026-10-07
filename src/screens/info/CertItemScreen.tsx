// 인증 음식점 상세(certItem). 가게 목록은 들고 있지 않고 네이버 지도 검색(c.q)으로 내보낸다.
// 데이터는 data/info.ts의 CERTS, 인덱스 i로 찾는다. CertScreen에서 들어온다.
import { Crumb } from '@/components/layout/Crumb';
import { InfoCard } from '@/components/ui/Cards';
import { SourceLine } from '@/components/ui/Notes';
import { Stack } from '@/components/ui/Tile';
import { WideButton } from '@/components/ui/WideButton';
import { useApp } from '@/context/AppContext';
import { CERTS, CERT_SRC, NAVER_SRC, naverMap } from '@/data/info';
import { UI } from '@/data/ui';

/** 인증 상세: 누가 주는 인증인지, 무엇을 보는지 + 네이버 지도에서 찾기(c.q가 검색어) */
export function CertItemScreen({ i }: { i: number }) {
  const { L } = useApp();
  const c = CERTS[i];
  if (!c) return null;
  return (
    <>
      <Crumb path={`${L(UI.cert)} › ${L(c.name)}`} />
      <h1>{L(c.name)}</h1>
      <InfoCard rows={[[L(UI.certBy), L(c.by)], [L(UI.certWhat), L(c.what)]]} />
      <Stack mt={12}>
        <WideButton primary href={naverMap(c.q)} label={L(UI.certFind)} />
      </Stack>
      <SourceLine items={[CERT_SRC, NAVER_SRC]} />
    </>
  );
}
