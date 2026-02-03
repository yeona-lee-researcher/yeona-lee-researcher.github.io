import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import useStore from "../store/useStore";
import Loading from "./Loading";

function TasteTest() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState([]); // 다중 선택을 위한 상태
  const { addTasteTestAnswer, clearTasteTestAnswers } = useStore();
  const [isLoading, setIsLoading] = useState(() => {
    // 1/3 확률로 로딩 화면 표시 결정 (초기값으로만 계산)
    return Math.random() < 1/5;
  });

  // 1/3 확률로 로딩 화면 표시
  useEffect(() => {
    if (isLoading) {
      // 2~4초 랜덤 대기
      const randomDelay = 2000 + Math.random() * 2000;
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, randomDelay);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // 테스트 시작 시 기존 답변 초기화
  useEffect(() => {
    clearTasteTestAnswers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  // 7개의 질문 정의
  const questions = [
    {
      question: "누구와 함께 가는 여행이 가장 많나요?",
      subtitle: "함께하는 동행에 따라 맞춤 축제를 찾아드릴게요.",
      options: [
        {
          id: 1,
          icon: "person",
          title: "혼자",
          description: "나만의 속도로 자유롭게 즐기는 여행",
          tags: ["#혼행"],
        },
        {
          id: 2,
          icon: "favorite",
          title: "연인",
          description: "둘만의 로맨틱한 시간을 보내는 여행",
          tags: ["#커플"],
        },
        {
          id: 3,
          icon: "group",
          title: "친구",
          description: "친구들과 함께 추억을 만드는 즐거운 여행",
          tags: ["#친구"],
        },
        {
          id: 4,
          icon: "family_restroom",
          title: "가족 (아이 포함)",
          description: "온 가족이 함께 즐기는 따뜻한 여행",
          tags: ["#가족"],
        },
        {
          id: 5,
          icon: "pets",
          title: "반려동물과 함께",
          description: "사랑하는 반려동물과 함께하는 특별한 여행",
          tags: ["#반려동물"],
        },
      ]
    },
    {
      question: "축제 분위기는 어떤 쪽이 더 좋나요?",
      subtitle: "당신이 선호하는 에너지를 알려주세요.",
      options: [
        {
          id: 1,
          icon: "celebration",
          title: "북적북적, 신나는 게 좋아요",
          description: "열정과 에너지가 넘치는 활기찬 분위기",
          tags: ["#활기찬"],
        },
        {
          id: 2,
          icon: "spa",
          title: "조용하고 여유로운 게 좋아요",
          description: "차분하고 평화로운 힐링 분위기",
          tags: ["#조용한", "#힐링"],
        },
        {
          id: 3,
          icon: "tune",
          title: "상황에 따라 상관없어요",
          description: "어떤 분위기든 다 즐길 수 있어요",
          tags: [],
        },
      ]
    },
    {
      question: "축제에서 가장 중요한 요소는 무엇인가요?",
      subtitle: "최대 2개까지 선택해주세요.",
      multiple: true,
      maxSelections: 2,
      options: [
        {
          id: 1,
          icon: "restaurant_menu",
          title: "맛있는 음식",
          description: "다양하고 특별한 먹거리를 즐기고 싶어요",
          tags: ["#미식"],
        },
        {
          id: 2,
          icon: "music_note",
          title: "공연·음악",
          description: "라이브 공연과 음악을 감상하고 싶어요",
          tags: ["#음악"],
        },
        {
          id: 3,
          icon: "temple_buddhist",
          title: "전통·문화",
          description: "우리의 전통과 문화를 체험하고 싶어요",
          tags: ["#전통"],
        },
        {
          id: 4,
          icon: "touch_app",
          title: "직접 해보는 체험",
          description: "손으로 직접 만들고 체험하고 싶어요",
          tags: ["#체험"],
        },
        {
          id: 5,
          icon: "forest",
          title: "자연 풍경",
          description: "아름다운 자연을 감상하고 싶어요",
          tags: ["#자연"],
        },
        {
          id: 6,
          icon: "photo_camera",
          title: "사진 찍기 좋은 장소",
          description: "인생샷을 남길 수 있는 포토존이 있으면 좋겠어요",
          tags: ["#사진", "#인생샷"],
        },
      ]
    },
    {
      question: "여행 예산에 가장 가까운 편은?",
      subtitle: "예산에 맞는 축제를 추천해드릴게요.",
      options: [
        {
          id: 1,
          icon: "savings",
          title: "무료·저렴하면 좋아요",
          description: "부담 없이 즐길 수 있는 가성비 좋은 축제",
          tags: ["#무료", "#가성비"],
        },
        {
          id: 2,
          icon: "account_balance_wallet",
          title: "적당하면 괜찮아요",
          description: "합리적인 가격의 축제면 충분해요",
          tags: [],
        },
        {
          id: 3,
          icon: "diamond",
          title: "비용은 크게 상관없어요",
          description: "가격보다 경험이 더 중요해요",
          tags: [],
        },
      ]
    },
    {
      question: "선호하는 시간대는?",
      subtitle: "시간대에 따라 축제의 매력이 달라져요.",
      options: [
        {
          id: 1,
          icon: "wb_sunny",
          title: "낮에 즐기는 축제",
          description: "따스한 햇살 아래 활동적으로 즐기는 축제",
          tags: ["#주간"],
        },
        {
          id: 2,
          icon: "nightlight",
          title: "밤이 더 매력적인 축제",
          description: "조명과 야경이 아름다운 밤 축제",
          tags: ["#야간"],
        },
        {
          id: 3,
          icon: "all_inclusive",
          title: "상관없어요",
          description: "언제든 즐길 수 있어요",
          tags: [],
        },
      ]
    },
    {
      question: "여행 스타일에 가장 가까운 것은?",
      subtitle: "당신의 여행 스타일을 알려주세요.",
      options: [
        {
          id: 1,
          icon: "self_improvement",
          title: "쉬엄쉬엄 힐링 위주",
          description: "여유롭게 쉬면서 재충전하는 여행",
          tags: ["#힐링"],
        },
        {
          id: 2,
          icon: "directions_run",
          title: "볼거리·체험 빡빡하게",
          description: "최대한 많이 보고 경험하는 알찬 여행",
          tags: ["#축제감성", "#활기찬"],
        },
        {
          id: 3,
          icon: "photo_camera",
          title: "사진·기록 남기기 중요",
          description: "추억을 사진과 영상으로 남기는 여행",
          tags: ["#사진"],
        },
        {
          id: 4,
          icon: "explore",
          title: "일정은 유연하게",
          description: "그때그때 기분에 따라 자유롭게",
          tags: ["#혼행"],
        },
      ]
    },
    {
      question: "사람이 많은 축제에 대한 생각은?",
      subtitle: "혼잡도에 대한 선호를 알려주세요.",
      options: [
        {
          id: 1,
          icon: "groups",
          title: "인기 많아도 괜찮아요",
          description: "사람이 많아도 열기가 느껴지는 축제가 좋아요",
          tags: ["#혼잡허용"],
        },
        {
          id: 2,
          icon: "nature_people",
          title: "너무 붐비는 건 싫어요",
          description: "여유롭게 즐길 수 있는 한적한 축제가 좋아요",
          tags: ["#한적"],
        },
      ]
    },
  ];

  const handleOptionClick = (optionId) => {
    const currentQ = questions[currentQuestion];
    
    // 다중 선택 질문인 경우
    if (currentQ.multiple) {
      if (selectedOptions.includes(optionId)) {
        // 이미 선택된 옵션이면 제거
        setSelectedOptions(selectedOptions.filter(id => id !== optionId));
      } else {
        // 최대 선택 개수 체크
        if (selectedOptions.length < (currentQ.maxSelections || 2)) {
          setSelectedOptions([...selectedOptions, optionId]);
        }
      }
    } else {
      // 단일 선택 질문인 경우 바로 저장하고 다음 질문으로
      const answer = {
        questionIndex: currentQuestion,
        answerId: optionId,
        question: currentQ.question,
        tags: currentQ.options.find(opt => opt.id === optionId)?.tags || [],
      };
      
      addTasteTestAnswer(answer);
      console.log('답변 저장됨:', answer);

      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedOptions([]); // 선택 초기화
      } else {
        navigate("/testresult");
      }
    }
  };

  const handleNext = () => {
    const currentQ = questions[currentQuestion];
    
    if (currentQ.multiple && selectedOptions.length > 0) {
      // 다중 선택 답변 저장
      const answer = {
        questionIndex: currentQuestion,
        answerId: selectedOptions,
        question: currentQ.question,
        tags: selectedOptions.flatMap(id => 
          currentQ.options.find(opt => opt.id === id)?.tags || []
        ),
      };
      
      addTasteTestAnswer(answer);
      console.log('다중 선택 답변 저장됨:', answer);

      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedOptions([]); // 선택 초기화
      } else {
        navigate("/testresult");
      }
    }
  };

  const globalStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,700;1,700&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');
    
    :root {
      --bright-gradient: linear-gradient(180deg, #FFFFFF 0%, #FFF9F5 100%);
    }
    
    .tastetest-body {
      background: var(--bright-gradient);
      background-attachment: fixed;
      min-height: 100vh;
      font-family: 'Plus Jakarta Sans', 'Segoe UI', sans-serif;
      color: #2D1B14;
      -webkit-font-smoothing: antialiased;
    }
    
    .survey-card {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem;
      border-radius: 2.5rem;
      background: white;
      border: 1px solid #FFE0B2;
      transition: all 0.3s ease;
      cursor: pointer;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      height: 100%;
    }
    
    .survey-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 25px -5px rgba(255, 153, 102, 0.1), 0 10px 10px -5px rgba(255, 153, 102, 0.04);
      border-color: #FFCC80;
    }
    
    .survey-card.active {
      border-color: #D4AF37;
      box-shadow: 0 0 0 4px rgba(212, 175, 55, 0.1);
      background: white;
    }
    
    .survey-card.active .icon-box {
      background: #E67E22 !important;
      color: white !important;
    }
    
    .icon-box {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 2rem;
      transition: all 0.3s ease;
      background: #FFF3E0;
      color: #E67E22;
    }
    
    .survey-card:hover .icon-box {
      background: #E67E22;
      color: white;
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-8px); }
    }
    
    @keyframes pulse-soft {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    
    @keyframes spin-slow {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    .animate-float {
      animation: float 3s ease-in-out infinite;
    }
    
    .animate-pulse-soft {
      animation: pulse-soft 2s ease-in-out infinite;
    }
    
    .animate-spin-slow {
      animation: spin-slow 10s linear infinite;
    }
    
    .material-symbols-outlined {
      font-family: 'Material Symbols Outlined';
      font-weight: normal;
      font-style: normal;
      font-size: 24px;
      line-height: 1;
      letter-spacing: normal;
      text-transform: none;
      display: inline-block;
      white-space: nowrap;
      word-wrap: normal;
      direction: ltr;
      -webkit-font-feature-settings: 'liga';
      font-feature-settings: 'liga';
      -webkit-font-smoothing: antialiased;
    }
  `;

  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh",
    },
    main: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "48px 24px",
      position: "relative",
      overflow: "hidden",
    },
    blob1: {
      position: "absolute",
      top: "10%",
      right: "-5%",
      width: "800px",
      height: "800px",
      background: "rgba(255, 152, 0, 0.1)",
      filter: "blur(120px)",
      borderRadius: "50%",
      zIndex: -1,
      animation: "pulse-soft 4s ease-in-out infinite",
    },
    blob2: {
      position: "absolute",
      bottom: "5%",
      left: "-5%",
      width: "600px",
      height: "600px",
      background: "rgba(255, 243, 224, 0.5)",
      filter: "blur(100px)",
      borderRadius: "50%",
      zIndex: -1,
    },
    badgeContainer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      marginBottom: "24px",
    },
    badge: {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      padding: "8px 16px",
      borderRadius: "24px",
      background: "#FFF3E0",
      border: "1px solid #FFE0B2",
      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
    },
    badgeDot: {
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      background: "#E67E22",
    },
    badgeText: {
      color: "#E67E22",
      fontWeight: 700,
      fontSize: "10px",
      letterSpacing: "0.2em",
      textTransform: "uppercase",
    },
    progressBar: {
      width: "96px",
      height: "6px",
      background: "#F5F5F5",
      borderRadius: "12px",
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      width: "33%",
      background: "#E67E22",
      borderRadius: "12px",
    },
    title: {
      fontSize: "clamp(36px, 6vw, 64px)",
      fontWeight: 900,
      marginBottom: "24px",
      textAlign: "center",
      lineHeight: 1.2,
      color: "#2D1B14",
      letterSpacing: "-0.02em",
    },
    titleGolden: {
      fontStyle: "italic",
      fontFamily: "'Playfair Display', serif",
      color: "#E67E22",
      position: "relative",
      display: "inline-block",
    },
    subtitle: {
      fontSize: "clamp(16px, 2vw, 20px)",
      color: "rgba(45, 27, 20, 0.6)",
      textAlign: "center",
      maxWidth: "700px",
      margin: "0 auto 64px",
      lineHeight: 1.6,
      fontWeight: 500,
    },
    cardsContainer: {
      display: currentQuestion === 0 ? "flex" : "grid",
      flexWrap: currentQuestion === 0 ? "wrap" : undefined,
      justifyContent: currentQuestion === 0 ? "center" : undefined,
      gridTemplateColumns: (currentQuestion === 5 || currentQuestion === 6) ? "repeat(2, 1fr)" : currentQuestion === 0 ? undefined : "repeat(3, 1fr)",
      gap: "24px",
      width: "100%",
      maxWidth: (currentQuestion === 5 || currentQuestion === 6) ? "900px" : "1400px",
      marginBottom: "120px",
      padding: "0 16px",
      margin: "0 auto",
    },
    firstPageCard: {
      flex: "0 0 calc(33.333% - 16px)",
      minWidth: "300px",
      maxWidth: "400px",
    },
    cardTitle: {
      fontSize: "24px",
      fontWeight: 700,
      marginBottom: "12px",
      color: "#2D1B14",
      letterSpacing: "-0.01em",
    },
    cardDescription: {
      fontSize: "14px",
      color: "rgba(45, 27, 20, 0.5)",
      textAlign: "center",
      lineHeight: 1.6,
    },
    starIcon: {
      position: "absolute",
      top: "24px",
      right: "24px",
      color: "#D4AF37",
    },
    buttonsContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "16px",
      width: "100%",
      maxWidth: "800px",
      margin: "0 auto",
    },
    backButton: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "16px 32px",
      borderRadius: "16px",
      background: "white",
      border: "1px solid #FFE0B2",
      color: "rgba(45, 27, 20, 0.6)",
      fontWeight: 700,
      cursor: "pointer",
      transition: "all 0.2s ease",
      width: "100%",
      justifyContent: "center",
      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
    },
    nextButton: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "16px 40px",
      borderRadius: "16px",
      background: "#E67E22",
      border: "none",
      color: "white",
      fontWeight: 900,
      cursor: "pointer",
      transition: "all 0.2s ease",
      width: "100%",
      justifyContent: "center",
      boxShadow: "0 8px 24px rgba(230, 126, 34, 0.3)",
    },
    helpBubble: {
      position: "fixed",
      bottom: "40px",
      right: "40px",
      background: "white",
      padding: "12px 20px",
      borderRadius: "16px",
      borderBottomRightRadius: "4px",
      boxShadow: "0 4px 20px rgba(230, 126, 34, 0.2)",
      border: "1px solid #FFE0B2",
      fontSize: "14px",
      fontWeight: 700,
      color: "#2D1B14",
      zIndex: 50,
      marginBottom: "80px",
      pointerEvents: "auto",
    },
    helpButton: {
      position: "fixed",
      bottom: "40px",
      right: "40px",
      width: "64px",
      height: "64px",
      borderRadius: "50%",
      background: "white",
      boxShadow: "0 8px 24px rgba(255, 152, 0, 0.2)",
      border: "2px solid #FFE0B2",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      transition: "transform 0.3s ease",
      zIndex: 50,
      padding: "8px",
      pointerEvents: "auto",
    },
    footer: {
      width: "100%",
      padding: "32px 64px",
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderTop: "1px solid rgba(255, 224, 178, 0.5)",
      background: "rgba(255, 255, 255, 0.5)",
      backdropFilter: "blur(8px)",
      marginTop: "auto",
    },
  };

  const currentQ = questions[currentQuestion];

  return (
    <>
      <style>{globalStyles}</style>
      <Header />
      <div className="tastetest-body" style={styles.container}>
        <main style={styles.main}>
          <div style={styles.blob1}></div>
          <div style={styles.blob2}></div>

          <div style={{ maxWidth: "1400px", width: "100%" }}>
            {/* Badge and Progress */}
            <div style={styles.badgeContainer}>
              <div style={styles.badge}>
                <div className="animate-pulse-soft" style={styles.badgeDot}></div>
                <span style={styles.badgeText}>Question {currentQuestion + 1} of {questions.length}</span>
              </div>
              <div style={styles.progressBar}>
                <div style={{ ...styles.progressFill, width: `${((currentQuestion + 1) / questions.length) * 100}%` }}></div>
              </div>
            </div>

            {/* Title */}
            <h1 style={styles.title}>
              {currentQ.question}
            </h1>

            {/* Subtitle */}
            <p style={styles.subtitle}>
              {currentQ.subtitle}
            </p>

            {/* Cards */}
            <div style={styles.cardsContainer}>
              {currentQ.options.map((option, index) => {
                const isSelected = selectedOptions.includes(option.id);
                const isFirstPage = currentQuestion === 0;
                return (
                  <div
                    key={option.id}
                    className={`survey-card ${isSelected ? 'active' : ''}`}
                    onClick={() => handleOptionClick(option.id)}
                    style={isFirstPage ? styles.firstPageCard : {}}
                  >
                    <div className="icon-box">
                      <span className="material-symbols-outlined" style={{ fontSize: "40px" }}>
                        {option.icon}
                      </span>
                    </div>
                    <h3 style={styles.cardTitle}>{option.title}</h3>
                    <p style={styles.cardDescription}>{option.description}</p>
                    {isSelected && (
                      <div style={styles.starIcon}>
                        <span className="material-symbols-outlined" style={{ color: "#E67E22" }}>
                          check_circle
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", width: "100%", marginTop: "40px" }}>
              <div style={{ display: "flex", gap: "16px", width: "100%", maxWidth: "600px", justifyContent: "center" }}>
                <button
                  style={styles.backButton}
                  onClick={() => {
                    if (currentQuestion > 0) {
                      setCurrentQuestion(currentQuestion - 1);
                      setSelectedOptions([]); // 선택 초기화
                    } else {
                      navigate("/after_home");
                    }
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255, 243, 224, 0.5)";
                    e.currentTarget.style.borderColor = "#FFCC80";
                    e.currentTarget.style.color = "#2D1B14";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "white";
                    e.currentTarget.style.borderColor = "#FFE0B2";
                    e.currentTarget.style.color = "rgba(45, 27, 20, 0.6)";
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                    west
                  </span>
                  {currentQuestion > 0 ? "Previous" : "Back"}
                </button>
                
                {/* 다중 선택 질문인 경우에만 Next 버튼 표시 */}
                {currentQ.multiple && (
                  <button
                    style={{
                      ...styles.nextButton,
                      opacity: selectedOptions.length === 0 ? 0.5 : 1,
                      cursor: selectedOptions.length === 0 ? "not-allowed" : "pointer",
                    }}
                    onClick={handleNext}
                    disabled={selectedOptions.length === 0}
                    onMouseEnter={(e) => {
                      if (selectedOptions.length > 0) {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 12px 32px rgba(230, 126, 34, 0.4)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 8px 24px rgba(230, 126, 34, 0.3)";
                    }}
                  >
                    Next
                    <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                      east
                    </span>
                  </button>
                )}
              </div>
              
              {/* 다중 선택 안내 메시지 */}
              {currentQ.multiple && (
                <p style={{ 
                  fontSize: "14px", 
                  color: "rgba(45, 27, 20, 0.5)",
                  textAlign: "center",
                  marginTop: "8px"
                }}>
                  {selectedOptions.length} / {currentQ.maxSelections || 2} 선택됨
                </p>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default TasteTest;
