class DiamondVisual {
  float x, y;
  float baseSize;
  int myColor; // 색상
  
  // 신호 태그들
  String scaleTag; 
  String drawTag;  
  
  // (선택) 회전 효과를 위한 변수
  float angle = 0; 

  DiamondVisual(float x, float y, float size, String scaleTag, String drawTag, int c) {
    this.x = x;
    this.y = y;
    this.baseSize = size;
    this.scaleTag = scaleTag;
    this.drawTag = drawTag;
    this.myColor = c;
  }

  void display() {
    // 1. 중계소에서 파워 가져오기
    float scalePower = (scaleTag != null) ? triggers.get(scaleTag) : 0;
    float drawPower  = (drawTag != null)  ? triggers.get(drawTag) : 0;
    
    // 2. 그리기 신호 없으면 퇴근 (Alpha 0이면 그리지 않음)
    if (drawTag != null && drawPower < 0.01) return;

    pushMatrix();
    translate(x, y);
    
    // (옵션) 비트가 칠 때마다 살짝 회전하거나, 계속 뱅글뱅글 돌게 할 수도 있음
    // rotate(radians(45)); // 그냥 45도 고정하려면 이거 주석 해제

    // 3. 크기 계산 ("뿅!" 효과 포함)
    // drawPower가 있으면 50% -> 120%로 펑 하고 커짐
    float popScale = map(drawPower, 0, 1, 0.5, 1.2); 
    
    // 기본 크기 + 스케일 펌핑
    float finalSize = (baseSize + (scalePower * 50)) * popScale;

    // 4. 그리기 (블러 네온 효과 적용)
    // 다이아몬드는 가로세로 비율이 1:1이 예뻐서 w, h 둘 다 finalSize
    drawBlurryDiamond(0, 0, finalSize, finalSize, myColor, drawPower);

    popMatrix();
  }
}

void setupDiamondsLayout() {
  // 간격 (하트랑 겹치지 않게 조절, 하트 간격이랑 비슷하거나 조금 좁게)
  float spacing = 160; 
  
  // 네가 요청한 4방향 좌표 (좌, 우, 하, 상)
  int[] gx = {-1,  1,  0,  0};
  int[] gy = { 0,  0,  1, -1};
  
  for (int i = 0; i < 4; i++) {
    float px = gx[i] * spacing;
    float py = gy[i] * spacing;
    
    // 다이아몬드 생성!
    // 태그: "DIAMOND_HIT" (새로운 태그) -> 매핑할 때 이 이름 쓰면 됨
    // 약간 아래로 이동시킴 (하트가 아래가 더 길어서 같이 배치했을 때 겹치지 않아야 함 일단은 py-20)
    diamonds.add(new DiamondVisual(px, py+30, 30, "DIAMOND_SCALE", "DIAMOND_HIT", color(200,0,0)));
  }
}

// ==================================================
// ★ 안쪽으로 휘어진 다이아몬드 (Curved Diamond / Star)
// ==================================================
void drawCurvedDiamond(float x, float y, float w, float h) {
  float hw = w / 2.0; // 절반 너비
  float hh = h / 2.0; // 절반 높이
  
  // 휘어짐 정도 (0.0 ~ 1.0)
  // 0.0에 가까울수록 더 뾰족하고 안쪽으로 푹 파임 (표창 모양)
  // 0.5 정도면 완만함
  float curve = 0.27; 
  
  beginShape();
  // 1. 위쪽 꼭짓점
  vertex(x, y - hh); 
  
  // 2. 오른쪽으로 가는 곡선 (베지어 곡선)
  // 제어점(Control Point)을 중심(0,0) 쪽으로 당겨서 안으로 휘게 만듦
  bezierVertex(x + hw*curve, y - hh*curve, x + hw*curve, y - hh*curve, x + hw, y);
  
  // 3. 아래쪽으로 가는 곡선
  bezierVertex(x + hw*curve, y + hh*curve, x + hw*curve, y + hh*curve, x, y + hh);
  
  // 4. 왼쪽으로 가는 곡선
  bezierVertex(x - hw*curve, y + hh*curve, x - hw*curve, y + hh*curve, x - hw, y);
  
  // 5. 다시 위로 닫는 곡선
  bezierVertex(x - hw*curve, y - hh*curve, x - hw*curve, y - hh*curve, x, y - hh);
  
  endShape(CLOSE);
}

// ==================================================
// ★ 블러 효과 먹인 다이아몬드 그리기 (네온)
// ==================================================
void drawBlurryDiamond(float x, float y, float w, float h, color c, float power) {
  noFill();
  blendMode(ADD); // 빛 겹치기
  
  int layers = 15; // 15겹
  float maxStroke = 20 * power; // 퍼짐 정도

  for (int i = 0; i < layers; i++) {
    float weight = map(i, 0, layers, 2, maxStroke);
    float alpha = map(i, 0, layers, 60, 0); // 투명도
    
    stroke(c, alpha * power);
    strokeWeight(weight);
    
    // 아까 만든 곡선 다이아몬드 함수 호출!
    drawCurvedDiamond(x, y, w, h);
  }
  
  blendMode(BLEND);
}

