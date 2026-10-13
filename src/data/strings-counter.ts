// 창구 모드 "대화 통역" 문구. 담당자 전용 화면이라 [ko, en] 두 칸만 있고 useApp().T 로 꺼내 쓴다.
// 주민 쪽 버튼 라벨은 LANGS[].native 를 붙여서 쓰므로 여기 없다.
export const CS = {
  title: ['대화 통역', 'Live interpreting'],
  lead: ['버튼을 누르고 말하면 상대 언어로 번역해 보여주고 읽어줘요. 직원 말은 주민 언어로, 주민 말은 한국어로.', 'Press a button and speak. The other side sees and hears the translation: officer to resident language, resident to Korean.'],
  officer: ['직원 말하기 (한국어)', 'Officer speaks (Korean)'],
  resident: ['주민 말하기', 'Resident speaks'],
  listening: ['듣는 중…', 'Listening…'],
  cancel: ['취소', 'Cancel'],
  noSr: ['이 브라우저는 음성 인식을 지원하지 않아요. 아래에 글로 입력해 주세요. (Chrome·Edge·Safari 권장)', 'Speech recognition is not available in this browser. Type below instead. (Chrome, Edge or Safari recommended)'],
  noAi: ['AI 키가 없어 번역이 되지 않아요', 'No AI key, so translation is off'],
  whoOfficer: ['직원', 'Officer'],
  whoResident: ['주민', 'Resident'],
  ph: ['말 대신 글로 입력', 'Type instead of speaking'],
  send: ['보내기', 'Send'],
  translating: ['번역 중…', 'Translating…'],
  trErr: ['번역에 실패했어요. 다시 시도해 주세요.', 'Translation failed. Please try again.'],
  srErr: ['음성을 알아듣지 못했어요. 다시 말해 주세요.', 'Could not recognize speech. Please try again.'],
  noVoice: ['이 기기에 그 언어 음성이 없어 읽어주지 못해요', 'No voice for that language on this device'],
  replay: ['번역 다시 듣기', 'Replay translation'],
  clear: ['대화 지우기', 'Clear'],
} as const satisfies Record<string, readonly [string, string]>;
