function drawMainVisualizer(){
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

  pop();
  if(triggers) triggers.reset();
}

function drawIntro() {
  background(0);

  // 1. 웹캠 화면 (거울)
  if (capture) {
    // push/pop으로 반전(거울모드) 처리하면 더 좋음
    push();
    translate(width, 0);
    scale(-1, 1);
    image(capture, 0, 0, width, height);
    pop();
  }
  
  // 2. 안내 문구 (옵션)
  // fill(255);
  // textAlign(CENTER);
  // text("글자를 맞춰서 L O V 3를 완성하세요!", width/2, 50);

  // 3. 글자들 그리기 & 로직 체크
  let completedCount = 0;
  for (let l of letters) {
    l.update();
    l.display();
    if (l.isLocked) completedCount++;
  }

  // 4. 다 맞췄으면? 다음 단계로!
  if (completedCount === 4) { // 글자가 4개니까 4
     takeSnapshotAndStart();
  }
}

// 퍼즐 4개가 다 제자리에 꽂혔을 때 호출되는 함수
function takeSnapshotAndStart() {
  console.log("🎉 퍼즐 완성! 비주얼라이저 모드로 전환합니다.");

  // 1. [소리] 브라우저 오디오 정책 해결 (필수!)
  userStartAudio(); 

  // 2. [추억] 현재 웹캠 화면 캡처해서 저장
  snapshot = capture.get(); 
  
  // 3. [화면] 상태 변경! (이게 있어야 draw()에서 비주얼라이저를 그려줌)
  gameState = "PLAYING"; 
  
  // 4. [음악] 실제 음악 재생 시작
  startPlayback();
}