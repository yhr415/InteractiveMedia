// ==========================================
// DiamondVisual 클래스
// ==========================================
class DiamondVisual {
  constructor(x, y, size, scaleTag, drawTag, c) {
    this.x = x;
    this.y = y;
    this.baseSize = size;
    this.scaleTag = scaleTag;
    this.drawTag = drawTag;
    this.myColor = c; // p5.color 객체
    
    // (선택) 회전 변수
    this.angle = 0;
  }

  display() {
    // 1. 중계소에서 파워 가져오기 (triggers가 있는지 확인)
    let scalePower = (this.scaleTag && typeof triggers !== 'undefined') ? triggers.get(this.scaleTag) : 0;
    let drawPower  = (this.drawTag && typeof triggers !== 'undefined') ? triggers.get(this.drawTag) : 0;
    
    // 2. 그리기 신호 없으면 퇴근 (Alpha 0이면 그리지 않음)
    if (this.drawTag && drawPower < 0.01) return;

    push(); // pushMatrix() -> push()
    translate(this.x, this.y);
    
    // (옵션) 회전 효과 (필요하면 주석 해제)
    // rotate(radians(45));

    // 3. 크기 계산 ("뿅!" 효과)
    let popScale = map(drawPower, 0, 1, 0.5, 1.2); 
    
    // 기본 크기 + 스케일 펌핑
    let finalSize = (this.baseSize + (scalePower * 50)) * popScale;

    // 4. 그리기 (블러 네온 효과 적용)
    drawBlurryDiamond(0, 0, finalSize, finalSize, this.myColor, drawPower);

    pop(); // popMatrix() -> pop()
  }
}

// ==================================================
// ★ 안쪽으로 휘어진 다이아몬드 그리기 (Curved Diamond)
// ==================================================
function drawCurvedDiamond(x, y, w, h) {
  let hw = w / 2.0; // 절반 너비
  let hh = h / 2.0; // 절반 높이
  
  // 휘어짐 정도 (0.0 ~ 1.0)
  // 0.27 정도가 예쁜 곡선
  let curve = 0.27; 
  
  beginShape();
  // 1. 위쪽 꼭짓점
  vertex(x, y - hh); 
  
  // 2. 오른쪽으로 가는 곡선 (베지어)
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
// ★ 블러 효과 먹인 다이아몬드 (네온 효과)
// ==================================================
function drawBlurryDiamond(x, y, w, h, c, power) {
  noFill();
  blendMode(ADD); // 빛 겹치기 효과
  
  let layers = 15; // 15겹
  let maxStroke = 20 * power; // 퍼짐 정도

  // p5.js Color 객체에서 RGB 값 추출
  let r = red(c);
  let g = green(c);
  let b = blue(c);

  for (let i = 0; i < layers; i++) {
    let weight = map(i, 0, layers, 2, maxStroke);
    let alphaVal = map(i, 0, layers, 60, 0); // 투명도
    
    // stroke(r, g, b, alpha) 방식으로 사용
    stroke(r, g, b, alphaVal * power);
    strokeWeight(weight);
    
    // 곡선 다이아몬드 그리기
    drawCurvedDiamond(x, y, w, h);
  }
  
  blendMode(BLEND); // 블렌드 모드 복구
}

// ==================================================
// 레이아웃 설정 (setup()에서 호출)
// ==================================================
function setupDiamondsLayout() {
  // diamonds 배열은 전역 변수로 선언되어 있어야 해 (let diamonds = [])
  
  let spacing = 160; 
  
  // 4방향 좌표
  let gx = [-1,  1,  0,  0];
  let gy = [ 0,  0,  1, -1];
  
  for (let i = 0; i < 4; i++) {
    let px = gx[i] * spacing;
    let py = gy[i] * spacing;
    
    // 다이아몬드 생성 및 배열 추가
    diamonds.push(new DiamondVisual(
      px, 
      py, // 약간 아래로 이동
      30, 
      "DIAMOND_SCALE", 
      "DIAMOND_HIT", 
      color(200, 0, 0) // p5.js color 함수 사용
    ));
  }
}