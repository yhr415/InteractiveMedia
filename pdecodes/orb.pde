class OrbVisual {
  float x, y, baseSize;
  color myColor;
  String drawTag, scaleTag;

  OrbVisual(float x, float y, float baseSize, String drawTag, String scaleTag, color myColor) {
    this.x = x;
    this.y = y;
    this.baseSize = baseSize;
    this.drawTag = drawTag;
    this.scaleTag = scaleTag;
    this.myColor = myColor;
  }

  void display() {
    float inDrawPower = (drawTag != null) ? triggers.get(drawTag) : 0;
    float inScalePower = (scaleTag != null) ? triggers.get(scaleTag) : 0;

    if (inDrawPower > 0.01) {
      pushMatrix();
      translate(x, y);

      // 하트의 currentSize는 알 수 없으므로, Orb의 크기는 baseSize를 기준으로 계산합니다.
      float currentOrbSize = (baseSize * 0.4) * 1.5;
      
      // SCALE 태그의 영향은 inScalePower를 통해 받습니다.
      float popScale = inScalePower * 30;

      float coreSize = currentOrbSize + popScale;
      
      // drawGlowingOrb 함수 호출
      drawGlowingOrb(0, 0, coreSize, myColor, inDrawPower);
      
      popMatrix();
    }
  }
}

// OrbVisual이 사용하는 drawGlowingOrb 함수가 필요합니다. (DrawFunctions 탭에 있는지 확인)
// void drawGlowingOrb(float x, float y, float size, int c, float power) { ... }

void setupOrbsLayout() {
  // 중앙 하트(0번)에 연결되었던 오브젝트를 독립시킵니다.
  // 위치: (0, 0)
  // 크기: 중앙 하트의 baseSize인 200을 전달
  // 태그: 기존에 사용하던 "MAIN_IN_DRAW", "MAIN_IN_SCALE" 사용
  // 색상: 0번 하트의 색상인 빨간색 (color(255, 0, 0)) 사용
  
  OrbVisual centerOrb = new OrbVisual(
    0, 0, 
    200, // baseSize
    "MAIN_IN_DRAW", 
    "MAIN_IN_SCALE", 
    color(255, 0, 0)
  );
  
  orbs.add(centerOrb);
}