# 01 — URL 입력 · 변환 · 결과 확인

## Outcome

사용자가 URL을 붙여넣어 제출하면 서버가 대상 페이지를 가져와 defuddle로 본문을
정제하고 Markdown으로 변환해, 제목·저자·렌더링된 Markdown을 보여준다. 유효하지
않은 URL 형식은 인라인 에러로, 페이지를 가져오거나 파싱하지 못하는 경우는
재시도 가능한 에러로 처리한다. "지우기"로 언제든 초기 상태로 되돌릴 수 있고,
화면 어디서나 라이트/다크 모드를 전환할 수 있으며 새로고침해도 유지된다.

## Blockers

None.

## Acceptance criteria

- [x] 유효하지 않은 URL 형식을 제출하면 변환이 시작되지 않고 인라인 에러가 보인다.
- [x] 유효한 URL을 제출하면 로딩 상태를 거쳐 성공 시 제목과 저자, 렌더링된
      Markdown이 보인다.
- [x] 대상 페이지를 가져오거나 파싱할 수 없으면 에러 메시지가 보이고 같은 URL로
      재시도할 수 있다.
- [x] "지우기"를 누르면 입력값과 결과 화면이 모두 초기 상태로 돌아간다.
- [x] 다크모드를 토글하면 화면 전체가 전환되고, 새로고침 후에도 선택한 모드가
      유지된다.

## Constraints

- 대상 페이지는 서버에서 가져온다(브라우저가 직접 fetch하면 대부분 CORS로
  막힌다).
- 다크모드는 시스템 설정을 따르지 않는 수동 토글이며, 브라우저 로컬 저장만
  사용한다(서버 저장 없음).

## Verification

- 스킴이 없거나 형식이 올바르지 않은 입력이 네트워크 호출 없이 인라인 에러로
  거부되는지 확인.
- 실제 접근 가능한 URL 하나로 제출부터 제목/저자/Markdown 표시까지 전체 경로 확인.
- 접근 불가하거나 파싱할 수 없는 URL로 에러 표시와 재시도 동작 확인.
- 다크모드를 켠 뒤 새로고침해 상태가 유지되는지 확인.

## Review checkpoint

None.

## Status

completed

## Execution

- Verification: `bun run lint`, `bun run typecheck`, `bun run test` (19/19 passed)
  all clean. Live-verified against the running dev server: invalid input
  ("그냥 아무 텍스트") rejected with no network call; a real reachable URL
  (`https://en.wikipedia.org/wiki/Web_scraping`) converted end-to-end via
  `/api/convert` → title/author/rendered Markdown shown; an unreachable URL
  (`.../Does_Not_Exist_Nonsense_Page_12345`) produced the error card, and
  "다시 시도" re-issued the request; "지우기" reset input and result state;
  dark mode toggled the `dark` class and persisted through a full page
  reload via `localStorage`.
  `code-review low` over the diff found one real defect (stale result stayed
  visible after submitting an invalid URL following a prior success); fixed
  in `app/page.tsx`, covered by a new test in `app/page.test.tsx`, and
  reverified live in the running app.
- Blocker: —
- Revision: —
