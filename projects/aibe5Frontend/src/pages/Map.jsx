import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import festivals from "../data/festivals.json";
import { loadGoogleMaps } from "../lib/googleMaps";
import useStore from "../store/useStore";
import Header from "../components/Header";

// 위도 경도 거리 계산
function haversineMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (v) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// price_level(0~4) → 대충 원화 추정치
function estimatedPriceFromLevel(priceLevel) {
  switch (priceLevel) {
    case 0:
      return 70000;
    case 1:
      return 90000;
    case 2:
      return 110000;
    case 3:
      return 140000;
    case 4:
      return 180000;
    default:
      return 110000;
  }
}
function priceLevelLabel(priceLevel) {
  if (priceLevel == null) return "-";
  return "₩".repeat(Math.max(1, Math.min(5, priceLevel + 1)));
}

export default function Map() {
  const { state } = useLocation();
  const { selectedFestivalPSeq } = useStore();

  // 백엔드(ai)에서 받은 축제 id(pSeq) 또는 zustand store에서 가져오기
  const festivalId = state?.festivalId || selectedFestivalPSeq;

  // 혹시 안나오면 서울시청 화면 나오게
  const query = state?.query ?? "서울시청";
  const radius = state?.radius ?? 2000;

  // JSON에서 festivalId로 축제 찾기
  const selectedFestival = useMemo(() => {
    if (!festivalId) return null;
    return festivals.find((f) => String(f.pSeq) === String(festivalId)) ?? null;
  }, [festivalId]);

  // UI state
  const [center, setCenter] = useState(null); // { lat, lng, title }
  const [hotels, setHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState(null);

  // distance | priceAsc | priceDesc | ratingDesc | ratingAsc
  const [sortType, setSortType] = useState("distance");

  // Map refs
  const mapDivRef = useRef(null);
  const mapObjRef = useRef(null);

  const placesServiceRef = useRef(null);
  const geocoderRef = useRef(null);
  const infoWindowRef = useRef(null);
  const markersRef = useRef([]);

  const [mapReady, setMapReady] = useState(false);

  // 1) Google Maps 로드 + 지도 생성(한 번)
  useEffect(() => {
    let cancelled = false;

    async function initGoogleMap() {
      // ✅ places 라이브러리 포함해서 로드 (nearbySearch / details 용)
      const google = await loadGoogleMaps({ libraries: ["places"] });
      if (cancelled) return;

      if (!mapDivRef.current) return;

      if (!mapObjRef.current) {
        mapObjRef.current = new google.maps.Map(mapDivRef.current, {
          center: { lat: 37.5665, lng: 126.978 },
          zoom: 14,
        });

        infoWindowRef.current = new google.maps.InfoWindow();
        geocoderRef.current = new google.maps.Geocoder();

        // ⚠️ 경고는 있지만 기존 고객/현재 키에서는 동작하는 경우 많음
        placesServiceRef.current = new google.maps.places.PlacesService(mapObjRef.current);
      }

      setMapReady(true);
    }

    initGoogleMap().catch((e) => {
      console.error("Google Maps init error:", e);
    });

    return () => {
      cancelled = true;
      // cleanup markers
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
      if (infoWindowRef.current) infoWindowRef.current.close();
    };
  }, []);

  // 유틸: 마커/인포윈도우 정리
  function clearMarkers() {
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    if (infoWindowRef.current) infoWindowRef.current.close();
  }

  // 유틸: 마커 추가 + 클릭 시 상세 로드
  function addMarker(position, title, hotelData = null) {
    const google = window.google;
    const map = mapObjRef.current;
    if (!google || !map) return null;

    const marker = new google.maps.Marker({
      position,
      map,
      title,
    });

    markersRef.current.push(marker);

    marker.addListener("click", () => {
      if (infoWindowRef.current) {
        infoWindowRef.current.setContent(
          `<div style="padding:6px 10px;font-size:12px;">${title}</div>`
        );
        infoWindowRef.current.open({ anchor: marker, map });
      }

      if (hotelData?.place_id) {
        fetchHotelDetails(hotelData.place_id);
      }
    });

    return marker;
  }

  // Places Details로 사진/평점/주소/전화/웹사이트/구글URL까지 보강
  function fetchHotelDetails(placeId) {
    const google = window.google;
    const service = placesServiceRef.current;
    if (!google || !service) return;

    service.getDetails(
      {
        placeId,
        fields: [
          "place_id",
          "name",
          "rating",
          "user_ratings_total",
          "formatted_address",
          "geometry",
          "photos",
          "price_level",
          "website",
          "url",
          "formatted_phone_number",
        ],
      },
      (place, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK || !place) return;

        const photoUrl =
          place.photos && place.photos.length > 0
            ? place.photos[0].getUrl({ maxWidth: 900, maxHeight: 600 })
            : null;

        const lat = place.geometry?.location?.lat?.();
        const lng = place.geometry?.location?.lng?.();

        setSelectedHotel({
          place_id: place.place_id,
          place_name: place.name,
          rating: place.rating ?? null,
          user_ratings_total: place.user_ratings_total ?? null,
          address: place.formatted_address ?? "-",
          lat,
          lng,
          photoUrl,
          price_level: place.price_level ?? null,
          estPrice: estimatedPriceFromLevel(place.price_level),
          website: place.website ?? null,
          googleUrl: place.url ?? null,
          phone: place.formatted_phone_number ?? null,
        });
      }
    );
  }

  // 주변 숙소 검색 (Nearby Search: type=lodging)
  function searchHotelsNearby(c) {
    const google = window.google;
    const map = mapObjRef.current;
    const service = placesServiceRef.current;

    if (!google || !map || !service) return;

    setHotels([]);
    setSelectedHotel(null);

    service.nearbySearch(
      {
        location: new google.maps.LatLng(c.lat, c.lng),
        radius,
        type: "lodging",
      },
      (results, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK || !results?.length) {
          setHotels([]);
          return;
        }

        const list = results
          .map((p) => {
            const lat = p.geometry?.location?.lat?.();
            const lng = p.geometry?.location?.lng?.();

            const photoUrl =
              p.photos && p.photos.length > 0
                ? p.photos[0].getUrl({ maxWidth: 600, maxHeight: 400 })
                : null;

            const priceLevel = p.price_level ?? null;

            return {
              place_id: p.place_id,
              place_name: p.name,
              lat,
              lng,
              rating: p.rating ?? null,
              user_ratings_total: p.user_ratings_total ?? null,
              address: p.vicinity ?? "-",
              photoUrl,
              price_level: priceLevel,
              estPrice: estimatedPriceFromLevel(priceLevel),
            };
          })
          .filter((x) => x.lat != null && x.lng != null);

        // 지도 마커 갱신
        clearMarkers();
        addMarker({ lat: c.lat, lng: c.lng }, `📍 ${c.title}`, null);
        list.forEach((h) => addMarker({ lat: h.lat, lng: h.lng }, h.place_name, h));

        setHotels(list);
      }
    );
  }

  // 2) (입력 변경 시) 센터 잡고 주변 숙소 검색
  useEffect(() => {
    if (!mapReady) return;

    const google = window.google;
    const map = mapObjRef.current;
    const geocoder = geocoderRef.current;
    const service = placesServiceRef.current;
    if (!google || !map || !geocoder || !service) return;

    const showCenterAndSearch = (lat, lng, title) => {
      const c = { lat, lng, title };
      setCenter(c);

      map.setCenter({ lat, lng });
      map.setZoom(14);

      searchHotelsNearby(c);
    };

    // 0) 축제 좌표 우선
    if (selectedFestival) {
      const lat = Number(selectedFestival.latitude);
      const lng = Number(selectedFestival.longitude);

      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        showCenterAndSearch(lat, lng, selectedFestival.fstvlNm || query);
        return;
      }
    }

    // 1) 주소 geocode
    geocoder.geocode({ address: query }, (results, status) => {
      if (status === "OK" && results?.length) {
        const loc = results[0].geometry.location;
        showCenterAndSearch(loc.lat(), loc.lng(), query);
        return;
      }

      // 2) fallback: textSearch
      service.textSearch({ query }, (places, status2) => {
        if (status2 === google.maps.places.PlacesServiceStatus.OK && places?.length) {
          const loc = places[0].geometry.location;
          const title = places[0].name || query;
          showCenterAndSearch(loc.lat(), loc.lng(), title);
        } else {
          alert(`"${query}" 위치를 찾지 못했습니다.`);
        }
      });
    });
  }, [mapReady, query, radius, selectedFestival]);

  // 리스트: 거리 계산 + 정렬
  const hotelList = useMemo(() => {
    if (!center) return [];

    const list = hotels.map((h) => {
      const d =
        h.lat != null && h.lng != null
          ? Math.round(haversineMeters(center.lat, center.lng, h.lat, h.lng))
          : Number.MAX_SAFE_INTEGER;
      return { ...h, _distance: d };
    });

    switch (sortType) {
      case "priceAsc":
        return [...list].sort((a, b) => a.estPrice - b.estPrice);
      case "priceDesc":
        return [...list].sort((a, b) => b.estPrice - a.estPrice);
      case "ratingDesc":
        return [...list].sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1));
      case "ratingAsc":
        return [...list].sort((a, b) => (a.rating ?? 999) - (b.rating ?? 999));
      case "distance":
      default:
        return [...list].sort((a, b) => a._distance - b._distance);
    }
  }, [hotels, center, sortType]);

  // 버튼 스타일
  const btnStyle = (type) => ({
    padding: "5px 8px",
    fontSize: 12,
    borderRadius: 6,
    border: "1px solid #ccc",
    background: sortType === type ? "#e3f2fd" : "#fff",
    cursor: "pointer",
  });

  const 기준라벨 = selectedFestival
    ? `축제: ${selectedFestival.fstvlNm} (pSeq: ${selectedFestival.pSeq})`
    : `검색어: ${query}`;

  return (
    <>
      <Header />
      <div
        style={{
          display: "flex",
          gap: 12,
          padding: 12,
          height: "calc(100vh - 64px)",
          boxSizing: "border-box",
        }}
      >
      {/* 왼쪽 리스트 */}
      <div
        style={{
          width: 360,
          border: "1px solid #ddd",
          borderRadius: 8,
          padding: 12,
          height: "100%",
          overflow: "auto",
          boxSizing: "border-box",
        }}
      >
        <h3 style={{ margin: "0 0 8px" }}>주변 숙소 (Google Places)</h3>

        <div style={{ fontSize: 13, marginBottom: 8 }}>
          {기준라벨}
          <br />
          반경: <b>{radius}m</b>
        </div>

        {/* 선택된 숙소 카드 */}
        {selectedHotel && (
          <div
            style={{
              border: "1px solid #dbeafe",
              background: "#f8fbff",
              borderRadius: 10,
              padding: 10,
              marginBottom: 10,
            }}
          >
            <div style={{ fontWeight: 800, marginBottom: 8 }}>선택한 숙소</div>

            <div
              style={{
                width: "100%",
                height: 160,
                borderRadius: 10,
                overflow: "hidden",
                border: "1px solid #eee",
                background: "#f3f4f6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {selectedHotel.photoUrl ? (
                <img
                  src={selectedHotel.photoUrl}
                  alt={selectedHotel.place_name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div style={{ fontSize: 12, color: "#666" }}>사진 없음</div>
              )}
            </div>

            <div style={{ marginTop: 8, fontWeight: 700 }}>{selectedHotel.place_name}</div>

            <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
              {selectedHotel.address || "-"}
            </div>

            <div style={{ fontSize: 12, marginTop: 6 }}>
              ⭐ 평점: <b>{selectedHotel.rating?.toFixed?.(1) ?? "-"}</b>
              {selectedHotel.user_ratings_total != null && (
                <> ({selectedHotel.user_ratings_total}명)</>
              )}
              {"  "}· 💰 가격(단계): <b>{priceLevelLabel(selectedHotel.price_level)}</b>
              {"  "}· (추정): <b>{selectedHotel.estPrice.toLocaleString()}원</b>
            </div>

            {selectedHotel.phone && (
              <div style={{ fontSize: 12, marginTop: 6 }}>☎ {selectedHotel.phone}</div>
            )}

            <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
              {selectedHotel.googleUrl && (
                <a
                  href={selectedHotel.googleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 12,
                    textDecoration: "none",
                    color: "#1a73e8",
                    fontWeight: 700,
                  }}
                >
                  Google 지도에서 보기 →
                </a>
              )}
              {selectedHotel.website && (
                <a
                  href={selectedHotel.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 12,
                    textDecoration: "none",
                    color: "#0f766e",
                    fontWeight: 700,
                  }}
                >
                  공식 웹사이트 →
                </a>
              )}
            </div>
          </div>
        )}

        {/* 정렬 버튼 */}
        <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
          <button style={btnStyle("distance")} onClick={() => setSortType("distance")}>
            거리순
          </button>
          <button style={btnStyle("ratingDesc")} onClick={() => setSortType("ratingDesc")}>
            평점순
          </button>
          <button style={btnStyle("priceAsc")} onClick={() => setSortType("priceAsc")}>
            가격(추정)⬆
          </button>
          <button style={btnStyle("priceDesc")} onClick={() => setSortType("priceDesc")}>
            가격(추정)⬇
          </button>
        </div>

        {hotelList.length === 0 ? (
          <div style={{ fontSize: 13, color: "#666" }}>
            숙소를 불러오는 중이거나 결과가 없습니다.
          </div>
        ) : (
          hotelList.map((h) => (
            <div
              key={h.place_id}
              onClick={() => fetchHotelDetails(h.place_id)}
              style={{
                padding: "10px 8px",
                borderBottom: "1px solid #eee",
                cursor: "pointer",
                borderRadius: 8,
                background: selectedHotel?.place_id === h.place_id ? "#f1f8ff" : "transparent",
              }}
            >
              <div style={{ fontWeight: 700 }}>{h.place_name}</div>

              <div style={{ fontSize: 12, color: "#444", marginTop: 4 }}>
                거리: {(h._distance / 1000).toFixed(2)} km
              </div>

              <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                주소: {h.address || "-"}
              </div>

              <div style={{ fontSize: 12, marginTop: 4 }}>
                ⭐ 평점: <b>{h.rating?.toFixed?.(1) ?? "-"}</b>
                {h.user_ratings_total != null && <> ({h.user_ratings_total}명)</>}
              </div>

              <div style={{ fontSize: 12, marginTop: 4 }}>
                💰 가격(단계): <b>{priceLevelLabel(h.price_level)}</b> · (추정){" "}
                <b>{h.estPrice.toLocaleString()}원</b>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 오른쪽 지도 + 예약 영역 */}
      <div style={{ flex: 1, height: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
        {/* 지도 */}
        <div
          ref={mapDivRef}
          style={{
            flex: 1,
            width: "100%",
            border: "1px solid #ddd",
            borderRadius: 8,
            minHeight: 400,
          }}
        />

        {/* 예약 CTA 영역 */}
        <div
          style={{
            padding: "14px 18px",
            borderRadius: 8,
            border: "1px solid #cce5ff",
            background: "#f5faff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 700 }}>🏨 지금 바로 숙소 예약하기!!</div>

          <a
            href="https://www.agoda.com/ko-kr/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "8px 14px",
              background: "#1a73e8",
              color: "#fff",
              borderRadius: 6,
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            아고다로 이동 →
          </a>
        </div>
      </div>
      </div>
    </>
  );
}
