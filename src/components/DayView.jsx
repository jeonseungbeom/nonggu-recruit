import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { logger } from '../logger';
import GuinPost from './GuinPost';
import GuijikPost from './GuijikPost';
import AddPostModal from './AddPostModal';

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dow = new Date(y, m - 1, d).getDay();
  return `${m}월 ${d}일 (${DAY_NAMES[dow]})`;
}

export default function DayView({ date, nickname, onClose }) {
  const [posts, setPosts] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    logger.api('DayView', `${date} 게시글 구독 시작`);

    const q = query(
      collection(db, 'posts'),
      where('date', '==', date),
      orderBy('createdAt', 'asc')
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      logger.api('DayView', `${date} 게시글 수신`, {
        total: data.length,
        guin: data.filter(p => p.type === 'guin').length,
        guijik: data.filter(p => p.type === 'guijik').length,
      });
      setPosts(data);
      setLoading(false);
    }, (err) => {
      logger.error('DayView', '게시글 구독 실패', err);
      setLoading(false);
    });

    return () => {
      logger.api('DayView', `${date} 게시글 구독 종료`);
      unsub();
    };
  }, [date]);

  const guinPosts   = posts.filter(p => p.type === 'guin');
  const guijikPosts = posts.filter(p => p.type === 'guijik');

  return (
    <>
      <div className="overlay overlay--day" onClick={onClose} />
      <div className="day-view">
        <div className="day-view__handle" />
        <div className="day-view__header">
          <h2 className="day-view__title">{formatDate(date)}</h2>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>

        <div className="day-view__body">
          {loading ? (
            <div className="loading">불러오는 중...</div>
          ) : posts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon">🏀</div>
              <p>등록된 글이 없습니다</p>
              <p className="empty-state__sub">아래 버튼으로 구인·구직을 올려보세요!</p>
            </div>
          ) : (
            <>
              {guinPosts.length > 0 && (
                <section>
                  <div className="section-label guin">🏀 구인 ({guinPosts.length})</div>
                  {guinPosts.map(post => (
                    <GuinPost key={post.id} post={post} nickname={nickname} />
                  ))}
                </section>
              )}
              {guijikPosts.length > 0 && (
                <section>
                  <div className="section-label guijik">👟 구직 ({guijikPosts.length})</div>
                  {guijikPosts.map(post => (
                    <GuijikPost key={post.id} post={post} nickname={nickname} />
                  ))}
                </section>
              )}
            </>
          )}
        </div>

        <div className="day-view__footer">
          <button className="add-btn" onClick={() => {
            logger.action('DayView', '글 추가 모달 열기', { date });
            setShowAdd(true);
          }}>
            + 구인 / 구직 추가하기
          </button>
        </div>
      </div>

      {showAdd && (
        <AddPostModal
          date={date}
          nickname={nickname}
          onClose={() => setShowAdd(false)}
        />
      )}
    </>
  );
}
