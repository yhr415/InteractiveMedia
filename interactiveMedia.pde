import java.io.*;
import javax.sound.midi.*;
import java.util.*;
import processing.sound.*;
import java.util.HashMap;

//=== Sound File ===
SoundFile musicFile;

// ====== 전역 설정 ======
float BPM = 132;
double msPerTick = 0;
long t0 = 0;

//trigger manager 관련 전역변수
TriggerManager triggers = new TriggerManager();


// ====== 파일 로딩======
String mainMidiFile="lov3.mid";

// ====== 트랙 객체들 ======
ArrayList<SynthTrack> tracks = new ArrayList<SynthTrack>();
SynthTrack mainSynth; // mainsynth 01

ArrayList<HeartVisual> hearts = new ArrayList<HeartVisual>();

void setup() {
  size(1100, 900);
  //mp3 loading
  musicFile = new SoundFile(this, "lov3.mp3");
  //midi file의 track들을 쪼개서 신호로 변경
  loadSingleMidiAndSplitTracks(mainMidiFile);
  manualMapping();
  setupHeartsLayout();
  startPlayback();
}

void draw() {
  // 1. 트리거 리셋 & 모든 트랙 업데이트
  triggers.reset();

  // ★ 중요: 숨겨진 트랙(false)이어도 소리는 나니까 update는 무조건 다 돌려야 함!
  for (SynthTrack t : tracks) {
    t.update(millis() - t0);
  }

  background(0);
  translate(width/2, height/2);

  // 2. 하트 그리기 (매핑된 태그에 반응)
  for (HeartVisual h : hearts) {
    h.display();
  }

  // 3. 원형 비주얼라이저 (Visible이 true인 애들만 그리기!)
  drawCircleVisibleOnly();
}

// ==========================================
//             유틸리티 함수들
// ==========================================

void startPlayback() {
  t0 = millis();
  for (SynthTrack t : tracks) t.reset();
  if (musicFile != null) {
    musicFile.stop();
    musicFile.play();
  }
}

void keyPressed() {
  if (key == 'r' || key == 'R') startPlayback();
}
