class FloatingText {
  constructor(targetW, targetH, targetSide = null, targetT = null) {
    let w = targetW;
    let h = targetH;
    let topY = -h * 0.35;
    let bottomY = h * 0.55;
    let sideX = w * 0.5;
    let ctrlY_Top = -h * 0.7;

    let t;
    let isRightSide;
    if (targetSide !== null && targetT !== null) {
      isRightSide = random(1) < 0.8 ? targetSide : !targetSide;
      t = constrain(randomGaussian(targetT, 0.15), 0, 1);
    } else {
      isRightSide = random(1) < 0.5;
      t = random(1);
    }

    let startX = 0;
    let startY = topY;
    let cp1x = isRightSide ? sideX * 0.5 : -sideX * 0.5;
    let cp1y = ctrlY_Top;
    let cp2x = isRightSide ? sideX : -sideX;
    let cp2y = -h * 0.1;
    let endX = 0;
    let endY = bottomY;

    let bx =
      pow(1 - t, 3) * startX +
      3 * pow(1 - t, 2) * t * cp1x +
      3 * (1 - t) * pow(t, 2) * cp2x +
      pow(t, 3) * endX;
    let by =
      pow(1 - t, 3) * startY +
      3 * pow(1 - t, 2) * t * cp1y +
      3 * (1 - t) * pow(t, 2) * cp2y +
      pow(t, 3) * endY;

    this.pos = createVector(bx, by);
    let noiseAmount = random(targetW * 0.05, targetW * 0.15);
    let noiseVec = p5.Vector.random2D().mult(noiseAmount);
    this.pos.add(noiseVec);

    // -----------------------------------------------------------
    // 2. [디지털 점멸 속성]
    // -----------------------------------------------------------
    this.isVisible = true;
    this.timer = random(15, 30); // 화면에 머무를 프레임 수 (약 0.2~0.5초)

    this.rectSize = random(6, 12);
    this.lineLen = random(20, 40) * (isRightSide ? 1 : -1);
    this.textChar = this.getRandomString();
    this.textSize = random(9, 13);
  }

  getRandomString() {
    let loveWords = [
      "LOVE",
      "사랑",
      "愛",
      "AMOUR",
      "AMOR",
      "LIEBE",
      "AMORE",
      "ЛЮБОВЬ",
      "AGÁPI",
      "CINTA",
      "ELSKER",
      "AISHITERU",
      "TI AMO",
      "TE AMO",
      "I LOVE U",
      "사랑해",
      "JE T'AIME",
      "ICH LIEBE DICH",
      "SARANG",
    ];
    return random(loveWords);
  }

  update() {
    this.timer--;
    if (this.timer <= 0) {
      this.isVisible = false;
    }
  }

  isDead() {
    return !this.isVisible;
  }

  display() {
    if (!this.isVisible) return;

    push();
    translate(this.pos.x, this.pos.y);

    stroke(255);
    strokeWeight(1);
    noFill();

    // 1. [타겟 네모] no fill, 흰 테두리
    rectMode(CENTER);
    rect(0, 0, this.rectSize * 1.6, this.rectSize);

    // 2. [직선] 네모 옆에서 뻗어나감
    // 네모 끝에서부터 선 시작
    let lineStartX =
      this.lineLen > 0 ? this.rectSize * 0.8 : -this.rectSize * 0.8;
    line(lineStartX, 0, this.lineLen, 0);

    // 3. [텍스트] 직선 끝에 배치
    noStroke();
    fill(255, this.alpha);
    textFont(floattext);
    textSize(this.textSize);

    // 글씨가 선 위에 살짝 떠 있게 (선 방향에 따라 정렬 변경)
    textAlign(this.lineLen > 0 ? LEFT : RIGHT, CENTER);
    let textPadding = this.lineLen > 0 ? 5 : -5;
    text(this.textChar, this.lineLen + textPadding, -2); // 선보다 아주 살짝 위(-2)

    pop();
  }
}
