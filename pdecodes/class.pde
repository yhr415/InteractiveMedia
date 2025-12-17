
class Event {
  long tick;
  boolean on;
  int pitch;
  int vel;
  Event(long tick, boolean on, int pitch, int vel) {
    this.tick = tick;
    this.on = on;
    this.pitch = pitch;
    this.vel = vel;
  }
}

class SynthTrack {
  String name;
  int trackColor;
  double msPerTick; // 파일마다 해상도가 다를 수 있어서 개별 저장

  ArrayList<Event> events = new ArrayList<Event>();
  ArrayList<Integer> activePitches = new ArrayList<Integer>();

  int cursor = 0;

  // === [중요] 매핑을 위한 상태 변수들 ===
  boolean isNoteStart = false; // Trigger: 이번 프레임에 시작됐나?
  boolean isNoteSus = false;   // Sustain: 지금 소리가 나고 있나?

  String outputTag = null; // 내가 쏘아 올릴 신호 이름 (없으면 null)
  boolean visible = true;
  // ★★★ 여기가 에러 원인! 이 변수가 없어서 에러가 난 겁니다 ★★★
  float power = 0; // 시각적 강도 (0.0 ~ 1.0)

  SynthTrack(String name, int c, double msPerTick) {
    this.name = name;
    this.trackColor = c;
    this.msPerTick = msPerTick;
  }

  void reset() {
    activePitches.clear();
    cursor = 0;
    isNoteStart = false;
    isNoteSus = false;
    power = 0; // 리셋
  }

  void sortByTick() {
    Collections.sort(events, new Comparator<Event>() {
      public int compare(Event a, Event b) {
        return Long.compare(a.tick, b.tick);
      }
    }
    );
  }

  // ★ 수동 설정용 헬퍼 함수
  void setConfig(String tag, boolean isVisible) {
    this.outputTag = tag;
    this.visible = isVisible;
  }

  // 매 프레임 호출해서 상태 갱신
  void update(long nowMs) {
    isNoteStart = false;

    // ★ 잔상 효과 로직: 매 프레임 힘이 10%씩 빠짐 (부드러운 애니메이션)
    power = power * 0.9;

    if (outputTag != null) {
      triggers.send(outputTag, this.power);
    }

    while (cursor < events.size()) {
      Event e = events.get(cursor);
      long eventTimeMs = (long)Math.round(e.tick * msPerTick);

      if (eventTimeMs <= nowMs) {
        cursor++; // 이벤트 처리

        if (e.on) {
          if (!activePitches.contains(e.pitch)) {
            activePitches.add(e.pitch);
            isNoteStart = true; // ★ 시작 신호 발사!
            power = 1.0;        // ★ 노트 시작될 때 파워 풀충전!
          }
        } else {
          if (activePitches.contains(e.pitch)) {
            activePitches.remove((Integer)e.pitch);
          }
        }
      } else {
        break; // 아직 처리할 시간이 안 됨
      }
    }

    // Sustain 상태 갱신
    if (activePitches.size() > 0) {
      isNoteSus = true;
      // 누르고 있는 동안은 파워가 0.5 밑으로 안 떨어지게 유지 (계속 빛나게)
      if (power < 0.5) power = 0.5;
    } else {
      isNoteSus = false;
    }
  }
}
