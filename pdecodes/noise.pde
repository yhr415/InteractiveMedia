// ==================================================
// ★ [최종 수정] 배경 노이즈 입자 클래스 (Rect 형태, 랜덤 크기)
// ==================================================
class NoiseParticle {
  PVector pos;
  PVector vel;
  float life;
  float maxLife;
  float baseSize;
  float randW, randH; // 랜덤 너비/높이

  NoiseParticle(PVector p, PVector v, float s) {
    pos = p.copy();
    vel = v.copy();
    life = 0;
    maxLife = random(30, 80); // 수명을 짧게 설정 (더 빠르게 사라짐)
    baseSize = s;
    // 베이스 크기(s)를 기준으로 랜덤 비율을 적용하여 다양한 크기 생성
    randW = baseSize * random(1, 3); 
    randH = baseSize * random(1, 3);
  }
  
  void update() {
    pos.add(vel);
    life++;
    // 속도 감속을 줄여서 좀 더 오래 움직이게 함
    vel.mult(0.99); 
  }
  
  void display() {
    float alpha = map(life, 0, maxLife, 255, 0); // 수명에 따라 투명해짐
    
    // 중앙 오브젝트와의 거리에 따른 밝기 조절 (원근감)
    float distance = pos.mag();
    alpha = constrain(alpha * map(distance, 0, 400, 1.5, 0.5), 0, 255);
    
    pushStyle();
    rectMode(CENTER); // ★ 중앙 기준으로 rect 그리기
    noStroke();
    fill(255, alpha); 
    
    // ★ rect 형태로, 랜덤 크기 적용
    rect(pos.x, pos.y, randW, randH); 
    
    popStyle();
  }
  
  boolean isDead() {
    return life >= maxLife;
  }
}


// ==================================================
// ★ [최종 수정] 글리치 노이즈 필드 관리 클래스 (Trigger & Clear 로직)
// ==================================================
class GlitchNoiseField {
  ArrayList<NoiseParticle> particles = new ArrayList<NoiseParticle>();
  PVector center;
  float baseSpawnRadius;
  String bassTag;        
  float lastBassPower = 0; // 베이스 피크 감지용
  
  GlitchNoiseField(PVector c, float r, String tag) {
    center = c;
    baseSpawnRadius = r;
    bassTag = tag;
  }

  void updateAndDisplay() {
    float bassPower = (bassTag != null) ? triggers.get(bassTag) : 0;
    
    // -------------------------------------------------------
    // ★ 1. 베이스 피크 감지 -> 클리어 & 생성 로직
    // -------------------------------------------------------
    if (bassPower - lastBassPower > 0.1) { // 피크가 찍혔을 때
        // 1-1. 이전 파티클 모두 지우기 (Clear)
        particles.clear(); 

        // 1-2. 동적 속성 계산 (베이스에 따라 생성량, 속도, 크기 결정)
        int spawnCount = int(map(bassPower, 0, 1, 10, 50)); // 베이스가 강할수록 더 많이
        float spawnSpeed = map(bassPower, 0, 1, 5, 20);      // 베이스가 강할수록 더 빠르게
        float particleBaseSize = map(bassPower, 0, 1, 2, 8); // 베이스가 강할수록 더 크게
        float currentSpawnRadius = baseSpawnRadius * map(bassPower, 0, 1, 0.9, 1.1);

        // 1-3. 새로운 파티클 생성 (Spawn)
        spawn(spawnCount, spawnSpeed, particleBaseSize, currentSpawnRadius);
    }
    lastBassPower = bassPower; // 다음 프레임을 위해 파워 업데이트


    // -------------------------------------------------------
    // 2. 입자 업데이트 및 그리기 (매 프레임)
    // -------------------------------------------------------
    for (int i = particles.size() - 1; i >= 0; i--) {
      NoiseParticle p = particles.get(i);
      p.update();
      p.display();
      
      // 3. 수명 다한 입자 제거
      if (p.isDead()) {
        particles.remove(i);
      }
    }
    
    // ★ [중요] 매 프레임 파티클을 계속 생성하는 로직은 삭제되었습니다.
  }
  
  void spawn(int count, float speed, float pBaseSize, float sRadius) {
    for (int i = 0; i < count; i++) {
      float angle = random(TWO_PI);
      float randRadius = random(sRadius * 0.1, sRadius);
      
      PVector startPos = new PVector(center.x + cos(angle) * randRadius, center.y + sin(angle) * randRadius);
      
      PVector initialVel = PVector.sub(startPos, center);
      initialVel.normalize();
      initialVel.mult(speed);
      
      particles.add(new NoiseParticle(startPos, initialVel, pBaseSize)); 
    }
  }
}