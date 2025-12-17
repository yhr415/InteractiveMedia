function setupLetters() {
  letters = []; //불러올 때마다 초기화
  let centerX = width / 2;
  let centerY = height / 2;
  let gap = 100; // 글자 간격

  // =================================================
  // [1] 주인공: 정답 글자 (LOV3)
  // =================================================
  // 목표 좌표(Target)가 명확하게 설정됨
  letters.push(new DraggableLetter("L", random(width), random(height), centerX - gap*1.5, centerY));
  letters.push(new DraggableLetter("O", random(width), random(height), centerX - gap*0.5, centerY));
  letters.push(new DraggableLetter("V", random(width), random(height), centerX + gap*0.5, centerY));
  letters.push(new DraggableLetter("3", random(width), random(height), centerX + gap*1.5, centerY));

  // =================================================
  // [2] 방해꾼: 갈 곳 없는 글자들 (Decoys)
  // =================================================
  let decoys = "ABCDEFGHIJKMNPQRSTUVWXYZ124567890@#$&?!"; 
  
  // 10개 뿌리기 (더 늘리고 싶으면 숫자만 바꾸면 됨)
  for (let i = 0; i < 10; i++) { 
    let rIndex = floor(random(decoys.length));
    let randomChar = decoys.charAt(rIndex);
    
    // 목표 좌표를 (-1000, -1000)으로 줘서 절대 안 붙게 함
    letters.push(new DraggableLetter(randomChar, random(width), random(height), -1000, -1000));
  }

  console.log(`💪 글자 세팅 완료! 총 ${letters.length}개 (정답 4 + 방해꾼 10)`);
}

class DraggableLetter {
  constructor(char, startX, startY, targetX, targetY) {
    this.char = char; // 보여줄 글자 (L, O, V, 3)
    
    // 현재 위치 (덤벨의 위치)
    this.pos = createVector(startX, startY);
    
    // 목표 위치 (거치대 위치)
    this.target = createVector(targetX, targetY);
    
    this.isDragging = false; // 지금 잡고 있나?
    this.isLocked = false;   // 자리에 꽂혔나?
    
    this.dragOffset = createVector(0, 0); // 마우스 잡은 위치 보정
    this.hitSize = 40; // 클릭 판정 범위 (반지름)
  }

  update() {
    // 이미 자리에 꽂혔으면(Lock) 더 이상 움직이지 않음 (휴식!)
    if (this.isLocked) return;

    // 드래그 중이면 마우스 따라다님
    if (this.isDragging) {
      this.pos.x = mouseX + this.dragOffset.x;
      this.pos.y = mouseY + this.dragOffset.y;
    }
  }

  display() {
    push();
    
    // 1. 타겟 박스 그리기 (빈 자리 표시)
    noFill();
    strokeWeight(2);
    if (this.isLocked) {
      stroke(0, 255, 0); // 성공하면 초록색
    } else {
      stroke(255, 100); // 평소엔 흐릿한 흰색
      // 점선 효과 대신 그냥 얇은 사각형으로 심플하게
      rectMode(CENTER);
      rect(this.target.x, this.target.y, 60, 80); 
    }

    // 2. 글자 그리기
    textAlign(CENTER, CENTER);
    textSize(64);
    noStroke();

    // 상태에 따른 색상 변화 (펌핑감!)
    if (this.isLocked) {
      fill(0, 255, 0); // 꽂힘: 초록
    } else if (this.isDragging) {
      fill(255, 50, 50); // 드래그 중: 빨강 (힘쓰는 중)
    } else {
      fill(255); // 기본: 흰색
    }

    text(this.char, this.pos.x, this.pos.y);
    
    pop();
  }

  // 마우스 눌렀을 때 (그립 잡기)
  pressed() {
    if (this.isLocked) return; // 이미 꽂힌 건 못 건드림

    // 마우스와 글자 사이 거리 체크
    let d = dist(mouseX, mouseY, this.pos.x, this.pos.y);
    
    if (d < this.hitSize) {
      this.isDragging = true;
      // 글자의 중심이 아니라, 내가 잡은 그 지점을 유지하기 위한 계산
      this.dragOffset.x = this.pos.x - mouseX;
      this.dragOffset.y = this.pos.y - mouseY;
    }
  }

  // 마우스 놓았을 때 (내려놓기)
  released() {
    if (!this.isDragging) return; // 내가 잡고 있던 게 아니면 무시
    
    this.isDragging = false;

    // 타겟 근처에 놓았는지 확인 (스냅 거리: 50px 이내)
    let d = dist(this.pos.x, this.pos.y, this.target.x, this.target.y);
    
    if (d < 50) {
      this.isLocked = true;
      this.pos = this.target.copy(); // 자석처럼 딱! 붙여버림
      console.log(`✅ ${this.char} 안착 성공!`);
      // 여기에 찰칵 소리나 효과음 넣어도 좋음
    }
  }
}