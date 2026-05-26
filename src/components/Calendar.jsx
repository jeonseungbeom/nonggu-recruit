import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { logger } from '../logger';

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];

function pad(n) { return String(n).padStart(2, '0'); }
function dateStr(y, m, d) { return `${y}-${pad(m + 1)}-${pad(d)}`; }

export default function Calendar({ onSelectDate, selectedDate }) {
  const [current, setCurrent] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [datesWithPosts, setDatesWithPosts] = useState(new Set());

  const { year, month } = current;

  useEffect(() => {
    const start = `${year}-${pad(month + 1)}-01`;
    const lastDay = new Date(year, month + 1, 0).getDate();
    const end = `${year}-${pad(month + 1)}-${pad(lastDay)}`;

    logger.api('Calendar', `${year}년 ${month + 1}월 게시글 조회`, { start, end });

    const q = query(
      collection(db, 'posts'),
      where('date', '>=', start),
      where('date', '<=', end)
    );

    const unsub = onSnapshot(q, (snap) => {
      const dates = new Set();
      snap.forEach(doc => dates.add(doc.data().date));
      logger.api('Calendar', `게시글 있는 날짜 수신`, { count: snap.size, dates: [...dates] });
      setDatesWithPosts(dates);
    }, (err) => {
      logger.error('Calendar', '게시글 조회 실패', err);
    });

    return unsub;
  }, [year, month]);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const today = new Date();
  const todayStr = dateStr(today.getFullYear(), today.getMonth(), today.getDate());

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const prevMonth = () => {
    setCurrent(({ year, month }) => {
      const next = month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 };
      logger.action('Calendar', '이전 달 이동', next);
      return next;
    });
  };

  const nextMonth = () => {
    setCurrent(({ year, month }) => {
      const next = month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 };
      logger.action('Calendar', '다음 달 이동', next);
      return next;
    });
  };

  return (
    <div className="calendar">
      <div className="calendar__nav">
        <button className="calendar__nav-btn" onClick={prevMonth}>‹</button>
        <h2 className="calendar__title">{year}년 {month + 1}월</h2>
        <button className="calendar__nav-btn" onClick={nextMonth}>›</button>
      </div>

      <div className="calendar__day-headers">
        {DAYS.map((d, i) => (
          <span key={d} className={`calendar__day-label ${i === 0 ? 'sun' : i === 6 ? 'sat' : ''}`}>{d}</span>
        ))}
      </div>

      <div className="calendar__grid">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const ds = dateStr(year, month, day);
          const isToday = ds === todayStr;
          const isSelected = ds === selectedDate;
          const hasPosts = datesWithPosts.has(ds);
          const dow = new Date(year, month, day).getDay();

          return (
            <div
              key={ds}
              className={[
                'calendar__cell',
                isToday    ? 'today'    : '',
                isSelected ? 'selected' : '',
                dow === 0  ? 'sun'      : '',
                dow === 6  ? 'sat'      : '',
              ].filter(Boolean).join(' ')}
              onClick={() => onSelectDate(ds)}
            >
              <span className="calendar__cell-num">{day}</span>
              {hasPosts && <span className="calendar__dot" />}
            </div>
          );
        })}
      </div>

      <div className="calendar__legend">
        <span className="legend-item"><span className="legend-dot" />게시글 있음</span>
        <span className="legend-item today-legend">오늘</span>
      </div>
    </div>
  );
}
