import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import Header from "../components/Header";
import useStore from "../store/useStore";

// ✅ 캘린더 스타일
const calendarStyles = `
  .custom-calendar .fc {
    font-family: 'Plus Jakarta Sans','Segoe UI',sans-serif;
    border: none;
  }
  
  .custom-calendar .fc-theme-standard td {
    border: 1px solid #e5e7eb !important;
  }
  
  .custom-calendar .fc-theme-standard th {
    border: 1px solid #e5e7eb !important;
  }
  
  .custom-calendar .fc-col-header-cell {
    background: transparent !important;
    font-weight: 700 !important;
    text-transform: uppercase !important;
    font-size: 0.875rem !important;
    letter-spacing: 0.2em !important;
    color: #9ca3af !important;
    padding: 1rem 0 !important;
    border-bottom: none !important;
  }
  
  .custom-calendar .fc-daygrid-day-number {
    font-weight: 500 !important;
    font-size: 2rem !important;
    color: #111827 !important;
    padding: 0 !important;
    width: 100% !important;
    height: 100% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }
  
  .custom-calendar .fc-daygrid-day-frame {
    min-height: 100px !important;
    aspect-ratio: 1 / 1;
  }
  
  .custom-calendar .fc-day-today {
    background: transparent !important;
  }
  
  .custom-calendar .fc-day-today .fc-daygrid-day-number {
    background: transparent !important;
  }
  
  .custom-calendar .fc-daygrid-day-top {
    width: 100%;
    height: 100%;
    justify-content: center;
  }
  
  .custom-calendar .fc-scrollgrid {
    border: none !important;
  }
  
  .custom-calendar .fc-daygrid-body {
    border-top: 1px solid #e5e7eb !important;
  }
  
  .custom-calendar .fc-toolbar {
    display: none !important;
  }
  
  .custom-calendar .fc-view-harness {
    background: white;
  }

  .custom-calendar .fc-daygrid-day.selected-range {
    background: transparent !important;
  }

  .custom-calendar .fc-daygrid-day.selected-range .fc-daygrid-day-number {
    position: relative;
    font-weight: 700 !important;
    color: #F97316 !important;
  }

  .custom-calendar .fc-daygrid-day.selected-range .fc-daygrid-day-number::before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 30%;
    height: 40%;
    background: rgba(249, 115, 22, 0.15);
    z-index: -1;
  }

  .custom-calendar .fc-daygrid-day.selected-start .fc-daygrid-day-number::before {
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
  }

  .custom-calendar .fc-daygrid-day.selected-end .fc-daygrid-day-number::before {
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
  }

  .custom-calendar .fc-highlight {
    background: rgba(249, 115, 22, 0.15) !important;
  }

  .custom-calendar .festival-label {
    position: absolute;
    bottom: 10%;
    left: 50%;
    transform: translateX(-50%);
    white-space: nowrap;
    font-size: 0.75rem;
    font-weight: 700;
    color: #F97316;
    background: white;
    padding: 2px 8px;
    border-radius: 99px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    z-index: 2;
  }
`;

