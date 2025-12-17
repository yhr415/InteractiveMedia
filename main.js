function preload() {
  soundFormats("mp3", "ogg");
  musicFile = loadSound("data/lov3.mp3");
  arrowSvg=loadImage("data/arrow-right-solid-full.svg");
}

function setup() {
  createCanvas(1100, 900);

  //웹캠 세팅, 글자 세팅, photobutton setting
  setupCamera();
  setupLetters();
  camBuffer = createGraphics(width, height);
  createVignetteMask();
  createGlitchVignetteMask();

  triggers = new TriggerManager();
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
  playbackBar = new PlaybackBar(width/2 - 400, height - 50, 800, 10);
}

function draw() {
  background(0); // 기본 검은 배경
  updateCamBuffer();
  switch (gameState) {
    case "SNAPSHOT":
      drawSnapshotStage(); // 1단계: 웹캠 + 버튼
      break;
    case "PUZZLE":
      drawPuzzleStage(); // 2단계: 액자 + 퍼즐
      break;
    case "TRANSITION":
      drawTransitionStage(); // 3단계: 3초 암전
      break;
    case "PLAYING":
      drawMainVisualizer(); // 4단계: 본게임
      break;
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
  if (key === "r" || key === "R") {
    startPlayback();
  }
}

function mousePressed() {
  if(gameState === "SNAPSHOT"){
    cameraButtonClick();
  }
  if (gameState === "PUZZLE") {
    checkLetter();
  }
  if (gameState === "PLAYING" && playbackBar) {
    playbackBar.clicked();
  }
}

function mouseDragged() {
  if (gameState === "PLAYING" && playbackBar) {
    playbackBar.dragged();
  }
}

function mouseReleased() {
  if (gameState === "PUZZLE") {
    for (let l of letters) {
      l.released();
    }
  }
  if (gameState === "PLAYING" && playbackBar) {
    playbackBar.released();
  }
}
