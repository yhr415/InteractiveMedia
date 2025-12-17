function preload() {
  soundFormats('mp3', 'ogg');
  musicFile = loadSound('data/lov3.mp3');
}

function setup() {
  createCanvas(1100, 900);

  //웹캠 세팅, 글자 세팅
  setupCamera();
  setupLetters();
  
  triggers = new TriggerManager();

  // MIDI 로딩 함수 호출 (JS에 맞게 구현 필요)
  loadSingleMidiAndSplitTracks(mainMidiFile);
  
  noSmooth();
  noStroke();

  // p5.js에서 PVector는 createVector() 사용
  noiseField = new GlitchNoiseField(createVector(0, 0), 400, "BASS_POWER");
  
  setupHeartsLayout();
  setupOrbsLayout();
  setupDiamondsLayout();
  setupGlitchesLayout();
  setupArcsLayout();
  setupSubHeartsLayout();
}

function draw() {

  if (gameState === "INTRO") {
    drawIntro(); 
    return; // 여기서 끊어줘야 밑에 코드가 실행 안 됨
  }

  // 2. 플레이 상태 (비주얼라이저)
  if (gameState === "PLAYING") {
    drawMainVisualizer(); 
  }
}

// ==========================================
//             유틸리티 함수들
// ==========================================

function startPlayback() {
  t0 = millis();
  for (let t of tracks) t.reset();
  
  if (musicFile && musicFile.isLoaded()) {
    musicFile.stop();
    musicFile.play();
  }
}

function keyPressed() {
  if (key === 'r' || key === 'R') {
    startPlayback();
  }
}

function mousePressed() {
  if (gameState === "INTRO") {
    for (let l of letters) {
      l.pressed();
    }
  }
}

function mouseReleased() {
  if (gameState === "INTRO") {
    for (let l of letters) {
      l.released();
    }
  }
}