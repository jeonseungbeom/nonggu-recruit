export default function SetupGuide() {
  return (
    <div className="setup-guide">
      <div className="setup-guide__icon">🏀</div>
      <h1 className="setup-guide__title">농구인구직</h1>
      <h2 className="setup-guide__sub">Firebase 설정이 필요합니다</h2>

      <div className="setup-steps">
        <div className="setup-step">
          <span className="step-num">1</span>
          <div>
            <strong>Firebase 프로젝트 만들기</strong>
            <p>
              <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer">
                console.firebase.google.com
              </a>{' '}
              접속 → [프로젝트 추가]
            </p>
          </div>
        </div>
        <div className="setup-step">
          <span className="step-num">2</span>
          <div>
            <strong>Firestore Database 생성</strong>
            <p>왼쪽 메뉴 → Firestore Database → 데이터베이스 만들기 → 테스트 모드</p>
          </div>
        </div>
        <div className="setup-step">
          <span className="step-num">3</span>
          <div>
            <strong>웹 앱 등록</strong>
            <p>⚙️ 프로젝트 설정 → 내 앱 → &lt;/&gt; 웹 클릭 → 앱 등록</p>
          </div>
        </div>
        <div className="setup-step">
          <span className="step-num">4</span>
          <div>
            <strong>.env 파일에 키 입력</strong>
            <p>SDK 설정 화면의 값을 프로젝트 루트 <code>.env</code> 파일에 붙여넣기</p>
          </div>
        </div>
        <div className="setup-step">
          <span className="step-num">5</span>
          <div>
            <strong>개발 서버 재시작</strong>
            <p><code>npm run dev</code></p>
          </div>
        </div>
      </div>

      <div className="setup-env-preview">
        <p className="setup-env-label">.env 파일 형식</p>
        <pre>{`VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=프로젝트ID.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=프로젝트ID
VITE_FIREBASE_STORAGE_BUCKET=프로젝트ID.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=숫자...
VITE_FIREBASE_APP_ID=1:숫자:web:...`}</pre>
      </div>
    </div>
  );
}
