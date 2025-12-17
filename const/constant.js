// ====== 전역 변수 선언 ======
let musicFile;
let BPM = 132;
let msPerTick = 0;
let t0 = 0;

// 초반 글자 움직이는 interaction에서 사용하는 배열
let letters=[];
let gameState="SNAPSHOT"; //playing이거나 intro. 기본 실행 시 intro로 시작, reset 버튼을 누르면 intro로 다시 돌아오도록 함


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
let lastSubHeartTime = 0;
let neonBursts = [];
let lastBurstTime = 0;
let noiseField;

// 카메라 관련 변수
let cam; 
let capture;
let snapshot; //이미 찍은 사진 저장하는 저장소
let photoButton; //사진을 찍는 버튼
let camBuffer;
let vignetteImg;
let flashAlpha = 0;
let glitchVignetteImg;

// [타이머 및 페이드 효과]
let transitionStartTime = 0; // 암전 시작 시간 기록용
let fadeAmount = 0;          // 어두워지는 정도 (0~255) 처음에는 0, 나중에 어두워짐

//재생 컨트롤 바
let playbackBar;