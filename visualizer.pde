void drawCircleVisibleOnly() {
  // === [세팅] ===
  // draw()에서 translate(width/2, height/2)를 했으니 중심은 0,0
  float cx = 0;
  float cy = 0;
  float radius = height * 0.35; // 원의 반지름

  // 1. 보이는 녀석들만 골라내기 (Visible check)
  ArrayList<SynthTrack> visibleList = new ArrayList<SynthTrack>();
  for (SynthTrack t : tracks) {
    if (t.visible) visibleList.add(t);
  }

  // 없으면 운동 종료
  int count = visibleList.size();
  if (count == 0) return;

  // 각도 계산
  float angleStep = TWO_PI / count;

  // 2. 그리기 반복
  for (int i = 0; i < count; i++) {
    SynthTrack t = visibleList.get(i);

    // 각도 계산 (12시 방향 -HALF_PI 부터 시작)
    float angle = -HALF_PI + (i * angleStep);

    // 좌표 변환
    float x = cx + cos(angle) * radius;
    float y = cy + sin(angle) * radius;

    // --- [시각 효과 1: 중앙 연결선] ---
    if (t.power > 0.01) {
      stroke(t.trackColor, t.power * 150);
      strokeWeight(1 + t.power * 2);
      line(cx, cy, x, y);
    }

    // --- [시각 효과 2: 트랙 원 (Orb)] ---
    float orbSize = 15 + (t.power * 40);

    noStroke();
    fill(t.trackColor, 200);
    circle(x, y, orbSize);

    // --- [시각 효과 3: 하이라이트 (Sustain)] ---
    if (t.isNoteSus) {
      noFill();
      stroke(255, 200);
      strokeWeight(2);
      circle(x, y, orbSize + 10);
    }

    // ==========================================
    // ★ [핵심 수정] 텍스트 크기 펌핑 로직 ★
    // ==========================================

    // 기본 거리
    float labelDist = radius + 30;

    // "지금 소리 지르는 중인가?" (Power > 0.1)
    boolean isActive = t.power > 0.1;

    if (isActive) {
      // 🔥 활성 상태: 글씨가 커지고, 색이 밝아지고, 밖으로 튀어나옴
      fill(255, 255, 0); // 형광 노란색 (눈에 잘 띔)
      textSize(24);      // 글자 크기 2.4배 떡상 (기본 10 -> 24)
      labelDist += 20;   // 원이랑 겹치지 않게 밖으로 더 밀어냄
    } else {
      // 💤 비활성 상태: 얌전히 있음
      fill(100);         // 어두운 회색
      textSize(10);      // 작게 유지
    }

    // 텍스트 위치 계산 (labelDist가 변했으므로 여기서 계산)
    float lx = cx + cos(angle) * labelDist;
    float ly = cy + sin(angle) * labelDist;

    textAlign(CENTER, CENTER);

    // 원래 트랙 번호 표시 (T-번호)
    int originalIndex = tracks.indexOf(t);
    text("T-" + originalIndex, lx, ly);
  }
}

class HeartVisual {
  float x, y;
  float baseSize;
  boolean isMain;
  int idNumber;
  int myColor;

  // 1. 하트 껍데기용 태그
  String scaleTag;
  String drawTag;

  // ★ 2. [추가] 안쪽 구슬(Core)용 태그 (따로 관리!)
  String innerDrawTag = null;  // 이 신호가 와야 구슬이 보임
  String innerScaleTag = null; // 이 신호가 오면 구슬이 커짐

  // 생성자 (기존과 동일 - 구슬 설정은 따로 함수로 뺌)
  HeartVisual(float x, float y, float size, boolean isMain, int idNumber, String scaleTag, String drawTag, int c) {
    this.x = x;
    this.y = y;
    this.baseSize = size;
    this.isMain = isMain;
    this.idNumber = idNumber;
    this.scaleTag = scaleTag;
    this.drawTag = drawTag;
    this.myColor = c;
  }

  // ★ [추가] 구슬 전용 태그 설정 함수 (셋업할 때 이거 호출하면 됨)
  void setInnerTags(String inDraw, String inScale) {
    this.innerDrawTag = inDraw;
    this.innerScaleTag = inScale;
  }

