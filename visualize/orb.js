// ==========================================
// OrbVisual 클래스
// ==========================================
class OrbVisual {
  constructor(x, y, baseSize, drawTag, scaleTag, myColor) {
    this.x = x;
    this.y = y;
    this.baseSize = baseSize;
    this.drawTag = drawTag;
    this.scaleTag = scaleTag;
    this.myColor = myColor; // p5.color 객체
  }

  display() {
    // triggers가 존재하는지 안전하게 확인
    let inDrawPower = (this.drawTag && typeof triggers !== 'undefined') ? triggers.get(this.drawTag) : 0;
    let inScalePower = (this.scaleTag && typeof triggers !== 'undefined') ? triggers.get(this.scaleTag) : 0;

    if (inDrawPower > 0.01) {
      push(); // pushMatrix() -> push()
      translate(this.x, this.y);

      // Orb 크기 계산 로직
      let currentOrbSize = (this.baseSize * 0.4) * 1.5;
      
      // SCALE 태그 영향
      let popScale = inScalePower * 30;

      let coreSize = currentOrbSize + popScale;
      
      // drawGlowingOrb 함수 호출
      // (이 함수는 이전에 변환해드린 코드에 포함되어 있어야 합니다)
      if (typeof drawGlowingOrb === 'function') {
        drawGlowingOrb(0, 0, coreSize, this.myColor, inDrawPower);
      }

      pop(); // popMatrix() -> pop()
    }
  }
}

// ==========================================
// Orb 레이아웃 설정
// ==========================================
function setupOrbsLayout() {
  // orbs 배열은 전역 변수로 선언되어 있어야 합니다 (let orbs = [])

  // 중앙 하트(0번)에 연결된 오브젝트 독립 생성
  let centerOrb = new OrbVisual(
    0, 0, 
    200, // baseSize
    "MAIN_IN_DRAW", 
    "MAIN_IN_SCALE", 
    color(255, 0, 0)
  );
  
  orbs.push(centerOrb); // ArrayList.add() -> Array.push()
}