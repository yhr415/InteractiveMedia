void drawCircleVisibleOnly() {
  // === [세팅] ===
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
    // [텍스트 크기 펌핑 로직]
    // ==========================================
    float labelDist = radius + 30;
    boolean isActive = t.power > 0.1;

    if (isActive) {
      fill(255, 255, 0);
      textSize(24);
      labelDist += 20;
    } else {
      fill(100);
      textSize(10);
    }

    float lx = cx + cos(angle) * labelDist;
    float ly = cy + sin(angle) * labelDist;

    textAlign(CENTER, CENTER);
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

  String scaleTag;
  String drawTag;

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

  void display() {
    float scalePower = (scaleTag != null) ? triggers.get(scaleTag) : 0;
    float drawPower  = (drawTag != null)  ? triggers.get(drawTag) : 0;

    pushMatrix();
    translate(x, y);

    float scaleFactor = 30;

    // 1. 스케일 강도 결정
    if (isMain) {
      if (idNumber == 0) {
        scaleFactor = 80;
      } else {
        scaleFactor = 40; // 1번, 2번 하트는 약하게 커짐
      }
    }

    float currentSize = baseSize + (scalePower * scaleFactor);

    // 2. [isMain] 하트 그리기 로직 (네온만 O)
    if (isMain) {

      if (drawPower > 0.01) {

        noFill();
        stroke(myColor, 255);
        strokeWeight(3);

        float popScale = map(drawPower, 0, 1, 0.9, 1.3);
        float w = currentSize * 1.7 * popScale;
        float h = currentSize * popScale;

        // drawBlurryNeon 호출
        drawBlurryNeon(0, 0, w, h, myColor, drawPower);
      }
    } else {
      // [서브 하트] (기존 로직 유지)
      float alpha = (drawTag != null) ? map(drawPower, 0, 1, 0, 255) : 255;
      if (alpha > 1) {
        fill(myColor, alpha);
        noStroke();
        drawHeartShape(0, 0, currentSize * 1.7, currentSize);
        if (idNumber > 0) {
          fill(255, alpha);
          text(idNumber, 0, 5);
        }
      }
    }
    popMatrix();
  }
}

void drawHeartShape(float x, float y, float w, float h) {
  float topY = y - h * 0.35;
  float bottomY = y + h * 0.55;
  float sideX = w * 0.5;
  float ctrlY_Top = y - h * 0.7;
  float ctrlY_Bottom = y + h * 0.15;

  beginShape();
  vertex(x, topY);
  bezierVertex(x + sideX * 0.5, ctrlY_Top, x + sideX, y - h * 0.1, x, bottomY);
  bezierVertex(x - sideX, y - h * 0.1, x - sideX * 0.5, ctrlY_Top, x, topY);
  endShape(CLOSE);
}

void setupHeartsLayout() {
  float spacing = 160;

  // ==========================================================
  // 1. [중앙] 메인 하트 (0, 0)
  // ==========================================================
  HeartVisual mainHeart = new HeartVisual(0, 0, 200, true, 0, "MAIN_SCALE", "MAIN_DRAW", color(255, 0, 0));
  hearts.add(mainHeart);
  //핑크색 메인하트
  HeartVisual mainHeart1 = new HeartVisual(0, 0, 200, true, 1, "TRACK_1_SCALE", "TRACK_1_DRAW", color(255, 100, 200));
  hearts.add(mainHeart1);

  HeartVisual mainHeart2 = new HeartVisual(0, 0, 200, true, 1, "HEART3_SCALE", "HEART3_DRAW", color(155, 94, 127));
  hearts.add(mainHeart2);
}
