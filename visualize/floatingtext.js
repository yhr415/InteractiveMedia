class FloatingText {
  constructor(targetW, targetH, targetSide = null, targetT = null) {
    // -----------------------------------------------------------
    // 1. 위치 계산 (형님의 베지어 공식 + 노이즈) - 그대로 유지
    // -----------------------------------------------------------
    let w = targetW;
    let h = targetH;

    let topY = -h * 0.35;
    let bottomY = h * 0.55;
    let sideX = w * 0.5;
    let ctrlY_Top = -h * 0.7;

    let startX = 0;
    let startY = topY;
    let cp1x = sideX * 0.5;
    let cp1y = ctrlY_Top;
    let cp2x = sideX;
    let cp2y = -h * 0.1;
    let endX = 0;
    let endY = bottomY;
    let isRightSide;
    let t;

    if (!isRightSide) {
      cp1x *= -1;
      cp2x *= -1;
    }

    if (targetSide !== null && targetT !== null) {
      // (1) 방향 결정: 80% 확률로 타겟 방향, 20%는 반대편에 튐 (자연스러움)
      if (random(1) < 0.8) {
        isRightSide = targetSide;
      } else {
        isRightSide = !targetSide;
      }

      // (2) 위치(t) 결정: 타겟(targetT)을 중심으로 종모양 분포(Gaussian)
      // 표준편차(sd)가 작을수록 더 빽빽하게 뭉침. 0.15 정도가 적당.
      let sd = 0.15;
      t = randomGaussian(targetT, sd);

      // t가 0~1 범위를 벗어나지 않게 자름
      t = constrain(t, 0, 1);
    } else {
      // 타겟 없으면 그냥 기존처럼 완전 랜덤 (비상용)
      isRightSide = random(1) < 0.5;
      t = random(1);
    }

    // 왼쪽/오른쪽 제어점 반전 처리 (기존 코드)
    if (!isRightSide) {
      cp1x *= -1;
      cp2x *= -1;
    }

    // -----------------------------------------------------------
    // 베지어 공식 대입 (기존과 동일)
    // -----------------------------------------------------------
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

    // 노이즈 추가 (기존과 동일)
    let noiseAmount = random(targetW * 0.05, targetW * 0.15);
    let noiseVec = p5.Vector.random2D().mult(noiseAmount);
    this.pos.add(noiseVec);

    // 속성 설정 (기존과 동일 - 움직임 없음)
    this.alpha = 255;
    this.fadeSpeed = random(5, 15);
    this.size = random(8, 14);
    this.textChar = this.getRandomString();
  }

  getRandomString() {
    let chars = [
      "LOV3",
      "사랑","愛", "AMOUR", "AMOR", "LIEBE", 
      "AMORE", "ЛЮБОВЬ"
    ];
    if (random(1) < 0.6) return random(chars);
    else return floor(random(10, 99)) + "";
  }

  update() {
    // this.pos.add(this.vel); <-- ★ [삭제됨] 위치 업데이트 안 함!

    this.alpha -= this.fadeSpeed; // 투명도만 줄어듦 (페이드 아웃)
  }

  isDead() {
    return this.alpha <= 0;
  }

  display() {
    if (this.alpha <= 0) return;

    push();
    translate(this.pos.x, this.pos.y);

    noStroke();
    fill(255, this.alpha);

    textAlign(CENTER, CENTER);
    textSize(this.size);
    text(this.textChar, 0, 0);

    pop();
  }
}
