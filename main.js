// ====== 전역 변수 선언 ======
let musicFile;
let BPM = 132;
let msPerTick = 0;
let t0 = 0;

// TriggerManager 인스턴스
let triggers; 

// 파일 이름
let mainMidiFile = "data/lov3.mid";

// ====== 배열 (ArrayList 대신 사용) ======
let tracks = [];
let hearts = [];
let diamonds = [];
let glitches = [];
let orbs = [];
let arcs = [];
let subHearts = [];
let noiseField;

// 카메라 변수 (이전 대화 맥락 반영, 필요 없으면 주석 처리)
let cam; 

// ====== p5.js는 리소스 로딩을 preload에서 하는 게 국룰 ======
function preload() {
  soundFormats('mp3', 'ogg');
  musicFile = loadSound('data/lov3.mp3');
  // 주의: MIDI 파일 파싱은 JS에서 복잡해서 별도 라이브러리(Tone.js 등)나 JSON 변환이 필요할 수 있음
  // 일단 구조만 유지합니다.
}

function setup() {
  console.log("형님! 셋업 시작했습니다!");
  createCanvas(1100, 900); // size() -> createCanvas()
  
  triggers = new TriggerManager(); // 클래스가 정의되어 있다고 가정

  // MIDI 로딩 함수 호출 (JS에 맞게 구현 필요)
  loadSingleMidiAndSplitTracks(mainMidiFile);
  manualMapping();
  
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
  
  startPlayback();
}

function draw() {
  // Trigger 리셋
  if(triggers) triggers.reset();

  let currentMillis = millis() - t0;

  // for (SynthTrack t : tracks) 문법 변경
  for (let t of tracks) {
    t.update(currentMillis);
  }

  background(0);
  
  push(); // pushMatrix() -> push()
  translate(width / 2, height / 2);

  // 트리거 값 가져오기
  let subPower = triggers.get("SUB_DRAW");

  // 서브 하트 랜덤 활성화 로직
  if (subPower > 0.1 && subHearts.length > 0) {
    // (int)random() -> floor(random())
    let randomIndex = floor(random(subHearts.length));
    subHearts[randomIndex].activate(subPower);
  }

  // 서브 하트 루프
  for (let sh of subHearts) {
    sh.update();
    sh.display();
  }

  if(noiseField) noiseField.updateAndDisplay();

  // 나머지 비주얼 객체 루프
  for (let h of hearts) h.display();
  for (let o of orbs) o.display();
  for (let a of arcs) a.display();
  for (let d of diamonds) d.display();
  for (let g of glitches) g.display();

  drawCircleVisibleOnly();

  pop(); // popMatrix() -> pop()
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
