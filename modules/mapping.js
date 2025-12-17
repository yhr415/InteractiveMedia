function manualMapping() {
  // 트랙이 없으면 중단 (Java의 .size() 대신 .length 사용)
  if (tracks.length === 0) return;

  console.log("=== [수동 매핑 시작] ===");
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

  setTrackConfig(10,"TEXT_CLOUD",false);
  setTrackConfig(11,"TEXT_CLOUD",false);
  setTrackConfig(12,"TEXT_CLOUD",false);

  setTrackConfig(17,"BASS_ZOOM", false);
  setTrackConfig(20,"BASS_ZOOM", false);

  setTrackConfig(22,"COMBO_BIT",false);

  setTrackConfig(18,"PULSE_TAG",false);
  
  setTrackConfig(1,null,false);
  setTrackConfig(3,null,false);
  setTrackConfig(13,null,false);
  setTrackConfig(14,null,false);
  setTrackConfig(15,null,false);
  setTrackConfig(19,null,false);


  console.log("=== [수동 매핑 완료] ===");
}