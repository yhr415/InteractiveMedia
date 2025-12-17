// ==================================================
// GlitchVisual 클래스
// ==================================================
class GlitchVisual {
  constructor(x, y, size, tag, c) {
    this.x = x;
    this.y = y;
    this.baseSize = size;
    this.glitchTag = tag;
    this.myColor = c; // p5.color 객체

    this.lastGlitchPower = 0;

    // 콘텐츠 관련 변수
    this.activeIndex = -1;
    this.alpha = 0;

    // 상수 정의 (this.TYPE_... 형태로 사용)
    this.TYPE_RECT = 0;
    this.TYPE_IMAGE = 1;
    this.TYPE_VIDEO = 2;
    this.TYPE_CUSTOM_DRAW = 3;
    this.TYPE_GRID = 4;
    
    this.contentType = this.TYPE_RECT;
    this.displayImage = null;   // p5.Image
    this.customCanvas = null;   // p5.Graphics

    // ★ [NEW] 랜덤 격자 속성 변수
    this.gridXOffset = 0;
    this.gridYOffset = 0;
    this.gridSpacing = 85.0;

    // 프리셋 배열 (2차원 배열)
    this.rectPresets = [
      // 1-4. 좌우 수직 벽
      [-550, 0, 10, 900], 
      [550, 0, 10, 900], 
      [-400, 0, 300, 600], 
      [400, 0, 300, 600], 

      // 5-8. 상하 수평 벽
      [0, -450, 1100, 10], 
      [0, 450, 1100, 10], 
      [0, -300, 800, 300], 
      [0, 300, 800, 300], 

      // 9-12. 모서리
      [-275, -225, 550, 450], 
      [275, -225, 550, 450], 
      [-275, 225, 550, 450], 
      [275, 225, 550, 450], 

      // 13-16. 오버레이
      [0, 0, 1200, 100], 
      [0, 0, 100, 1000], 
      [0, 0, 1100, 900], 
      [0, 0, 1200, 1000], 

      // 17-20. 비대칭 오프셋
      [-450, 100, 200, 700], 
      [450, -100, 200, 700], 
      [-300, -300, 500, 500], 
      [300, 300, 500, 500]     
    ];
  }

  setImage(img) {
    this.displayImage = img;
  }

  // 글리치 발동 로직
  triggerGlitch() {
    let availableTypes = [this.TYPE_RECT, this.TYPE_IMAGE, this.TYPE_GRID];
    // random()은 실수를 반환하므로 floor()로 정수 변환
    this.contentType = availableTypes[floor(random(availableTypes.length))];

    this.activeIndex = floor(random(this.rectPresets.length));
    this.alpha = 255;

    // ★ [핵심] 격자 속성 랜덤화
    if (this.contentType === this.TYPE_GRID) {
      this.gridSpacing = random(60, 100);
      this.gridXOffset = random(-200, 200);
      this.gridYOffset = random(-200, 200);
    }
  }

  display() {
    // triggers가 존재하는지 확인
    let gPower = (this.glitchTag && typeof triggers !== 'undefined') ? triggers.get(this.glitchTag) : 0;

    // 1. 피크 감지
    if (gPower - this.lastGlitchPower > 0.1) {
      this.triggerGlitch();
    }
    this.lastGlitchPower = gPower;

    // 2. 글리치 그리기
    if (this.alpha <= 1) return;

    push(); // pushMatrix() + pushStyle()
    translate(this.x, this.y);

    // 광속 소멸
    this.alpha -= 20;

    let sizeFactor = 1.0;

    let p = this.rectPresets[this.activeIndex];
    let rx = p[0];
    let ry = p[1];
    let rw = p[2] * sizeFactor;
    let rh = p[3] * sizeFactor;

    this.drawContent(rx, ry, rw, rh);

    pop(); // popMatrix() + popStyle()
  }