  void display() {
    // ---------------------------------------------------------
    // 1. main heart 그리기
    // ---------------------------------------------------------
    float scalePower = (scaleTag != null) ? triggers.get(scaleTag) : 0;
    float drawPower  = (drawTag != null)  ? triggers.get(drawTag) : 0;

    float alpha = 255;
    if (drawTag != null) {
      alpha = map(drawPower, 0, 1, 0, 255);
    }

    pushMatrix();
    translate(x, y);

    float currentSize = baseSize + (scalePower * (isMain ? 80 : 30));

    if (isMain) {
      // drawPower(0~1)를 크기 배율로 변환
      // 소리 0일 때 -> 원래 크기의 50% (0.5)
      // 소리 1일 때 -> 원래 크기의 110% (1.1) -> 약간 오버해서 커짐!
      float popScale = map(drawPower, 0, 1, 0.9, 1.3);

      // 계산된 배율(popScale)을 가로, 세로에 곱해줌
      // 가로 1.7배 비율은 유지하면서 popScale 추가 적용
      float w = currentSize * 1.7 * popScale;
      float h = currentSize * popScale;

      // 블러 네온 그리기
      // 빨간색(255, 0, 0)
      drawBlurryNeon(0, 0, w, h, color(255, 0, 0), drawPower);
      // ---------------------------------------------------------
      // ★ 2. [핵심] 안쪽 구슬(Core) 로직 (태그 분리!)
      // ---------------------------------------------------------

      // 구슬용 파워 가져오기
      float inDrawPower = (innerDrawTag != null) ? triggers.get(innerDrawTag) : 0;
      float inScalePower = (innerScaleTag != null) ? triggers.get(innerScaleTag) : 0;

      // ★ 구슬 그리기 조건: innerDrawTag가 설정되어 있고, 신호가 왔을 때만!
      if (innerDrawTag != null && inDrawPower > 0.01) {

        // 구슬 투명도 및 파워 계산 (0.0 ~ 1.0 사이 값으로 power 전달)
        // inDrawPower 자체가 0~1 사이 값이므로 그대로 power로 씀
        float orbPower = inDrawPower;

        // 구슬 크기 (기본 크기 + 스케일 신호 받으면 펌핑)
        // 네온 효과라서 조금 더 큼직하게 잡아야 예쁨 (* 1.5 추가함)
        float coreSize = ((currentSize * 0.4) + (inScalePower * 30)) * 1.5;

        // ★ [수정] 딱딱한 circle 대신, 빛나는 구슬 함수 호출!
        // (x, y, 크기, 색상, 강도)
        // 색상은 myColor를 그대로 쓰거나, 조금 더 밝게 조정해서 넘김
        drawGlowingOrb(0, 0, coreSize, myColor, orbPower);
      }
    } else {
      // 서브 하트 그리기 (기존 동일)
      fill(myColor, alpha);
      noStroke();
      drawHeartShape(0, 0, currentSize * 1.7, currentSize);
      if (idNumber > 0) {
        fill(255, alpha);
        text(idNumber, 0, 5);
      }
    }

    popMatrix();
  }
}
// ==================================================
// ★ 하트 그리기 도구 (이게 없으면 에러 남!)
// x, y: 위치, w, h: 너비와 높이
// ==================================================
void drawHeartShape(float x, float y, float w, float h) {
  // 하트 모양을 잡기 위한 좌표 계산 (베지어 곡선 제어점)
  float topY = y - h * 0.35;
  float bottomY = y + h * 0.55;
  float sideX = w * 0.5;
  float ctrlY_Top = y - h * 0.7;
  float ctrlY_Bottom = y + h * 0.15;

  beginShape();

  // 1. 위쪽 중앙에서 시작
  vertex(x, topY);

  // 2. 오른쪽 곡선 그리기
  bezierVertex(x + sideX * 0.5, ctrlY_Top,
    x + sideX, y - h * 0.1,
    x, bottomY);

  // 3. 왼쪽 곡선 그리기
  bezierVertex(x - sideX, y - h * 0.1,
    x - sideX * 0.5, ctrlY_Top,
    x, topY);

  endShape(CLOSE);
}

// ==================================================
// ★ 하트 배치 및 태그/색상 부여 함수
// ==================================================
void setupHeartsLayout() {
  // 간격 조절 (좌표가 -2, +2까지 가니까 간격을 조금 좁혀도 괜찮을 듯?)
  float spacing = 160;

  // ==========================================================
  // 1. [중앙] 메인 하트 (0, 0)
  // ==========================================================
  HeartVisual mainHeart = new HeartVisual(0, 0, 200, true, 0, "MAIN_SCALE", "MAIN_DRAW", color(255, 0, 0));
  mainHeart.setInnerTags("MAIN_IN_DRAW", "MAIN_IN_SCALE");
  hearts.add(mainHeart);

  // ==========================================================
  // 2. [주변] 서브 하트들 (지정된 좌표에 배치)
  // ==========================================================

  // 네가 요청한 8개의 좌표 리스트
  // 순서: (-2,0), (-1,1), (-1,-1), (0,2), (0,-2), (1,1), (1,-1), (2,0)
  int[] gridX = {-2, -1, -1, 0, 0, 1, 1, 2};
  int[] gridY = { 0, 1, -1, 2, -2, 1, -1, 0};

  for (int i = 0; i < 8; i++) {
    float px = gridX[i] * spacing;
    float py = gridY[i] * spacing;

    // 서브 하트 생성
    // 크기는 메인(200)보다 조금 작게 120 정도로 줄였어 (원하면 키워!)
    // 번호는 1번부터 시작 (i + 1)
    hearts.add(new HeartVisual(px, py, 200, false, i + 1, "SUB_SCALE", null, color(200, 20, 20)));
  }
}
