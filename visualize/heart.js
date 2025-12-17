// ==========================================
// 원형 트랙 시각화 (Visible Only)
// ==========================================
function drawCircleVisibleOnly() {
  // === [세팅] ===
  let cx = 0;
  let cy = 0;
  let radius = height * 0.35; // 원의 반지름

  // 1. 보이는 녀석들만 골라내기 (Visible check)
  // JS의 filter 함수를 쓰면 ArrayList 생성보다 훨씬 깔끔해
  let visibleList = tracks.filter(t => t.visible);

  // 없으면 운동 종료
  let count = visibleList.length;
  if (count === 0) return;

  // 각도 계산
  let angleStep = TWO_PI / count;

  // 2. 그리기 반복
  for (let i = 0; i < count; i++) {
    let t = visibleList[i];

    // 각도 계산 (12시 방향 -HALF_PI 부터 시작)
    let angle = -HALF_PI + (i * angleStep);

    // 좌표 변환
    let x = cx + cos(angle) * radius;
    let y = cy + sin(angle) * radius;

    // --- [시각 효과 1: 중앙 연결선] ---
    if (t.power > 0.01) {
      // 색상 분해 (p5.js color 객체 안전 처리)
      let r = red(t.trackColor);
      let g = green(t.trackColor);
      let b = blue(t.trackColor);
      
      stroke(r, g, b, t.power * 150);
      strokeWeight(1 + t.power * 2);
      line(cx, cy, x, y);
    }

    // --- [시각 효과 2: 트랙 원 (Orb)] ---
    let orbSize = 15 + (t.power * 40);

    noStroke();
    let r = red(t.trackColor);
    let g = green(t.trackColor);
    let b = blue(t.trackColor);
    fill(r, g, b, 200); // Alpha 200
    
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
    let labelDist = radius + 30;
    let isActive = t.power > 0.1;

    if (isActive) {
      fill(255, 255, 0);
      textSize(24);
      labelDist += 20;
    } else {
      fill(100);
      textSize(10);
    }

    let lx = cx + cos(angle) * labelDist;
    let ly = cy + sin(angle) * labelDist;

    textAlign(CENTER, CENTER);
    
    // tracks 배열에서 t의 인덱스 찾기
    let originalIndex = tracks.indexOf(t);
    text("T-" + originalIndex, lx, ly);
  }
}

// ==========================================
// HeartVisual 클래스
// ==========================================
class HeartVisual {
  constructor(x, y, size, isMain, idNumber, scaleTag, drawTag, c) {
    this.x = x;
    this.y = y;
    this.baseSize = size;
    this.isMain = isMain;
    this.idNumber = idNumber;
    this.scaleTag = scaleTag;
    this.drawTag = drawTag;
    this.myColor = c; // p5.color 객체
  }

  display() {
    // triggers가 존재하는지 안전하게 확인
    let scalePower = (this.scaleTag && typeof triggers !== 'undefined') ? triggers.get(this.scaleTag) : 0;
    let drawPower  = (this.drawTag && typeof triggers !== 'undefined') ? triggers.get(this.drawTag) : 0;

    push(); // pushMatrix() -> push()
    translate(this.x, this.y);

    let scaleFactor = 30;

    // 1. 스케일 강도 결정
    if (this.isMain) {
      if (this.idNumber === 0) {
        scaleFactor = 80;
      } else {
        scaleFactor = 40; // 1번, 2번 하트는 약하게 커짐
      }
    }

    let currentSize = this.baseSize + (scalePower * scaleFactor);

    // 2. [isMain] 하트 그리기 로직 (네온만 O)
    if (this.isMain) {
      if (drawPower > 0.01) {
        noFill();
        
        let r = red(this.myColor);
        let g = green(this.myColor);
        let b = blue(this.myColor);

        stroke(r, g, b, 255);
        strokeWeight(3);

        let popScale = map(drawPower, 0, 1, 0.9, 1.3);
        let w = currentSize * 1.7 * popScale;
        let h = currentSize * popScale;

        // drawBlurryNeon 함수가 정의되어 있어야 함 (이전 코드에 있거나 별도 정의 필요)
        if (typeof drawBlurryNeon === 'function') {
          drawBlurryNeon(0, 0, w, h, this.myColor, drawPower);
        } else {
          // 함수가 없을 경우 기본 하트라도 그림
          drawHeartShape(0, 0, w, h);
        }
      }
    } else {
      // [서브 하트]
      let alphaVal = (this.drawTag) ? map(drawPower, 0, 1, 0, 255) : 255;
      
      if (alphaVal > 1) {
        let r = red(this.myColor);
        let g = green(this.myColor);
        let b = blue(this.myColor);
        
        fill(r, g, b, alphaVal);
        noStroke();
        
        drawHeartShape(0, 0, currentSize * 1.7, currentSize);
        
        if (this.idNumber > 0) {
          fill(255, alphaVal);
          textAlign(CENTER, CENTER); // 텍스트 정렬 추가
          text(this.idNumber, 0, 5);
        }
      }
    }
    pop(); // popMatrix() -> pop()
  }
}

// ==========================================
// 하트 모양 그리기 함수 (Bezier)
// ==========================================
function drawHeartShape(x, y, w, h) {
  let topY = y - h * 0.35;
  let bottomY = y + h * 0.55;
  let sideX = w * 0.5;
  let ctrlY_Top = y - h * 0.7;
  let ctrlY_Bottom = y + h * 0.15;

  beginShape();
  vertex(x, topY);
  bezierVertex(x + sideX * 0.5, ctrlY_Top, x + sideX, y - h * 0.1, x, bottomY);
  bezierVertex(x - sideX, y - h * 0.1, x - sideX * 0.5, ctrlY_Top, x, topY);
  endShape(CLOSE);
}

// ==========================================
// 하트 레이아웃 설정
// ==========================================
function setupHeartsLayout() {
  // hearts 배열은 전역에 선언되어 있어야 함 (let hearts = [])
  
  // 1. [중앙] 메인 하트 (0, 0)
  let mainHeart = new HeartVisual(0, 0, 200, true, 0, "MAIN_SCALE", "MAIN_DRAW", color(255, 0, 0));
  hearts.push(mainHeart); // add -> push

  // 핑크색 메인하트
  let mainHeart1 = new HeartVisual(0, 0, 200, true, 1, "TRACK_1_SCALE", "TRACK_1_DRAW", color(255, 100, 200));
  hearts.push(mainHeart1);

  // 보라색 메인하트
  let mainHeart2 = new HeartVisual(0, 0, 200, true, 1, "HEART3_SCALE", "HEART3_DRAW", color(155, 94, 127));
  hearts.push(mainHeart2);
}