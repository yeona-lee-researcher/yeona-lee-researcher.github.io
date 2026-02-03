import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import chatBotImage from '../assets/chatBot.png';

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // 챗봇을 숨길 페이지 목록
  const hiddenPages = ['/loading', '/login', '/signup'];
  
  // 현재 페이지가 숨김 목록에 있으면 렌더링하지 않음
  if (hiddenPages.includes(location.pathname)) {
    return null;
  }

  const handleChatBotClick = () => {
    // 챗봇 연결 로직 (나중에 실제 챗봇 URL로 변경 가능)
    setIsOpen(!isOpen);
    // 예시: window.open('챗봇URL', '_blank');
    alert('챗봇 서비스에 연결됩니다!');
  };

  return (
    <>
      {/* 챗봇 버튼 */}
      <div
        onClick={handleChatBotClick}
        style={{
          position: 'fixed',
          bottom: 30,
          right: 30,
          width: 70,
          height: 70,
          cursor: 'pointer',
          zIndex: 9999,
          animation: 'float 3s ease-in-out infinite',
          transition: 'transform 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.querySelector('.tooltip').style.opacity = '1';
          e.currentTarget.querySelector('.tooltip').style.visibility = 'visible';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.querySelector('.tooltip').style.opacity = '0';
          e.currentTarget.querySelector('.tooltip').style.visibility = 'hidden';
        }}
      >
        <img
          src={chatBotImage}
          alt="챗봇"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            filter: 'drop-shadow(0 4px 12px rgba(255, 95, 51, 0.3))',
          }}
        />
        {/* 툴팁 */}
        <div
          className="tooltip"
          style={{
            position: 'absolute',
            bottom: '100%',
            right: 0,
            marginBottom: 10,
            backgroundColor: '#FF5F33',
            color: 'white',
            padding: '10px 16px',
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 700,
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(255, 95, 51, 0.4)',
            opacity: 0,
            visibility: 'hidden',
            transition: 'all 0.3s ease',
          }}
        >
          나에게 맞는 축제를 알아보아요!! 🎉
          {/* 말풍선 꼬리 */}
          <div
            style={{
              position: 'absolute',
              bottom: -6,
              right: 20,
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '8px solid #FF5F33',
            }}
          />
        </div>
      </div>

      <style>
        {`
          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-15px);
            }
          }
        `}
      </style>
    </>
  );
}
