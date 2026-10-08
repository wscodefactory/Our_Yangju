// 아이콘 한 곳. 참고용 html의 ic(name, cls)와 같은 이름을 Lucide 컴포넌트로 연결한다.
// 크기·선 굵기는 global.css의 .ic / .ic.sm / .ic.lg 가 정한다 (24px, 1.9, 둥근 끝 = 디자인시스템 §5).
// 장식용이라 전부 aria-hidden. 버튼의 이름은 호출부가 aria-label로 준다.
import {
  AlertTriangle, AppWindow, ArrowLeft, ALargeSmall, Bookmark, Briefcase, Building2, Bus, Calendar, Camera, Car, Check,
  ChevronRight, CircleHelp, Copy, Cross, ExternalLink, FileText, FlaskConical, Flower2, Globe, Heart, House, IdCard, Info,
  Landmark, MapPin, Maximize, MessageCircle, Mountain, Palette, Pencil, Phone, Send, ShieldCheck, Siren, Smile, TrainFront,
  Trash2, User, Users, Utensils, Volume2, X, type LucideIcon,
} from 'lucide-react';

const MAP = {
  globe: Globe, textsize: ALargeSmall, bookmark: Bookmark, back: ArrowLeft, chev: ChevronRight, close: X, chat: MessageCircle,
  send: Send, phone: Phone, copy: Copy, ext: ExternalLink, volume: Volume2, expand: Maximize, check: Check, landmark: Landmark,
  file: FileText, heart: Heart, house: House, idcard: IdCard, medical: Cross, smile: Smile, car: Car, help: CircleHelp,
  siren: Siren, trash: Trash2, bus: Bus, train: TrainFront, briefcase: Briefcase, calendar: Calendar, pin: MapPin, info: Info,
  alert: AlertTriangle, shield: ShieldCheck, camera: Camera, pencil: Pencil, sample: FlaskConical, mountain: Mountain,
  flower: Flower2, palette: Palette, utensils: Utensils, user: User, users: Users, building: Building2, web: AppWindow,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof MAP;

/** <Ic n="globe" /> · n은 참고용 html의 아이콘 이름 그대로. cls는 'sm' | 'lg' | 'filled' 조합 */
export function Ic({ n, cls = '' }: { n: IconName | string; cls?: string }) {
  const C = MAP[n as IconName] || CircleHelp;
  return <C className={`ic ${cls}`.trim()} aria-hidden="true" focusable="false" />;
}
