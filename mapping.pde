void manualMapping() {
  // 트랙이 없으면 중단
  if (tracks.size() == 0) return;

  println("=== [수동 매핑 시작] ===");

  // ========================================================
  // ★ 여기서 네가 직접 번호를 적어서 세팅해! (인덱스는 0부터 시작)
  // 사용법: tracks.get(번호).setConfig("태그이름", 보일지여부T/F);
  // ========================================================

  // [그룹 1] 신스 1번 그룹 -> 메인 하트를 "그리기(DRAW)"만 함
  setTrackConfig(0, "MAIN_DRAW", false); //0번트랙은 가장 메인신스, 노래 가장앞, 뒤에서 나오는...
  //날카로운 saw같은 신스임...!

//20번 트랙은 신스중에 bass
  setTrackConfig(20,"MAIN_IN_DRAW",false);
  setTrackConfig(21,"MAIN_IN_DRAW",false);


  // [그룹 2] 신스 2번 그룹 -> 메인 하트를 "키우기(SCALE)"만 함
  // 예: 2번, 3번 트랙이 신스 2라면?
  //setTrackConfig(2, "MAIN_SCALE", false);

  // [그룹 3] 킥/베이스 -> 서브 하트(1~8번) 펌핑용
  // 4번 트랙이 킥이라면?
  //setTrackConfig(4, "SUB_SCALE", true); // true니까 원형 비주얼라이저에도 보임!

  //println("=== [수동 매핑 완료] ===");
}