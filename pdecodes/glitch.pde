// ==================================================
// ★ [FINAL UPDATE] GlitchVisual 클래스 (랜덤 격자 위치/크기 반영)
// ==================================================
class GlitchVisual {
  float x, y;
  float baseSize;
  int myColor;
  String glitchTag;

  float lastGlitchPower = 0;

  // 콘텐츠 관련 변수
  int activeIndex = -1;
  float alpha = 0;

  final static int TYPE_RECT = 0;
  final static int TYPE_IMAGE = 1;
  final static int TYPE_VIDEO = 2;
  final static int TYPE_CUSTOM_DRAW = 3;
  final static int TYPE_GRID = 4;
  int contentType = TYPE_RECT;
  PImage displayImage = null;
  PGraphics customCanvas = null;

  // ★ [NEW] 랜덤 격자 속성 변수
  float gridXOffset = 0;
  float gridYOffset = 0;
  float gridSpacing = 85.0; // 기본값

  float[][] rectPresets = {
    // 1-4. 좌우 수직 벽에 붙임 (X 경계 = 550)
    {-550, 0, 10, 900}, // 1. 좌측 벽에 붙은 세로선 (두께 10)
    {550, 0, 10, 900}, // 2. 우측 벽에 붙은 세로선 (두께 10)
    {-400, 0, 300, 600}, // 3. 중앙에서 왼쪽에 붙은 큰 블록 (X: -550까지 닿음)
    {400, 0, 300, 600}, // 4. 중앙에서 오른쪽에 붙은 큰 블록 (X: +550까지 닿음)

    // 5-8. 상하 수평 벽에 붙임 (Y 경계 = 450)
    {0, -450, 1100, 10}, // 5. 상단 벽에 붙은 가로선 (두께 10)
    {0, 450, 1100, 10}, // 6. 하단 벽에 붙은 가로선 (두께 10)
    {0, -300, 800, 300}, // 7. 중앙에서 위쪽에 붙은 넓은 블록 (Y: -450까지 닿음)
    {0, 300, 800, 300}, // 8. 중앙에서 아래쪽에 붙은 넓은 블록 (Y: +450까지 닿음)

    // 9-12. 모서리 (Corner) 옵션 (두 벽에 동시에 붙음)
    {-275, -225, 550, 450}, // 9. 좌상단 1/4 영역을 덮는 블록
    {275, -225, 550, 450}, // 10. 우상단 1/4 영역을 덮는 블록
    {-275, 225, 550, 450}, // 11. 좌하단 1/4 영역을 덮는 블록
    {275, 225, 550, 450}, // 12. 우하단 1/4 영역을 덮는 블록

    // 13-16. 극단적인 오버레이 (Overlays)
    {0, 0, 1200, 100}, // 13. 화면 전체를 가로지르는 두꺼운 띠 (X 오버)
    {0, 0, 100, 1000}, // 14. 화면 전체를 세로지르는 두꺼운 띠 (Y 오버)
    {0, 0, 1100, 900}, // 15. 화면 전체를 덮는 정사각형 (전체 깜빡임)
    {0, 0, 1200, 1000}, // 16. 화면 경계를 완전히 넘어가는 오버사이즈

    // 17-20. 비대칭 오프셋 및 중앙 통과
    {-450, 100, 200, 700}, // 17. 좌측 하단에 붙어있고 길게 뻗은 블록
    {450, -100, 200, 700}, // 18. 우측 상단에 붙어있고 길게 뻗은 블록
    {-300, -300, 500, 500}, // 19. 좌상단 모서리 쪽에서 중앙을 침범하는 중간 사이즈
    {300, 300, 500, 500}     // 20. 우하단 모서리 쪽에서 중앙을 침범하는 중간 사이즈
  };

  GlitchVisual(float x, float y, float size, String tag, int c) {
    this.x = x;
    this.y = y;
    this.baseSize = size;
    this.glitchTag = tag;
    this.myColor = c;
  }

  void setImage(PImage img) {
    this.displayImage = img;
  }

