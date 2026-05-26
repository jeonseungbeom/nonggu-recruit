import React, { useState } from 'react';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase';
import { logger } from '../logger';
import CommentSection from './CommentSection';

const TIME_STYLE = {
  '오전': { bg: '#E3F2FD', color: '#1565C0', label: '☀️ 오전' },
  '낮':   { bg: '#FFF8E1', color: '#F57F17', label: '🌤 낮'   },
  '저녁': { bg: '#EDE7F6', color: '#4527A0', label: '🌙 저녁' },
};

export default function GuijikPost({ post, nickname }) {
  const [showSeekers,  setShowSeekers]  = useState(false);
  const [showComments, setShowComments] = useState(false);

  const seekers  = post.seekers || [];
  const isSeeking = seekers.includes(nickname);
  const isOwner  = post.createdBy === nickname;
  const style    = TIME_STYLE[post.timePreference] || TIME_STYLE['낮'];

  const handleSeek = async () => {
    if (isOwner) return;
    const ref = doc(db, 'posts', post.id);

    try {
      if (isSeeking) {
        logger.action('GuijikPost', '구직 취소', { postId: post.id, nickname });
        await updateDoc(ref, { seekers: arrayRemove(nickname) });
        logger.api('GuijikPost', '구직 취소 완료', { postId: post.id });
      } else {
        logger.action('GuijikPost', '나도 구직 신청', { postId: post.id, nickname });
        await updateDoc(ref, { seekers: arrayUnion(nickname) });
        logger.api('GuijikPost', '나도 구직 완료', { postId: post.id });
      }
    } catch (err) {
      logger.error('GuijikPost', '구직 처리 실패', err);
    }
  };

  return (
    <div className="post-card post-card--guijik">
      <div className="post-card__top">
        <span className="badge badge--guijik">구직</span>
        <span className="time-pref-badge" style={{ background: style.bg, color: style.color }}>
          {style.label}
        </span>
        <span className="post-creator">by {post.createdBy}</span>
      </div>

      <div className="post-card__actions">
        <button
          className={`toggle-btn ${showSeekers ? 'active' : ''}`}
          onClick={() => {
            logger.info('GuijikPost', '구직현황 토글', { postId: post.id, show: !showSeekers });
            setShowSeekers(v => !v);
          }}
        >
          구직현황 ({seekers.length}명)
        </button>
        <button
          className={`action-btn ${isSeeking ? 'joined' : 'guijik'}`}
          onClick={handleSeek}
          disabled={isOwner}
        >
          {isOwner ? '내 글' : isSeeking ? '취소' : '나도 구직'}
        </button>
      </div>

      {showSeekers && (
        <div className="tag-list">
          {seekers.length === 0
            ? <span className="empty-text">구직자가 없습니다</span>
            : seekers.map((s, i) => (
              <span key={i} className={`tag ${s === post.createdBy ? 'tag--owner' : ''}`}>
                {s}{s === post.createdBy ? ' 📝' : ''}
              </span>
            ))
          }
        </div>
      )}

      <button
        className={`comment-toggle ${showComments ? 'active' : ''}`}
        onClick={() => {
          logger.info('GuijikPost', '댓글 토글', { postId: post.id, show: !showComments });
          setShowComments(v => !v);
        }}
      >
        💬 댓글 {showComments ? '접기' : '보기'}
      </button>

      {showComments && (
        <CommentSection postId={post.id} nickname={nickname} />
      )}
    </div>
  );
}
