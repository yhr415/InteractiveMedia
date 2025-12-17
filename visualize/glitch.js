class GlitchVisual {
  constructor(x, y, size, tag, c) {
    this.x = x;
    this.y = y;
    this.baseSize = size;
    this.glitchTag = tag;
    this.myColor = c;

    this.lastGlitchPower = 0;

    this.activeIndex = -1;
    this.alpha = 0;

    // 상수 정의
    this.TYPE_RECT = 0;
    this.TYPE_IMAGE = 1;
    this.TYPE_VIDEO = 2; // ★ 비디오 모드
    this.TYPE_CUSTOM_DRAW = 3;
    this.TYPE_GRID = 4;

    this.contentType = this.TYPE_RECT;
    this.displayImage = null;
    this.customCanvas = null;

    // 그리드 변수
    this.gridXOffset = 0;
    this.gridYOffset = 0;
    this.gridSpacing = 85.0;

    // ★ 비디오 글리치용 랜덤 변수 (신호가 튀는 느낌)
    this.videoOffsetX = 0;
    this.videoOffsetY = 0;

    // 프리셋 배열 (기존과 동일)
    this.rectPresets = [
      [-550, 0, 10, 900],
      [550, 0, 10, 900],
      [-400, 0, 300, 600],
      [400, 0, 300, 600],
      [0, -450, 1100, 10],
      [0, 450, 1100, 10],
      [0, -300, 800, 300],
      [0, 300, 800, 300],
      [-275, -225, 550, 450],
      [275, -225, 550, 450],
      [-275, 225, 550, 450],
      [275, 225, 550, 450],
      [0, 0, 1200, 100],
      [0, 0, 100, 1000],
      [0, 0, 1100, 900],
      [0, 0, 1200, 1000],
      [-450, 100, 200, 700],
      [450, -100, 200, 700],
      [-300, -300, 500, 500],
      [300, 300, 500, 500],
    ];
  }

  setImage(img) {
    this.displayImage = img;
  }

  // 글리치 발동 로직
  triggerGlitch() {
    // ★ [핵심] 랜덤 뽑기 통에 TYPE_VIDEO 추가!
    let availableTypes = [
      this.TYPE_RECT,
      this.TYPE_IMAGE,
      this.TYPE_GRID,
      this.TYPE_VIDEO,
    ];

    this.contentType = availableTypes[floor(random(availableTypes.length))];
    this.activeIndex = floor(random(this.rectPresets.length));
    this.alpha = 255;

    // 속성 랜덤화 (격자)
    if (this.contentType === this.TYPE_GRID) {
      this.gridSpacing = random(60, 100);
      this.gridXOffset = random(-200, 200);
      this.gridYOffset = random(-200, 200);
    }

    // ★ [NEW] 비디오도 그냥 나오면 재미없으니 살짝 비틀어서(Offset) 보여줌
    if (this.contentType === this.TYPE_VIDEO) {
      this.videoOffsetX = random(-50, 50);
      this.videoOffsetY = random(-50, 50);
    }
  }

  display() {
    // triggers가 없으면 안전하게 0
    let gPower =
      this.glitchTag && typeof triggers !== "undefined"
        ? triggers.get(this.glitchTag)
        : 0;

    if (gPower - this.lastGlitchPower > 0.1) {
      this.triggerGlitch();
    }
    this.lastGlitchPower = gPower;

    if (this.alpha <= 1) return;

    push();
    translate(this.x, this.y);

    this.alpha -= 20; // 광속 소멸

    let sizeFactor = 1.0;
    let p = this.rectPresets[this.activeIndex];
    let rx = p[0];
    let ry = p[1];
    let rw = p[2] * sizeFactor;
    let rh = p[3] * sizeFactor;

    this.drawContent(rx, ry, rw, rh);

    pop();
  }

  drawContent(cx, cy, cw, ch) {
    // 1. 기본 프레임 (그리드일 땐 제외)
    if (this.contentType !== this.TYPE_GRID) {
      rectMode(CENTER);
      noFill();
      stroke(255, this.alpha);
      noStroke();
      rect(cx, cy, cw, ch);
    }

    // 2. 콘텐츠 채우기
    switch (this.contentType) {
      case this.TYPE_RECT:
        let flicker = random(0.6, 1.4);
        fill(255, constrain(this.alpha * flicker, 0, 255));
        noStroke();
        rect(cx, cy, cw, ch);
        break;

      case this.TYPE_IMAGE:
        if (this.displayImage) {
          tint(255, this.alpha);
          imageMode(CENTER);
          image(this.displayImage, cx, cy, cw, ch);
          noTint();
        } else {
          fill(255, this.alpha * 0.5);
          rect(cx, cy, cw, ch);
        }
        break;

      // ===============================================
      // ★★★ [TYPE_VIDEO 구현] 웹캠 영상 띄우기 ★★★
      // ===============================================
      case this.TYPE_VIDEO:
        // camBuffer가 준비됐는지 확인
        if (typeof camBuffer !== "undefined") {
          let absoluteLeft = this.x + cx - cw / 2;
          let absoluteTop = this.y + cy - ch / 2;

          let sourceX = absoluteLeft + this.videoOffsetX;
          let sourceY = absoluteTop + this.videoOffsetY;

          let sx = constrain(sourceX, 0, camBuffer.width - cw);
          let sy = constrain(sourceY, 0, camBuffer.height - ch);

          // 이미지 조각 떠오기 (Crop)
          let snippet = camBuffer.get(sx, sy, cw, ch);
          snippet.filter(GRAY);

          // 3. 그리기 (Destination)
          // 이제 translate와 tint가 정상적으로 먹힘!
          tint(255, this.alpha);
          imageMode(CENTER); // 글리치 박스 중심에 그림
          image(snippet, cx, cy, cw, ch);
          blendMode(HARD_LIGHT);
          let contrastAlpha = constrain(this.alpha, 0, 255);
          tint(255, contrastAlpha);
          image(snippet, cx, cy, cw, ch);
          if (typeof glitchVignetteImg !== "undefined") {
            blendMode(MULTIPLY); // 곱하기 모드 (어둡게 만듦)

            // 비네팅도 글리치 투명도에 맞춰서 같이 사라져야 함
            tint(255, this.alpha);

            // 마스크 이미지를 현재 글리치 박스 크기(cw, ch)에 맞춰서 늘려 그림!
            image(glitchVignetteImg, cx, cy, cw, ch);
          }
          blendMode(BLEND);
          noTint();
        } else {
          fill(255, 0, 0, this.alpha);
          rect(cx, cy, cw, ch);
        }
        break;

      case this.TYPE_GRID:
        let gridAlpha = map(this.alpha, 0, 255, 0, 255);
        push();
        stroke(255, gridAlpha);
        strokeWeight(2); // 선 좀 더 두껍게
        noFill();
        translate(this.gridXOffset, this.gridYOffset);

        // 그리드 간격
        let SPACING = this.gridSpacing;
        for (let i = -5; i <= 5; i++) {
          line(-2000, i * SPACING, 2000, i * SPACING); // 가로선
          line(i * SPACING, -2000, i * SPACING, 2000); // 세로선
        }
        pop();
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
  let centerGlitch = new GlitchVisual(0, 0, 200, "KICK_PEAK", color(255, 0, 0));
  glitches.push(centerGlitch);
}
