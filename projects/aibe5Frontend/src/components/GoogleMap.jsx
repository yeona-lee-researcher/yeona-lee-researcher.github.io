import React, { useEffect, useRef } from "react";
import { loadGoogleMaps } from "../lib/googleMaps";

// GoogleMap 컴포넌트: 위도/경도 또는 주소로 지도 표시
export default function GoogleMap({ latitude, longitude, rdnmadr, lnmadr, apiKey }) {
  const mapRef = useRef(null);
  
  useEffect(() => {
    async function initMap() {
      if (!mapRef.current) return;
      
      // ✅ googleMaps.js의 loadGoogleMaps 사용 (중복 로드 방지)
      try {
        const google = await loadGoogleMaps();
        
        if (!mapRef.current) return;
        
        const map = new google.maps.Map(mapRef.current, {
          zoom: 16,
          center: latitude && longitude ? { lat: latitude, lng: longitude } : { lat: 37.5665, lng: 126.9780 },
          disableDefaultUI: false,
          gestureHandling: "auto",
          clickableIcons: true,
        });
        
        if (google.maps.Marker) {
          if (latitude && longitude) {
            new google.maps.Marker({
              position: { lat: latitude, lng: longitude },
              map,
            });
          } else if (rdnmadr || lnmadr) {
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ address: rdnmadr || lnmadr }, (results, status) => {
              if (status === "OK" && results[0]) {
                map.setCenter(results[0].geometry.location);
                new google.maps.Marker({
                  map,
                  position: results[0].geometry.location,
                });
              }
            });
          }
        }
      } catch (error) {
        console.error('Google Maps 로드 실패:', error);
        if (mapRef.current) {
          mapRef.current.innerHTML = '<div style="color:red;padding:16px;">지도를 불러올 수 없습니다.</div>';
        }
      }
    }
    
    initMap();
  }, [latitude, longitude, rdnmadr, lnmadr, apiKey]);

  // 지도 위에 오버레이로 라벨 추가
  return (
    <div style={{ position: "relative", width: "100%", height: 450, borderRadius: 12, overflow: "hidden", margin: "24px 0", boxShadow: "0 1px 4px 0 rgba(60,64,67,.15)" }}>
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
      <div style={{
        position: "absolute",
        left: 0,
        top: 0,
        background: "#4285F4",
        color: "white",
        borderRadius: "8px 0 8px 0",
        padding: "4px 8px 4px 8px",
        fontSize: 14,
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        gap: 4,
        zIndex: 2,
      }}>
        <span style={{ fontSize: 18, marginRight: 4 }}>🚉</span> 지도에서 보기
      </div>
    </div>
  );
}