  // 글리치 발동 로직: 랜덤으로 콘텐츠 타입과 프리셋을 선택
  void triggerGlitch() {
    int[] availableTypes = {TYPE_RECT, TYPE_IMAGE, TYPE_GRID};
    contentType = availableTypes[int(random(availableTypes.length))];

    activeIndex = int(random(rectPresets.length));
    alpha = 255;

    // ★ [핵심] 격자 속성 랜덤화 (TYPE_GRID일 경우에만)
    if (contentType == TYPE_GRID) {
      // 1. 간격 랜덤화 (60 ~ 100 픽셀)
      gridSpacing = random(60, 100);

      // 2. 위치 랜덤 오프셋 (중앙에서 +/- 200 픽셀 범위 내에서 이동)
      gridXOffset = random(-200, 200);
      gridYOffset = random(-200, 200);
    }
  }

  void display() {
    float gPower = (glitchTag != null) ? triggers.get(glitchTag) : 0;

    // 1. 피크 감지 로직
    if (gPower - lastGlitchPower > 0.1) {
      triggerGlitch(); // 글리치 발동!
    }
    lastGlitchPower = gPower;

    // 2. 글리치 그리기 로직
    if (alpha <= 1) return;

    pushMatrix();
    translate(x, y);

    // 광속 소멸 (Fade Out)
    alpha -= 20;

    float sizeFactor = 1.0;

    float[] p = rectPresets[activeIndex];
    float rx = p[0];
    float ry = p[1];
    float rw = p[2] * sizeFactor;
    float rh = p[3] * sizeFactor;

    pushStyle();

    drawContent(rx, ry, rw, rh);

    popStyle();
    popMatrix();
  }

