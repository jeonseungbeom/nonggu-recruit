import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { logger } from '../logger';

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dow = new Date(y, m - 1, d).getDay();
  return `${m}월 ${d}일 (${DAY_NAMES[dow]})`;
}

export default function AddPostModal({ date, nickname, onClose }) {
  const [type,      setType]      = useState('guin');
  const [teamName,  setTeamName]  = useState('');
  const [timeStart, setTimeStart] = useState('');
  const [timeEnd,   setTimeEnd]   = useState('');
  const [place,     setPlace]     = useState('');
  const [capacity,  setCapacity]  = useState('');
  const [timePref,  setTimePref]  = useState('오전');
  const [loading,   setLoading]   = useState(false);

  const timeInvalid = timeStart !== '' && timeEnd !== '' && Number(timeEnd) <= Number(timeStart);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || timeInvalid) return;

    const timeStr = `${String(timeStart).padStart(2,'0')}:00 ~ ${String(timeEnd).padStart(2,'0')}:00`;
    const base = { type, date, createdBy: nickname, createdAt: serverTimestamp() };

    logger.action('AddPostModal', '게시글 등록 시도', {
      type, date, nickname,
      ...(type === 'guin'
        ? { teamName, time: timeStr, place, capacity: parseInt(capacity, 10) }
        : { timePref }),
    });

    setLoading(true);
    try {
      if (type === 'guin') {
        const docRef = await addDoc(collection(db, 'posts'), {
          ...base,
          teamName: teamName.trim(),
          time:     timeStr,
          place:    place.trim(),
          capacity: parseInt(capacity, 10),
          participants: [],
        });
        logger.api('AddPostModal', '구인 게시글 등록 완료', { postId: docRef.id, teamName, date });
      } else {
        const docRef = await addDoc(collection(db, 'posts'), {
          ...base,
          timePreference: timePref,
          seekers: [nickname],
        });
        logger.api('AddPostModal', '구직 게시글 등록 완료', { postId: docRef.id, timePref, date });
      }
      onClose();
    } catch (err) {
      logger.error('AddPostModal', '게시글 등록 실패', err);
    } finally {
      setLoading(false);
    }
  };

  const isGuinValid = teamName.trim() && timeStart !== '' && timeEnd !== '' && !timeInvalid && place.trim() && capacity;

  return (
    <>
      <div className="overlay overlay--modal" onClick={onClose} />
      <div className="modal">
        <div className="modal__header">
          <h2 className="modal__title">{formatDate(date)} 글 추가</h2>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>

        <div className="type-tabs">
          <button
            className={`type-tab ${type === 'guin' ? 'type-tab--guin active' : ''}`}
            onClick={() => { setType('guin'); logger.info('AddPostModal', '탭 전환 → 구인'); }}
          >
            🏀 구인
          </button>
          <button
            className={`type-tab ${type === 'guijik' ? 'type-tab--guijik active' : ''}`}
            onClick={() => { setType('guijik'); logger.info('AddPostModal', '탭 전환 → 구직'); }}
          >
            👟 구직
          </button>
        </div>

        <form onSubmit={handleSubmit} className="post-form">
          {type === 'guin' ? (
            <>
              <div className="form-group">
                <label>팀명</label>
                <input type="text" value={teamName} onChange={e => setTeamName(e.target.value)}
                  placeholder="예: 서초 바스켓볼클럽" required autoFocus />
              </div>
              <div className="form-group">
                <label>시간 (24시간 기준)</label>
                <div className="time-range">
                  <input
                    className={timeInvalid ? 'error' : ''}
                    type="number" value={timeStart}
                    onChange={e => setTimeStart(e.target.value)}
                    placeholder="00" min="0" max="23" required
                  />
                  <span className="time-range__sep">~</span>
                  <input
                    className={timeInvalid ? 'error' : ''}
                    type="number" value={timeEnd}
                    onChange={e => setTimeEnd(e.target.value)}
                    placeholder="24" min="1" max="24" required
                  />
                  <span className="time-range__unit">시</span>
                </div>
                {timeInvalid && <p className="field-error">종료 시간은 시작 시간보다 늦어야 합니다</p>}
              </div>
              <div className="form-group">
                <label>장소</label>
                <input type="text" value={place} onChange={e => setPlace(e.target.value)}
                  placeholder="예: 서초구민체육관 3코트" required />
              </div>
              <div className="form-group">
                <label>필요 인원</label>
                <input type="number" value={capacity} onChange={e => setCapacity(e.target.value)}
                  placeholder="몇 명이 필요한가요?" min="1" max="50" required />
              </div>
              <p className="form-note">※ 등록 시 팀장으로 자동 참가됩니다</p>
            </>
          ) : (
            <>
              <div className="form-group">
                <label>선호 시간대를 선택하세요</label>
                <div className="time-pref-group">
                  {['오전', '낮', '저녁'].map(t => (
                    <button key={t} type="button"
                      className={`time-pref-btn ${timePref === t ? 'active' : ''}`}
                      onClick={() => setTimePref(t)}
                    >
                      {t === '오전' ? '☀️' : t === '낮' ? '🌤' : '🌙'} {t}
                    </button>
                  ))}
                </div>
              </div>
              <p className="form-note">※ 다른 사람들이 내 구직 글에 댓글을 남길 수 있습니다</p>
            </>
          )}

          <button
            type="submit"
            className="submit-btn"
            disabled={loading || (type === 'guin' && !isGuinValid)}
          >
            {loading ? '등록 중...' : '등록하기'}
          </button>
        </form>
      </div>
    </>
  );
}
