import java.io.*;
import javax.sound.midi.*;
import java.util.*;
import processing.sound.*;
import java.util.HashMap;
import processing.video.*;

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
ArrayList<DiamondVisual> diamonds = new ArrayList<DiamondVisual>();
ArrayList<GlitchVisual> glitches = new ArrayList<GlitchVisual>();
ArrayList<OrbVisual> orbs = new ArrayList<OrbVisual>();
ArrayList<ArcVisual> arcs = new ArrayList<ArcVisual>();
ArrayList<SubHeartVisual> subHearts = new ArrayList<SubHeartVisual>();
GlitchNoiseField noiseField;

void setup() {
  size(1100, 900);
  //mp3 loading
  musicFile = new SoundFile(this, "lov3.mp3");
  //midi file의 track들을 쪼개서 신호로 변경
  loadSingleMidiAndSplitTracks(mainMidiFile);
  manualMapping();
  noSmooth();
  noStroke();

  noiseField = new GlitchNoiseField(new PVector(0, 0), 400, "BASS_POWER");
  setupHeartsLayout();
  setupOrbsLayout();
  setupDiamondsLayout();
  setupGlitchesLayout();
  setupArcsLayout();
  setupSubHeartsLayout();
  startPlayback();
}

void draw() {

  triggers.reset();

  // ★ 중요: 숨겨진 트랙(false)이어도 소리는 나니까 update는 무조건 다 돌려야 함!
  for (SynthTrack t : tracks) {
    t.update(millis() - t0);
  }

  background(0);
  translate(width/2, height/2);

  float subPower = triggers.get("SUB_DRAW");

  // 신호가 들어왔을 때만 랜덤하게 하트 하나를 선택합니다.
  if (subPower > 0.1 && subHearts.size() > 0) {
    // 0부터 subHearts.size() - 1 중 하나를 랜덤 선택
    int randomIndex = (int)random(subHearts.size());

    // 선택된 하트만 활성화 신호를 받습니다.
    subHearts.get(randomIndex).activate(subPower);
  }

  // 모든 서브 하트 업데이트 및 출력
  for (SubHeartVisual sh : subHearts) {
    sh.update(); // 밝기 감소 처리
    sh.display(); // 출력 (이제 매개변수 없음)
  }

  noiseField.updateAndDisplay();
  for (HeartVisual h : hearts) {
    h.display();
  }
  for (OrbVisual o : orbs) {
    o.display();
  }
  for (ArcVisual a : arcs) {
    a.display();
  }

  for (DiamondVisual d : diamonds) {
    d.display();
  }
  for (GlitchVisual g : glitches) {
    g.display();
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
