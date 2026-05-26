import React, { useState, useEffect } from 'react';
import { isConfigured } from './firebase';
import { logger } from './logger';
import NicknameModal from './components/NicknameModal';
import Calendar from './components/Calendar';
import DayView from './components/DayView';
import SetupGuide from './components/SetupGuide';

export default function App() {
  const [nickname, setNickname] = useState(() => localStorage.getItem('nonggu_nickname') || '');
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    logger.info('App', '앱 시작', { configured: isConfigured, nickname: nickname || '(없음)' });
  }, []);

  const handleNicknameSet = (name) => {
    localStorage.setItem('nonggu_nickname', name);
    setNickname(name);
    logger.action('App', '닉네임 설정', { nickname: name });
  };

  const handleSelectDate = (date) => {
    const next = selectedDate === date ? null : date;
    setSelectedDate(next);
    if (next) logger.action('App', '날짜 선택', { date });
  };

  if (!isConfigured) {
    return <SetupGuide />;
  }

  return (
    <div className="app">
      {!nickname && <NicknameModal onSet={handleNicknameSet} />}
      <header className="app-header">
        <span className="header-icon">🏀</span>
        <h1>농구인구직</h1>
        {nickname && (
          <button
            className="nickname-badge"
            onClick={() => {
              if (window.confirm('닉네임을 변경하시겠습니까?')) {
                logger.action('App', '닉네임 초기화');
                localStorage.removeItem('nonggu_nickname');
                setNickname('');
              }
            }}
          >
            {nickname}
          </button>
        )}
      </header>
      <main>
        <Calendar onSelectDate={handleSelectDate} selectedDate={selectedDate} />
      </main>
      {selectedDate && (
        <DayView
          date={selectedDate}
          nickname={nickname}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}
