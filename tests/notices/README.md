# 고지서 인식 정확도 테스트

`cases.json` 에 적힌 사진을 앱과 **같은 프롬프트**(`src/services/prompts.ts` 의 `READ_NOTICE_PROMPT`)로 Gemini 에 보내, 기대값과 비교해 정답률을 낸다.
실제 고지서 사진이 쌓일수록 "정답률 n%" 를 근거 있게 말할 수 있다.

## 사진 추가하기

1. **이름·주소·납세번호·차량번호를 먼저 가린다.** 검은 스티커나 사진 앱의 펜 도구로 완전히 덮는다. 가리지 않은 사진은 넣지 않는다 (깃에 올라간다).
2. 고지서를 평평하게 펴고 정면에서, 글자가 읽힐 만큼 밝게 찍는다. 1~2 MB 크기면 충분하다 (`.jpg` 또는 `.png`).
3. 파일을 이 폴더에 넣는다. 이름은 `세목-금액.jpg` 식이면 알아보기 쉽다 (예: `property-312500.jpg`).
4. `cases.json` 에 항목을 추가한다.

```json
{
  "file": "property-312500.jpg",
  "note": "2026년 재산세, 양주시",
  "expected": {
    "tax_type": "property",
    "amount_won": 312500,
    "due_date": "2026-07-31",
    "epay_no": "1163-0202-6120-0043-21",
    "vacct_digits": "790-9999-1234-567"
  }
}
```

`expected` 는 **고지서에 인쇄된 값을 사람이 보고** 적는다.

| 항목 | 적는 법 |
|---|---|
| `tax_type` | `auto`(자동차세) / `resident`(주민세) / `property`(재산세) / `income`(지방소득세) / `other` |
| `amount_won` | 납부할 금액, 숫자만 (쉼표 없이) |
| `due_date` | 납기일 `YYYY-MM-DD` |
| `epay_no` | 전자납부번호, 인쇄된 그대로 (하이픈 있어도 됨. 숫자만 비교한다) |
| `vacct_digits` | 가상계좌의 **숫자 부분만** (은행명은 뺀다). 모델 응답에 이 숫자가 포함되면 정답 |

참고: 앱은 사진을 긴 변 1200px JPEG 로 줄여서 보내지만, 이 테스트는 원본 파일을 그대로 보낸다. 큰 사진에서 결과가 다르면 앱에서 한 번 더 확인한다.

## 실행

```
npm run eval:notices            # 표만 출력
npm run eval:notices -- --json  # tests/notices/last-run.json 에도 저장 (깃에 안 올라감)
```

`.env` 의 `VITE_GEMINI_API_KEY`, `VITE_GEMINI_MODEL` 을 쓴다. 사진 한 장에 10~20초 걸린다.

## 결과 읽기

```
file | tax_type | amount_won | due_date | epay_no | vacct | ms
sample-auto-143000.png | ✓ | ✓ | ✓ | ✓ | ✓ | 12756
  got: {...}            ← 틀린 항목이 있을 때만, 모델이 실제로 읽은 값

tax_type    100%        ← 항목별 정답률
...
정답률 (모든 항목 일치) 1/1 = 100%   ← 보고용 숫자: 다섯 항목이 전부 맞은 사진의 비율
```

하나라도 틀리면 종료 코드 1. 틀린 경우 `got:` 줄을 보고 사진 문제(흐림·가림)인지 프롬프트 문제인지 판단한다.

## 결과 기록

실행할 때마다 날짜·모델·사진 수·정답률을 **공유 결과 문서**에 한 줄 적는다. `last-run.json` 은 로컬 참고용이라 깃에 올라가지 않는다.
