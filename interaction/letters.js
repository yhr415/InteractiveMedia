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
    this.char = char; // 보여줄 글자 (L, O, V, 3)

    // 현재 위치 (덤벨의 위치)
    this.pos = createVector(startX, startY);

    // 목표 위치 (거치대 위치)
    this.target = createVector(targetX, targetY);

    this.isDragging = false; // 지금 잡고 있나?
    this.isLocked = false; // 자리에 꽂혔나?

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

    // 글자를 넣어야하는 빈자리
    if (this.target.x > 0 && !this.isLocked) {
      textAlign(CENTER, CENTER);
      textSize(64);
      noStroke();

      // ★ 형님이 원하던 "연한 검정색" (Dark Gray)
      // 0(완전검정) ~ 255(흰색) 사이. 60~80 정도면 적당히 어두워 보임
      fill(80);

      // 타겟 위치에 미리 글자를 박아둠 (가이드)
      text(this.char, this.target.x, this.target.y);
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
    if (this.isLocked) return false; // 이미 꽂힌 건 못 건드림

    // 마우스와 글자 사이 거리 체크
    let d = dist(mouseX, mouseY, this.pos.x, this.pos.y);

    if (d < this.hitSize) {
      if (this.isSealed) {
        this.hp--;
        if (this.hp <= 0) this.isSealed = false;
        return true; // ★ 봉인 때리는 것도 "잡은 것"으로 처리해서 뒤에 놈 클릭 방지!
      }
      this.isDragging = true;
      return true;
    }
    return false;
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

//글씨 검사하는 함수
function checkLetter() {
  for (let i = letters.length - 1; i >= 0; i--) {
    if (letters[i].pressed()) {
      break;
    }
  }
}
