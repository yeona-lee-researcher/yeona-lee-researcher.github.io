import { useState, useEffect } from "react";

// 팔도의 주요 도시 좌표
const REGIONS = [
  { name: "서울", lat: 37.5665, lon: 126.9780, region: "경기" },
  { name: "부산", lat: 35.1796, lon: 129.0756, region: "경상" },
  { name: "대구", lat: 35.8714, lon: 128.6014, region: "경상" },
  { name: "인천", lat: 37.4563, lon: 126.7052, region: "경기" },
  { name: "광주", lat: 35.1595, lon: 126.8526, region: "전라" },
  { name: "대전", lat: 36.3504, lon: 127.3845, region: "충청" },
  { name: "강릉", lat: 37.7519, lon: 128.8761, region: "강원" },
  { name: "제주", lat: 33.4996, lon: 126.5312, region: "제주" },
];

const WeatherWidget = () => {
  const [weatherData, setWeatherData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
      console.log("ENV KEY:", apiKey, "len:", apiKey?.length);

      
      if (!apiKey) {
        setError("API 키가 설정되지 않았습니다.");
        setLoading(false);
        return;
      }

      try {
        const promises = REGIONS.map(async (region) => {
          try {
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${region.lat}&lon=${region.lon}&appid=${apiKey}&units=metric&lang=kr`;
            const response = await fetch(url);
            
            if (!response.ok) {
              console.error(`날씨 API 에러 (${region.name}):`, response.status, response.statusText);
              return null;
            }
            
            const data = await response.json();
            
            // API 응답 데이터 검증
            if (!data.main || !data.weather || !data.weather[0]) {
              console.error(`잘못된 날씨 데이터 (${region.name}):`, data);
              return null;
            }
            
            return {
              ...region,
              temp: Math.round(data.main.temp),
              feels_like: Math.round(data.main.feels_like),
              weather: data.weather[0].main,
              description: data.weather[0].description,
              icon: data.weather[0].icon,
              humidity: data.main.humidity,
              wind_speed: data.wind.speed,
            };
          } catch (err) {
            console.error(`날씨 정보 가져오기 실패 (${region.name}):`, err);
            return null;
          }
        });

        const results = await Promise.all(promises);
        const validResults = results.filter(r => r !== null);
        
        if (validResults.length === 0) {
          setError("날씨 API 키가 유효하지 않습니다. OpenWeather API 키를 확인해주세요.");
        } else {
          setWeatherData(validResults);
        }
        setLoading(false);
      } catch (err) {
        console.error("날씨 정보를 가져오는데 실패했습니다:", err);
        setError("날씨 정보를 불러올 수 없습니다.");
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  // 날씨에 따른 이모지
  const getWeatherEmoji = (weather) => {
    const weatherMap = {
      Clear: "☀️",
      Clouds: "☁️",
      Rain: "🌧️",
      Drizzle: "🌦️",
      Thunderstorm: "⛈️",
      Snow: "❄️",
      Mist: "🌫️",
      Fog: "🌫️",
      Haze: "🌫️",
    };
    return weatherMap[weather] || "🌤️";
  };

  if (loading) {
    return (
      <div style={{
        backgroundColor: "white",
        borderRadius: 24,
        padding: 24,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: "#FF5F33" }}>
          🌤️ 전국 날씨
        </h3>
        <div style={{ textAlign: "center", padding: "20px 0", color: "#9ca3af" }}>
          날씨 정보를 불러오는 중...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        backgroundColor: "white",
        borderRadius: 24,
        padding: 24,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: "#FF5F33" }}>
          🌤️ 전국 날씨
        </h3>
        <div style={{ 
          padding: "20px", 
          backgroundColor: "#fef2f2", 
          borderRadius: 12,
          border: "1px solid #fecaca",
        }}>
          <div style={{ color: "#dc2626", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
            ⚠️ 날씨 정보를 불러올 수 없습니다
          </div>
          <div style={{ color: "#991b1b", fontSize: 12, lineHeight: 1.5 }}>
            OpenWeather API 키를 확인해주세요.<br/>
            <br/>
            <strong>해결 방법:</strong><br/>
            1. OpenWeather 계정에서 API 키가 활성화되었는지 확인<br/>
            2. 무료 플랜은 활성화까지 몇 시간 소요될 수 있습니다<br/>
            3. .env 파일의 VITE_OPENWEATHER_API_KEY 확인
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: "white",
      borderRadius: 24,
      padding: 24,
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    }}>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: "#FF5F33" }}>
        🌤️ 전국 날씨
      </h3>
      
      <div style={{ display: "grid", gap: 12 }}>
        {weatherData.map((city) => (
          <div
            key={city.name}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 12,
              borderRadius: 12,
              backgroundColor: "#f9fafb",
              transition: "all 0.2s ease",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f3f4f6";
              e.currentTarget.style.transform = "translateX(4px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#f9fafb";
              e.currentTarget.style.transform = "translateX(0)";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 28 }}>{getWeatherEmoji(city.weather)}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#1f2937" }}>
                  {city.name}
                </div>
                <div style={{ fontSize: 11, color: "#6b7280" }}>
                  {city.description}
                </div>
              </div>
            </div>
            
            <div style={{ textAlign: "right" }}>
              <div style={{ 
                fontSize: 20, 
                fontWeight: 800, 
                color: "#FF5F33",
                marginBottom: 2,
              }}>
                {city.temp}°
              </div>
              <div style={{ fontSize: 10, color: "#9ca3af" }}>
                체감 {city.feels_like}°
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div style={{
        marginTop: 16,
        padding: 12,
        backgroundColor: "#fef3e8",
        borderRadius: 12,
        fontSize: 11,
        color: "#92400e",
        textAlign: "center",
      }}>
        💡 축제 방문 시 날씨를 확인하세요!
      </div>
    </div>
  );
};

export default WeatherWidget;
