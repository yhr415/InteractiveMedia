function setupLetters() {
  letters = []; //불러올 때마다 초기화
  let centerX = width / 2;
  let centerY = height / 2;
  let gap = 100; // 글자 간격
  let noSpawnWidth = 600;
  let noSpawnHeight = 250;

  // =================================================
  // [1] 주인공: 정답 글자 (LOV3)
  // =================================================
  let targetChars = ["L", "O", "V", "3"];
  // 각 글자의 목표 위치(Target) 계산을 위한 오프셋
  let offsets = [-1.5, -0.5, 0.5, 1.5];

  for (let i = 0; i < 4; i++) {
    // ★ 여기가 핵심! "중앙은 피하고, 너무 멀지 않은 랜덤 위치" 받아오기
    let spawnPos = getRandomPosExcludingCenter(noSpawnWidth, noSpawnHeight);

    // 목표 위치 계산
    let targetX = centerX + gap * offsets[i];
    let targetY = centerY;

    letters.push(
      new DraggableLetter(
        targetChars[i],
        spawnPos.x,
        spawnPos.y,
        targetX,
        targetY
      )
    );
  }

  // =================================================
  // [2] 방해꾼: (Decoys)
  // =================================================
  let decoys = "ABCDFGHIJKMNPQRSTUWXYZ12456789@#$&?!";

  for (let i = 0; i < 12; i++) {
    // 방해꾼 좀 더 늘려도 됨
    let rIndex = floor(random(decoys.length));
    let randomChar = decoys.charAt(rIndex);

    // 방해꾼도 마찬가지로 중앙 피해서 생성
    let spawnPos = getRandomPosExcludingCenter(noSpawnWidth, noSpawnHeight);

    // 목표 좌표는 (-1000, -1000) -> 절대 안 붙음
    letters.push(
      new DraggableLetter(randomChar, spawnPos.x, spawnPos.y, -1000, -1000)
    );
  }

  console.log(
    `💪 글자 배치 완료! (중앙 구역 ${noSpawnWidth}x${noSpawnHeight} 제외)`
  );
}

// =================================================
// 📍 [보조 함수] 안전한 랜덤 위치 찾기 (스마트 스포터)
// =================================================
function getRandomPosExcludingCenter(excludeW, excludeH) {
  let x, y;
  let safe = false;

  // 적절한 위치 찾을 때까지 무한 반복 (보통 1~2번 만에 찾음)
  do {
    // 1. 전체 가동 범위 설정 (화면 너무 끝까지는 안 가게 여백 100px 줌)
    let margin = 100;
    x = random(margin, width - margin);
    y = random(margin, height - margin);

    // 2. 중앙 금지 구역(Box)에 들어갔는지 체크
    // 중앙점(width/2, height/2)에서 현재 점(x,y)까지의 거리가 금지구역 절반보다 작으면 '내부'임
    let distFromCenterX = abs(x - width / 2);
    let distFromCenterY = abs(y - height / 2);

    // 가로 거리와 세로 거리가 모두 금지구역 안쪽이면? -> 다시 뽑아! (safe = false)
    if (distFromCenterX < excludeW / 2 && distFromCenterY < excludeH / 2) {
      safe = false;
    } else {
      safe = true; // 안전지대! 통과!
    }
  } while (!safe); // safe가 true가 될 때까지 반복

  return createVector(x, y);
}

class DraggableLetter {
  constructor(char, startX, startY, targetX, targetY) {
    this.char = char;
    this.pos = createVector(startX, startY);
    this.target = createVector(targetX, targetY);

    this.isDragging = false;
    this.isLocked = false;
    this.hitSize = 40;

    // ★ [핵심] 생성될 때 딱 한 번만 색상을 정함 (번쩍임 방지)
    // R은 150~255 사이, G/B는 아주 낮게 해서 다양한 레드 톤 생성
    this.myColor = color(random(150, 255), random(0, 30), random(0, 30));
    
    // 드래그 중일 때 쓸 더 밝은 레드
    this.brightColor = color(255, 150, 150);
  }

  update() {
    if (this.isLocked) return;
    if (this.isDragging) {
      this.pos.x = mouseX; 
      this.pos.y = mouseY;
    }
  }

  display() {
    push();
    textAlign(CENTER, CENTER);
    textFont(titletext);
    textSize(64);
    noStroke();

    // 1. [가이드] 정답 자리 (연한 검정/회색)
    if (this.target.x > 0 && !this.isLocked) {
      stroke(200,50);
      strokeWeight(5);
      fill(30, 30, 30, 180); 
      text(this.char, this.target.x, this.target.y);
    }

    // 2. [본체 글자] 색상 로직
    if (this.isLocked) {
      fill(255, 0, 0); // 성공하면 초록색 (혹은 형님이 원하는 색)
      drawingContext.shadowBlur = 15;
      drawingContext.shadowColor = 'red';
    } else if (this.isDragging) {
      fill(this.brightColor); // 잡고 있을 땐 밝은 레드
      
      // 잡고 있을 때만 살짝 네온 광택
      drawingContext.shadowBlur = 15;
      drawingContext.shadowColor = 'red';
    } else {
      strokeWeight(5);
      stroke(231,140,159,50);
      fill(this.myColor); // 안 잡을 땐 아까 정해진 고유 레드 (안 번쩍거림!)
    }

    text(this.char, this.pos.x, this.pos.y);
    pop();
  }

  pressed() {
    if (this.isLocked) return false;
    let d = dist(mouseX, mouseY, this.pos.x, this.pos.y);
    if (d < this.hitSize) {
      this.isDragging = true;
      return true;
    }
    return false;
  }

  released() {
    if (!this.isDragging) return;
    this.isDragging = false;
    
    let d = dist(this.pos.x, this.pos.y, this.target.x, this.target.y);
    if (d < 50) {
      this.isLocked = true;
      this.pos = this.target.copy();
    }
  }
}

//글씨 검사하는 함수
function checkLetter() {
  for (let i = letters.length - 1; i >= 0; i--) {
    if (letters[i].pressed()) {
      break;
    }
  }
}
