void loadSingleMidiAndSplitTracks(String fileName) {
  try {
    File f = new File(dataPath(fileName));
    // file loading debuging - fixed
    // if(!f.exists()) {
    //   println("[경고] 파일을 못 찾겠어!: " + fileName);
    //   return;
    // }

    Sequence seq = MidiSystem.getSequence(f);
    int ppq = seq.getResolution();
    double localMsPerTick = 60000.0 / (BPM * ppq);

    Track[] midiTracks = seq.getTracks();
    println("[체크] 원본 미디 파일의 총 트랙 수: " + midiTracks.length);

    int validTrackCount = 0; // 살아남은 트랙 수

    for (int i = 0; i < midiTracks.length; i++) {
      Track tr = midiTracks[i];

      // 1차 필터: 너무 텅 빈 트랙 패스
      if (tr.size() <= 1) continue;

      String trackName = "Track " + i;
      int c = color(random(100, 255), random(100, 255), random(200, 255));
      SynthTrack newTrack = new SynthTrack(trackName, c, localMsPerTick);

      // 노트 추출
      fillNoteEvents(tr, newTrack.events);

      // ★★★ [중요] 2차 필터: "커팅" 들어갑니다 ★★★
      // 노트 개수가 10개 미만이면 "잡동사니" 취급하고 버림.
      // (만약 킥 드럼처럼 노트가 적은 악기라면 이 숫자를 5 정도로 낮춰)
      if (newTrack.events.size() < 10) {
        continue; // "넌 너무 가벼워! 탈락!"
      }

      // 합격한 놈들만 등록
      newTrack.sortByTick();
      tracks.add(newTrack);
      validTrackCount++;

      // 콘솔에 생존자 명단 출력 (누가 살아남았는지 확인해봐)
      println("[생존] 트랙 #" + i + " | 노트 수: " + newTrack.events.size());
    }
    println("------------------------------------------------");
    println("[결과] 컷팅 완료! 총 " + validTrackCount + "개의 알짜배기 트랙만 남음.");
  }
  catch (Exception e) {
    e.printStackTrace();
  }
}

void fillNoteEvents(Track midiTrack, ArrayList<Event> out) {
  for (int i = 0; i < midiTrack.size(); i++) {
    MidiEvent me = midiTrack.get(i);
    MidiMessage mm = me.getMessage();
    long tick = me.getTick();

    if (mm instanceof ShortMessage) {
      ShortMessage sm = (ShortMessage) mm;
      int cmd = sm.getCommand();
      int pitch = sm.getData1();
      int vel = sm.getData2();

      if (cmd == ShortMessage.NOTE_ON && vel > 0) {
        out.add(new Event(tick, true, pitch, vel));
      } else if (cmd == ShortMessage.NOTE_OFF || (cmd == ShortMessage.NOTE_ON && vel == 0)) {
        out.add(new Event(tick, false, pitch, vel));
      }
    }
  }
}

// (안전하게 세팅해주는 도우미 함수)
void setTrackConfig(int index, String tag, boolean isVisible) {
  if (index >= 0 && index < tracks.size()) {
    tracks.get(index).setConfig(tag, isVisible);
    println("Track " + index + " 설정됨 -> Tag: " + tag + ", Visible: " + isVisible);
  } else {
    println("[경고] 트랙 번호 틀림: " + index + "번 트랙은 없습니다.");
  }
}


//blurrr
void drawBlurryNeon(float x, float y, float w, float h, color c, float power) {
  noFill();
  blendMode(ADD); // 빛 겹치기 (필수!)

  // === [1. 후광 효과 (Blur Glow)] ===
  // 15겹의 얇은 빛을 겹쳐서 경계선을 없앰
  int layers = 15;

  // 빛이 퍼지는 최대 두께 (power가 클수록 더 넓게 퍼짐)
  float maxStroke = 60 * power;

  for (int i = 0; i < layers; i++) {
    // i가 커질수록(반복할수록) 선이 점점 두꺼워짐
    float weight = map(i, 0, layers, 2, maxStroke);

    // i가 커질수록 투명도는 급격히 낮아짐 (바깥쪽은 희미하게)
    // 255가 아니라 50 정도의 낮은 값으로 시작해서 겹쳐야 부드러움
    float alpha = map(i, 0, layers, 50, 0);

    stroke(c, alpha * power); // 파워 적용
    strokeWeight(weight);
    drawHeartShape(x, y, w, h);
  }

  // === [2. 코어 (Core)] ===
  // 중심부는 하얗고 쨍하게 (전구 필라멘트 느낌)
  stroke(lerpColor(c, color(255), 0.5), 200 * power); // 약간 흰색 섞음
  strokeWeight(2); // 아주 얇고 선명한 선
  drawHeartShape(x, y, w, h);

  blendMode(BLEND); // 원래대로 복구
}

// ==================================================
// ★ 안개처럼 빛나는 네온 구슬 (Energy Orb) 그리기
// ==================================================
void drawGlowingOrb(float x, float y, float size, color c, float power) {
  noStroke();
  blendMode(ADD); // 빛 겹치기 모드 (필수!)

  int layers = 20; // 겹치는 횟수 (많을수록 부드러움)

  // 구슬 그리기 반복문
  for (int i = 0; i < layers; i++) {
    // 0.0 ~ 1.0 진행률
    float progress = (float)i / layers;

    // 1. 크기: 바깥쪽(큰 원) -> 안쪽(작은 원) 순서로 그림
    // size에서 시작해서 점점 0으로 줄어듦
    float r = map(progress, 0, 1, size, 0);

    // 2. 투명도: 아주 낮게 시작해서 겹침
    // power가 셀수록 더 밝게 빛남
    float alpha = 20 * power;

    // 3. 색상: 바깥쪽은 원래 색(c), 안쪽으로 갈수록 흰색(255)에 가까워짐
    // (중심부가 하얗게 타오르는 효과)
    color drawColor = lerpColor(c, color(255), progress * 0.8);

    fill(drawColor, alpha);
    circle(x, y, r);
  }

  blendMode(BLEND); // 원래대로 복구
}
