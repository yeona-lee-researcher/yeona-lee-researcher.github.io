import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import festivals from "../data/festivals.json";

import Header_home from "../components/Header_home";
import { TownCard } from "../components/TownCard";
import { TownDetailModal } from "../components/TownDetailModal";
import WeatherWidget from "../components/WeatherWidget";
import bannerVideo from "../assets/풍랑30.mp4";

function Home() {
  const navigate = useNavigate();
  const [selectedFestival, setSelectedFestival] = useState(null);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      <Header_home />
      <main style={{ maxWidth: "1600px", margin: "0 auto", padding: "24px 20px" }}>
        {/* HERO 배너 */}
        <section
          style={{
            marginBottom: 40,
            borderRadius: 32,
            overflow: "hidden",
            aspectRatio: "16 / 6",
            position: "relative",
            display: "flex",
            alignItems: "center",
            padding: 60,
          }}
        >
          {/* 배경 비디오 */}
          <video
            autoPlay
            loop
            muted
            playsInline
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              zIndex: 0,
            }}
          >
            <source src={bannerVideo} type="video/mp4" />
          </video>
          
          {/* 오버레이 */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "linear-gradient(to right, rgba(255,255,255,.95), rgba(255,255,255,.4), rgba(255,255,255,.9))",
              zIndex: 1,
            }}
          />

          <div style={{ maxWidth: 600, position: "relative", zIndex: 2 }}>
            <span
              style={{
                display: "inline-block",
                padding: "8px 16px",
                borderRadius: 999,
                backgroundColor: "rgba(255,95,51,.1)",
                color: "#FF5F33",
                fontWeight: 700,
                marginBottom: 24,
              }}
            >
              3분이면 오늘의 축제 여행 코스가 뚝딱✨
            </span>
            <h1 style={{ fontSize: 48, fontWeight: 900, lineHeight: 1.1 }}>
              Find your <br />
              <span
                style={{
                  background: "linear-gradient(90deg,#FF5F33,#EAB308)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Golden Harmony
              </span>
            </h1>
            <p style={{ color: "#4b5563", margin: "24px 0" }}>
              축제와 사진의 황금시간을 찾아보세요.<br />
              AI가 추천하는 맞춤형 축제와 촬영 명소!
            </p>
            <button
              onClick={() => navigate("/login")}
              style={{
                padding: "16px 32px",
                borderRadius: 12,
                border: "none",
                background: "linear-gradient(90deg,#FF5F33,#EAB308)",
                color: "white",
                fontWeight: 800,
                cursor: "pointer",
                fontSize: 18,
              }}
            >
              Start Recommendation with AI
            </button>
          </div>
        </section>
        {/* GRID */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 15 }}>
          {/* LEFT - 추천 섹션 */}
          <section>
            <h2 style={{ fontSize: 28, fontWeight: 900 }}>
               <span style={{ color: "#FF5F33" }}>요즘 난리 난</span> 축제들, 놓치면 아쉬워요 😎
            </h2>
            <p style={{ color: "#6b7280", marginBottom: 24 }}>
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              {festivals.filter(f => [201, 750, 272].includes(f.pSeq)).map((f) => (
                <TownCard
                  key={f.pSeq}
                  town={{
                    name: f.fstvlNm,
                    description: f.ministry_description,
                    image: f.ministry_image_url || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f",
                    id: f.pSeq,
                  }}
                  festivl={f}
                  onClick={() => setSelectedFestival(f)}
                />
              ))}
            </div>
            {/* 요즘 핫한 축제 포토카드 5개 */}
            <div style={{ marginTop: 40 }}>
              <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>
                지역별 추천 축제
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
                {festivals.slice(67, 72).map((f) => (
                  <div style={{ minWidth: 0, height: 340, display: "flex" }} key={f.pSeq}>
                    <TownCard
                      town={{
                        name: f.fstvlNm,
                        description: f.ministry_description,
                        image: f.ministry_image_url || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f",
                        id: f.pSeq,
                      }}
                      festival={f}
                      onClick={() => setSelectedFestival(f)}
                      style={{ flex: 1, height: "100%" }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
          {/* RIGHT - 캘린더 & 날씨 */}
          <aside
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              height: "fit-content",
              position: "sticky",
              top: 140,
            }}
          >
            {/* 캘린더 섹션 */}
            <div
              style={{
                backgroundColor: "white",
                borderRadius: 24,
                padding: 24,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              <h3 style={{ fontWeight: 800 }}>My Festival Calendar</h3>
              
              {/* 미니 캘린더 */}
              <div style={{
                backgroundColor: "#f9fafb",
                borderRadius: 16,
                padding: 16,
                marginBottom: 16,
              }}>
                {(() => {
                  const today = new Date();
                  const year = today.getFullYear();
                  const month = today.getMonth();
                  const firstDay = new Date(year, month, 1).getDay();
                  const daysInMonth = new Date(year, month + 1, 0).getDate();
                  const monthNames = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];
                  
                  return (
                    <>
                      <div style={{ 
                        textAlign: "center", 
                        fontWeight: 700, 
                        marginBottom: 12,
                        color: "#1f2937",
                        fontSize: 14,
                      }}>
                        {year}년 {monthNames[month]}
                      </div>
                      
                      {/* 요일 */}
                      <div style={{ 
                        display: "grid", 
                        gridTemplateColumns: "repeat(7, 1fr)", 
                        gap: 4,
                        marginBottom: 8,
                      }}>
                        {["일", "월", "화", "수", "목", "금", "토"].map((day, i) => (
                          <div key={day} style={{
                            textAlign: "center",
                            fontSize: 11,
                            fontWeight: 600,
                            color: i === 0 ? "#ef4444" : i === 6 ? "#3b82f6" : "#6b7280",
                            padding: "4px 0",
                          }}>
                            {day}
                          </div>
                        ))}
                      </div>
                      
                      {/* 날짜 */}
                      <div style={{ 
                        display: "grid", 
                        gridTemplateColumns: "repeat(7, 1fr)", 
                        gap: 4,
                      }}>
                        {Array.from({ length: firstDay }).map((_, i) => (
                          <div key={`empty-${i}`} style={{ height: 32 }} />
                        ))}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                          const day = i + 1;
                          const isToday = day === today.getDate();
                          const dayOfWeek = (firstDay + i) % 7;
                          
                          return (
                            <div key={day} style={{
                              textAlign: "center",
                              padding: 6,
                              borderRadius: 8,
                              fontSize: 12,
                              fontWeight: isToday ? 700 : 500,
                              backgroundColor: isToday ? "#FF5F33" : "transparent",
                              color: isToday ? "white" : dayOfWeek === 0 ? "#ef4444" : dayOfWeek === 6 ? "#3b82f6" : "#374151",
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                              if (!isToday) {
                                e.currentTarget.style.backgroundColor = "#f3f4f6";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isToday) {
                                e.currentTarget.style.backgroundColor = "transparent";
                              }
                            }}>
                              {day}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  );
                })()}
              </div>
              
              <button
                onClick={() => navigate("/calendar")}
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 16,
                  border: "1px solid #FF5F33",
                  background: "transparent",
                  color: "#FF5F33",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#FF5F33";
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#FF5F33";
                }}
              >
                전체 캘린더 보기
              </button>
            </div>
            
            {/* 날씨 위젯 */}
            <WeatherWidget />
          </aside>
        </div>
      </main>
      {/* FOOTER */}
      <footer
        style={{
          marginTop: 80,
          padding: "40px 20px",
          borderTop: "1px solid #e5e7eb",
          backgroundColor: "white",
        }}
      >
        <div
          style={{
            maxWidth: "1600px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h4 style={{ fontWeight: 800 }}>Festory</h4>
            <p style={{ color: "#6b7280", fontSize: 14 }}>
              Elevating cultural tourism through the lens of aesthetic timing and premium curation. Discover Korea's hidden gems.
            </p>
          </div>
          <div>
            <p>Explore</p>
            <p>Tradition</p>
            <p>Modern</p>
            <p>Photography</p>
          </div>
          <div>
            <p>Support</p>
            <p>About Us</p>
            <p>FAQ</p>
            <p>Contact</p>
          </div>
        </div>
      </footer>
      {/* 상세 모달 */}
      {selectedFestival && (
        <TownDetailModal
          festival={selectedFestival}
          onClose={() => setSelectedFestival(null)}
        />
      )}
    </div>
  );
}

export default Home;
