function setupCamera() {
  capture = createCapture(VIDEO);
  capture.size(width, height);
  capture.hide();
}

function drawSnapshotStage() {
  background(50); // 배경: 짙은 회색

  // 1. [뷰파인더]
  let viewW = 880;
  let viewH = 660;
  let viewX = (width - viewW) / 2;
  let viewY = 50;

  noStroke();
  fill(255);
  rect(viewX - 10, viewY - 10, viewW + 20, viewH + 20, 5); // 흰 테두리

  if (typeof camBuffer !== "undefined") {
    image(camBuffer, viewX, viewY, viewW, viewH);
  } else {
    fill(0);
    rect(viewX, viewY, viewW, viewH);
  }

  // 2. [컨트롤 바]
  fill(30);
  rect(0, height - 150, width, 150);

  // 3. [빨간 셔터 버튼] (심플하게 고정)
  let btnX = width / 2;
  let btnY = height - 75;
  let btnSize = 80;

  // 그림자
  fill(0, 50);
  ellipse(btnX + 2, btnY + 4, btnSize, btnSize);

  // 버튼 본체 (항상 밝은 빨강)
  fill(255, 60, 60);
  stroke(255);
  strokeWeight(4);
  ellipse(btnX, btnY, btnSize, btnSize);

  // 카메라 아이콘
  noStroke();
  fill(255);
  rectMode(CENTER);
  rect(btnX, btnY, 40, 30, 3);
  rect(btnX, btnY - 18, 15, 6);
  fill(255, 60, 60);
  ellipse(btnX, btnY, 18, 18);
  rectMode(CORNER);

  if (flashAlpha > 0) {
    fill(255, flashAlpha);
    noStroke();
    rect(0, 0, width, height);
    flashAlpha -= 15;
  }
}

// ★ 버튼 클릭했을 때 실행되는 함수
function takeSnapshotBtnClicked() {
  console.log("📸 찰칵! Y2K 감성으로 저장 완료!");

  // ★ [수정됨] capture.get() 대신 camBuffer.get() 사용!
  // 이제 필터, 조명, 비네팅, 거울모드 적용된 그대로 저장됨.

  if (typeof camBuffer !== "undefined") {
    // 버퍼의 현재 상태를 그대로 이미지로 떠옴
    snapshot = camBuffer.get();
  } else {
    // 혹시라도 버퍼 없으면 비상용으로 원본 사용
    snapshot = capture.get();
  }

  // 버튼 숨기기
  if (photoButton) photoButton.hide();

  // 상태 변경 -> 퍼즐 맞추기로 이동
  gameState = "PUZZLE";
}

function drawPuzzleStage() {
  // 1. 액자 그리기 (사진 테두리)
  rectMode(CENTER);
  fill(100, 50, 0); // 갈색 프레임
  noStroke();
  rect(width / 2, height / 2, width * 0.7 + 40, height * 0.7 + 40); // 사진보다 조금 크게

  // 2. 찍은 사진 걸기 (액자 안에)
  if (snapshot) {
    imageMode(CENTER);
    image(snapshot, width / 2, height / 2, width * 0.7, height * 0.7);
    imageMode(CORNER); // 모드 복구
  }

  // 3. 글자들 뿌리기 & 완성 체크
  let completedCount = 0;
  for (let l of letters) {
    l.update();
    l.display();
    if (l.isLocked) completedCount++;
  }

  // 4. 다 맞췄으면? -> 3단계(암전)로 넘어가는 트리거 발동!
  if (completedCount === 4) {
    startTransition();
  }
}

// 암전 시작을 알리는 함수 (딱 한 번 실행됨)
function startTransition() {
  console.log("🎉 퍼즐 완성! 3초간 암전 시작...");
  gameState = "TRANSITION";
  transitionStartTime = millis(); // 현재 시간 기록 (타이머 시작)
  fadeAmount = 0; // 밝은 상태에서 시작

  // 브라우저 오디오 정책 해결 (이때 미리 열어두는 게 좋음)
  userStartAudio();
}

