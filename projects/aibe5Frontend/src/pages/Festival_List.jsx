
import React, { useState, useEffect, useMemo } from "react";
import festivals from "../data/festivals.json";
import Header from "../components/Header";
import { TownCard } from "../components/TownCard";
import { TownDetailModal } from "../components/TownDetailModal";
import { useNavigate } from "react-router-dom";
import Loading from "./Loading";
import "./Festival_List.css";
import useStore from "../store/useStore";

function Festival_List() {
	const [selectedFestival, setSelectedFestival] = useState(null);

	// Calendar에서 가져온 필터 상태
	const [activeFilters, setActiveFilters] = useState({
		regions: [], // 선택된 지역들
		duration: null, // '당일', '단기(2~3일)', '장기(3~5일)'
		isFree: null, // true(무료), false(유료), null(전체)
		includesWeekend: false // 주말 포함 여부
	});
	const [filterSectionsOpen, setFilterSectionsOpen] = useState({
		region: false,
		duration: false,
		price: false,
		weekend: false
	});
	const [isLoading, setIsLoading] = useState(() => {
		// 1/3 확률로 로딩 화면 표시 결정 (초기값으로만 계산)
		return Math.random() < 1/5;
	});
	const navigate = useNavigate();
	const { user, loginUser, likedFestivals, toggleLikeFestival } = useStore();
	const getUserName = () => {
		if (user?.name) return user.name;
		if (loginUser && loginUser !== "google") return loginUser;
		return "회원";
	};

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

	if (isLoading) {
		return <Loading />;
	}

	// Calendar의 고급 필터 로직 적용
	const parseFestivalDate = (festival) => {
		try {
			if (festival.fstvlStartDate) {
				const startDateTime = festival.fstvlStartDate;
				let endDateTime = festival.fstvlEndDate || festival.fstvlStartDate;
				const endDate = new Date(endDateTime);
				endDate.setDate(endDate.getDate() + 1);
				endDateTime = endDate.toISOString().split('T')[0];
				return { startDateTime, endDateTime };
			}
			const dateStr = festival.ministry_date;
			if (!dateStr) return null;
			let match = dateStr.match(/(\d{4})\.\s+(\d{1,2})\.\s+(\d{1,2})\.\s*~\s*(\d{1,2})\.\s+(\d{1,2})\./);
			if (match) {
				const year = parseInt(match[1]);
				const startMonth = parseInt(match[2]);
				const startDay = parseInt(match[3]);
				const endMonth = parseInt(match[4]);
				const endDay = parseInt(match[5]);
				const startDateTime = `${year}-${String(startMonth).padStart(2, '0')}-${String(startDay).padStart(2, '0')}`;
				const endDate = new Date(year, endMonth - 1, endDay);
				endDate.setDate(endDate.getDate() + 1);
				const endDateTime = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
				return { startDateTime, endDateTime };
			}
			match = dateStr.match(/(\d{4})\.\s+(\d{1,2})\.\s+(\d{1,2})\.\s*~\s*(\d{4})\.\s+(\d{1,2})\.\s+(\d{1,2})\./);
			if (match) {
				const startYear = parseInt(match[1]);
				const startMonth = parseInt(match[2]);
				const startDay = parseInt(match[3]);
				const endYear = parseInt(match[4]);
				const endMonth = parseInt(match[5]);
				const endDay = parseInt(match[6]);
				const startDateTime = `${startYear}-${String(startMonth).padStart(2, '0')}-${String(startDay).padStart(2, '0')}`;
				const endDate = new Date(endYear, endMonth - 1, endDay);
				endDate.setDate(endDate.getDate() + 1);
				const endDateTime = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
				return { startDateTime, endDateTime };
			}
			match = dateStr.match(/(\d{4})\.\s+(\d{1,2})\.\s+(\d{1,2})\./);
			if (match) {
				const year = parseInt(match[1]);
				const month = parseInt(match[2]);
				const day = parseInt(match[3]);
				const startDateTime = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
				const endDate = new Date(year, month - 1, day);
				endDate.setDate(endDate.getDate() + 1);
				const endDateTime = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
				return { startDateTime, endDateTime };
			}
			return null;
		} catch {
			return null;
		}
	};

	const filtered = useMemo(() => {
		let filteredFestivals = festivals;
		if (activeFilters.regions.length > 0) {
			filteredFestivals = filteredFestivals.filter(festival => {
				const location = festival.ministry_region || festival.opar || festival.rdnmadr || "";
				const regionMap = {
					'서울': '서울', '부산': '부산', '대구': '대구', '인천': '인천', '광주': '광주', '대전': '대전', '울산': '울산', '세종': '세종', '경기': '경기', '강원': '강원', '충북': '충청북도', '충남': '충청남도', '전북': '전라북도', '전남': '전라남도', '경북': '경상북도', '경남': '경상남도', '제주': '제주'
				};
				return activeFilters.regions.some(region => {
					const fullRegionName = regionMap[region] || region;
					return location.includes(fullRegionName);
				});
			});
		}
		if (activeFilters.duration) {
			filteredFestivals = filteredFestivals.filter(festival => {
				const dateInfo = parseFestivalDate(festival);
				if (!dateInfo) return false;
				const start = new Date(dateInfo.startDateTime);
				const end = new Date(dateInfo.endDateTime);
				const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
				if (activeFilters.duration === '당일') return diffDays <= 1;
				if (activeFilters.duration === '단기(2~3일)') return diffDays >= 2 && diffDays <= 3;
				if (activeFilters.duration === '장기(3~5일)') return diffDays >= 3 && diffDays <= 5;
				return true;
			});
		}
		if (activeFilters.isFree !== null) {
			filteredFestivals = filteredFestivals.filter(festival => {
				const isFree = festival.rdnmadr?.includes('무료') || festival.ministry_description?.includes('무료') || festival.fstvlNm?.includes('무료');
				return activeFilters.isFree ? isFree : !isFree;
			});
		}
		if (activeFilters.includesWeekend) {
			filteredFestivals = filteredFestivals.filter(festival => {
				try {
					const dateInfo = parseFestivalDate(festival);
					if (!dateInfo || !dateInfo.startDateTime || !dateInfo.endDateTime) return false;
					const startStr = String(dateInfo.startDateTime).split('T')[0];
					const endStr = String(dateInfo.endDateTime).split('T')[0];
					if (!/^\d{4}-\d{2}-\d{2}$/.test(startStr) || !/^\d{4}-\d{2}-\d{2}$/.test(endStr)) return false;
					const [startYear, startMonth, startDay] = startStr.split('-').map(Number);
					const [endYear, endMonth, endDay] = endStr.split('-').map(Number);
					const start = new Date(startYear, startMonth - 1, startDay);
					const end = new Date(endYear, endMonth - 1, endDay);
					end.setDate(end.getDate() - 1);
					let current = new Date(start);
					while (current <= end) {
						const day = current.getDay();
						if (day === 0 || day === 6) return true;
						current.setDate(current.getDate() + 1);
					}
					return false;
				} catch {
					return false;
				}
			});
		}
		return filteredFestivals;
	}, [activeFilters]);

	return (
		<div className="bg-background-light text-[#181411] font-display min-h-screen">
			<Header />
			<div className="max-w-[1280px] mx-auto px-6 py-8 grid grid-cols-12 gap-8">
				{/* FILTERS - 새로운 디자인 */}
				<aside className="col-span-12 lg:col-span-3 space-y-6">
					<div className="bg-white rounded-2xl p-6 shadow-sm sticky top-20">
						<h3 className="font-bold text-2xl mb-6" style={{ color: '#FF5F33' }}>Filters</h3>
						<div className="space-y-5">
							{/* KEYWORD 검색 */}
							<div>
								<label className="block text-sm font-bold text-gray-600 mb-2 uppercase tracking-wide">Keyword</label>
								<div className="relative">
									<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">search</span>
									<input
										type="text"
										placeholder="Festival name..."
										className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all outline-none text-gray-700"
									/>
								</div>
							</div>

							{/* REGION 필터 */}
							<div>
								<label className="block text-sm font-bold text-gray-600 mb-2 uppercase tracking-wide">Region</label>
								<div className="relative">
									<select
										className="w-full appearance-none px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all outline-none text-gray-700 bg-white cursor-pointer"
										onChange={(e) => {
											const value = e.target.value;
											setActiveFilters(prev => ({
												...prev,
												regions: value === 'all' ? [] : [value]
											}));
										}}
										value={activeFilters.regions.length === 0 ? 'all' : activeFilters.regions[0]}
									>
										<option value="all">All Regions</option>
										{['서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종', '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'].map(region => (
											<option key={region} value={region}>{region}</option>
										))}
									</select>
									<span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-[20px]">expand_more</span>
								</div>
							</div>

							{/* DATE 필터 */}
							<div>
								<label className="block text-sm font-bold text-gray-600 mb-2 uppercase tracking-wide">Date</label>
								<div className="relative">
									<select
										className="w-full appearance-none px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all outline-none text-gray-700 bg-white cursor-pointer"
										onChange={(e) => {
											const value = e.target.value;
											setActiveFilters(prev => ({
												...prev,
												duration: value === 'all' ? null : value
											}));
										}}
										value={activeFilters.duration || 'all'}
									>
										<option value="all">This Weekend</option>
										<option value="당일">당일</option>
										<option value="단기(2~3일)">단기(2~3일)</option>
										<option value="장기(3~5일)">장기(3~5일)</option>
									</select>
									<span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-[20px]">expand_more</span>
								</div>
							</div>

							{/* 주말 포함 토글 */}
							<div className="pt-2">
								<label className="flex items-center justify-between cursor-pointer group">
									<span className="text-sm font-bold text-gray-600 uppercase tracking-wide">주말 포함</span>
									<div
										className={`relative w-12 h-6 rounded-full transition-colors ${
											activeFilters.includesWeekend ? 'bg-orange-500' : 'bg-gray-200'
										}`}
										onClick={() => setActiveFilters(prev => ({ ...prev, includesWeekend: !prev.includesWeekend }))}
									>
										<div
											className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
												activeFilters.includesWeekend ? 'translate-x-6' : 'translate-x-0'
											}`}
										/>
									</div>
								</label>
							</div>

							{/* 무료/유료 토글 */}
							<div className="pt-2">
								<label className="flex items-center justify-between cursor-pointer group">
									<span className="text-sm font-bold text-gray-600 uppercase tracking-wide">무료만 보기</span>
									<div
										className={`relative w-12 h-6 rounded-full transition-colors ${
											activeFilters.isFree === true ? 'bg-orange-500' : 'bg-gray-200'
										}`}
										onClick={() => setActiveFilters(prev => ({ ...prev, isFree: prev.isFree === true ? null : true }))}
									>
										<div
											className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
												activeFilters.isFree === true ? 'translate-x-6' : 'translate-x-0'
											}`}
										/>
									</div>
								</label>
							</div>
						</div>
					</div>
				</aside>
				<main className="col-span-12 lg:col-span-9 space-y-12">
					{/* 맞춤 추천 */}
					<section className="space-y-6">
						<div className="flex items-center justify-between mb-6">
							<div className="flex items-center gap-3">
								<div className="p-2 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-lg text-white shadow-lg">
									<span className="material-symbols-outlined">auto_awesome</span>
								</div>
								<div>
									  <h2 className="text-2xl font-extrabold" style={{ 
										background: 'linear-gradient(90deg, #FF5F33 0%, #FFB347 100%)',
										WebkitBackgroundClip: 'text',
										WebkitTextFillColor: 'transparent',
										backgroundClip: 'text'
									  }}>AI Customized for {getUserName()}</h2>
									<p className="text-sm text-gray-500">Based on your recent interests and searches</p>
								</div>
							</div>
							<button className="bg-gradient-to-r from-orange-600 via-orange-500 to-yellow-500 hover:from-orange-500 hover:via-orange-400 hover:to-yellow-400 text-white px-6 py-2.5 rounded-full font-bold text-[15px] flex items-center gap-2 shadow-[0_4px_15px_rgba(251,146,60,0.3)] hover:shadow-[0_6px_20px_rgba(251,146,60,0.4)] transition-all transform hover:-translate-y-0.5 active:scale-95"
								onClick={() => navigate("/tastetest")}
							>
								<span className="material-symbols-outlined text-[20px]">auto_awesome</span>
								AI로 선택 축제여행 추천받기
							</button>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{filtered.slice(0, 2).map(f => (
								<TownCard
									key={f.pSeq}
									town={{
										id: f.pSeq,
										name: f.fstvlNm,
										image: f.ministry_image_url,
										description: f.ministry_description
									}}
									onClick={() => setSelectedFestival(f)}
								/>
							))}
							<div className="bg-white rounded-xl overflow-hidden shadow-sm border border-[#e6dfdb] hover:shadow-md transition-shadow group cursor-pointer flex flex-col justify-center items-center p-6 text-center border-dashed min-h-[180px] max-w-[280px] ml-auto mr-12">
								<div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
									<span className="material-symbols-outlined text-gray-400 text-3xl group-hover:text-primary">add</span>
								</div>
								<h4 className="font-bold text-[#181411] text-lg">More Recommendations</h4>
								<p className="text-sm text-gray-500 mt-1">See more personalized picks</p>
							</div>
						</div>
					</section>
					{/* 전체 축제 리스트 */}
					<section className="space-y-6">
						<div className="flex items-center justify-between pb-4 border-b border-gray-100">
							<h2 className="font-bold text-2xl flex items-center gap-2" style={{ color: '#FF5F33' }}>
								All Festivals <span className="text-gray-400 text-lg font-medium">({filtered.length})</span>
							</h2>
							<div className="flex items-center gap-6">
								<div className="flex items-center gap-2">
									<span className="text-sm text-gray-500 whitespace-nowrap">Show:</span>
									<div className="relative">
										<select 
											defaultValue="20"
											className="appearance-none bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-[#181411] pl-3 pr-8 py-1 focus:ring-primary focus:border-primary cursor-pointer hover:bg-gray-100 transition-colors"
										>
											<option value="10">10</option>
											<option value="20">20</option>
											<option value="50">50</option>
										</select>
										<span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-[16px]">expand_more</span>
									</div>
									<span className="text-sm text-gray-500 whitespace-nowrap">per page</span>
								</div>
								<div className="flex items-center gap-4">
									<span className="text-sm text-gray-500">Sorted by:</span>
									<button className="flex items-center gap-1 text-sm font-bold text-[#181411] hover:text-primary transition-colors">
										Date <span className="material-symbols-outlined text-[18px]">expand_more</span>
									</button>
								</div>
							</div>
						</div>
						<div className="flex flex-col gap-6 items-center">
							{filtered.slice(2, 12).length > 0 ? (
								filtered.slice(2, 12).map((f) => (
									<article
										key={f.pSeq}
										className="bg-white rounded-2xl overflow-hidden shadow-soft border border-[#e6dfdb] flex flex-row group hover:shadow-lg transition-shadow duration-300 h-64 w-full max-w-4xl"
										onClick={() => setSelectedFestival(f)}
										style={{ cursor: 'pointer' }}
									>
										<div className="relative w-[360px] shrink-0 overflow-hidden">
											<img
												alt={f.fstvlNm}
												className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
												src={f.ministry_image_url || 'https://via.placeholder.com/360x256?text=No+Image'}
											/>
											{/* 예시: D-day 뱃지 */}
											<div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md text-white text-sm font-bold px-3 py-1 rounded-full border border-white/20">D-5</div>
										</div>
										<div className="p-4 flex flex-col flex-1 relative justify-start">
											<div>
												<div className="flex justify-between items-start mb-1">
													<div className="flex gap-2 mb-1">
														<span className="px-2 py-0.5 text-xs font-bold rounded" style={{ backgroundColor: '#FFF9E6', color: '#D4A017' }}>Spectacular</span>
														<span className="px-2 py-0.5 text-xs font-bold rounded" style={{ backgroundColor: '#E8F5E9', color: '#66BB6A' }}>Night View</span>
													</div>
													<button
														className={`transition-colors bg-gray-50 p-2 rounded-full ${
															likedFestivals.some(fest => fest.pSeq === f.pSeq)
																? "text-red-500"
																: "text-gray-300"
														}`}
														onClick={e => {
															e.stopPropagation();
															toggleLikeFestival(f);
														}}
														aria-label="찜하기"
													>
														<span className="material-symbols-outlined filled">favorite</span>
													</button>
												</div>
												<h3 className="text-2xl font-bold text-[#181411] mb-1 group-hover:text-primary transition-colors">{f.fstvlNm}</h3>
												<p className="text-gray-500 line-clamp-2 mb-2 leading-relaxed">{f.ministry_description || 'No description available.'}</p>
												<div className="flex gap-4 mt-1">
													<div className="flex items-center gap-2 text-sm text-gray-700">
														<span className="material-symbols-outlined text-primary text-[20px]">calendar_today</span>
														<span className="font-medium">{f.fstvlStartDate || 'Date TBA'}</span>
													</div>
													<div className="flex items-center gap-2 text-sm text-gray-700">
														<span className="material-symbols-outlined text-primary text-[20px]">location_on</span>
														<span>{f.ministry_region || 'Location TBA'}</span>
													</div>
												</div>
											</div>
											<div className="flex items-center justify-end pt-2 border-t border-gray-100 mt-2">
												<button
													className="text-white font-bold text-sm px-6 py-2 rounded-lg shadow-sm hover:shadow-md transition-all"
													style={{ background: 'linear-gradient(135deg, #FF8C42 0%, #FF6B35 100%)', border: 'none' }}
												>
													View Details
												</button>
											</div>
										</div>
									</article>
								))
							) : (
								<div className="text-center text-gray-400 py-12 text-lg font-semibold w-full">
									표시할 축제가 없습니다.
									(데이터가 없거나, 필터 조건에 맞는 축제가 없습니다.)
								</div>
							)}
						</div>
					</section>
				</main>
			</div>
			{/* 상세 모달 */}
			{selectedFestival && (
				<TownDetailModal festival={selectedFestival} onClose={() => setSelectedFestival(null)} />
			)}
		</div>
	);
}

export default Festival_List;
