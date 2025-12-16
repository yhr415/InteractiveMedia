class TriggerManager {
  // 신호 이름(String)과 파워(Float)를 저장하는 지도
  HashMap<String, Float> signals = new HashMap<String, Float>();

  // 1. 매 프레임 시작할 때 초기화 (리셋)
  void reset() {
    signals.clear();
  }

  // 2. 트랙이 신호 보낼 때 쓰는 함수 (Send)
  // 같은 신호에 여러 트랙이 몰리면, 더 센 놈을 기준으로 삼음 (Max)
  void send(String name, float power) {
    if (power <= 0.01) return; // 너무 약하면 무시

    if (signals.containsKey(name)) {
      float current = signals.get(name);
      signals.put(name, max(current, power)); // 더 큰 값으로 덮어쓰기
    } else {
      signals.put(name, power);
    }
  }

  // 3. 하트가 신호 확인할 때 쓰는 함수 (Receive)
  float get(String name) {
    if (signals.containsKey(name)) {
      return signals.get(name);
    }
    return 0.0; // 신호 없으면 0
  }
}