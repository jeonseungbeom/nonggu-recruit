import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { logger } from '../logger';

const URL_REGEX = /(https?:\/\/[^\s]+)/g;

function renderWithLinks(text) {
  return text.split(URL_REGEX).map((part, i) =>
    /^https?:\/\//.test(part)
      ? <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="comment-link"
           onClick={e => e.stopPropagation()}>{part}</a>
      : part
  );
}

function formatTime(ts) {
  if (!ts) return '';
  const d = ts.toDate();
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

export default function CommentSection({ postId, nickname }) {
  const [comments, setComments] = useState([]);
  const [text,     setText]     = useState('');
  const [sending,  setSending]  = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    logger.api('CommentSection', `댓글 구독 시작`, { postId });

    const q = query(
      collection(db, 'comments'),
      where('postId', '==', postId)
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (a.createdAt?.seconds ?? 0) - (b.createdAt?.seconds ?? 0));
      logger.api('CommentSection', '댓글 수신', { postId, count: data.length });
      setComments(data);
    }, (err) => {
      logger.error('CommentSection', '댓글 구독 실패', err);
    });

    return () => {
      logger.api('CommentSection', '댓글 구독 종료', { postId });
      unsub();
    };
  }, [postId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;

    const hasLink = URL_REGEX.test(text);
    logger.action('CommentSection', '댓글 작성', { postId, nickname, hasLink, length: text.trim().length });
    URL_REGEX.lastIndex = 0;

    setSending(true);
    try {
      await addDoc(collection(db, 'comments'), {
        postId,
        content:   text.trim(),
        createdBy: nickname,
        createdAt: serverTimestamp(),
      });
      logger.api('CommentSection', '댓글 등록 완료', { postId });
      setText('');
    } catch (err) {
      logger.error('CommentSection', '댓글 등록 실패', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="comment-section">
      <div className="comment-list">
        {comments.length === 0
          ? <p className="empty-text">첫 댓글을 남겨보세요!</p>
          : comments.map(c => (
            <div key={c.id} className={`comment ${c.createdBy === nickname ? 'mine' : ''}`}>
              <div className="comment__meta">
                <span className="comment__author">{c.createdBy}</span>
                <span className="comment__time">{formatTime(c.createdAt)}</span>
              </div>
              <p className="comment__text">{renderWithLinks(c.content)}</p>
            </div>
          ))
        }
        <div ref={bottomRef} />
      </div>
      <form className="comment-form" onSubmit={handleSend}>
        <input
          className="comment-input"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="댓글 입력... (링크 포함 가능)"
          maxLength={300}
        />
        <button className="comment-send" type="submit" disabled={!text.trim() || sending}>
          전송
        </button>
      </form>
    </div>
  );
}
