class SubHeartVisual {
  float x, y;
  float baseSize;
  int idNumber; // 3번부터 10번까지 부여됨
  int myColor;
  
  // ★ [추가] 자신의 현재 밝기 상태
  float currentAlpha = 0; 
  float decayRate = 0.9; // 밝기가 꺼지는 속도

  SubHeartVisual(float x, float y, float size, int idNumber, int c) {
    this.x = x;
    this.y = y;
    this.baseSize = size;
    this.idNumber = idNumber;
    this.myColor = c;
  }

  // ★ [수정] 외부에서 신호(power)를 직접 받아 자신의 밝기를 설정
  void activate(float power) {
    // 신호가 들어오면 밝기를 즉시 최대치로 설정
    if (power > 0.01) {
      currentAlpha = 255;
    }
  }
  
  void update() {
    // 매 프레임 밝기가 자연스럽게 감소
    currentAlpha *= decayRate; 
    currentAlpha = max(currentAlpha, 0);
  }

  // ★ [수정] display 함수는 더 이상 orbiter 매개변수를 받지 않습니다.
  void display() {
    if (currentAlpha < 10) return; // 너무 희미하면 그리지 않음

    float w = baseSize * 1.7;
    float h = baseSize;
    
    // 네온 테두리 그리기
    pushMatrix();
    translate(x, y);

    noFill();
    stroke(myColor, currentAlpha);
    strokeWeight(2);
    
    // drawBlurryNeon 함수를 사용하지 않는 경우, drawHeartShape만 사용합니다.
    drawHeartShape(0, 0, w, h); 
    
    // 하이라이트 효과 (네온 블러)
    stroke(myColor, currentAlpha / 2); 
    strokeWeight(5);
    drawHeartShape(0, 0, w, h);

    popMatrix();
  }
}

void setupSubHeartsLayout() {
  float spacing = 160;

  // 네가 요청한 8개의 좌표 리스트
  int[] gridX = {-2, -1, -1, 0, 0, 1, 1, 2};
  int[] gridY = { 0, 1, -1, 2, -2, 1, -1, 0};
  
  // 마름모 좌표 (더 이상 사용되지 않지만 코드는 간결화)
  // ArrayList<PVector> diamondVertices = new ArrayList<PVector>(); 

  // 기존 subHearts 리스트를 먼저 비우는 것이 안전합니다.
  subHearts.clear();

  for (int i = 0; i < 8; i++) {
    float px = gridX[i] * spacing;
    float py = gridY[i] * spacing;

    // 서브 하트 생성 (번호는 3번부터 시작)
    subHearts.add(new SubHeartVisual(px, py, 120, i + 3, color(200, 20, 20)));

    // 오비터 객체 생성 로직 제거
  }
  
  // orbiter = null; // 오비터 객체 생성 로직 제거
}
