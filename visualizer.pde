void drawCircle(ArrayList<SynthTrack> tList) {
  // === [세팅] ===
  float cx = width / 2;       // 화면 중심 X
  float cy = height / 2;      // 화면 중심 Y
  float radius = height * 0.35; // 원의 반지름 (화면 높이의 35%)
  
  // 트랙 수만큼 각도 쪼개기
  int count = tList.size();
  float angleStep = TWO_PI / count; 
  
  // === [그리기 반복] ===
  for (int i = 0; i < count; i++) {
    SynthTrack t = tList.get(i);
    
    // 각도 계산 (12시 방향인 -HALF_PI 부터 시작)
    float angle = -HALF_PI + (i * angleStep);
    
    // 극좌표계 변환 (각도와 거리로 X, Y 좌표 구하기)
    float x = cx + cos(angle) * radius;
    float y = cy + sin(angle) * radius;
    
    // --- [시각 효과 1: 중앙 연결선] ---
    // 소리가 날 때만 중앙이랑 연결되는 레이저 빔 쏘기
    if (t.power > 0.01) {
      stroke(t.trackColor, t.power * 150); // 투명도 조절
      strokeWeight(1 + t.power * 2);
      line(cx, cy, x, y);
    }

    // --- [시각 효과 2: 트랙 원 (Orb)] ---
    // 비트가 터지면(power가 크면) 원도 커짐
    float orbSize = 15 + (t.power * 40); 
    
    noStroke();
    fill(t.trackColor, 200); // 기본 색상
    circle(x, y, orbSize);
    
    // --- [시각 효과 3: 하이라이트 (Sustain)] ---
    // 꾹 누르고 있는 음(Sustain)이 있으면 테두리 발광
    if (t.isNoteSus) {
      noFill();
      stroke(255, 200);
      strokeWeight(2);
      circle(x, y, orbSize + 10);
    }

    // --- [텍스트] ---
    // 원 바깥쪽에 트랙 번호 적기
    float labelDist = radius + 40; // 원보다 조금 더 멀리
    float lx = cx + cos(angle) * labelDist;
    float ly = cy + sin(angle) * labelDist;
    
    fill(150);
    textSize(10);
    textAlign(CENTER, CENTER);
    text(i, lx, ly);
  }
  
  // (선택사항) 화면 정중앙에 멋으로 하나 그려두기
  noStroke();
  fill(30);
  circle(cx, cy, 20);
}

// ★ 메인 신스 전용 비주얼라이저 (가로 파형 스타일)
void drawMainVisualizer(SynthTrack t) {
  float cy = height / 2;
  
  // 1. 소리가 날 때 (Trigger) - 화면 전체 번쩍임(약하게)
  if (t.isNoteStart) {
    noStroke();
    fill(t.trackColor, 50);
    rect(0, 0, width, height);
  }
  
  // 2. 파형 그리기
  noFill();
  stroke(t.trackColor);
  strokeWeight(2 + t.power * 5); // 소리 크면 선이 굵어짐
  
  beginShape();
  for (int x = 0; x <= width; x += 10) {
    // 기본 y 위치 + 진동
    // power가 0이면 일직선, 1이면 미친듯이 요동침
    float noiseVal = noise(x * 0.01, frameCount * 0.1); // 자연스러운 움직임
    float amp = t.power * 150; // 진동 폭
    
    // sin파와 노이즈를 섞어서 전기 같은 느낌 줌
    float y = cy + sin(x * 0.05 + frameCount * 0.2) * (amp * 0.2) 
                 + (noiseVal - 0.5) * amp * 2;
                 
    vertex(x, y);
  }
  endShape();
  
  // 3. 텍스트 라벨 (화면 상단 중앙)
  fill(255);
  textAlign(CENTER);
  text("MAIN SYNTH: " + t.name, width/2, cy - 100);
}