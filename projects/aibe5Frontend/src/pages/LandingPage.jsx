import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import beachVideo from '../assets/바닷가.mp4';

function LandingPage() {
  const navigate = useNavigate();
  const [fadeState, setFadeState] = useState('fade-in'); // fade-in, visible, fade-out
  const [pageFadeOut, setPageFadeOut] = useState(false);

  useEffect(() => {
    // 1초 후 fade-in 완료
    const fadeInTimer = setTimeout(() => {
      setFadeState('visible');
    }, 1000);

    // 3초간 보여주기
    const visibleTimer = setTimeout(() => {
      setFadeState('fade-out');
    }, 4000);

    // 텍스트 fade-out 후 페이지 전체 fade-out
    const pageFadeTimer = setTimeout(() => {
      setPageFadeOut(true);
    }, 5500);

    // 페이지 fade-out 후 home으로 이동
    const navigateTimer = setTimeout(() => {
      navigate('/home');
    }, 7500);

    return () => {
      clearTimeout(fadeInTimer);
      clearTimeout(visibleTimer);
      clearTimeout(pageFadeTimer);
      clearTimeout(navigateTimer);
    };
  }, [navigate]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#000',
        opacity: pageFadeOut ? 0 : 1,
        transition: 'opacity 2s ease-in-out',
      }}
    >
      {/* 배경 비디오 */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          minWidth: '100%',
          minHeight: '100%',
          width: 'auto',
          height: 'auto',
          transform: 'translate(-50%, -50%)',
          objectFit: 'cover',
        }}
      >
        <source src={beachVideo} type="video/mp4" />
      </video>

      {/* 어두운 오버레이 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          zIndex: 1,
        }}
      />

      {/* 텍스트 */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 2,
          textAlign: 'center',
          opacity: fadeState === 'fade-in' ? 0 : fadeState === 'visible' ? 1 : 0,
          transition: 'opacity 1.5s ease-in-out',
        }}
      >
        <h1
          style={{
            fontSize: '56px',
            fontWeight: '400',
            fontStyle: 'italic',
            color: '#FFD700',
            textShadow: '2px 2px 8px rgba(0, 0, 0, 0.6), 0 0 20px rgba(255, 215, 0, 0.3)',
            fontFamily: "'Georgia', 'Times New Roman', serif",
            letterSpacing: '2px',
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          Your golden hour starts here
          <br />
          <span
            style={{
              fontSize: '48px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              marginTop: '10px',
            }}
          >
            <span style={{ fontSize: '40px', fontWeight: '300' }}>—</span> with Festory.
          </span>
        </h1>
      </div>

      {/* CSS 애니메이션 */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;700;900&display=swap');
        `}
      </style>
    </div>
  );
}

export default LandingPage;
