void loadSingleMidiAndSplitTracks(String fileName) {
  try {
    File f = new File(dataPath(fileName));
    // file loading debuging - fixed
    // if(!f.exists()) {
    //   println("[경고] 파일을 못 찾겠어!: " + fileName);
    //   return;
    // }
    
    Sequence seq = MidiSystem.getSequence(f);
    int ppq = seq.getResolution();
    double localMsPerTick = 60000.0 / (BPM * ppq);
    
    Track[] midiTracks = seq.getTracks();
    println("[체크] 원본 미디 파일의 총 트랙 수: " + midiTracks.length);

    int validTrackCount = 0; // 살아남은 트랙 수

    for (int i = 0; i < midiTracks.length; i++) {
      Track tr = midiTracks[i];
      
      // 1차 필터: 너무 텅 빈 트랙 패스
      if (tr.size() <= 1) continue; 

      String trackName = "Track " + i;
      int c = color(random(100, 255), random(100, 255), random(200, 255));
      SynthTrack newTrack = new SynthTrack(trackName, c, localMsPerTick);
      
      // 노트 추출
      fillNoteEvents(tr, newTrack.events);
      
      // ★★★ [중요] 2차 필터: "커팅" 들어갑니다 ★★★
      // 노트 개수가 10개 미만이면 "잡동사니" 취급하고 버림.
      // (만약 킥 드럼처럼 노트가 적은 악기라면 이 숫자를 5 정도로 낮춰)
      if (newTrack.events.size() < 10) {
         continue; // "넌 너무 가벼워! 탈락!"
      }

      // 합격한 놈들만 등록
      newTrack.sortByTick();
      tracks.add(newTrack);
      validTrackCount++;
      
      // 콘솔에 생존자 명단 출력 (누가 살아남았는지 확인해봐)
      println("[생존] 트랙 #" + i + " | 노트 수: " + newTrack.events.size());
    }

    if (tracks.size() > 0) {
      // 1. 리스트의 첫 번째 놈(0번)을 mainSynth로 임명
      mainSynth = tracks.get(0);
      
      // 2. 리스트에서는 삭제 (안 지우면 원형에도 또 나옴)
      tracks.remove(0);
      
      println("[분리 완료] 메인 신스 트랙이 분리되었습니다: " + mainSynth.name);
    }

    
    println("------------------------------------------------");
    println("[결과] 컷팅 완료! 총 " + validTrackCount + "개의 알짜배기 트랙만 남음.");
    
  } catch (Exception e) {
    e.printStackTrace();
  }
}

void fillNoteEvents(Track midiTrack, ArrayList<Event> out) {
  for (int i = 0; i < midiTrack.size(); i++) {
    MidiEvent me = midiTrack.get(i);
    MidiMessage mm = me.getMessage();
    long tick = me.getTick();

    if (mm instanceof ShortMessage) {
      ShortMessage sm = (ShortMessage) mm;
      int cmd = sm.getCommand();
      int pitch = sm.getData1();
      int vel = sm.getData2();

      if (cmd == ShortMessage.NOTE_ON && vel > 0) {
        out.add(new Event(tick, true, pitch, vel));
      } else if (cmd == ShortMessage.NOTE_OFF || (cmd == ShortMessage.NOTE_ON && vel == 0)) {
        out.add(new Event(tick, false, pitch, vel));
      }
    }
  }
}