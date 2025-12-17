function drawMainVisualizer() {
  if (triggers) triggers.reset();

  let currentMillis = millis() - t0;

  // for (SynthTrack t : tracks) 문법 변경
  for (let t of tracks) {
    t.update(currentMillis);
  }
  let burstPower = triggers.get("HEART_BURST");
  let currentTime = millis();
  if (burstPower > 0.6 && currentTime - lastBurstTime > 100) {
    if (neonBursts.length < 15) {
      neonBursts.push(new NeonHeartBurst());

      // ★ 발사했으니 도장 쾅! (마지막 시간 갱신)
      lastBurstTime = currentTime;
    }
  }

  background(0);

  push(); // pushMatrix() -> push()
  translate(width / 2, height / 2);

  for (let i = neonBursts.length - 1; i >= 0; i--) {
    let b = neonBursts[i];
    b.update();
    b.display();
    if (b.isDead()) neonBursts.splice(i, 1);
  }

  let subPower = triggers.get("SUB_DRAW");

  // (drawMainVisualizer 내부)

  // 서브 하트 활성화 로직
  if (subPower > 0.3 && subHearts.length > 0) {
    // 쿨타임 체크 (8분음표 리듬 유지)
    if (currentTime - lastSubHeartTime > 200) {
      // ★ [수정] 한 번에 켤 개수를 랜덤으로 정함 (1개 ~ 4개)
      // floor(random(min, max)) -> min은 포함, max는 제외
      let count = floor(random(4, 8));

      // 정해진 개수만큼 반복해서 켬
      for (let i = 0; i < count; i++) {
        let randomIndex = floor(random(subHearts.length));
        subHearts[randomIndex].activate(subPower);
      }

      lastSubHeartTime = currentTime;
    }
  }

  // 그리기 루프 (기존 동일)
  for (let sh of subHearts) {
    sh.update();
    sh.display();
  }

  if (noiseField) noiseField.updateAndDisplay();

  // 나머지 비주얼 객체 루프
  for (let h of hearts) h.display();
  //textcloud
  let textTrigger = triggers.get("TEXT_CLOUD");
  // 쿨타임 적용 (너무 자주 생기면 지저분함. 100ms 정도 추천)
  if (textTrigger > 0.2 && currentTime - lastTextCloudTime > 100) {
    // ==========================================================
    // ★ [신규] 이번에 집중적으로 글리치 낼 위치(Target) 선정
    // ==========================================================
    // 1. 왼쪽 심방을 팰지, 오른쪽 심방을 팰지 결정 (랜덤)
    let focusSide = random(1) < 0.5;

    // 2. 위(0.0) ~ 아래(1.0) 중 어디를 팰지 결정 (랜덤)
    let focusT = random(1);

    let count = floor(random(3, 8));

    for (let i = 0; i < count; i++) {
      // ★ 생성자에게 "집중 타겟(focusSide, focusT)" 정보를 같이 넘겨줌!
      floatingTexts.push(
        new FloatingText(200*1.7, 200, focusSide, focusT)
      );
    }

    lastTextCloudTime = currentTime;
  }

  // 2. 업데이트 및 그리기 루프
  // 하트보다 뒤에 그리고 싶으면 drawMainHeart 위, 앞에 그리고 싶으면 아래에 배치
  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    let ft = floatingTexts[i];
    ft.update();
    ft.display();
    if (ft.isDead()) floatingTexts.splice(i, 1);
  }

  for (let o of orbs) o.display();
  for (let a of arcs) a.display();
  for (let d of diamonds) d.display();
  for (let g of glitches) g.display();

  drawCircleVisibleOnly();
  pop();
  if (playbackBar) {
    playbackBar.display();
  }
  if (triggers) triggers.reset();
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
  if (completedCount === 4) {
    // 글자가 4개니까 4
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
