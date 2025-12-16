import java.io.*;
import javax.sound.midi.*;
import java.util.*;
import processing.sound.*;

//=== Sound File ===
SoundFile musicFile;

// ====== 전역 설정 ======
float BPM = 132;          
double msPerTick = 0;     
long t0 = 0;              

// ====== 파일 로딩======
String mainMidiFile="lov3.mid";

// ====== 트랙 객체들 ======
ArrayList<SynthTrack> tracks = new ArrayList<SynthTrack>();
SynthTrack mainSynth; // mainsynth 01

void setup() {
  size(1000, 600);
  //mp3 loading
  musicFile = new SoundFile(this, "lov3.mp3");
  //midi file의 track들을 쪼개서 신호로 변경
  loadSingleMidiAndSplitTracks(mainMidiFile);
  startPlayback();
}

void draw() {
  background(20); // 배경 깔고
  long now = millis() - t0;
  
  // 1. [Main] 주인공 신스 처리 (특별 대우)
  if (mainSynth != null) {
    mainSynth.update(now); // 시간 업데이트 필수!
    drawMainVisualizer(mainSynth); // ★ 전용 비주얼라이저 호출
  }

  // 2. [Background] 나머지 조연들 처리 (원형 배치)
  // (트랙이 남아있을 때만 실행)
  if (tracks.size() > 0) {
    for (SynthTrack t : tracks) t.update(now);
    drawCircle(tracks);
  }
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