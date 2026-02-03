import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingVideo.css';

function LandingVideo() {
  const navigate = useNavigate();
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // 9초 후 페이드아웃 시작
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 9000);

    // 10초 후 홈으로 이동
    const navTimer = setTimeout(() => {
      navigate('/home');
    }, 10000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(navTimer);
    };
  }, [navigate]);

  return (
    <div className={`landing-container ${fadeOut ? 'fade-out' : ''}`}>
      <video autoPlay muted className="background-video">
        <source src="/videos/바닷가.mp4" type="video/mp4" />
      </video>
      <div className="text-overlay">
        <h1 className="welcome-text text-fade-in">
          Your golden hour starts here
        </h1>
        <p className="subtitle-text subtitle-fade-in">— with Festory.</p>
      </div>
    </div>
  );
}

export default LandingVideo;