  // 콘텐츠 그리기 함수
  void drawContent(float cx, float cy, float cw, float ch) {

    // 1. 기본 배경 프레임 (그리드 제외)
    if (contentType != TYPE_GRID) {
      rectMode(CENTER);
      noFill();
      stroke(255, alpha); // 흰색 프레임
      strokeWeight(2);
      rect(cx, cy, cw, ch);
    }

    // 2. 타입별 내부 콘텐츠 채우기
    switch (contentType) {
    case TYPE_RECT:
      // 사각형 모드 (★ [핵심] 번쩍임 로직 적용)

      float flickerFactor = 1.0;

      // 5% 확률로 아예 건너뛰어 사라지는 효과를 줌 (깜빡임의 '사라짐' 부분)
      if (random(1) < 0.3) {
        break;
      }

      // 10% 확률로 강하게 번쩍이는 효과를 줌 (깜빡임의 '나타남' 부분)
      if (random(1) < 0.1) {
        flickerFactor = 1.8;
      }

      // 나머지 프레임은 무작위로 알파값을 살짝 흔들어서 노이즈 추가
      flickerFactor += random(-0.4, 0.4);
      flickerFactor = constrain(flickerFactor, 0.1, 1.8);

      // 기본 투명도(alpha)에 랜덤 팩터를 곱해서 최종 투명도 결정
      float currentAlpha = constrain(alpha * flickerFactor, 0, 255);

      // 내부 채우기 (흰색)
      fill(255);

      // 테두리 (myColor) - 테두리는 살짝 덜 강하게 번쩍이도록 0.7 곱함
      noStroke();

      rect(cx, cy, cw, ch);
      break; // TYPE_RECT 끝

    case TYPE_IMAGE:
      // 이미지 모드
      if (displayImage != null) {
        tint(255, alpha);
        imageMode(CENTER);
        image(displayImage, cx, cy, cw, ch);
        noTint();
      } else {
        fill(255, alpha * 0.1);
        rect(cx, cy, cw, ch);
      }
      break;

    // case TYPE_VIDEO:
    //   // ★★★ [최종 로직] PImage 잘라내기 후 글리치 영역에 맞춰 그리기 ★★★
    //   if (cam != null && cam.loaded) {

    //     pushMatrix();

    //     // translate(cx, cy)로 프리셋 중심점으로 이동
    //     translate(cx, cy);

    //     // 목표 영역의 폭과 높이
    //     float targetW = cw;
    //     float targetH = ch;

    //     // 1. 카메라 영상의 중앙을 자를 시작점 계산 (PImage 좌표)
    //     // 이 로직은 화면 중심이 아닌, 카메라 영상 320x180의 중앙을 잘라냅니다.
    //     // 이 방식이 가장 안정적이므로 유지합니다.
    //     int camCropX = cam.width / 2 - (int)(targetW / 2);
    //     int camCropY = cam.height / 2 - (int)(targetH / 2);

    //     // 경계 조건을 만족하도록 constrain을 사용합니다.
    //     // (단, targetW, targetH가 cam.width/height보다 크면 이 constrain은 무의미합니다.)
    //     camCropX = (int)constrain(camCropX, 0, cam.width - targetW);
    //     camCropY = (int)constrain(camCropY, 0, cam.height - targetH);

    //     // 2. PImage를 잘라냄
    //     PImage croppedCam = cam.get(
    //       camCropX,
    //       camCropY,
    //       (int)targetW,
    //       (int)targetH
    //       );

    //     // 3. 복사한 PImage를 글리치 영역에 그립니다.
    //     // 그려질 좌표: 현재 translate(cx, cy)된 상태에서 좌상단 좌표 (-cw/2, -ch/2)
    //     float drawX = -cw / 2;
    //     float drawY = -ch / 2;

    //     tint(255, alpha);
    //     imageMode(CORNER);

    //     // ★★★ [수정] 자른 영역을 글리치 크기(targetW, targetH)에 맞춰 늘여서 그립니다.
    //     image(croppedCam, drawX, drawY, targetW, targetH);

    //     noTint();
    //     popMatrix();
    //   } else {
    //     // 카메라가 없거나 로드되지 않았을 경우 대체 사각형
    //     fill(color(0, 200, 255));
    //     rect(cx, cy, cw, ch);
    //   }
    //   break;

    case TYPE_CUSTOM_DRAW:
      // 커스텀 드로잉 모드
      if (customCanvas != null) {
        tint(255, alpha);
        imageMode(CENTER);
        image(customCanvas, cx, cy, cw, ch);
        noTint();
      } else {
        stroke(myColor, alpha);
        strokeWeight(1);
        for (int i=-2; i<=2; i++) {
          line(cx - cw/2, cy + ch/4 * i, cx + cw/2, cy + ch/4 * i);
        }
        noStroke();
      }
      break;

    case TYPE_GRID:
      // ★ [UPDATE] 그리드 모드 (랜덤 위치/크기 적용)

      int gridAlpha = (int)map(alpha, 0, 255, 0, 255);

      final int HORIZONTAL_LINES = 8;
      final int VERTICAL_LINES = 10;

      pushStyle();
      // ★ 격자 스타일
      stroke(255, gridAlpha);
      strokeWeight(1);
      noFill();

      // ★ [핵심] 1. 랜덤 위치로 이동 (GlitchVisual의 중심 [0,0] 기준)
      pushMatrix();
      translate(gridXOffset, gridYOffset);

      // 2. 격자 간격 적용
      final float SPACING = gridSpacing;

      // 중앙 기준 좌표 계산
      float halfWidth = (VERTICAL_LINES - 1) * SPACING / 2.0;
      float halfHeight = (HORIZONTAL_LINES - 1) * SPACING / 2.0;

      for (int i = 1; i < HORIZONTAL_LINES - 1; i++) {
        float y = -halfHeight + i * SPACING;
        line(-halfWidth, y, halfWidth, y);
      }
      for (int i = 1; i < VERTICAL_LINES - 1; i++) {
        float x = -halfWidth + i * SPACING;
        line(x, -halfHeight, x, halfHeight);
      }

      popMatrix(); // 랜덤 위치 이동 복원
      popStyle();
      break;
    }
  }
}
// ==================================================
// ★ [NEW] 글리치 레이아웃 함수 (GlitchVisual 전용)
// ==================================================
void setupGlitchesLayout() {
  // 하트 리스트를 클리어하는 건 실수 방지를 위해 넣어두는 것이 좋습니다.
  // glitches.clear();

  // 1. [중앙] 메인 하트 위치에 글리치 이펙트 생성
  // (메인 하트와 동일한 위치, 색상, 기준 크기를 사용한다고 가정)
  // 태그: KICK_PEAK 트랙에 연결
  GlitchVisual centerGlitch = new GlitchVisual(
    0, 0, // 중앙 (0, 0) 위치
    200, // 기준 크기
    "KICK_PEAK", // 글리치 전용 트랙 태그 (예시)
    color(255, 0, 0)           // 메인 하트 색상 (예시)
    );
  glitches.add(centerGlitch);

  // 2. [주변] 서브 하트 위치에 글리치 이펙트 추가 (선택 사항)
  // 만약 주변 하트들 위치에도 글리치를 배치하고 싶다면 여기에 추가하면 됩니다.
  // ...
}
