function setupPhotobutton() {
  photoButton = createButton("📸 찰칵! (사진 찍기)");
  photoButton.position(width / 2 - 100, height - 100); // 화면 하단 중앙 배치
  photoButton.size(200, 60);
  photoButton.style("font-size", "24px");
  photoButton.style("background-color", "#ef4e4eff");
  photoButton.style("color", "white");
  photoButton.style("border", "none");
  photoButton.style("border-radius", "10px");
  photoButton.mousePressed(takeSnapshotBtnClicked); // 버튼 누르면 실행될 함수 연결
}

class PlaybackBar {
  constructor(x, y, w, h) {
    this.x = x;     // 바 시작 위치 X
    this.y = y;     // 바 시작 위치 Y
    this.w = w;     // 전체 길이
    this.h = h;     // 두께 (터치 영역)
    
    this.isDragging = false; // 드래그 중인지 체크
  }

  display() {
    // 음악 파일이 없거나 로딩 안 됐으면 그리지 않음
    if (!musicFile || !musicFile.isLoaded()) return;

    let duration = musicFile.duration();
    let currentTime = musicFile.currentTime();
    
    // 0으로 나누기 방지
    if (duration === 0) return;

    // 진행률 (0.0 ~ 1.0)
    let progress = currentTime / duration;
    
    // 만약 드래그 중이라면, 마우스 위치에 따라 보여주는 게 더 자연스러움
    if (this.isDragging) {
      let mouseProgress = (mouseX - this.x) / this.w;
      progress = constrain(mouseProgress, 0, 1);
    }

    push();
    translate(this.x, this.y);

    // 1. [배경 트랙] (어두운 회색)
    noStroke();
    fill(80);
    rectMode(CORNER);
    rect(0, -this.h / 2, this.w, this.h, 5); // 둥근 모서리

    // 2. [진행 바] (채워진 부분 - 빨간색 or 흰색)
    fill(255, 50, 50); // 유튜브 레드 컬러!
    let currentW = this.w * progress;
    rect(0, -this.h / 2, currentW, this.h, 5);

    // 3. [핸들] (동그라미) - 마우스 올리거나 드래그할 때 강조
    let handleX = currentW;
    
    // 마우스가 근처에 있거나 드래그 중이면 핸들을 키움
    let isHover = this.isMouseOver();
    let handleSize = (isHover || this.isDragging) ? 20 : 12;

    fill(255);
    ellipse(handleX, 0, handleSize, handleSize);
    
    // (옵션) 시간 텍스트 표시 (예: 1:30 / 3:45)
    if (isHover || this.isDragging) {
      textAlign(CENTER, BOTTOM);
      textSize(12);
      fill(255);
      text(this.formatTime(currentTime), handleX, -15);
    }

    pop();
  }

  // 마우스가 바 영역 위에 있는지 체크
  isMouseOver() {
    // 위아래로 조금 여유(padding)를 둬서 클릭하기 쉽게 함
    return (mouseX > this.x && mouseX < this.x + this.w &&
            mouseY > this.y - 20 && mouseY < this.y + 20);
  }

  // 클릭 시작 (mousePressed)
  clicked() {
    if (this.isMouseOver()) {
      this.isDragging = true;
      this.updateMusicTime(); // 클릭하자마자 그 위치로 이동
      return true; // "나 잡혔어!"
    }
    return false;
  }

  // 드래그 중 (mouseDragged)
  dragged() {
    if (this.isDragging) {
      this.updateMusicTime();
    }
  }

  // 클릭 해제 (mouseReleased)
  released() {
    this.isDragging = false;
  }

  // 음악 시간 점프 (Seek)
  updateMusicTime() {
    if (!musicFile || !musicFile.isLoaded()) return;

    let duration = musicFile.duration();
    // 마우스 위치를 비율로 환산
    let clickX = constrain(mouseX, this.x, this.x + this.w);
    let ratio = (clickX - this.x) / this.w;
    
    let targetTime = duration * ratio;
    
    // ★ 실제 음악 이동 (Jump)
    musicFile.jump(targetTime);
    //비주얼라이저 기준 시간 재설정
    if (typeof t0 !== 'undefined') {
      t0 = millis() - (targetTime * 1000); 
    }
    if (typeof tracks !== 'undefined') {
      for (let t of tracks) {
        t.reset(); // 일단 0점으로 복귀
        t.update(targetTime * 1000); // 목표 시간까지 순식간에 상태 업데이트
      }
    }

  }
  
  // 초 -> 분:초 포맷팅 (유틸)
  formatTime(seconds) {
    let m = floor(seconds / 60);
    let s = floor(seconds % 60);
    return m + ":" + nf(s, 2); // nf(숫자, 자릿수) -> 01, 02 등
  }
}