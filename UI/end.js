function drawEndScreen() {
  // 1. Snapshot 단계에서 저장한 사진 뿌리기
  if (snapshot) {
    push();
    rotate(PI/12);
    translate(150,-150);
    imageMode(CENTER);
    rectMode(CENTER);
    // 화면 크기에 맞춰서 적절하게 출력 (예: 800x600 혹은 가변 크기)
    fill(255);
    rect(width/2,height/2,650,500);
    image(snapshot, width / 2, height / 2, 600, 450);
    pop();
  }

  // 2. 사진 위에 반투명 블랙 오버레이 (텍스트 가독성 벌크업)
  fill(0, 150);
  noStroke();
  rectMode(CENTER);
  rect(width / 2, height / 2, width, height);

  // 3. 엔딩 메시지
  fill(255,0,0);
  textAlign(CENTER, CENTER);
  textFont(floattext);
  textSize(30);
  text("SIK-K, Lil Moshpit - LOV3", width / 2, height / 2 - 120);

  // 4. [RESTART] 버튼 그리기
  drawRestartButton();
}

function drawRestartButton() {
  let btnX = width / 2;
  let btnY = height / 2 + 150;
  let btnW = 250;
  let btnH = 60;

  // 마우스 오버 시 레드 네온 효과
  if (abs(mouseX - btnX) < btnW/2 && abs(mouseY - btnY) < btnH/2) {
    fill(255, 0, 0);
    cursor(HAND);
  } else {
    fill(200);
    cursor(ARROW);
  }

  rect(btnX, btnY, btnW, btnH, 15);
  
  fill(0);
  textSize(20);
  textFont(floattext);
  text("또다시 보여줘야 돼", btnX, btnY);
}

function resetGame() {
  gameState = "SNAPSHOT"; // 처음으로 빽!
  
  // 1. 이미지 및 시간 데이터 초기화
  snapshot = null;
  t0 = millis();
  
  // 2. 모든 배열 싹 비우기 (중요!)
  hearts = [];
  diamonds = [];
  glitches = [];
  orbs = [];
  arcs = [];
  subHearts = [];
  neonBursts = [];
  floatingTexts = [];
  pulses = [];
  comboIcons = [];

  // 3. 음악 초기화
  if (musicFile) {
    musicFile.stop();
  }

  // 4. 글자 다시 세팅
  setupLetters();
  
  // 5. 비주얼라이저 레이아웃 다시 세팅
  setupHeartsLayout();
  setupOrbsLayout();
  setupDiamondsLayout();
  setupGlitchesLayout();
  setupArcsLayout();
  setupSubHeartsLayout();

  if (musicFile) {
    musicFile.stop();
    if (typeof fft !== 'undefined') {
      fft.setInput(musicFile); // 분석기 입력을 다시 잡아줌
    }
  }
}

function checkGameClear() {
  // 예: 음악이 끝났거나 재생바가 끝에 도달했을 때
  if (musicFile && !musicFile.isPlaying() && musicFile.currentTime() > 0) {
    gameState = "END";
  }
}