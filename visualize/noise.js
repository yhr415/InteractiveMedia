// ==================================================
// ★ [최종 수정] 배경 노이즈 입자 클래스 (Rect 형태, 랜덤 크기)
// ==================================================
class NoiseParticle {
  constructor(p, v, s) {
    this.pos = p.copy(); // p5.Vector 복사
    this.vel = v.copy();
    this.life = 0;
    this.maxLife = random(30, 80); // 수명을 짧게 설정
    this.baseSize = s;
    
    // 베이스 크기(s)를 기준으로 랜덤 비율 적용
    this.randW = this.baseSize * random(1, 3);
    this.randH = this.baseSize * random(1, 3);
  }

  update() {
    this.pos.add(this.vel);
    this.life++;
    // 속도 감속
    this.vel.mult(0.99);
  }

  display() {
    // 수명에 따라 투명해짐
    let alphaVal = map(this.life, 0, this.maxLife, 255, 0);

    // 중앙 오브젝트와의 거리에 따른 밝기 조절 (원근감)
    let distance = this.pos.mag();
    let distFactor = map(distance, 0, 400, 1.5, 0.5);
    
    // constrain 사용
    alphaVal = constrain(alphaVal * distFactor, 0, 255);

    push(); // pushStyle() -> push()
    rectMode(CENTER); // 중앙 기준
    noStroke();
    fill(255, alphaVal);

    // rect 형태로, 랜덤 크기 적용
    rect(this.pos.x, this.pos.y, this.randW, this.randH);

    pop(); // popStyle() -> pop()
  }

  isDead() {
    return this.life >= this.maxLife;
  }
}


// ==================================================
// ★ [최종 수정] 글리치 노이즈 필드 관리 클래스
// ==================================================
class GlitchNoiseField {
  constructor(c, r, tag) {
    this.particles = []; // ArrayList -> []
    this.center = c; // p5.Vector (createVector로 넘겨줘야 함)
    this.baseSpawnRadius = r;
    this.bassTag = tag;
    this.lastBassPower = 0; // 베이스 피크 감지용
  }

  updateAndDisplay() {
    // triggers 전역 객체 확인
    let bassPower = (this.bassTag && typeof triggers !== 'undefined') ? triggers.get(this.bassTag) : 0;

    // -------------------------------------------------------
    // ★ 1. 베이스 피크 감지 -> 클리어 & 생성 로직
    // -------------------------------------------------------
    if (bassPower - this.lastBassPower > 0.1) {
      // 1-1. 이전 파티클 모두 지우기 (Clear)
      this.particles = []; // 배열 초기화로 싹 지움

      // 1-2. 동적 속성 계산
      let spawnCount = floor(map(bassPower, 0, 1, 10, 50)); // int() -> floor()
      let spawnSpeed = map(bassPower, 0, 1, 5, 20);
      let particleBaseSize = map(bassPower, 0, 1, 2, 8);
      let currentSpawnRadius = this.baseSpawnRadius * map(bassPower, 0, 1, 0.9, 1.1);

      // 1-3. 새로운 파티클 생성 (Spawn)
      this.spawn(spawnCount, spawnSpeed, particleBaseSize, currentSpawnRadius);
    }
    this.lastBassPower = bassPower; // 다음 프레임을 위해 파워 업데이트

    // -------------------------------------------------------
    // 2. 입자 업데이트 및 그리기 (매 프레임)
    // -------------------------------------------------------
    // 역순 루프 (삭제 시 인덱스 오류 방지)
    for (let i = this.particles.length - 1; i >= 0; i--) {
      let p = this.particles[i];
      p.update();
      p.display();

      // 3. 수명 다한 입자 제거
      if (p.isDead()) {
        this.particles.splice(i, 1); // ArrayList.remove(i) -> splice(i, 1)
      }
    }
  }

  spawn(count, speed, pBaseSize, sRadius) {
    for (let i = 0; i < count; i++) {
      let angle = random(TWO_PI);
      let randRadius = random(sRadius * 0.1, sRadius);

      // 시작 위치 계산
      let startX = this.center.x + cos(angle) * randRadius;
      let startY = this.center.y + sin(angle) * randRadius;
      let startPos = createVector(startX, startY);

      // 초기 속도 계산 (중앙에서 바깥으로 퍼짐)
      // PVector.sub(startPos, center) -> p5.Vector.sub(...)
      let initialVel = p5.Vector.sub(startPos, this.center);
      initialVel.normalize();
      initialVel.mult(speed);

      // 파티클 추가
      this.particles.push(new NoiseParticle(startPos, initialVel, pBaseSize));
    }
  }
}