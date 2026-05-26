import React, { useState } from 'react';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase';
import { logger } from '../logger';

export default function GuinPost({ post, nickname }) {
  const [showParticipants, setShowParticipants] = useState(false);

  const participants = post.participants || [];
  const isJoined  = participants.includes(nickname);
  const isOwner   = post.createdBy === nickname;
  const isFull    = participants.length >= post.capacity;

  const fillRatio     = participants.length / post.capacity;
  const progressColor = fillRatio >= 1 ? '#f44336' : fillRatio >= 0.7 ? '#FF9800' : '#4CAF50';

  const handleJoin = async () => {
    if (isOwner) return;
    const ref = doc(db, 'posts', post.id);
    try {
      if (isJoined) {
        logger.action('GuinPost', '참가 취소', { postId: post.id, teamName: post.teamName, nickname });
        await updateDoc(ref, { participants: arrayRemove(nickname) });
        logger.api('GuinPost', '참가 취소 완료', { postId: post.id });
      } else if (!isFull) {
        logger.action('GuinPost', '참가 신청', { postId: post.id, teamName: post.teamName, nickname });
        await updateDoc(ref, { participants: arrayUnion(nickname) });
        logger.api('GuinPost', '참가 신청 완료', { postId: post.id });
      }
    } catch (err) {
      logger.error('GuinPost', '참가 처리 실패', err);
    }
  };

  return (
    <div className="post-card post-card--guin">
      <div className="post-card__top">
        <span className="badge badge--guin">구인</span>
        <span className="host-badge">👑 방장 {post.createdBy}</span>
      </div>

      <div className="info-grid">
        <div className="info-item">
          <span className="info-label">팀명</span>
          <span className="info-value">{post.teamName}</span>
        </div>
        <div className="info-item">
          <span className="info-label">시간</span>
          <span className="info-value">{post.time}</span>
        </div>
        <div className="info-item">
          <span className="info-label">장소</span>
          <span className="info-value">{post.place}</span>
        </div>
        <div className="info-item">
          <span className="info-label">참가인원</span>
          <span className="info-value">
            <span style={{ color: progressColor, fontWeight: 700 }}>{participants.length}</span>
            /{post.capacity}명
          </span>
        </div>
      </div>

      <div className="progress-bar">
        <div
          className="progress-bar__fill"
          style={{ width: `${Math.min(fillRatio * 100, 100)}%`, backgroundColor: progressColor }}
        />
      </div>

      <div className="post-card__actions">
        <button
          className={`toggle-btn ${showParticipants ? 'active' : ''}`}
          onClick={() => {
            logger.info('GuinPost', '참가현황 토글', { postId: post.id, show: !showParticipants });
            setShowParticipants(v => !v);
          }}
        >
          참가현황 ({participants.length}명)
        </button>
        {isOwner ? (
          <span className="owner-label">내 글</span>
        ) : (
          <button
            className={`action-btn ${isJoined ? 'joined' : isFull ? 'full' : 'guin'}`}
            onClick={handleJoin}
            disabled={isFull && !isJoined}
          >
            {isJoined ? '참가취소' : isFull ? '마감' : '참가하기'}
          </button>
        )}
      </div>

      {showParticipants && (
        <div className="tag-list">
          {participants.length === 0
            ? <span className="empty-text">아직 참가자가 없습니다</span>
            : participants.map((p, i) => (
              <span key={i} className="tag">{p}</span>
            ))
          }
        </div>
      )}
    </div>
  );
}
