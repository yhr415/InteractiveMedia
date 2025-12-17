// ==================================================
// ★ MIDI 파일 로딩 및 트랙 분리 (비동기 방식)
// ==================================================
// p5.js의 preload()나 setup()에서 호출하세요.
// 예: loadSingleMidiAndSplitTracks("lov3.mid");
async function loadSingleMidiAndSplitTracks(fileName) {
  try {
    console.log("[시작] MIDI 파일 로딩 중... " + fileName);

    // 1. @tonejs/midi 라이브러리를 사용해 웹에서 MIDI 로드
    const midi = await Midi.fromUrl(fileName);

    console.log("[체크] 원본 미디 트랙 수: " + midi.tracks.length);

    let validTrackCount = 0;

    // 2. 트랙 순회 및 필터링
    // 자바스크립트 forEach 대신 for loop 사용 (인덱스 필요)
    for (let i = 0; i < midi.tracks.length; i++) {
      let tr = midi.tracks[i];

      // 1차 필터: 노트가 거의 없는 빈 트랙 패스
      if (tr.notes.length <= 1) continue;

      let trackName = "Track " + i;
      // 랜덤 색상 생성
      let c = color(random(100, 255), random(100, 255), random(200, 255));

      // SynthTrack 생성 (형님이 정의한 클래스)
      // JS에서는 msPerTick 계산을 라이브러리가 알아서 초(Seconds) 단위로 줍니다.
      // 여기서는 일단 객체만 만듭니다.
      let newTrack = new SynthTrack(trackName, c, 1.0);

      // 3. 노트 데이터 채우기 (fillNoteEvents 대체)
      // @tonejs/midi는 이미 notes 배열에 깔끔하게 정리되어 있어서 fillNoteEvents 함수가 따로 필요 없습니다.

      tr.notes.forEach((note) => {
        // ★★★ [중요 수정 2] note.time(초)을 가져와서 1000을 곱해 밀리초(ms)로 변환
        let startMs = note.time * 1000;
        let durationMs = note.duration * 1000;
        let pitch = note.midi;
        let vel = note.velocity * 127;

        // 이제 'tick' 변수에는 '밀리초' 시간이 들어갑니다.
        newTrack.events.push(new Event(startMs, true, pitch, vel));
        newTrack.events.push(new Event(startMs + durationMs, false, pitch, 0));
      });

      // ★★★ [중요] 2차 필터: "커팅" ★★★
      // 노트 개수가 10개 미만이면 "잡동사니" 취급
      if (newTrack.events.length < 10) {
        // console.log("탈락: " + trackName + " (노트 수 부족)");
        continue;
      }

      // 합격한 트랙 등록
      newTrack.sortByTick(); // 정렬 함수 필요
      tracks.push(newTrack); // add -> push
      validTrackCount++;

      console.log(`[생존] 트랙 #${i} | 노트 수: ${newTrack.events.length}`);
    }

    console.log("------------------------------------------------");
    console.log(
      `[결과] 컷팅 완료! 총 ${validTrackCount}개의 알짜배기 트랙만 남음.`
    );
  } catch (e) {
    console.error("MIDI 로딩 실패:", e);
  }
  manualMapping();
}

// fillNoteEvents 함수는 JS 라이브러리를 쓰면 필요 없어져서 삭제했습니다.
// 라이브러리가 이미 파싱을 다 해주기 때문입니다.

// ==================================================
// 트랙 설정 도우미 함수
// ==================================================
function setTrackConfig(index, tag, isVisible) {
  if (index >= 0 && index < tracks.length) {
    tracks[index].setConfig(tag, isVisible);
    console.log(`Track ${index} 설정됨 -> Tag: ${tag}, Visible: ${isVisible}`);
  } else {
    console.warn(`[경고] 트랙 번호 틀림: ${index}번 트랙은 없습니다.`);
  }
}


// ==================================================
// ★ 블러 네온 (하트용) - drawBlurryNeon
// ==================================================
function drawBlurryNeon(x, y, w, h, c, power) {
  noFill();
  blendMode(ADD); // 빛 겹치기 (필수!)

  let layers = 15;
  let maxStroke = 60 * power;

  // p5.js Color 객체에서 RGB 분리 (투명도 조절을 위해)
  let r = red(c);
  let g = green(c);
  let b = blue(c);

  for (let i = 0; i < layers; i++) {
    // i가 커질수록 두꺼워짐
    let weight = map(i, 0, layers, 2, maxStroke);

    // 바깥쪽은 희미하게
    let alphaVal = map(i, 0, layers, 50, 0);

    stroke(r, g, b, alphaVal * power);
    strokeWeight(weight);

    // drawHeartShape 함수가 정의되어 있어야 함
    drawHeartShape(x, y, w, h);
  }

  // === 코어 (Core) ===
  // lerpColor 사용 (p5.js color 객체끼리 섞음)
  let coreColor = lerpColor(c, color(255), 0.5);
  stroke(red(coreColor), green(coreColor), blue(coreColor), 200 * power);
  strokeWeight(2);

  drawHeartShape(x, y, w, h);

  blendMode(BLEND); // 복구
}