// 3초 동안 계속 그려지는 함수
function drawTransitionStage() {
  // =================================================
  // 1. [배경] 사라져야 할 녀석들 먼저 그리기
  // =================================================

  // (1) 액자랑 사진 그리기 (PuzzleStage에서 썼던 코드 재사용)
  rectMode(CENTER);
  fill(100, 50, 0); // 갈색 프레임
  noStroke();
  rect(width / 2, height / 2, width * 0.7 + 40, height * 0.7 + 40);

  if (snapshot) {
    imageMode(CENTER);
    image(snapshot, width / 2, height / 2, width * 0.7, height * 0.7);
    imageMode(CORNER);
  }

  // (2) 방해꾼 글자(Decoys)들도 배경에 깔아둠 (얘네도 같이 어두워져야 하니까)
  for (let l of letters) {
    if (!l.isLocked) {
      l.display(); // 정답 아닌 애들만 먼저 그림
    }
  }

  // =================================================
  // 2. [커튼] 점점 어두워지는 검은 막 씌우기
  // =================================================
  let duration = 3000; // 3초 동안 진행
  let elapsed = millis() - transitionStartTime;

  // 0(투명)에서 시작해서 255(완전 검정)까지 변함
  let fadeAlpha = map(elapsed, 0, duration, 0, 255);
  fadeAlpha = constrain(fadeAlpha, 0, 255); // 안전장치

  noStroke();
  fill(0, fadeAlpha); // 검은색 + 투명도
  rectMode(CORNER);
  rect(0, 0, width, height); // 전체 화면 덮기

  // =================================================
  // 3. [주인공] LOV3만 검은 막 "위에" 다시 그리기!
  // =================================================
  // 이러면 배경은 어두워져도 얘는 밝게 남아있음 (Spotlight 효과)
  for (let l of letters) {
    if (l.isLocked) {
      // 이때 살짝 더 빛나는 효과 주면 멋짐 (옵션)
      // l.display()가 내부에서 fill 설정을 하므로 그냥 호출만 해도 됨
      l.display();
    }
  }

  // =================================================
  // 4. [종료] 완전히 어두워지면 다음 스테이지로
  // =================================================
  if (elapsed > duration) {
    console.log("🎬 암전 끝! 쇼타임!");
    gameState = "PLAYING";
    startPlayback();
  }
}

function updateCamBuffer() {
  if (typeof capture !== "undefined" && capture.loadedmetadata) {
    camBuffer.clear();

    camBuffer.push();
    camBuffer.translate(width, 0);
    camBuffer.scale(-1, 1); // 거울 모드

    // ==========================================================
    // 1단계: [베이스] 원본 깔기
    // ==========================================================
    camBuffer.blendMode(BLEND);
    camBuffer.noTint();
    camBuffer.image(capture, 0, 0, width, height);

    // ==========================================================
    // 2단계: [대비 펌핑] HARD_LIGHT (핵심!)
    // ==========================================================
    // 밝은 곳은 하얗게 날리고, 어두운 곳은 확 눌러버림 (S자 커브 효과)
    camBuffer.blendMode(HARD_LIGHT);

    // 여기서 회색(128)보다 밝으면 더 밝게, 어두우면 더 어둡게 만듦.
    // 쿨톤을 위해 파란빛(255)을 섞음.
    // 4번째 숫자(투명도)가 '대비의 강도'임. (150~200 추천)
    camBuffer.tint(200, 200, 255, 180);
    camBuffer.image(capture, 0, 0, width, height);

    // ==========================================================
    // 3단계: [노출 오버] SCREEN (하이라이트 날리기)
    // ==========================================================
    // 빛이 닿은 부분만 골라서 더 환하게 만듦 (플래시 직광 느낌)
    camBuffer.blendMode(SCREEN);

    // 약간 푸른끼 도는 밝은 빛을 얹음
    camBuffer.tint(220, 220, 255, 150);
    camBuffer.image(capture, 0, 0, width, height);

    // ==========================================================
    // 4단계: [마무리] 정리
    // ==========================================================
    camBuffer.blendMode(BLEND);
    camBuffer.noTint();
    camBuffer.pop();

    // 5. 비네팅 적용 (가장자리 어둡게)
    if (typeof vignetteImg !== "undefined") {
      camBuffer.blendMode(MULTIPLY);
      camBuffer.image(vignetteImg, 0, 0);
      camBuffer.blendMode(BLEND);
    }
  } else {
    camBuffer.background(0, 0, 255);
  }
}

