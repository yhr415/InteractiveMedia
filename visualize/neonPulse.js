class NeonPulse {
  constructor() {
    this.r = 0;          // 시작 반지름
    this.alpha = 255;    // 초기 투명도
    this.fadeSpeed = 4;  // 사라지는 속도 (조절 가능)
    this.growSpeed = 8;  // 커지는 속도 (조절 가능)
  }

  update() {
    this.r += this.growSpeed;
    this.alpha -= this.fadeSpeed;
  }

  isDead() {
    return this.alpha <= 0;
  }

  display() {
    push();
    noFill();
    
    // 네온 효과: 흰색 선을 겹쳐서 빛나는 느낌 연출
    for (let i = 0; i < 3; i++) {
      stroke(255, this.alpha / (i + 1));
      strokeWeight(2 + i * 3); // 바깥으로 갈수록 두껍고 흐리게
      ellipse(0, 0, this.r * 2);
    }
    
    // 가장 안쪽 날카로운 선
    stroke(255, this.alpha/2.4);
    strokeWeight(1);
    ellipse(0, 0, this.r * 2);
    
    pop();
  }
}