// ==================================================
// ★ 안개처럼 빛나는 네온 구슬 (Energy Orb)
// ==================================================
function drawGlowingOrb(x, y, size, c, power) {
  noStroke();
  blendMode(ADD);

  let layers = 20;

  // 색상 분리
  let r = red(c);
  let g = green(c);
  let b = blue(c);

  for (let i = 0; i < layers; i++) {
    let progress = i / layers;

    // 1. 크기: 큰 원 -> 작은 원
    let radius = map(progress, 0, 1, size, 0);

    // 2. 투명도: 낮게 시작해서 겹침
    let alphaVal = 20 * power;

    // 3. 색상: 중심부로 갈수록 흰색
    // lerpColor는 두 개의 color 객체가 필요함
    let whiteCol = color(255);
    let myCol = color(r, g, b);
    let drawColor = lerpColor(myCol, whiteCol, progress * 0.8);

    // p5.js fill에 color 객체와 alpha를 같이 넣으려면 setAlpha를 쓰거나,
    // red(), green(), blue()로 쪼개서 넣어야 함. 가장 안전한 방법:
    fill(red(drawColor), green(drawColor), blue(drawColor), alphaVal);

    circle(x, y, radius);
  }

  blendMode(BLEND);
}

class TriggerManager {
  constructor() {
    // Java의 HashMap<String, Float> 대신 그냥 빈 객체 사용
    this.signals = {};
  }

  // 1. 매 프레임 시작할 때 초기화 (리셋)
  reset() {
    // 객체를 비우는 가장 쉬운 방법: 그냥 새 빈 객체로 덮어쓰기
    this.signals = {};
  }

  // 2. 트랙이 신호 보낼 때 쓰는 함수 (Send)
  send(name, power) {
    if (power <= 0.01) return; // 너무 약하면 무시

    // 자바스크립트에서는 객체에 키가 있는지 확인하고 값 비교
    // this.signals[name]이 undefined가 아니면 이미 값이 있다는 뜻
    if (this.signals[name] !== undefined) {
      let current = this.signals[name];
      this.signals[name] = max(current, power); // p5.js의 max() 함수 사용
    } else {
      this.signals[name] = power;
    }
  }

  // 3. 하트가 신호 확인할 때 쓰는 함수 (Receive)
  get(name) {
    // 값이 있으면 그 값을 리턴, 없으면(undefined) 0을 리턴
    // (JS의 단축 평가 || 연산자 사용)
    return this.signals[name] || 0.0;
  }
}

// ==========================================
// Event 클래스 (데이터 저장용)
// ==========================================
class Event {
  constructor(tick, on, pitch, vel) {
    this.tick = tick;
    this.on = on; // true: Note On, false: Note Off
    this.pitch = pitch;
    this.vel = vel;
  }
}

// ==========================================
// SynthTrack 클래스 (트랙 관리 및 재생 로직)
// ==========================================
class SynthTrack {
  constructor(name, c, msPerTick) {
    this.name = name;
    this.trackColor = c; // p5.color 객체
    this.msPerTick = msPerTick;

    // ArrayList -> []
    this.events = [];
    this.activePitches = []; // 현재 눌려있는 노트들

    this.cursor = 0;

    // === [중요] 매핑을 위한 상태 변수들 ===
    this.isNoteStart = false; // Trigger: 이번 프레임에 시작됐나?
    this.isNoteSus = false; // Sustain: 지금 소리가 나고 있나?

    this.outputTag = null; // 내가 쏘아 올릴 신호 이름
    this.visible = true;

    // ★★★ 시각적 강도 (0.0 ~ 1.0)
    this.power = 0;
  }

  reset() {
    this.activePitches = []; // clear() -> 빈 배열 할당
    this.cursor = 0;
    this.isNoteStart = false;
    this.isNoteSus = false;
    this.power = 0;
  }

  sortByTick() {
    // 자바스크립트 배열 정렬 (오름차순)
    this.events.sort((a, b) => a.tick - b.tick);
  }

  // ★ 수동 설정용 헬퍼 함수
  setConfig(tag, isVisible) {
    this.outputTag = tag;
    this.visible = isVisible;
  }

  // 매 프레임 호출해서 상태 갱신
  update(nowMs) {
    this.isNoteStart = false;

    // ★ 잔상 효과 로직: 매 프레임 힘이 10%씩 빠짐 (부드러운 애니메이션)
    this.power *= 0.9;

    // 신호 보내기 (TriggerManager가 전역변수 triggers로 있다고 가정)
    if (this.outputTag !== null && typeof triggers !== "undefined") {
      triggers.send(this.outputTag, this.power);
    }

    // 이벤트 루프
    while (this.cursor < this.events.length) {
      let e = this.events[this.cursor];

      // 시간 계산 (반올림)
      let eventTimeMs = Math.round(e.tick * this.msPerTick);

      if (eventTimeMs <= nowMs) {
        this.cursor++; // 커서 이동

        if (e.on) {
          // Note On: 리스트에 없으면 추가
          if (!this.activePitches.includes(e.pitch)) {
            this.activePitches.push(e.pitch);
            this.isNoteStart = true; // ★ 시작 신호 발사!
            this.power = 1.0; // ★ 노트 시작될 때 파워 풀충전!
          }
        } else {
          // Note Off: 리스트에서 제거
          // JS엔 remove(값)이 없어서 인덱스를 찾아 지워야 함
          let idx = this.activePitches.indexOf(e.pitch);
          if (idx > -1) {
            this.activePitches.splice(idx, 1);
          }
        }
      } else {
        break; // 아직 처리할 시간이 안 됨 (미래의 노트)
      }
    }

    // Sustain 상태 갱신
    if (this.activePitches.length > 0) {
      this.isNoteSus = true;
      // 누르고 있는 동안은 파워가 0.5 밑으로 안 떨어지게 유지 (계속 빛나게)
      if (this.power < 0.5) this.power = 0.5;
    } else {
      this.isNoteSus = false;
    }
  }
}