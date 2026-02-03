import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import useStore from "../store/useStore";
import { TownCard } from "../components/TownCard";

function Mypage() {  const navigate = useNavigate();  const [activeTab, setActiveTab] = useState("myinfo");
  const [isEditing, setIsEditing] = useState(false);
  
  const { user, loginUser, setUser, likedFestivals, tasteType, clearTasteTestAnswers, clearTasteType } = useStore();
  
  // 수정 가능한 필드를 위한 state
  const [editedInfo, setEditedInfo] = useState({
    id: user?.id || loginUser?.id || "",
    name: user?.name || loginUser?.name || "",
    nickname: user?.nickname || loginUser?.nickname || "",
    email: user?.email || loginUser?.email || "",
    phone: user?.phone || loginUser?.phone || "",
    gender: user?.gender || loginUser?.gender || "",
  });

  const userInfo = {
    id: user?.id || loginUser?.id || "festory_lover",
    email: user?.email || loginUser?.email || "festory_lover@goldenhour.com",
    name: user?.name || loginUser?.name || "김페스",
    nickname: user?.nickname || loginUser?.nickname || "선셋다이어리",
    phone: user?.phone || loginUser?.phone || "010-1234-5678",
    gender: user?.gender || loginUser?.gender || "여성",
    memberType: "PRO MEMBER",
    joinDate: user?.joinDate || loginUser?.joinDate || "2024. 05. 14"
  };

  // 취향 유형 정보 가져오기
  const getTasteTypeInfo = () => {
    if (!tasteType) {
      return {
        hashtag: "#Experience_Explorer",
        title: "경험 중심의 탐험가",
        titleHighlight: "탐험가",
        tags: ["#Experience_Explorer", "#신체활동", "#전통감성"],
        description1: "새로운 경험과 감각적 풍요로움을 추구하는 당신, 단순한 관람보다는 직접 참여하고 몸으로 느끼는 역동적인 축제를 선호하시네요!",
        description2: "전통적인 가치를 소중히 여기면서도, 새로운 체험을 통해 성취감을 얻는 과정에서 가장 큰 행복을 느끼는 타입입니다. 다가오는 가을, 지역색이 짙은 체험형 전통 축제에 방문해보는 것은 어떨까요?",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop"
      };
    }

    switch(tasteType) {
      case 1:
        return {
          hashtag: "#Experience_Explorer",
          title: "경험 중심의 탐험가",
          titleHighlight: "탐험가",
          tags: ["#Experience_Explorer", "#신체활동", "#전통감성"],
          description1: `${userInfo.name}님은 단순한 관람보다는 직접 참여하고 몸으로 느끼는 역동적인 축제를 선호하시네요!`,
          description2: "전통적인 가치를 소중히 여기면서도, 새로운 체험을 통해 성취감을 얻는 과정에서 가장 큰 행복을 느끼는 타입입니다. 다가오는 가을, 지역색이 짙은 체험형 전통 축제에 방문해보는 것은 어떨까요?",
          image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop"
        };
      case 2:
        return {
          hashtag: "#Party_Lover",
          title: "열정 넘치는 파티러버",
          titleHighlight: "파티러버",
          tags: ["#Party_Lover", "#신나는음악", "#활기찬분위기"],
          description1: `${userInfo.name}님은 활기차고 에너지 넘치는 축제를 사랑하네요!`,
          description2: "신나는 음악과 불꽃쇼가 가득한 페스티벌에서 진정한 즐거움을 찾습니다. 밤늦도록 춤추고 노래하며, 함께하는 모든 순간이 특별한 추억이 되는 당신에게 어울리는 축제를 찾아보세요!",
          image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop"
        };
      case 3:
        return {
          hashtag: "#감성_아티스트",
          title: "감성적인 아티스트",
          titleHighlight: "아티스트",
          tags: ["#감성_아티스트", "#도시감성", "#예술적영감"],
          description1: `${userInfo.name}님은 현대적이고 세련된 분위기를 즐기는 감성적인 타입이시네요!`,
          description2: "도시적 감성과 예술이 어우러진 페스티벌에서 영감을 받습니다. 아름다운 비주얼과 독특한 콘셉트가 있는 축제에서 당신만의 특별한 순간을 만들어보세요!",
          image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop"
        };
      default:
        return {
          hashtag: "#Experience_Explorer",
          title: "경험 중심의 탐험가",
          titleHighlight: "탐험가",
          tags: ["#Experience_Explorer", "#신체활동", "#전통감성"],
          description1: `${userInfo.name}님은 단순한 관람보다는 직접 참여하고 몸으로 느끼는 역동적인 축제를 선호하시네요!`,
          description2: "전통적인 가치를 소중히 여기면서도, 새로운 체험을 통해 성취감을 얻는 과정에서 가장 큰 행복을 느끼는 타입입니다. 다가오는 가을, 지역색이 짙은 체험형 전통 축제에 방문해보는 것은 어떨까요?",
          image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop"
        };
    }
  };

  const tasteTypeInfo = getTasteTypeInfo();

  // 취향 테스트 다시 하기
  const handleRetakeTest = () => {
    clearTasteTestAnswers();
    clearTasteType();
    navigate("/tastetest");
  };

  const handleEdit = () => {
    if (isEditing) {
      // 저장 로직
      const updatedUser = {
        ...user,
        ...editedInfo,
      };
      setUser(updatedUser);
      setIsEditing(false);
    } else {
      // 편집 모드로 전환
      setEditedInfo({
        id: userInfo.id,
        name: userInfo.name,
        nickname: userInfo.nickname,
        email: userInfo.email,
        phone: userInfo.phone,
        gender: userInfo.gender,
      });
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedInfo({
      id: userInfo.id,
      name: userInfo.name,
      nickname: userInfo.nickname,
      email: userInfo.email,
      phone: userInfo.phone,
      gender: userInfo.gender,
    });
  };

  const handleChange = (field, value) => {
    setEditedInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 로그아웃 버튼 클릭 시 /home으로 이동
  const handleLogout = () => {
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-[#fff9f2]">
      <style>{`
        .vibrant-gradient {
          background: linear-gradient(135deg, #f48525 0%, #fbbf24 100%);
        }
        .compass-glow {
          box-shadow: 0 0 50px rgba(251, 191, 36, 0.4), inset 0 0 20px rgba(255, 255, 255, 0.5);
        }
        .vintage-map {
          background: radial-gradient(circle at center, #f5e6d3 0%, #e8d5b7 100%);
          box-shadow: inset 0 0 100px rgba(0,0,0,0.05);
        }
      `}</style>

      <Header />
      
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-black mb-8 text-gray-900">
            마이페이지
          </h2>
          
          <div className="flex gap-8 border-b-2 border-gray-200 mb-10">
            <button
              onClick={() => setActiveTab("myinfo")}
              className={`pb-3 text-xl font-semibold transition-all ${
                activeTab === "myinfo"
                  ? "text-orange-500 border-b-4 border-orange-500 -mb-0.5"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              My info
            </button>
            <button
              onClick={() => setActiveTab("preference")}
              className={`pb-3 text-xl font-semibold transition-all ${
                activeTab === "preference"
                  ? "text-orange-500 border-b-4 border-orange-500 -mb-0.5"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              내 축제 취향
            </button>
            <button
              onClick={() => setActiveTab("liked")}
              className={`pb-3 text-xl font-semibold transition-all ${
                activeTab === "liked"
                  ? "text-orange-500 border-b-4 border-orange-500 -mb-0.5"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
               찜한 축제
            </button>
          </div>

        {activeTab === "myinfo" && (
          <div>
            <div className="bg-white rounded-3xl shadow-md p-16 mb-6">
              <div className="space-y-8">
                <div className="flex items-start">
                  <div className="w-44 text-gray-400 text-base font-medium pt-1">아이디</div>
                  <div className="flex-1">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedInfo.id}
                        onChange={(e) => handleChange('id', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    ) : (
                      <div className="text-gray-900 text-xl font-semibold">{userInfo.id}</div>
                    )}
                  </div>
                </div>
                
                <div className="border-t border-gray-200"></div>
                
                <div className="flex items-start">
                  <div className="w-44 text-gray-400 text-base font-medium pt-1">이메일</div>
                  <div className="flex-1">
                    {isEditing ? (
                      <input
                        type="email"
                        value={editedInfo.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    ) : (
                      <div className="text-gray-900 text-xl font-semibold">{userInfo.email}</div>
                    )}
                  </div>
                </div>
                
                <div className="border-t border-gray-200"></div>
                
                <div className="flex items-start">
                  <div className="w-44 text-gray-400 text-base font-medium pt-1">이름</div>
                  <div className="flex-1">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedInfo.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    ) : (
                      <div className="text-gray-900 text-xl font-semibold">{userInfo.name}</div>
                    )}
                  </div>
                </div>
                
                <div className="border-t border-gray-200"></div>
                
                <div className="flex items-start">
                  <div className="w-44 text-gray-400 text-base font-medium pt-1">닉네임</div>
                  <div className="flex-1 flex items-center gap-3">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedInfo.nickname}
                        onChange={(e) => handleChange('nickname', e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    ) : (
                      <span className="text-gray-900 text-xl font-semibold">{userInfo.nickname}</span>
                    )}
                    <span className="px-3 py-1 bg-orange-100 text-orange-600 text-xs font-bold rounded-full">
                      PRO MEMBER
                    </span>
                  </div>
                </div>
                
                <div className="border-t border-gray-200"></div>
                
                <div className="flex items-start">
                  <div className="w-44 text-gray-400 text-base font-medium pt-1">전화번호</div>
                  <div className="flex-1">
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editedInfo.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="010-1234-5678"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    ) : (
                      <div className="text-gray-900 text-xl font-semibold">{userInfo.phone}</div>
                    )}
                  </div>
                </div>
                
                <div className="border-t border-gray-200"></div>
                
                <div className="flex items-start">
                  <div className="w-44 text-gray-400 text-base font-medium pt-1">성별</div>
                  <div className="flex-1">
                    {isEditing ? (
                      <select
                        value={editedInfo.gender}
                        onChange={(e) => handleChange('gender', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">선택해주세요</option>
                        <option value="남성">남성</option>
                        <option value="여성">여성</option>
                        <option value="기타">기타</option>
                      </select>
                    ) : (
                      <div className="text-gray-900 text-xl font-semibold">{userInfo.gender}</div>
                    )}
                  </div>
                </div>
                
                <div className="border-t border-gray-200"></div>
                
                <div className="flex items-start">
                  <div className="w-44 text-gray-400 text-base font-medium pt-1">가입일</div>
                  <div className="flex-1 text-gray-900 text-xl font-semibold">{userInfo.joinDate}</div>
                </div>
              </div>
              
              <div className="mt-16 flex justify-center gap-4">
                {isEditing ? (
                  <>
                    <button 
                      onClick={handleCancel}
                      className="w-full max-w-md h-14 bg-gray-200 text-gray-700 font-bold text-lg rounded-full shadow-md hover:shadow-lg transition-all"
                    >
                      취소
                    </button>
                    <button 
                      onClick={handleEdit}
                      className="w-full max-w-md h-14 bg-gradient-to-r from-orange-500 to-orange-400 text-white font-bold text-lg rounded-full shadow-md hover:shadow-lg transition-all"
                    >
                      저장하기
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={handleEdit}
                    className="w-full max-w-md h-14 bg-gradient-to-r from-orange-500 to-orange-400 text-white font-bold text-lg rounded-full shadow-md hover:shadow-lg transition-all"
                  >
                    내 회원가입 정보 수정
                  </button>
                )}
              </div>
            </div>
            
            <div className="text-center py-6">
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleLogout}
                  className="text-gray-400 text-sm hover:text-gray-600 underline"
                >
                  로그아웃
                </button>
                <button className="text-gray-400 text-sm hover:text-gray-600 underline">
                  회원 탈퇴하기
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "preference" && (
          <div className="w-full max-w-[1000px]">
            <div className="bg-white rounded-[3rem] shadow-[0_10px_60px_-15px_rgba(0,0,0,0.2)] overflow-hidden border border-orange-100/80 min-h-[500px] hidden lg:block">
              <div className="flex h-full">
                <div className="w-[42%] bg-[#fdf8f4] flex items-center justify-center relative p-10">
                  <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden rounded-[2rem] gap-6">
                    <div className="w-64 h-64 rounded-full overflow-hidden shadow-2xl">
                      <img 
                        src={tasteTypeInfo.image || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop"}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-center w-full px-2">
                      <p className="text-gray-900 text-2xl font-bold mb-1">당신은</p>
                      <p className="text-[#f48525] text-[22px] font-black mb-1 break-all leading-tight">{tasteTypeInfo.hashtag}</p>
                      <p className="text-gray-900 text-2xl font-bold">유형입니다!</p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 p-14 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap gap-2 mb-8">
                      {tasteTypeInfo.tags.map((tag, index) => (
                        <span key={index} className="px-4 py-1.5 bg-orange-50 text-[#f48525] text-sm font-bold rounded-full">{tag}</span>
                      ))}
                    </div>
                    <h3 className="text-4xl font-black text-[#1c140d] mb-8 leading-tight">
                      {tasteTypeInfo.title.split(tasteTypeInfo.titleHighlight)[0]}<span className="text-[#f48525]">{tasteTypeInfo.titleHighlight}</span>
                    </h3>
                    <div className="space-y-6 text-gray-600 text-[15.5px] leading-relaxed font-medium" style={{ maxWidth: '600px' }}>
                      <p>{tasteTypeInfo.description1}</p>
                      <p>{tasteTypeInfo.description2}</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleRetakeTest}
                    className="w-full h-16 vibrant-gradient text-white font-black rounded-2xl text-xl shadow-xl shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 mt-6"
                  >
                     다시 축제취향 설문하기
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-[3rem] shadow-[0_10px_60px_-15px_rgba(0,0,0,0.2)] p-10 lg:hidden mb-12 border border-orange-100/80">
              <div className="flex flex-col gap-10">
                <div className="w-full flex flex-col items-center justify-center gap-6 py-8">
                  <div className="w-56 h-56 rounded-full overflow-hidden shadow-xl">
                    <img 
                      src={tasteTypeInfo.image || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop"}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-gray-900 text-xl font-bold mb-1">당신은</p>
                    <p className="text-[#f48525] text-2xl font-black mb-1">{tasteTypeInfo.hashtag}</p>
                    <p className="text-gray-900 text-xl font-bold">유형입니다!</p>
                  </div>
                </div>
                <div>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {tasteTypeInfo.tags.map((tag, index) => (
                      <span key={index} className="px-4 py-1.5 bg-orange-50 text-[#f48525] text-sm font-bold rounded-full">{tag}</span>
                    ))}
                  </div>
                  <h3 className="text-3xl font-black text-[#1c140d] mb-6 leading-tight">
                    {tasteTypeInfo.title.split(tasteTypeInfo.titleHighlight)[0]}<span className="text-[#f48525]">{tasteTypeInfo.titleHighlight}</span>
                  </h3>
                  <div className="space-y-4 text-gray-600 text-base leading-relaxed font-medium" style={{ maxWidth: '100%' }}>
                    <p>{tasteTypeInfo.description1}</p>
                    <p>{tasteTypeInfo.description2}</p>
                  </div>
                  <button 
                    onClick={handleRetakeTest}
                    className="w-full h-16 vibrant-gradient text-white font-black rounded-2xl text-xl shadow-xl shadow-orange-500/20 mt-6 flex items-center justify-center gap-2"
                  >
                     다시 축제취향 설문하기
                  </button>
                </div>
              </div>
            </div>
            {/* 하단 안내 문구 제거됨 */}
          </div>
        )}

        {activeTab === "liked" && (
          <div className="mb-24">
            <div className="bg-white rounded-3xl shadow-md p-8">
              <h2 className="text-3xl font-black mb-2 text-gray-900"> 찜한 축제</h2>
              <p className="text-gray-500 mb-8">총 {likedFestivals.length}개의 축제를 찜했어요</p>
              
              {likedFestivals.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4">🎪</div>
                  <p className="text-gray-400 text-lg">아직 찜한 축제가 없어요</p>
                  <p className="text-gray-300 text-sm mt-2">축제를 찜하면 여기에 표시됩니다</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {likedFestivals.map((festival) => (
                    <div
                      key={festival.pSeq}
                      className="rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                    >
                      <TownCard
                        town={{
                          name: festival.fstvlNm,
                          description: festival.ministry_description,
                          image: festival.ministry_image_url || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f",
                          id: festival.pSeq,
                        }}
                        festival={festival}
                        onClick={() => {
                          // 모달 열기 로직 추가 (필요시)
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        </div>
      </main>
    </div>
  );
}

export default Mypage;
