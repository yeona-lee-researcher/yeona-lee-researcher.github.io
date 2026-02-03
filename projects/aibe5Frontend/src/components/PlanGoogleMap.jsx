import { useEffect, useRef, useState } from "react";
import { loadGoogleMaps } from "../lib/googleMaps";

// 여러 축제를 지도에 표시하는 컴포넌트 (일정 관리용)
export default function PlanGoogleMap({ festivals, onAddPlace }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const infoWindowsRef = useRef([]);
  const placeMarkersRef = useRef([]);
  const placeInfoWindowsRef = useRef([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    async function initMap() {
      if (!mapRef.current || !festivals || festivals.length === 0) return;

      try {
        const google = await loadGoogleMaps();
        
        if (!mapRef.current) return;

        // 지도 중심 계산 (첫 번째 축제의 위치 또는 서울 중심)
        let centerLat = 37.5665;
        let centerLng = 126.9780;
        
        const firstFestival = festivals[0];
        if (firstFestival.latitude && firstFestival.longitude) {
          centerLat = firstFestival.latitude;
          centerLng = firstFestival.longitude;
        }

        const map = new google.maps.Map(mapRef.current, {
          zoom: festivals.length === 1 ? 14 : 12,
          center: { lat: centerLat, lng: centerLng },
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ]
        });

        // 지도 인스턴스 저장
        mapInstanceRef.current = map;

        // 기존 마커 제거
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];
        infoWindowsRef.current = [];

        // 각 축제에 대한 마커 추가
        const bounds = new google.maps.LatLngBounds();
        let hasValidLocation = false;
        let firstMarker = null;
        let firstInfoWindow = null;

        for (let i = 0; i < festivals.length; i++) {
          const festival = festivals[i];
          
          if (festival.latitude && festival.longitude) {
            const position = { lat: festival.latitude, lng: festival.longitude };
            
            const marker = new google.maps.Marker({
              position,
              map,
              title: festival.fstvlNm,
              label: {
                text: `${i + 1}`,
                color: 'white',
                fontSize: '14px',
                fontWeight: 'bold'
              },
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 20,
                fillColor: '#FF6B35',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 3
              }
            });

            const infoWindow = new google.maps.InfoWindow({
              content: `
                <div style="padding: 8px; min-width: 200px;">
                  <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #1a1a1a;">
                    ${festival.fstvlNm}
                  </h3>
                  <p style="margin: 4px 0; font-size: 13px; color: #666;">
                    📍 ${festival.rdnmadr || festival.opar || '위치 정보 없음'}
                  </p>
                  <p style="margin: 4px 0; font-size: 13px; color: #666;">
                    📅 ${festival.fstvlStartDate || ''} ~ ${festival.fstvlEndDate || ''}
                  </p>
                </div>
              `
            });

            marker.addListener('click', () => {
              // 모든 InfoWindow 닫기
              infoWindowsRef.current.forEach(iw => iw.close());
              infoWindow.open(map, marker);
            });

            // 첫 번째 마커와 InfoWindow 저장
            if (i === 0) {
              firstMarker = marker;
              firstInfoWindow = infoWindow;
            }

            markersRef.current.push(marker);
            infoWindowsRef.current.push(infoWindow);
            bounds.extend(position);
            hasValidLocation = true;
          } else if (festival.rdnmadr || festival.lnmadr) {
            // 주소로 지오코딩
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ address: festival.rdnmadr || festival.lnmadr }, (results, status) => {
              if (status === 'OK' && results[0]) {
                const position = results[0].geometry.location;
                
                const marker = new google.maps.Marker({
                  position,
                  map,
                  title: festival.fstvlNm,
                  label: {
                    text: `${i + 1}`,
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  },
                  icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 20,
                    fillColor: '#FF6B35',
                    fillOpacity: 1,
                    strokeColor: '#ffffff',
                    strokeWeight: 3
                  }
                });

                const infoWindow = new google.maps.InfoWindow({
                  content: `
                    <div style="padding: 8px; min-width: 200px;">
                      <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #1a1a1a;">
                        ${festival.fstvlNm}
                      </h3>
                      <p style="margin: 4px 0; font-size: 13px; color: #666;">
                        📍 ${festival.rdnmadr || festival.opar || '위치 정보 없음'}
                      </p>
                      <p style="margin: 4px 0; font-size: 13px; color: #666;">
                        📅 ${festival.fstvlStartDate || ''} ~ ${festival.fstvlEndDate || ''}
                      </p>
                    </div>
                  `
                });

                marker.addListener('click', () => {
                  // 모든 InfoWindow 닫기
                  infoWindowsRef.current.forEach(iw => iw.close());
                  infoWindow.open(map, marker);
                });

                // 첫 번째 마커와 InfoWindow 저장 (지오코딩 후)
                if (i === 0 && !firstMarker) {
                  firstMarker = marker;
                  firstInfoWindow = infoWindow;
                  // 첫 번째 축제로 지도 중심 이동
                  map.setCenter(position);
                  // 첫 번째 InfoWindow 자동 열기
                  setTimeout(() => {
                    infoWindow.open(map, marker);
                  }, 500);
                }

                markersRef.current.push(marker);
                infoWindowsRef.current.push(infoWindow);
                bounds.extend(position);
              }
            });
            hasValidLocation = true;
          }
        }

        // 축제가 하나만 있을 때는 첫 번째 축제 위치로 지도 중심 이동 및 InfoWindow 열기
        if (festivals.length === 1 && firstMarker && firstInfoWindow) {
          // 약간의 지연 후 InfoWindow 열기
          setTimeout(() => {
            firstInfoWindow.open(map, firstMarker);
          }, 300);
        }
        // 모든 마커가 보이도록 지도 범위 조정 (축제가 여러 개일 때)
        else if (hasValidLocation && markersRef.current.length > 1) {
          map.fitBounds(bounds);
          
          // 줌 레벨이 너무 높으면 조정
          const listener = google.maps.event.addListener(map, "idle", function() {
            if (map.getZoom() > 15) map.setZoom(15);
            google.maps.event.removeListener(listener);
            
            // 범위 조정 후 첫 번째 InfoWindow 열기
            if (firstMarker && firstInfoWindow) {
              setTimeout(() => {
                firstInfoWindow.open(map, firstMarker);
              }, 300);
            }
          });
        }

      } catch (error) {
        console.error('Google Maps 로드 실패:', error);
      }
    }

    initMap();
  }, [festivals]);

  // 장소 추가 핸들러를 전역에 등록
  useEffect(() => {
    window.handleAddPlace = (category, placeId) => {
      const marker = placeMarkersRef.current.find(m => m.placeData?.place_id === placeId);
      if (marker && marker.placeData && onAddPlace) {
        const place = marker.placeData;
        const categoryLabels = {
          'lodging': '숙소',
          'restaurant': '음식점',
          'cafe': '카페'
        };
        
        if (window.confirm(`"${place.name}"을(를) 일정에 추가하시겠습니까?`)) {
          onAddPlace({
            type: category,
            typeLabel: categoryLabels[category],
            name: place.name,
            address: place.vicinity,
            rating: place.rating,
            placeId: place.place_id,
            photoUrl: place.photoUrl,
            location: {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            }
          });
        }
      }
    };

    return () => {
      delete window.handleAddPlace;
    };
  }, [onAddPlace]);

  // 주변 장소 검색 함수
  const searchNearbyPlaces = async (category) => {
    if (!mapInstanceRef.current || !festivals || festivals.length === 0) {
      console.log('지도 또는 축제 정보 없음');
      return;
    }

    try {
      const google = await loadGoogleMaps();
      
      console.log('Google Maps 로드 완료');
      console.log('Places API 사용 가능:', !!google.maps.places);
      
      // 기존 장소 마커 제거
      placeMarkersRef.current.forEach(marker => marker.setMap(null));
      placeMarkersRef.current = [];
      placeInfoWindowsRef.current = [];

      // 카테고리가 이미 선택되어 있으면 토글 (제거)
      if (selectedCategory === category) {
        setSelectedCategory(null);
        return;
      }

      setSelectedCategory(category);

      // 첫 번째 축제 위치 기준으로 검색
      const firstFestival = festivals[0];
      let searchLocation;

      if (firstFestival.latitude && firstFestival.longitude) {
        searchLocation = new google.maps.LatLng(firstFestival.latitude, firstFestival.longitude);
        console.log('축제 위치:', firstFestival.latitude, firstFestival.longitude);
      } else if (firstFestival.rdnmadr || firstFestival.lnmadr) {
        // 주소로 지오코딩
        console.log('주소로 지오코딩:', firstFestival.rdnmadr || firstFestival.lnmadr);
        const geocoder = new google.maps.Geocoder();
        const results = await new Promise((resolve, reject) => {
          geocoder.geocode({ address: firstFestival.rdnmadr || firstFestival.lnmadr }, (results, status) => {
            if (status === 'OK' && results[0]) {
              resolve(results);
            } else {
              reject(new Error('Geocoding failed: ' + status));
            }
          });
        });
        searchLocation = results[0].geometry.location;
        console.log('지오코딩 결과:', searchLocation.lat(), searchLocation.lng());
      } else {
        console.error('축제 위치 정보가 없습니다.');
        return;
      }

      // Places Service 사용
      if (!google.maps.places) {
        console.error('Places API가 로드되지 않았습니다!');
        return;
      }

      const service = new google.maps.places.PlacesService(mapInstanceRef.current);

      // 카테고리별 검색 타입 매핑
      const typeMap = {
        'lodging': 'lodging',
        'restaurant': 'restaurant',
        'cafe': 'cafe'
      };

      const request = {
        location: searchLocation,
        radius: 3000,
        type: typeMap[category]
      };

      console.log('Places API 요청:', request);

      service.nearbySearch(request, (results, status) => {
        console.log('Places API 응답 상태:', status);
        console.log('검색 결과 수:', results?.length || 0);
        
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          // 최대 20개까지만 표시
          const placesToShow = results.slice(0, 20);
          console.log(`${category} ${placesToShow.length}개 표시`);

          placesToShow.forEach((place) => {
            // 카테고리별 아이콘 색상과 이모지
            const categoryInfo = {
              'lodging': { color: '#4F46E5', icon: '🏨', label: '숙소' },
              'restaurant': { color: '#DC2626', icon: '🍽️', label: '음식점' },
              'cafe': { color: '#D97706', icon: '☕', label: '카페' }
            };

            const info = categoryInfo[category];

            // SVG 마커 아이콘 생성
            const markerIcon = {
              url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="50" viewBox="0 0 40 50">
                  <path d="M20 0C9 0 0 9 0 20c0 15 20 30 20 30s20-15 20-30C40 9 31 0 20 0z" 
                    fill="${info.color}" stroke="white" stroke-width="2"/>
                  <circle cx="20" cy="20" r="10" fill="white"/>
                  <text x="20" y="26" font-size="16" text-anchor="middle" fill="${info.color}">${info.icon}</text>
                </svg>
              `)}`,
              scaledSize: new google.maps.Size(32, 40),
              anchor: new google.maps.Point(16, 40)
            };

            const marker = new google.maps.Marker({
              position: place.geometry.location,
              map: mapInstanceRef.current,
              title: place.name,
              icon: markerIcon,
              animation: google.maps.Animation.DROP
            });

            const infoWindow = new google.maps.InfoWindow({
              content: `
                <div style="padding: 12px; min-width: 200px; max-width: 280px;">
                  <div style="display: flex; align-items: start; gap: 8px; margin-bottom: 8px;">
                    <span style="font-size: 24px;">${info.icon}</span>
                    <div style="flex: 1;">
                      <div style="display: inline-block; padding: 2px 8px; background: ${info.color}20; color: ${info.color}; 
                        border-radius: 4px; font-size: 11px; font-weight: bold; margin-bottom: 4px;">
                        ${info.label}
                      </div>
                      <h4 style="margin: 0 0 6px 0; font-size: 15px; font-weight: bold; color: #1a1a1a;">
                        ${place.name}
                      </h4>
                    </div>
                  </div>
                  <p style="margin: 0 0 8px 0; font-size: 12px; color: #666; line-height: 1.4;">
                    📍 ${place.vicinity || '주소 정보 없음'}
                  </p>
                  ${place.rating ? `
                    <p style="margin: 0 0 12px 0; font-size: 12px; color: #f59e0b; font-weight: 600;">
                      ⭐ ${place.rating} ${place.user_ratings_total ? `(${place.user_ratings_total}명)` : ''}
                    </p>
                  ` : '<div style="margin-bottom: 12px;"></div>'}
                  <button 
                    onclick="window.handleAddPlace('${category}', '${place.place_id}')"
                    style="width: 100%; padding: 10px; background: ${info.color}; color: white; 
                      border: none; border-radius: 8px; font-weight: bold; font-size: 13px; 
                      cursor: pointer; transition: all 0.2s;"
                    onmouseover="this.style.opacity='0.9'; this.style.transform='scale(0.98)'"
                    onmouseout="this.style.opacity='1'; this.style.transform='scale(1)'">
                    📅 일정에 추가하기
                  </button>
                </div>
              `
            });

            marker.addListener('click', () => {
              // 다른 InfoWindow 닫기
              placeInfoWindowsRef.current.forEach(iw => iw.close());
              infoWindow.open(mapInstanceRef.current, marker);
            });

            placeMarkersRef.current.push(marker);
            placeInfoWindowsRef.current.push(infoWindow);
            
            // 장소 데이터를 마커에 저장 (사진 URL 포함)
            const photoUrl = place.photos && place.photos.length > 0 
              ? place.photos[0].getUrl({ maxWidth: 800, maxHeight: 600 })
              : null;
            
            marker.placeData = {
              ...place,
              photoUrl: photoUrl
            };
          });
        } else {
          console.error('Places API 검색 실패:', status);
          if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            alert('주변 3km 내에 해당 시설이 없습니다.');
          } else if (status === google.maps.places.PlacesServiceStatus.REQUEST_DENIED) {
            alert('Places API 요청이 거부되었습니다. API 키를 확인해주세요.');
          } else {
            alert('검색 중 오류가 발생했습니다: ' + status);
          }
        }
      });

    } catch (error) {
      console.error('주변 장소 검색 실패:', error);
      alert('장소 검색 중 오류가 발생했습니다: ' + error.message);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%', borderRadius: '40px' }} />
      
      {/* 카테고리 버튼 */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        zIndex: 10
      }}>
        <button
          onClick={() => searchNearbyPlaces('lodging')}
          style={{
            padding: '12px 16px',
            backgroundColor: selectedCategory === 'lodging' ? '#4F46E5' : 'white',
            color: selectedCategory === 'lodging' ? 'white' : '#1f2937',
            border: '2px solid ' + (selectedCategory === 'lodging' ? '#4F46E5' : '#e5e7eb'),
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '14px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap'
          }}
          onMouseEnter={(e) => {
            if (selectedCategory !== 'lodging') {
              e.target.style.borderColor = '#4F46E5';
              e.target.style.backgroundColor = '#EEF2FF';
            }
          }}
          onMouseLeave={(e) => {
            if (selectedCategory !== 'lodging') {
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.backgroundColor = 'white';
            }
          }}
        >
          <span>🏨</span> 숙소
        </button>

        <button
          onClick={() => searchNearbyPlaces('restaurant')}
          style={{
            padding: '12px 16px',
            backgroundColor: selectedCategory === 'restaurant' ? '#DC2626' : 'white',
            color: selectedCategory === 'restaurant' ? 'white' : '#1f2937',
            border: '2px solid ' + (selectedCategory === 'restaurant' ? '#DC2626' : '#e5e7eb'),
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '14px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap'
          }}
          onMouseEnter={(e) => {
            if (selectedCategory !== 'restaurant') {
              e.target.style.borderColor = '#DC2626';
              e.target.style.backgroundColor = '#FEF2F2';
            }
          }}
          onMouseLeave={(e) => {
            if (selectedCategory !== 'restaurant') {
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.backgroundColor = 'white';
            }
          }}
        >
          <span>🍽️</span> 음식점
        </button>

        <button
          onClick={() => searchNearbyPlaces('cafe')}
          style={{
            padding: '12px 16px',
            backgroundColor: selectedCategory === 'cafe' ? '#D97706' : 'white',
            color: selectedCategory === 'cafe' ? 'white' : '#1f2937',
            border: '2px solid ' + (selectedCategory === 'cafe' ? '#D97706' : '#e5e7eb'),
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '14px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap'
          }}
          onMouseEnter={(e) => {
            if (selectedCategory !== 'cafe') {
              e.target.style.borderColor = '#D97706';
              e.target.style.backgroundColor = '#FFFBEB';
            }
          }}
          onMouseLeave={(e) => {
            if (selectedCategory !== 'cafe') {
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.backgroundColor = 'white';
            }
          }}
        >
          <span>☕</span> 카페
        </button>
      </div>
    </div>
  );
}