function Dateregistration() {
  const navigate = useNavigate();
  const calendarRef = useRef(null);
  const setSelectedTravelDates = useStore((state) => state.setSelectedTravelDates);
  const addTrip = useStore((state) => state.addTrip);
  const updateTrip = useStore((state) => state.updateTrip);
  const setCurrentTrip = useStore((state) => state.setCurrentTrip);
  const editingTripId = useStore((state) => state.editingTripId);
  const setEditingTripId = useStore((state) => state.setEditingTripId);
  const trips = useStore((state) => state.trips);

  // 편집 중인 trip 가져오기
  const editingTrip = editingTripId ? trips.find(trip => trip.id === editingTripId) : null;

  // 초기값 설정
  const [selectedDates, setSelectedDates] = useState(
    editingTrip ? {
      start: editingTrip.start,
      end: editingTrip.end,
      display: editingTrip.display
    } : null
  );
  const [tripName, setTripName] = useState(editingTrip?.name || "");
  const [selectedRegion, setSelectedRegion] = useState(editingTrip?.region || "서울");
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // 날짜 선택 핸들러
  const handleDateSelect = (selectInfo) => {
    // 이전 FullCalendar 선택 해제
    selectInfo.view.calendar.unselect();
    
    // FullCalendar의 날짜 문자열 직접 사용 (타임존 이슈 방지)
    const startStr = selectInfo.startStr; // YYYY-MM-DD
    const endStr = selectInfo.endStr;     // YYYY-MM-DD (exclusive, 다음날)
    
    // end는 exclusive이므로 -1일 계산
    const [year, month, day] = endStr.split('-').map(Number);
    const endDate = new Date(year, month - 1, day);
    endDate.setDate(endDate.getDate() - 1);
    
    const actualEndStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
    
    // 표시용 포맷 (YYYY.MM.DD)
    const displayStart = startStr.replace(/-/g, '.');
    const displayEnd = actualEndStr.replace(/-/g, '.');

    const dateData = {
      start: startStr,
      end: actualEndStr,
      display: `${displayStart} ~ ${displayEnd}`
    };
    
    setSelectedDates(dateData);
    setSelectedTravelDates(dateData); // Zustand store에 저장

    // 선택 영역 스타일 적용
    applySelectionStyles(startStr, actualEndStr);
  };

  // 선택된 날짜 범위에 스타일 적용
  const applySelectionStyles = (startStr, endStr) => {
    // 기존 스타일 제거
    document.querySelectorAll('.fc-daygrid-day').forEach(cell => {
      cell.classList.remove('selected-range', 'selected-start', 'selected-end');
    });

    // 새로운 스타일 적용 (날짜 문자열 기반)
    const [startYear, startMonth, startDay] = startStr.split('-').map(Number);
    const [endYear, endMonth, endDay] = endStr.split('-').map(Number);
    
    const startDate = new Date(startYear, startMonth - 1, startDay);
    const endDate = new Date(endYear, endMonth - 1, endDay);
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      const cell = document.querySelector(`[data-date="${dateStr}"]`);
      
      if (cell) {
        cell.classList.add('selected-range');
        
        if (currentDate.getTime() === startDate.getTime()) {
          cell.classList.add('selected-start');
        }
        if (currentDate.getTime() === endDate.getTime()) {
          cell.classList.add('selected-end');
        }
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
  };

  // 편집 모드에서 캘린더에 선택 상태 표시
  useEffect(() => {
    if (editingTrip && selectedDates) {
      setTimeout(() => {
        applySelectionStyles(selectedDates.start, selectedDates.end);
      }, 100);
    }
  }, [editingTrip]);

  // 캘린더 렌더링 후 스타일 재적용
  useEffect(() => {
    if (selectedDates) {
      applySelectionStyles(selectedDates.start, selectedDates.end);
    }
  }, [selectedDates]);

  // 이전/다음 달로 이동
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const formatMonthYear = (date) => {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <style>{calendarStyles}</style>
      
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 p-8 bg-white dark:bg-gray-900 flex flex-col min-h-0">
        <div className="max-w-[1440px] mx-auto w-full flex-1 flex flex-col min-h-0">
          {/* Header Section */}
          <section className="flex items-center justify-between mb-8 shrink-0">
            <div className="flex-1">
              <h2 className="text-gray-900 dark:text-white text-3xl font-bold leading-tight tracking-tight">
                {editingTripId ? '여행일정 수정' : '여행일정 등록'}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-base font-normal mt-1">
                일정에 따른 날씨예보, 여행 정보를 알려드립니다.
              </p>
              
              {/* 여행 이름 입력 */}
              <div className="mt-4 flex items-center gap-3">
                <input 
                  type="text"
                  value={tripName}
                  onChange={(e) => setTripName(e.target.value)}
                  placeholder="여행 이름을 입력하세요 (예: 보성여행길라잡이)"
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg text-base focus:outline-none focus:border-orange-500 transition-colors flex-1 max-w-md"
                />
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg text-base focus:outline-none focus:border-orange-500 transition-colors bg-white"
                >
                  <option value="서울">서울</option>
                  <option value="부산">부산</option>
                  <option value="대구">대구</option>
                  <option value="인천">인천</option>
                  <option value="광주">광주</option>
                  <option value="대전">대전</option>
                  <option value="강릉">강릉</option>
                  <option value="제주">제주</option>
                </select>
              </div>
            </div>
            <button 
              onClick={() => {
                if (!selectedDates || !tripName) return; // 비활성화 상태일 때 클릭 무시
                
                if (editingTripId) {
                  // 편집 모드: 기존 trip 업데이트
                  updateTrip(editingTripId, {
                    name: tripName,
                    region: selectedRegion,
                    start: selectedDates.start,
                    end: selectedDates.end,
                    display: selectedDates.display,
                    updatedAt: new Date().toISOString()
                  });
                  setSelectedTravelDates(selectedDates);
                  setEditingTripId(null); // 편집 모드 해제
                  navigate('/plancuration');
                } else {
                  // 새 일정 추가 모드
                  const newTrip = {
                    id: Date.now(),
                    name: tripName,
                    region: selectedRegion,
                    start: selectedDates.start,
                    end: selectedDates.end,
                    display: selectedDates.display,
                    createdAt: new Date().toISOString()
                  };
                  addTrip(newTrip);
                  setCurrentTrip(newTrip.id);
                  setSelectedTravelDates(selectedDates);
                  navigate('/plancuration');
                }
              }}
              disabled={!selectedDates || !tripName}
              className={`px-8 py-3 rounded-xl font-bold text-base shadow-lg transition-all flex items-center gap-2 ${
                selectedDates && tripName
                  ? 'bg-gradient-to-r from-orange-500 to-orange-400 text-white hover:shadow-orange-200/50 cursor-pointer'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <span>
                {selectedDates ? selectedDates.display : '날짜를 선택하세요'} / {editingTripId ? '수정완료' : '등록완료'}
              </span>
              <span className="material-symbols-outlined text-lg">check_circle</span>
            </button>
          </section>

          {/* Calendar Scroll Container */}
          <div className="overflow-y-auto pr-4 flex-1">
            {/* Calendar Navigation */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <button
                  onClick={goToPreviousMonth}
                  className="p-2 rounded-full hover:bg-gray-100 transition-all"
                >
                  <span className="material-symbols-outlined text-2xl text-gray-700">chevron_left</span>
                </button>
                <h3 className="text-2xl font-bold text-primary dark:text-primary">{formatMonthYear(currentMonth)}</h3>
                <button
                  onClick={goToNextMonth}
                  className="p-2 rounded-full hover:bg-gray-100 transition-all"
                >
                  <span className="material-symbols-outlined text-2xl text-gray-700">chevron_right</span>
                </button>
              </div>
              <div className="custom-calendar">
                <FullCalendar
                  ref={calendarRef}
                  plugins={[dayGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  initialDate={currentMonth}
                  headerToolbar={false}
                  height="auto"
                  dayMaxEvents={false}
                  fixedWeekCount={false}
                  showNonCurrentDates={false}
                  selectable={true}
                  selectMirror={true}
                  select={handleDateSelect}
                  unselectAuto={false}
                  dayCellClassNames="cursor-pointer"
                  locale="ko"
                  dayHeaderFormat={{ weekday: 'short' }}
                  key={currentMonth.toISOString()}
                />
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dateregistration;