  drawContent(cx, cy, cw, ch) {
    // 1. 기본 배경 프레임 (그리드 제외)
    if (this.contentType !== this.TYPE_GRID) {
      rectMode(CENTER);
      noFill();
      stroke(255, this.alpha);
      noStroke();
      rect(cx, cy, cw, ch);
    }

    // 2. 타입별 내부 콘텐츠 채우기
    switch (this.contentType) {
      case this.TYPE_RECT:
        // 사각형 모드
        let flickerFactor = 1.0;

        // 확률적 로직
        if (random(1) < 0.3) break; // 사라짐
        if (random(1) < 0.1) flickerFactor = 1.8; // 강한 번쩍임

        flickerFactor += random(-0.4, 0.4);
        flickerFactor = constrain(flickerFactor, 0.1, 1.8);

        let currentAlpha = constrain(this.alpha * flickerFactor, 0, 255);

        fill(255, currentAlpha); // p5.js에선 fill에 알파값 바로 넣기 가능
        noStroke();
        rect(cx, cy, cw, ch);
        break;

      case this.TYPE_IMAGE:
        // 이미지 모드
        if (this.displayImage) {
          // p5.js의 tint(gray, alpha)
          tint(255, this.alpha);
          imageMode(CENTER);
          image(this.displayImage, cx, cy, cw, ch);
          noTint();
        } else {
          fill(255, this.alpha * 0.1);
          rect(cx, cy, cw, ch);
        }
        break;

      /* case this.TYPE_VIDEO:
        // ★★★ [p5.js용 카메라 로직] ★★★
        // cam이 전역 변수로 있고, 로드되었다고 가정
        if (typeof cam !== 'undefined' && cam.loadedmetadata) { // p5.js 비디오 로드 확인 속성
          push();
          translate(cx, cy);

          let targetW = cw;
          let targetH = ch;

          // 비디오 중앙 크롭 계산
          let camCropX = cam.width / 2 - targetW / 2;
          let camCropY = cam.height / 2 - targetH / 2;
          
          camCropX = constrain(camCropX, 0, cam.width - targetW);
          camCropY = constrain(camCropY, 0, cam.height - targetH);

          // p5.js의 get() 혹은 copy() 사용. copy()가 성능상 더 좋음
          // copy(srcImage, sx, sy, sw, sh, dx, dy, dw, dh)
          // 여기서는 그냥 이미지를 get()해서 그리는 방식 (직관적)
          
          let croppedCam = cam.get(camCropX, camCropY, targetW, targetH);
          
          let drawX = -cw / 2;
          let drawY = -ch / 2;

          tint(255, this.alpha);
          imageMode(CORNER);
          image(croppedCam, drawX, drawY, targetW, targetH);
          noTint();
          pop();
        } else {
          fill(0, 200, 255, this.alpha); // p5.js color syntax
          rect(cx, cy, cw, ch);
        }
        break; 
      */

      case this.TYPE_CUSTOM_DRAW:
        if (this.customCanvas) {
          tint(255, this.alpha);
          imageMode(CENTER);
          image(this.customCanvas, cx, cy, cw, ch);
          noTint();
        } else {
          // 색상 분해 후 적용
          let r = red(this.myColor);
          let g = green(this.myColor);
          let b = blue(this.myColor);
          stroke(r, g, b, this.alpha);
          
          strokeWeight(1);
          for (let i = -2; i <= 2; i++) {
            line(cx - cw / 2, cy + ch / 4 * i, cx + cw / 2, cy + ch / 4 * i);
          }
          noStroke();
        }
        break;

      case this.TYPE_GRID:
        // 그리드 모드
        let gridAlpha = map(this.alpha, 0, 255, 0, 255);
        let HORIZONTAL_LINES = 8;
        let VERTICAL_LINES = 10;

        push(); // pushStyle() 대체
        stroke(255, gridAlpha);
        strokeWeight(1);
        noFill();

        // 1. 랜덤 위치 이동
        translate(this.gridXOffset, this.gridYOffset);

        // 2. 간격 적용
        let SPACING = this.gridSpacing;
        let halfWidth = (VERTICAL_LINES - 1) * SPACING / 2.0;
        let halfHeight = (HORIZONTAL_LINES - 1) * SPACING / 2.0;

        for (let i = 1; i < HORIZONTAL_LINES - 1; i++) {
          let y = -halfHeight + i * SPACING;
          line(-halfWidth, y, halfWidth, y);
        }
        for (let i = 1; i < VERTICAL_LINES - 1; i++) {
          let x = -halfWidth + i * SPACING;
          line(x, -halfHeight, x, halfHeight);
        }

        pop(); // popStyle() 대체
        break;
    }
  }
}

// ==================================================
// 레이아웃 설정 (setup()에서 호출)
// ==================================================
function setupGlitchesLayout() {
  // glitches 배열은 전역에 선언되어 있어야 함 (let glitches = [])
  
  // glitches = []; // 초기화 (필요시)

  // 1. [중앙] 메인 하트 위치
  let centerGlitch = new GlitchVisual(
    0, 0, 
    200, 
    "KICK_PEAK", 
    color(255, 0, 0)
  );
  glitches.push(centerGlitch);
}