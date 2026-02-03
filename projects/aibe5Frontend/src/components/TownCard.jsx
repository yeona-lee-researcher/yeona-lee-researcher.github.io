import { useState } from 'react';
import useStore from '../store/useStore';

export function TownCard({ town, festival, onClick, onMainEventSelect }) {
  const [isHovered, setIsHovered] = useState(false);
  const { likedFestivals, toggleLikeFestival } = useStore();
  
  // festival prop이 없으면 town에서 필요한 데이터를 생성
  const festivalData = festival || {
    pSeq: town.id,
    festival_name: town.name,
    image_url: town.image,
    festival_description: town.description,
  };

  const isLiked = likedFestivals.some(f => f.pSeq === festivalData.pSeq);

  // 좋아요 버튼 클릭 시 부모 onClick이 실행되지 않도록 stopPropagation 사용
  const handleLikeClick = (e) => {
    e.stopPropagation();
    toggleLikeFestival(festivalData);
    if (onMainEventSelect) {
      onMainEventSelect(festivalData);
    }
  };

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="
        group w-full text-left
        rounded-2xl bg-white
        shadow-sm hover:shadow-md
        transition-all
        overflow-hidden
        relative
        cursor-pointer
      "
      style={isHovered ? {
        boxShadow: '0 0 0 4px #FFA500, 0 0 0 8px #FFD700',
        borderRadius: '1rem',
        transition: 'box-shadow 0.3s',
      } : { margin: 0, border: 'none' }}
    >
      {/* 이미지 영역 */}
      <div className="aspect-4/3 overflow-hidden relative">
        <img
          src={town.image}
          alt={town.name}
          className="
            h-full w-full object-cover
            transition-transform duration-500 ease-out
            group-hover:scale-110
          "
        />
        
        {/* 하트 아이콘 */}
        <button
          onClick={handleLikeClick}
          className="
            absolute top-3 right-3
            p-2.5 rounded-full
            bg-white/90 hover:bg-white
            shadow-lg hover:shadow-xl
            transition-all
            z-10
          "
        >
          {isLiked ? (
            <svg className="w-6 h-6 fill-red-500" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 fill-none stroke-gray-600 stroke-2" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          )}
        </button>
      </div>

      {/* 텍스트 영역 */}
      <div className="p-5">
        <h3 className="text-lg font-semibold line-clamp-1">
          {town.name}
        </h3>
        <p className="mt-1 text-sm text-gray-600 line-clamp-2">
          {town.description}
        </p>
      </div>
    </div>
  );
}
