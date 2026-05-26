import React, { useState } from 'react';

export default function NicknameModal({ onSet }) {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim().length >= 2) {
      onSet(name.trim());
    }
  };

  return (
    <>
      <div className="overlay overlay--full" />
      <div className="modal nickname-modal">
        <div className="nickname-modal__logo">🏀</div>
        <h1 className="nickname-modal__title">농구인구직</h1>
        <p className="nickname-modal__desc">농구 팀원을 구하고 팀을 찾아보세요</p>
        <form onSubmit={handleSubmit}>
          <input
            className="nickname-modal__input"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="닉네임 입력 (2자 이상)"
            maxLength={10}
            autoFocus
          />
          <button
            className="nickname-modal__btn"
            type="submit"
            disabled={name.trim().length < 2}
          >
            시작하기
          </button>
        </form>
      </div>
    </>
  );
}
