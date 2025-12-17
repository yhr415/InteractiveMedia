// ====== 전역 변수 선언 ======
let musicFile;
let BPM = 132;
let msPerTick = 0;
let t0 = 0;

// 초반 글자 움직이는 interaction에서 사용하는 배열
let letters=[];
let gameState="INTRO"; //playing이거나 intro. 기본 실행 시 intro로 시작, reset 버튼을 누르면 intro로 다시 돌아오도록 함


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

// 카메라 관련 변수
let cam; 
let capture;
