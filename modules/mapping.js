function manualMapping() {
  // 트랙이 없으면 중단 (Java의 .size() 대신 .length 사용)
  if (tracks.length === 0) return;

  console.log("=== [수동 매핑 시작] ===");

  // ========================================================
  // ★ 여기서 네가 직접 번호를 적어서 세팅해! (인덱스는 0부터 시작)
  // 사용법: setTrackConfig(번호, "태그이름", 보일지여부T/F);
  // ========================================================

  // [그룹 1] 신스 1번 그룹 -> 메인 하트를 "그리기(DRAW)"만 함
  setTrackConfig(0, "MAIN_DRAW", false); // 0번트랙: 가장 메인신스 (Saw 느낌)
  setTrackConfig(9, "MAIN_DRAW", false);

  setTrackConfig(2, "SUB_DRAW", false);

  // 킥/베이스 (글리치 효과)
  // 3번은 주석 처리되어 있어서 제외했어
  setTrackConfig(7, "KICK_PEAK", false);
  setTrackConfig(6, "KICK_PEAK", false);
  setTrackConfig(8, "KICK_PEAK", false);
  // kickpeak는 글리치효과에 해당!

  setTrackConfig(5, "MAIN_IN_DRAW", false);

  setTrackConfig(4, "HEART_PATTERN", false);

  setTrackConfig(16, "DIAMOND_HIT", false);

  setTrackConfig(21, "BASS_POWER", false);

  setTrackConfig(23,"HEART_BURST",false);
  // t21이 808 (Bass)

  // [그룹 2] 주석 처리된 예시들은 그대로 둠
  // setTrackConfig(2, "MAIN_SCALE", false);
  // setTrackConfig(4, "SUB_SCALE", true); 

  console.log("=== [수동 매핑 완료] ===");
}