import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GoogleMap from './GoogleMap';
import Dateregistration from '@/pages/Dateregistration';

export function TownDetailModal({ festival, onClose }) {
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const Dast = () => {
    navigate('../dateregistration');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 모달 본체 */}
      <div className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-2xl flex flex-col">
        {/* 헤더 이미지 */}
        <div className="relative h-80 overflow-hidden bg-gray-200 flex-shrink-0">
          <img
            src={festival.ministry_image_url}
            alt={festival.fstvlNm}
            className="h-full w-full object-cover"
          />
          {/* 그라디언트 오버레이 */}
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
          {/* 닫기 버튼 */}
          <button
            onClick={onClose}
            className="absolute right-6 top-6 z-20 rounded-full bg-white/90 p-2 hover:bg-white transition-all"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {/* 축제 이름 오버레이 */}
          <div className="absolute bottom-6 left-6 right-6">
            <span className="inline-block px-4 py-2 rounded-full bg-orange-500/90 text-white text-sm font-bold mb-3">
              {festival.personality || "축제"}
            </span>
            <h2 className="text-4xl font-black text-white leading-tight">
              {festival.fstvlNm}
            </h2>
          </div>
        </div>

        {/* 내용 영역 - 스크롤 가능 */}
        <div className="overflow-y-auto flex-1 p-8">
          {/* 기본 정보 그리드 */}
          <div className="grid grid-cols-2 gap-6 mb-8 pb-8 border-b border-gray-100">
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">📅 기간</p>
              <p className="text-lg font-bold text-gray-900">
                {festival.fstvlStartDate} ~ {festival.fstvlEndDate}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">📍 지역</p>
              <p className="text-lg font-bold text-gray-900">{festival.ministry_region}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">📌 장소</p>
              <p className="text-lg font-bold text-gray-900">{festival.rdnmadr || festival.lnmadr || festival.ministry_location || '장소 정보 없음'}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">💰 입장료</p>
              <p className="text-lg font-bold text-orange-500">{festival.ministry_fee}</p>
            </div>
          </div>

          {/* 축제 설명 */}
          <div className="mb-8">
            <h3 className="text-xl font-black text-gray-900 mb-4">축제 소개</h3>
            <p className="text-gray-700 leading-relaxed text-base">
              {festival.ministry_description}
            </p>
          </div>

          {/* 위치 지도 */}
          <GoogleMap
            latitude={festival.latitude}
            longitude={festival.longitude}
            rdnmadr={festival.rdnmadr}
            lnmadr={festival.lnmadr}
            apiKey={import.meta.env.VITE_GOOGLE_MAPS_KEY}
          />

          {/* 주최처 정보 */}
          {festival.ministry_institution && (
            <div className="mb-8 bg-linear-to-r from-orange-50 to-yellow-50 p-6 rounded-2xl border border-orange-100">
              <p className="text-sm font-semibold text-gray-600 mb-2">주최 · 주관</p>
              <p className="font-bold text-gray-900">{festival.ministry_institution}</p>
            </div>
          )}

          {/* 액션 버튼 */}
          <div className="flex gap-4">
            {festival.ministry_site && (
              <a
                href={festival.ministry_site}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-xl bg-linear-to-r from-orange-500 to-yellow-500 px-6 py-3 font-bold text-white hover:shadow-lg transition-shadow text-center"
              >
                공식 웹사이트 →
              </a>
            )}
            <button
              className="flex-1 rounded-xl border-2 border-gray-300 px-3 py-3 font-bold text-gray-900 hover:border-gray-400 transition-colors order-2"
              onClick={onClose}
            >
              닫기
            </button>
            {/* 일정 생성하기 버튼: 더 진한 주황+금색 그라데이션 */}
            <button
              className="w-1/2 rounded-xl bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-300 px-3 py-3 font-bold text-white shadow-md hover:from-orange-600 hover:to-yellow-400 transition-all order-1"
              onClick={Dast}
            >
              일정 생성하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