//filter function
function createVignetteMask() {
  vignetteImg = createGraphics(width, height);
  vignetteImg.noFill();

  // ★ 튜닝 포인트 1: 최대 어두움 정도 (0~255)
  // 아까 200이었는데, 100 정도로 낮춰서 투명하게 만듦
  let maxDarkness = 120;

  // ★ 튜닝 포인트 2: 어둠이 시작되는 위치
  // width * 0.5 (화면 절반) 지점부터 어두워지기 시작 (얼굴 주변은 깨끗하게!)
  let startRadius = width * 0.5;

  for (let r = 0; r < width * 1.5; r += 10) {
    // map(현재반지름, 시작점, 끝점, 0, 최대어두움)
    let alpha = map(r, startRadius, width * 1.2, 0, maxDarkness);
    alpha = constrain(alpha, 0, maxDarkness);

    if (alpha > 0) {
      vignetteImg.stroke(0, alpha);
      vignetteImg.strokeWeight(10); // 선 두께를 좀 얇게 해서 더 부드럽게
      // 타원 모양도 살짝 덜 납작하게 수정 (0.9)
      vignetteImg.ellipse(width / 2, height / 2, r, r * 0.9);
    }
  }
}

function cameraButtonClick() {
  let btnX = width / 2;
  let btnY = height - 75;
  let btnSize = 80;

  let d = dist(mouseX, mouseY, btnX, btnY);

  // 버튼 클릭 범위 안이면 -> 바로 찰칵!
  if (d < btnSize / 2) {
    triggerCapture(); // ★ 카운트다운 없이 바로 촬영 함수 호출!
  }
}

function triggerCapture() {

  flashAlpha = 255; 

  if (typeof camBuffer !== 'undefined') {
    snapshot = camBuffer.get();
    snapshot.filter(GRAY);
  } else {
    snapshot = capture.get();
    snapshot.filter(GRAY);
  }
  
  isCountingDown = false;
  gameState = "PUZZLE"; // 퍼즐 모드로 이동
}

function createGlitchVignetteMask() {
  // 캔버스 크기만큼 만듦 (나중에 글리치 크기에 맞춰 늘려 쓸 거임)
  glitchVignetteImg = createGraphics(width, height);
  glitchVignetteImg.noFill();
  
  // ★ 튜닝 1: 최대 어두움 (거의 새카맣게)
  let maxDarkness = 240; // 255에 가까울수록 어두움

  // ★ 튜닝 2: 어둠 시작 위치 (중앙에서 가까운 곳부터 시작)
  // width * 0.2 면 꽤 안쪽부터 어두워지기 시작함
  let startRadius = width * 0.2; 

  for (let r = 0; r < width * 1.5; r += 10) {
    let alpha = map(r, startRadius, width, 0, maxDarkness);
    alpha = constrain(alpha, 0, maxDarkness);
    
    if (alpha > 0) {
      glitchVignetteImg.stroke(0, alpha);
      glitchVignetteImg.strokeWeight(12);
      // 타원 비율 조절 (글리치 박스에 맞게 늘어날 거라 적당히 원형 유지)
      glitchVignetteImg.ellipse(width/2, height/2, r, r * 0.95); 
    }
  }
}