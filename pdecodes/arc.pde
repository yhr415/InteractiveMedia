// ArcVisual.pde 탭에 추가
class ArcVisual {
  String patternTag;
  String scaleTag; 
  int myColor;
  float baseSize; // 0번 하트의 기본 크기 (200)

  // 아크 게이지 로직 변수
  float lastPatternPower = 0;
  float currentRotation = 0;
  final float ANGLE_STEP = HALF_PI;
  ArrayList<ArcSegment> segments = new ArrayList<ArcSegment>();

  ArcVisual(float baseSize, String patternTag, String scaleTag, int c) {
    this.baseSize = baseSize;
    this.patternTag = patternTag;
    this.scaleTag = scaleTag;
    this.myColor = c;
  }

  void display() {
    float pPower = (patternTag != null) ? triggers.get(patternTag) : 0;
    float scalePower = (scaleTag != null) ? triggers.get(scaleTag) : 0;

    // 1. [스케일 계산] HeartVisual의 0번 하트 로직(scaleFactor=80)을 따라갑니다.
    float scaleFactor = 80; 
    float currentSize = baseSize + (scalePower * scaleFactor);

    // 2. [로직] 피크 감지 & 아크 생성 (비트 감지)
    if (pPower - lastPatternPower > 0.1) {
      segments.add(new ArcSegment(currentRotation, ANGLE_STEP, myColor));
      currentRotation += ANGLE_STEP;
    }
    lastPatternPower = pPower;

    // 3. [그리기] 게이지 아크
    pushMatrix();
    // ArcSegment는 중앙(0,0)에 그려지도록 설계되었으므로, translate는 필요 없습니다.

    for (int i = segments.size() - 1; i >= 0; i--) {
      ArcSegment seg = segments.get(i);
      // 아크 반지름은 currentSize의 3배입니다. (기존 HeartVisual 로직)
      float arcRadius = currentSize * 3.0; 
      seg.display(0, 0, arcRadius); 
      if (seg.isDead()) {
        segments.remove(i);
      }
    }
    popMatrix();
  }
}


class ArcSegment {
  float baseAngle;   // max angle
  float maxSpan;     // maximum length

  float headProgress = 0; // 앞부분 진행률 (0.0 -> 1.0)
  float tailProgress = 0; // 뒷부분 진행률 (0.0 -> 1.0)

  int col;
  float life = 1.0;
  float decaySpeed = 0.02; // 사라지는 속도 (작을수록 오래 감)

  ArcSegment(float start, float span, int c) {
    this.baseAngle = start;
    this.maxSpan = span;
    this.col = c;
  }

  void display(float x, float y, float diameter) {
    // 1. 수명 관리
    life -= decaySpeed;
    if (life <= 0) return;

    // 2. 애니메이션 로직 (Tail Chasing)
    // [생성 초기]: Head가 먼저 100%까지 자라남
    if (life > 0.6) {
      headProgress = lerp(headProgress, 1.0, 0.2);
    }
    // [사라질 때]: Tail이 뒤늦게 100%까지 쫓아옴 (꼬리 자르기)
    else if (life < 0.4) {
      // life가 줄어들수록 tail은 1.0을 향해 감
      // 목표값을 1.0으로 두고 lerp
      tailProgress = lerp(tailProgress, 1.0, 0.1);
    }

    // head는 항상 1.0 유지 (유지 구간)
    if (life <= 0.6) headProgress = 1.0;

    // 3. 그리기
    noFill();
    strokeCap(SQUARE); // 각진 끝
    blendMode(ADD);

    // 투명도 (완전히 사라지기 전까진 밝게 유지하다가 끝에 살짝 페이드)
    float alpha = map(life, 0, 0.2, 0, 255);
    alpha = constrain(alpha, 0, 255);

    // ★ [핵심] 꼬리와 머리의 각도 계산
    float startDraw = baseAngle + (maxSpan * tailProgress);
    float endDraw   = baseAngle + (maxSpan * headProgress);

    // ★ [틈새 메우기] endDraw를 살짝(0.02 라디안) 더 길게 그려서 다음 아크와 겹치게 함!
    float overlap = 0.01;

    // 그릴 길이가 너무 짧으면(꼬리가 머리를 잡으면) 안 그림
    if (endDraw - startDraw < 0.01) return;

    int layers = 4;
    for (int i=0; i<layers; i++) {
      float w = map(i, 0, layers, 3, 25);
      float a = map(i, 0, layers, alpha, 0);

      stroke(col, a);
      strokeWeight(w);
      // startDraw부터 endDraw + overlap까지 그림
      arc(x, y, diameter, diameter, startDraw, endDraw + overlap);
    }

    blendMode(BLEND);
  }

