// ==========================================
// SubHeartVisual 클래스
// ==========================================
class SubHeartVisual {
  constructor(x, y, size, idNumber, c) {
    this.x = x;
    this.y = y;
    this.baseSize = size;
    this.idNumber = idNumber; // 3번부터 10번까지
    this.myColor = c; // p5.color 객체

    // ★ [추가] 자신의 현재 밝기 상태
    this.currentAlpha = 0;
    this.decayRate = 0.9; // 밝기가 꺼지는 속도
  }

  // ★ [수정] 외부에서 신호(power)를 직접 받아 자신의 밝기를 설정
  activate(power) {
    // 신호가 들어오면 밝기를 즉시 최대치로 설정
    if (power > 0.01) {
      this.currentAlpha = 255;
    }
  }

  update() {
    // 매 프레임 밝기가 자연스럽게 감소
    this.currentAlpha *= this.decayRate;
    // p5.js의 max() 함수 사용
    this.currentAlpha = max(this.currentAlpha, 0);
  }

  // ★ [수정] display 함수
  display() {
    if (this.currentAlpha < 10) return; // 너무 희미하면 그리지 않음

    let w = this.baseSize * 1.7;
    let h = this.baseSize;

    push(); // pushMatrix() -> push()
    translate(this.x, this.y);

    // p5.js Color 객체에서 RGB 값 추출 (투명도 조절을 위해)
    let r = red(this.myColor);
    let g = green(this.myColor);
    let b = blue(this.myColor);

    noFill();

    let c = color(r, g, b);

    let power = map(this.currentAlpha, 0, 255, 0, 1);

    // 3. 네온 함수 호출! (깔끔하게 위임)
    // (x, y, 너비, 높이, 색상, 강도)
    drawBlurryNeon(0, 0, w, h, c, power);

    pop(); // popMatrix() -> pop()
  }
}

// ==========================================
// 서브 하트 레이아웃 설정
// ==========================================
function setupSubHeartsLayout() {
  let spacing = 160;

  // 8개의 좌표 리스트 (배열)
  let gridX = [-2, -1, -1, 0, 0, 1, 1, 2];
  let gridY = [0, 1, -1, 2, -2, 1, -1, 0];

  // 기존 subHearts 리스트 초기화
  // (subHearts 변수는 전역에 let subHearts = [] 로 선언되어 있어야 합니다)
  subHearts = [];

  for (let i = 0; i < 8; i++) {
    let px = gridX[i] * spacing;
    let py = gridY[i] * spacing;

    // 서브 하트 생성 (번호는 3번부터 시작)
    // ArrayList.add() -> Array.push()
    subHearts.push(
      new SubHeartVisual(
        px,
        py,
        120, // size
        i + 3, // idNumber
        color(200, 20, 20) // p5.js color 함수
      )
    );
  }
}
