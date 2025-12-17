// ==========================================
// ArcVisual 클래스
// ==========================================
class ArcVisual {
  constructor(baseSize, patternTag, scaleTag, c) {
    this.baseSize = baseSize; // 기본 크기
    this.patternTag = patternTag;
    this.scaleTag = scaleTag;
    this.myColor = c; // p5.color 객체

    // 로직 변수
    this.lastPatternPower = 0;
    this.currentRotation = 0;
    this.ANGLE_STEP = HALF_PI; // p5.js 상수
    this.segments = []; // ArrayList 대체
  }

  display() {
    // triggers는 전역 변수라고 가정
    let pPower = (this.patternTag !== null && typeof triggers !== 'undefined') ? triggers.get(this.patternTag) : 0;
    let scalePower = (this.scaleTag !== null && typeof triggers !== 'undefined') ? triggers.get(this.scaleTag) : 0;

    // 1. [스케일 계산]
    let scaleFactor = 80;
    let currentSize = this.baseSize + (scalePower * scaleFactor);

    // 2. [로직] 피크 감지 & 아크 생성
    if (pPower - this.lastPatternPower > 0.1) {
      this.segments.push(new ArcSegment(this.currentRotation, this.ANGLE_STEP, this.myColor));
      this.currentRotation += this.ANGLE_STEP;
    }
    this.lastPatternPower = pPower;

    // 3. [그리기]
    push();
    // 중앙(0,0) 기준이므로 translate는 draw() 메인 루프에서 이미 되어있다고 가정
    
    // 역순 루프 (삭제를 위해)
    for (let i = this.segments.length - 1; i >= 0; i--) {
      let seg = this.segments[i];
      let arcRadius = currentSize * 3.0; // 지름(diameter)으로 사용됨

      seg.display(0, 0, arcRadius);

      if (seg.isDead()) {
        this.segments.splice(i, 1); // remove(i) 대체
      }
    }
    pop();
  }
}

// ==========================================
// ArcSegment 클래스
// ==========================================
class ArcSegment {
  constructor(start, span, c) {
    this.baseAngle = start;
    this.maxSpan = span;
    this.col = c;
    this.headProgress = 0;
    this.tailProgress = 0;
    this.life = 1.0;
    this.decaySpeed = 0.04; // 1. 속도 업
  }

  display(x, y, diameter) {
    this.life -= this.decaySpeed;
    if (this.life <= 0) return;

    // 2. 애니메이션 겹침 구간 최적화 (더 빨리 사라지게)
    this.headProgress = lerp(this.headProgress, 1.0, 0.3);
    
    if (this.life < 0.6) { // 더 일찍 꼬리가 출발
      this.tailProgress = lerp(this.tailProgress, 1.0, 0.25);
    }

    noFill();
    strokeCap(SQUARE);
    blendMode(ADD);

    // 3. 투명도 커브를 더 가파르게 (끝에서 흐리멍텅하게 남지 않게)
    let alphaVal = map(this.life, 0.1, 0.4, 0, 255); 
    alphaVal = constrain(alphaVal, 0, 255);

    let startDraw = this.baseAngle + (this.maxSpan * this.tailProgress);
    let endDraw = this.baseAngle + (this.maxSpan * this.headProgress);
    
    if (endDraw - startDraw < 0.001) return; // 너무 작으면 렌더링 스킵

    let r = red(this.col);
    let g = green(this.col);
    let b = blue(this.col);

    let layers = 4;
    for (let i = 0; i < layers; i++) {
      let w = map(i, 0, layers, 3, 20);
      let a = map(i, 0, layers, alphaVal, 0);
      stroke(r, g, b, a);
      strokeWeight(w);
      arc(x, y, diameter, diameter, startDraw, endDraw + 0.01);
    }
    blendMode(BLEND);
  }

  isDead() { return this.life <= 0 || (this.tailProgress > 0.95 && this.life < 0.5); }
}

// ==========================================
// 유틸리티 함수
// ==========================================

function drawBlurryCircleNeon(x, y, size, c, power) {
  noFill();
  blendMode(ADD);
  let layers = 10;
  let maxStroke = 80 * power;

  let r = red(c);
  let g = green(c);
  let b = blue(c);

  for (let i = 0; i < layers; i++) {
    let weight = map(i, 0, layers, 5, maxStroke);
    let alphaVal = map(i, 0, layers, 200, 0);
    
    stroke(r, g, b, alphaVal * power);
    strokeWeight(weight);
    circle(x, y, size);
  }

  // 코어 라인 (흰색에 가깝게)
  let coreColor = lerpColor(c, color(255), 0.7);
  stroke(red(coreColor), green(coreColor), blue(coreColor), 255 * power);
  strokeWeight(5);
  circle(x, y, size);

  blendMode(BLEND);
}

function setupArcsLayout() {
  // arcs 배열은 전역 변수로 선언되어 있어야 합니다 (let arcs = [])
  
  let centerArc = new ArcVisual(
    200, 
    "HEART_PATTERN", 
    "MAIN_SCALE", 
    color(255, 0, 0)
  );
  
  arcs.push(centerArc); // ArrayList.add() -> Array.push()
}