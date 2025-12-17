// ====== 전역 변수 선언 ======
let musicFile;
let BPM = 132;
let msPerTick = 0;
let t0 = 0;

// TriggerManager 인스턴스
let triggers; 

// 파일 이름
let mainMidiFile = "data/lov3.mid";

// ====== 배열 (ArrayList 대신 사용) ======
let tracks = [];
let hearts = [];
let diamonds = [];
let glitches = [];
let orbs = [];
let arcs = [];
let subHearts = [];
let noiseField;

// 카메라 변수 (이전 대화 맥락 반영, 필요 없으면 주석 처리)
let cam; 