  boolean isDead() {
    return life <= 0;
  }
}

// ==================================================
void drawBlurryCircleNeon(float x, float y, float size, color c, float power) {
  noFill();
  blendMode(ADD);
  int layers = 10; // 레이어 수
  float maxStroke = 80 * power; // 최대 두께

  for (int i = 0; i < layers; i++) {
    float weight = map(i, 0, layers, 5, maxStroke);
    float alpha = map(i, 0, layers, 200, 0);
    stroke(c, alpha * power);
    strokeWeight(weight);
    circle(x, y, size);
  }

  // 코어(중심) 라인
  stroke(lerpColor(c, color(255), 0.7), 255 * power);
  strokeWeight(5);
  circle(x, y, size);

  blendMode(BLEND);
}

void setupArcsLayout() {
  // 중앙 하트(0번)에 연결되었던 아크 오브젝트를 독립시킵니다.
  ArcVisual centerArc = new ArcVisual(
    200, // baseSize (0번 하트와 동일)
    "HEART_PATTERN", 
    "MAIN_SCALE", 
    color(255, 0, 0) // 0번 하트의 색상
  );
  
  arcs.add(centerArc);
}// ==========================================
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
    this.col = c; // p5 color object

    this.headProgress = 0;
    this.tailProgress = 0;
    this.life = 1.0;
    this.decaySpeed = 0.02;
  }

  display(x, y, diameter) {
    // 1. 수명 관리
    this.life -= this.decaySpeed;
    if (this.life <= 0) return;

    // 2. 애니메이션 로직 (Tail Chasing)
    if (this.life > 0.6) {
      this.headProgress = lerp(this.headProgress, 1.0, 0.2);
    } else if (this.life < 0.4) {
      this.tailProgress = lerp(this.tailProgress, 1.0, 0.1);
    }

    if (this.life <= 0.6) this.headProgress = 1.0;

    // 3. 그리기
    noFill();
    strokeCap(SQUARE);
    blendMode(ADD);

    // 투명도 계산
    let alphaVal = map(this.life, 0, 0.2, 0, 255);
    alphaVal = constrain(alphaVal, 0, 255);

    // 각도 계산
    let startDraw = this.baseAngle + (this.maxSpan * this.tailProgress);
    let endDraw = this.baseAngle + (this.maxSpan * this.headProgress);
    let overlap = 0.01;

    // 너무 짧으면 그리지 않음
    if (endDraw - startDraw < 0.01) return;

    let layers = 4;
    
    // 색상 분해 (p5.js에서 color 객체 내부 값 접근)
    let r = red(this.col);
    let g = green(this.col);
    let b = blue(this.col);

    for (let i = 0; i < layers; i++) {
      let w = map(i, 0, layers, 3, 25);
      let a = map(i, 0, layers, alphaVal, 0);

      stroke(r, g, b, a); // RGB + Alpha
      strokeWeight(w);
      
      // p5.js arc: x, y, w, h, start, stop
      arc(x, y, diameter, diameter, startDraw, endDraw + overlap);
    }

    blendMode(BLEND);
  }

  isDead() {
    return this.life <= 0;
  }
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