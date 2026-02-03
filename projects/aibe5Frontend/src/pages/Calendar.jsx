import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import festivals from "../data/festivals.json";
import useStore from "../store/useStore";
import Header from "../components/Header";
import { TownCard } from "../components/TownCard";
import { TownDetailModal } from "../components/TownDetailModal";
import Loading from "./Loading";

// ✅ FullCalendar 이벤트 텍스트 중앙정렬 및 스타일 개선
const calendarStyles = `
  .fc {
    font-family: 'Pretendard','Noto Sans KR','Apple SD Gothic Neo','Malgun Gothic','Segoe UI',sans-serif;
  }
  
  .fc-event-title {
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    font-weight: 600;
  }
  
  .fc-daygrid-event {
    padding: 4px 8px !important;
    border-radius: 8px !important;
    border: 1px solid rgba(255, 255, 255, 0.4) !important;
    position: relative !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12), 
                0 2px 4px rgba(0, 0, 0, 0.08),
                inset 0 1px 0 rgba(255, 255, 255, 0.5),
                inset 0 -1px 0 rgba(0, 0, 0, 0.1) !important;
    transition: all 0.3s ease !important;
  }
  
  .fc-daygrid-event::before {
    content: '' !important;
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    background: linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 100%) !important;
    border-radius: 7px !important;
    pointer-events: none !important;
  }
  
  .fc-daygrid-event:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18), 
                0 3px 8px rgba(0, 0, 0, 0.12),
                inset 0 1px 0 rgba(255, 255, 255, 0.6),
                inset 0 -1px 0 rgba(0, 0, 0, 0.15) !important;
  }
  
  .fc-col-header-cell {
    background: #f9fafb !important;
    font-weight: 700 !important;
    text-transform: uppercase !important;
    font-size: 11px !important;
    letter-spacing: 0.5px !important;
    color: #6b7280 !important;
    padding: 12px 0 !important;
  }
  
  .fc-daygrid-day-number {
    font-weight: 600 !important;
    color: #111827 !important;
    padding: 8px !important;
  }
  
  .fc-day-today {
    background: rgba(244,133,37,0.05) !important;
  }
  
  .fc-day-today .fc-daygrid-day-number {
    background: rgb(244,133,37) !important;
    color: white !important;
    border-radius: 50% !important;
    width: 32px !important;
    height: 32px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }
  
  .fc-button {
    background: linear-gradient(90deg, rgb(244,133,37) 0%, rgb(255,153,102) 100%) !important;
    border: none !important;
    border-radius: 8px !important;
    padding: 8px 16px !important;
    font-weight: 700 !important;
    text-transform: capitalize !important;
    transition: all 0.2s ease !important;
  }
  
  .fc-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(244,133,37,0.3) !important;
  }
  
  .fc-button-active {
    background: linear-gradient(90deg, rgb(230,120,30) 0%, rgb(240,140,90) 100%) !important;
  }
`;

// ✅ 화면에 캘린더(월/주) 항상 표시
// ✅ 로그인 후 구글 캘린더 일정 불러오기
// ✅ 날짜/드래그 선택 → 일정 추가 → Google Calendar에 실제로 insert

function Calendar() {
  const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const CALENDAR_ID = import.meta.env.VITE_GOOGLE_CALENDAR_ID || "primary";

  // ✅ 일정 추가하려면 readonly 말고 write scope 필요
  // 가장 무난: calendar.events (이벤트 CRUD)
  const SCOPES = "https://www.googleapis.com/auth/calendar.events";

  // ✅ zustand store로 Google 토큰과 축제 pSeq 관리
  const { googleAccessToken, setGoogleAccessToken, selectedFestivalPSeq, clearSelectedFestivalPSeq, savedCalendarFestivals, toggleCalendarFestival, likedFestivals } = useStore();
  
  const [token, setToken] = useState(googleAccessToken);
  const [tokenClient, setTokenClient] = useState(null);
  const [error, setError] = useState("");
  const [events, setEvents] = useState([]); // FullCalendar용 이벤트 배열
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(() => {
    // 1/3 확률로 로딩 화면 표시 결정 (초기값으로만 계산)
    return Math.random() < 1/5;
  });

  // 오른쪽 "Upcoming" 패널용 원본(구글 이벤트)
  // const [rawEvents, setRawEvents] = useState([]); // ✅ 이제 likedFestivals를 사용하므로 제거

  // ✅ 모달 상태 관리
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" | "edit" | "delete"
  const [formData, setFormData] = useState({
    id: null,
    title: "",
    description: "",
    startDateTime: "",
    endDateTime: "",
    allDay: false,
  });

  // ✅ 축제 pSeq 입력 상태
  const [festivalPSeq, setFestivalPSeq] = useState("");
  const [showFestivalInput, setShowFestivalInput] = useState(false);

  // ✅ 축제 추가 여부 추적 (중복 방지)
  const festivalAddedRef = useRef(false);

  // ✅ 뷰 전환: 'calendar' | 'saved'
  const [activeView, setActiveView] = useState('calendar');

  // ✅ 축제 상세정보 모달
  const [selectedFestival, setSelectedFestival] = useState(null);
  const [festivalDetailOpen, setFestivalDetailOpen] = useState(false);

  // ✅ FullCalendar ref
  const calendarRef = useRef(null); // My Festival Calendar용
  const festivalCalendarRef = useRef(null); // Festival Calendar용
  const [currentView, setCurrentView] = useState("dayGridMonth");
  const [currentTitle, setCurrentTitle] = useState("");
  const [festivalCurrentTitle, setFestivalCurrentTitle] = useState("");

  // ✅ 필터 상태
  const [activeFilters, setActiveFilters] = useState({
    regions: [], // 선택된 지역들
    duration: null, // '당일', '단기(2~3일)', '장기(3~5일)'
    isFree: null, // true(무료), false(유료), null(전체)
    includesWeekend: false // 주말 포함 여부
  });

  // 필터 섹션 열림/닫힘 상태
  const [filterSectionsOpen, setFilterSectionsOpen] = useState({
    region: false,
    duration: false,
    price: false,
    weekend: false
  });

  // ✅ 로딩 타이머 (페이지 진입 시 1/3 확률로 2~4초 대기)
  useEffect(() => {
    if (isLoading) {
      const randomDelay = 2000 + Math.random() * 2000;
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, randomDelay);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // ---------- GIS init ----------
  useEffect(() => {
    setError("");

    // ✅ zustand store에서 토큰 가져오기
    if (googleAccessToken) {
      setToken(googleAccessToken);
    }

    if (!CLIENT_ID) {
      setError("VITE_GOOGLE_CLIENT_ID가 없습니다. (.env 확인)");
      return;
    }

    if (!window.google?.accounts?.oauth2) {
      setError("Google Identity Services 로딩이 아직 안 됐습니다. (index.html 스크립트 확인)");
      return;
    }

    const tc = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (resp) => {
        if (resp?.access_token) {
          setToken(resp.access_token);
          setGoogleAccessToken(resp.access_token);
        } else {
          setError("토큰 발급에 실패했습니다.");
        }
      },
    });

    setTokenClient(tc);
  }, [CLIENT_ID, googleAccessToken, setGoogleAccessToken]);

  // ✅ 토큰이 없을 때 자동으로 Google 로그인 요청
  useEffect(() => {
    if (!token && tokenClient && !loading) {
      // 페이지 로드 후 0.5초 뒤에 자동으로 로그인 요청
      const timer = setTimeout(() => {
        tokenClient.requestAccessToken({ prompt: "" });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [token, tokenClient, loading]);

  // ---------- helpers ----------
  // const fmtK = (iso) => { // ✅ 이제 사용하지 않음
  //   try {
  //     const d = new Date(iso);
  //     return d.toLocaleString("ko-KR", { month: "short", day: "2-digit" });
  //   } catch {
  //     return "";
  //   }
  // };

  // ✅ 축제 날짜 파싱 함수 - fstvlStartDate와 fstvlEndDate 사용
  const parseFestivalDate = (festival) => {
    try {
      // fstvlStartDate와 fstvlEndDate가 있으면 직접 사용
      if (festival.fstvlStartDate) {
        const startDateTime = festival.fstvlStartDate; // 이미 "YYYY-MM-DD" 형식
        let endDateTime = festival.fstvlEndDate || festival.fstvlStartDate;
        
        // ✅ FullCalendar allDay 이벤트는 end가 exclusive이므로 +1일 필요
        const endDate = new Date(endDateTime);
        endDate.setDate(endDate.getDate() + 1);
        endDateTime = endDate.toISOString().split('T')[0];
        
        return { startDateTime, endDateTime };
      }

      // 없으면 ministry_date 파싱 (fallback)
      const dateStr = festival.ministry_date;
      if (!dateStr) return null;

      // 패턴 1: "2026. 1. 16. ~ 1. 18." (같은 연도)
      let match = dateStr.match(/(\d{4})\.\s+(\d{1,2})\.\s+(\d{1,2})\.\s*~\s*(\d{1,2})\.\s+(\d{1,2})\./);
      if (match) {
        const year = parseInt(match[1]);
        const startMonth = parseInt(match[2]);
        const startDay = parseInt(match[3]);
        const endMonth = parseInt(match[4]);
        const endDay = parseInt(match[5]);

        const startDateTime = `${year}-${String(startMonth).padStart(2, '0')}-${String(startDay).padStart(2, '0')}`;
        
        // ✅ FullCalendar allDay 이벤트는 end가 exclusive이므로 +1일 필요
        const endDate = new Date(year, endMonth - 1, endDay);
        endDate.setDate(endDate.getDate() + 1);
        const endDateTime = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;

        return { startDateTime, endDateTime };
      }

      // 패턴 2: "2025. 11. 29. ~ 2026. 1. 18." (연도가 바뀌는 경우)
      match = dateStr.match(/(\d{4})\.\s+(\d{1,2})\.\s+(\d{1,2})\.\s*~\s*(\d{4})\.\s+(\d{1,2})\.\s+(\d{1,2})\./);
      if (match) {
        const startYear = parseInt(match[1]);
        const startMonth = parseInt(match[2]);
        const startDay = parseInt(match[3]);
        const endYear = parseInt(match[4]);
        const endMonth = parseInt(match[5]);
        const endDay = parseInt(match[6]);

        const startDateTime = `${startYear}-${String(startMonth).padStart(2, '0')}-${String(startDay).padStart(2, '0')}`;
        
        // ✅ FullCalendar allDay 이벤트는 end가 exclusive이므로 +1일 필요
        const endDate = new Date(endYear, endMonth - 1, endDay);
        endDate.setDate(endDate.getDate() + 1);
        const endDateTime = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;

        return { startDateTime, endDateTime };
      }

      // 패턴 3: "2026. 1. 16." (단일 날짜)
      match = dateStr.match(/(\d{4})\.\s+(\d{1,2})\.\s+(\d{1,2})\./);
      if (match) {
        const year = parseInt(match[1]);
        const month = parseInt(match[2]);
        const day = parseInt(match[3]);

        const startDateTime = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        // ✅ FullCalendar allDay 이벤트는 end가 exclusive이므로 +1일 필요
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

  // ✅ pSeq로 축제 정보 로드 및 모달 오픈
  const loadFestivalAndOpen = (pSeq) => {
    const festival = festivals.find((f) => String(f.pSeq) === String(pSeq));
    if (!festival) {
      alert("축제를 찾을 수 없습니다.");
      return;
    }

    const dateInfo = parseFestivalDate(festival);
    if (!dateInfo) {
      alert("축제 날짜를 파싱할 수 없습니다.");
      return;
    }

    setFormData({
      id: null,
      title: festival.fstvlNm,
      description: festival.ministry_description,
      startDateTime: dateInfo.startDateTime,
      endDateTime: dateInfo.endDateTime,
      allDay: true,
    });
    setModalMode("add");
    setModalOpen(true);
    setFestivalPSeq("");
    setShowFestivalInput(false);
  };

  // ---------- load events from Google ----------
  const fetchEvents = async (timeMinISO, timeMaxISO) => {
    if (!token) return;

    setLoading(true);
    setError("");
    try {
      const url =
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events` +
        `?timeMin=${encodeURIComponent(timeMinISO)}` +
        `&timeMax=${encodeURIComponent(timeMaxISO)}` +
        `&singleEvents=true&orderBy=startTime&maxResults=250` +
        `&fields=items(id,summary,description,start,end)`; // ✅ description 포함

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        // ✅ 401 에러인 경우 토큰이 만료되었으므로 재로그인 필요
        if (res.status === 401) {
          setError("Google 로그인이 만료되었습니다. 다시 로그인해주세요.");
          setToken(null);
          setGoogleAccessToken(null);
          // 자동으로 재로그인 요청
          if (tokenClient) {
            setTimeout(() => {
              tokenClient.requestAccessToken({ prompt: "" });
            }, 1000);
          }
          return;
        }
        
        const text = await res.text();
        throw new Error(`events.list 실패 (${res.status}): ${text}`);
      }

      const data = await res.json();
      const items = data.items || [];
      // setRawEvents(items); // ✅ 이제 likedFestivals를 사용하므로 필요없음

      // FullCalendar 형식으로 변환
      const fc = items.map((ev) => ({
        id: ev.id,
        title: ev.summary || "(제목 없음)",
        start: ev.start?.dateTime || ev.start?.date,
        end: ev.end?.dateTime || ev.end?.date,
        allDay: !!ev.start?.date, // 종일 이벤트면 date만 옴
        extendedProps: {
          description: ev.description || "", // ✅ description을 extendedProps에 저장
        },
      }));
      setEvents(fc);
    } catch (e) {
      console.error(e);
      setError("캘린더 이벤트를 불러오지 못했습니다. (콘솔 확인)");
    } finally {
      setLoading(false);
    }
  };

  // ---------- insert event to Google ----------
  const insertEvent = async ({ title, description, start, end, allDay }) => {
    if (!token) {
      setError("먼저 Google 로그인을 해주세요.");
      return;
    }

    setError("");
    try {
      // ✅ allDay 이벤트의 경우 end 날짜에 1일 추가 (Google Calendar API는 end date가 exclusive)
      let endDate = end;
      if (allDay && end) {
        const endDateObj = new Date(end);
        endDateObj.setDate(endDateObj.getDate() + 1);
        endDate = endDateObj.toISOString().split("T")[0];
      }

      const body = {
        summary: title,
        description: description || undefined,
        start: allDay
          ? { date: start.slice(0, 10) }
          : { dateTime: new Date(start).toISOString() },
        end: allDay
          ? { date: endDate }
          : { dateTime: new Date(end).toISOString() },
      };

      const res = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      if (!res.ok) {
        if (res.status === 401) {
          setError("Google 로그인이 만료되었습니다. 다시 로그인해주세요.");
          setToken(null);
          setGoogleAccessToken(null);
          if (tokenClient) {
            setTimeout(() => {
              tokenClient.requestAccessToken({ prompt: "" });
            }, 1000);
          }
          return;
        }
        const text = await res.text();
        throw new Error(`events.insert 실패 (${res.status}): ${text}`);
      }

      // 추가 후 현재 뷰 범위 다시 로드가 가장 확실
      // (FullCalendar가 제공하는 info.view.currentStart/end를 이용하려면 ref 쓰면 되는데,
      //  여기서는 간단하게 "이번달 전후" 다시 로드)
      const now = new Date();
      const timeMin = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const timeMax = new Date(now.getFullYear(), now.getMonth() + 2, 0).toISOString();
      await fetchEvents(timeMin, timeMax);
    } catch (e) {
      console.error(e);
      setError("일정 추가에 실패했습니다. (권한/스코프/캘린더ID 확인)");
    }
  };

  // ---------- update event in Google ----------
  const updateEvent = async (eventId, { title, description, start, end, allDay }) => {
    if (!token) {
      setError("먼저 Google 로그인을 해주세요.");
      return;
    }

    setError("");
    try {
      // ✅ 먼저 기존 이벤트 조회
      const getRes = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events/${encodeURIComponent(eventId)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!getRes.ok) {
        if (getRes.status === 401) {
          setError("Google 로그인이 만료되었습니다. 다시 로그인해주세요.");
          setToken(null);
          setGoogleAccessToken(null);
          if (tokenClient) {
            setTimeout(() => {
              tokenClient.requestAccessToken({ prompt: "" });
            }, 1000);
          }
          return;
        }
        throw new Error(`이벤트 조회 실패 (${getRes.status})`);
      }

      const existingEvent = await getRes.json();

      // ✅ 필드 업데이트
      // ✅ allDay 이벤트의 경우 end 날짜에 1일 추가
      let endDate = end;
      if (allDay && end) {
        const endDateObj = new Date(end);
        endDateObj.setDate(endDateObj.getDate() + 1);
        endDate = endDateObj.toISOString().split("T")[0];
      }

      const body = {
        ...existingEvent,
        summary: title,
        description: description || undefined,
        start: allDay
          ? { date: start.slice(0, 10) }
          : { dateTime: new Date(start).toISOString() },
        end: allDay
          ? { date: endDate }
          : { dateTime: new Date(end).toISOString() },
      };

      const updateRes = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events/${encodeURIComponent(eventId)}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      if (!updateRes.ok) {
        if (updateRes.status === 401) {
          setError("Google 로그인이 만료되었습니다. 다시 로그인해주세요.");
          setToken(null);
          setGoogleAccessToken(null);
          if (tokenClient) {
            setTimeout(() => {
              tokenClient.requestAccessToken({ prompt: "" });
            }, 1000);
          }
          return;
        }
        const text = await updateRes.text();
        throw new Error(`events.update 실패 (${updateRes.status}): ${text}`);
      }

      // 다시 로드
      const now = new Date();
      const timeMin = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const timeMax = new Date(now.getFullYear(), now.getMonth() + 2, 0).toISOString();
      await fetchEvents(timeMin, timeMax);
    } catch (e) {
      console.error(e);
      setError("일정 수정에 실패했습니다.");
    }
  };

  // ---------- delete event from Google ----------
  const deleteEvent = async (eventId) => {
    if (!token) {
      setError("먼저 Google 로그인을 해주세요.");
      return;
    }

    if (!window.confirm("정말로 이 일정을 삭제하시겠습니까?")) {
      return;
    }

    setError("");
    try {
      const res = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events/${encodeURIComponent(eventId)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        if (res.status === 401) {
          setError("Google 로그인이 만료되었습니다. 다시 로그인해주세요.");
          setToken(null);
          setGoogleAccessToken(null);
          if (tokenClient) {
            setTimeout(() => {
              tokenClient.requestAccessToken({ prompt: "" });
            }, 1000);
          }
          return;
        }
        const text = await res.text();
        throw new Error(`events.delete 실패 (${res.status}): ${text}`);
      }

      // 다시 로드
      const now = new Date();
      const timeMin = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const timeMax = new Date(now.getFullYear(), now.getMonth() + 2, 0).toISOString();
      await fetchEvents(timeMin, timeMax);
    } catch (e) {
      console.error(e);
      setError("일정 삭제에 실패했습니다.");
    }
  };

  // ---------- auth ----------
  const _signIn = () => {
    setError("");
    if (!tokenClient) {
      setError("로그인 준비가 아직 안 됐습니다. 잠시 후 다시 시도하세요.");
      return;
    }
    tokenClient.requestAccessToken({ prompt: "" });
  };

  const _signOut = () => {
    setToken(null);
    setEvents([]);
    // setRawEvents([]); // ✅ 이제 likedFestivals를 사용하므로 필요없음
  };

  // ✅ pSeq로 축제 정보 로드 및 바로 캘린더에 추가 (모달 없이)
  const loadFestivalAndAdd = useCallback(async (pSeq) => {
    if (!token) return;
    
    const festival = festivals.find((f) => String(f.pSeq) === String(pSeq));
    if (!festival) return;

    const dateInfo = parseFestivalDate(festival);
    if (!dateInfo) return;

    // 바로 Google Calendar에 추가
    await insertEvent({
      title: festival.fstvlNm,
      description: festival.ministry_description,
      start: dateInfo.startDateTime,
      end: dateInfo.endDateTime,
      allDay: true,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ✅ 홈에서 선택한 축제 자동 추가 (한 번만 실행)
  useEffect(() => {
    if (selectedFestivalPSeq && token && !festivalAddedRef.current) {
      festivalAddedRef.current = true;
      setTimeout(() => {
        loadFestivalAndAdd(selectedFestivalPSeq);
        clearSelectedFestivalPSeq();
      }, 1000);
    }
  }, [selectedFestivalPSeq, token, clearSelectedFestivalPSeq, loadFestivalAndAdd]);

  // ---------- upcoming (right panel) ----------
  // ✅ 이제 likedFestivals를 사용하므로 제거됨

  // ✅ 축제 데이터를 FullCalendar 이벤트로 변환
  const festivalEvents = useMemo(() => {
    let filteredFestivals = festivals;

    // 지역 필터
    if (activeFilters.regions.length > 0) {
      filteredFestivals = filteredFestivals.filter(festival => {
        const location = festival.ministry_region || festival.opar || festival.rdnmadr || "";
        return activeFilters.regions.some(region => {
          // 축약형 지역명을 전체 이름으로 매핑
          const regionMap = {
            '서울': '서울',
            '부산': '부산',
            '대구': '대구',
            '인천': '인천',
            '광주': '광주',
            '대전': '대전',
            '울산': '울산',
            '세종': '세종',
            '경기': '경기',
            '강원': '강원',
            '충북': '충청북도',
            '충남': '충청남도',
            '전북': '전라북도',
            '전남': '전라남도',
            '경북': '경상북도',
            '경남': '경상남도',
            '제주': '제주'
          };
          
          const fullRegionName = regionMap[region] || region;
          return location.includes(fullRegionName);
        });
      });
    }

    // 기간 필터
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

    // 유료/무료 필터
    if (activeFilters.isFree !== null) {
      filteredFestivals = filteredFestivals.filter(festival => {
        const isFree = festival.rdnmadr?.includes('무료') || 
                      festival.ministry_description?.includes('무료') ||
                      festival.fstvlNm?.includes('무료');
        return activeFilters.isFree ? isFree : !isFree;
      });
    }

    // 주말 포함 필터
    if (activeFilters.includesWeekend) {
      filteredFestivals = filteredFestivals.filter(festival => {
        try {
          const dateInfo = parseFestivalDate(festival);
          if (!dateInfo || !dateInfo.startDateTime || !dateInfo.endDateTime) return false;
          
          // 문자열로 확실하게 변환
          const startStr = String(dateInfo.startDateTime).split('T')[0];
          const endStr = String(dateInfo.endDateTime).split('T')[0];
          
          // YYYY-MM-DD 형식인지 확인
          if (!/^\d{4}-\d{2}-\d{2}$/.test(startStr) || !/^\d{4}-\d{2}-\d{2}$/.test(endStr)) {
            return false;
          }
          
          // YYYY-MM-DD 형식을 로컬 시간대로 정확하게 파싱
          const [startYear, startMonth, startDay] = startStr.split('-').map(Number);
          const [endYear, endMonth, endDay] = endStr.split('-').map(Number);
          
          const start = new Date(startYear, startMonth - 1, startDay);
          // ✅ endDateTime은 이미 +1일 되어있으므로 실제 종료일은 -1일
          const end = new Date(endYear, endMonth - 1, endDay);
          end.setDate(end.getDate() - 1);
          
          // 기간 중 토요일(6) 또는 일요일(0)이 포함되어 있는지 확인
          let current = new Date(start);
          while (current <= end) {
            const day = current.getDay();
            if (day === 0 || day === 6) {
              return true; // 주말 포함
            }
            current.setDate(current.getDate() + 1);
          }
          
          return false; // 주말 미포함
        } catch (error) {
          console.error('주말 필터 에러:', festival.fstvlNm, error);
          return false;
        }
      });
    }

    const colors = [
      { bg: '#f48525', border: '#f48525' }, // 주황색
      { bg: '#60a5fa', border: '#60a5fa' }, // 하늘색
      { bg: '#84cc16', border: '#84cc16' }  // 연두색
    ];
    
    return filteredFestivals.map((festival, index) => {
      const dateInfo = parseFestivalDate(festival);
      if (!dateInfo) return null;
      
      const colorIndex = index % colors.length;
      const color = colors[colorIndex];
      
      return {
        id: `festival-${festival.pSeq}`,
        title: festival.fstvlNm,
        start: dateInfo.startDateTime,
        end: dateInfo.endDateTime,
        allDay: true,
        backgroundColor: color.bg,
        borderColor: color.border,
        extendedProps: {
          festival: festival
        }
      };
    }).filter(Boolean);
  }, [activeFilters]);

  // ✅ 저장된 축제를 FullCalendar 이벤트로 변환 (Saved Festivals 뷰용)
  // ✅ 주말 필터도 같이 적용
  // ✅ Saved Festivals 뷰의 이벤트: likedFestivals를 캘린더에 표시
  const savedFestivalEvents = useMemo(() => {
    if (!likedFestivals || likedFestivals.length === 0) {
      return [];
    }

    let filteredSaved = [...likedFestivals];

    // 주말 포함 필터 적용
    if (activeFilters.includesWeekend) {
      filteredSaved = filteredSaved.filter(festival => {
        try {
          const dateInfo = parseFestivalDate(festival);
          if (!dateInfo || !dateInfo.startDateTime || !dateInfo.endDateTime) return false;
          
          const startStr = String(dateInfo.startDateTime).split('T')[0];
          const endStr = String(dateInfo.endDateTime).split('T')[0];
          
          if (!/^\d{4}-\d{2}-\d{2}$/.test(startStr) || !/^\d{4}-\d{2}-\d{2}$/.test(endStr)) {
            return false;
          }
          
          const [startYear, startMonth, startDay] = startStr.split('-').map(Number);
          const [endYear, endMonth, endDay] = endStr.split('-').map(Number);
          
          const start = new Date(startYear, startMonth - 1, startDay);
          // ✅ endDateTime은 이미 +1일 되어있으므로 실제 종료일은 -1일
          const end = new Date(endYear, endMonth - 1, endDay);
          end.setDate(end.getDate() - 1);
          
          let current = new Date(start);
          while (current <= end) {
            const day = current.getDay();
            if (day === 0 || day === 6) {
              return true;
            }
            current.setDate(current.getDate() + 1);
          }
          
          return false;
        } catch {
          return false;
        }
      });
    }

    const colors = [
      { bg: '#f48525', border: '#f48525' }, // 주황색
      { bg: '#60a5fa', border: '#60a5fa' }, // 하늘색
      { bg: '#84cc16', border: '#84cc16' }  // 연두색
    ];
    
    return filteredSaved.map((festival, index) => {
      const dateInfo = parseFestivalDate(festival);
      if (!dateInfo) return null;
      
      const colorIndex = index % colors.length;
      const color = colors[colorIndex];
      
      return {
        id: `liked-${festival.pSeq}`,
        title: `❤️ ${festival.fstvlNm || festival.festival_name}`,
        start: dateInfo.startDateTime,
        end: dateInfo.endDateTime,
        allDay: true,
        backgroundColor: color.bg,
        borderColor: color.border,
        extendedProps: {
          festival: festival
        }
      };
    }).filter(Boolean);
  }, [likedFestivals, activeFilters.includesWeekend]);

  // ---------- styles (기존 유지) ----------
  const styles = {
    container: { display: "flex", flexDirection: "column", minHeight: "calc(100vh - 64px)", background: "#f9fafb", fontFamily: "'Plus Jakarta Sans','Segoe UI',sans-serif" },
    header: { height: 60, background: "#fff", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", marginBottom: 0 },
    sidebar: { position: "absolute", left: 0, top: 124, width: 380, height: "calc(100vh - 124px)", background: "#fff", borderRight: "1px solid #e5e7eb", padding: 28, overflowY: "auto" },
    main: { marginLeft: 390, marginTop: 0, flex: 1, display: "flex", gap: 20, padding: "20px 20px 20px 10px", maxWidth: "100%" },
    calendarCard: { flex: 1, background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden", display: "flex", flexDirection: "column" },
    calendarTopBar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #e5e7eb", background: "#fff" },
    calendarBody: { padding: 16, overflowY: "auto", height: "calc(100vh - 120px)" },
    rightPanel: { width: 340, background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflowY: "auto" },
    sidebarSection: { marginBottom: 24 },
    sidebarTitle: { fontSize: 16, fontWeight: 700, color: "#111827", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 16 },
    sidebarItem: { fontSize: 15, color: "#374151", padding: "10px 16px", borderRadius: 6, marginBottom: 8, cursor: "pointer", background: "transparent", border: "none", textAlign: "left", width: "100%" },
    sidebarItemActive: { background: "rgb(244,133,37)", color: "#fff", fontWeight: 600 },
    btn: { padding: "10px 12px", background: "linear-gradient(90deg, rgb(244,133,37) 0%, rgb(255,153,102) 100%)", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" },
    btnGhost: { padding: "10px 12px", background: "#fff", color: "#111", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" },
    errorBox: { margin: "12px 16px", padding: "10px 12px", borderRadius: 8, background: "#fff1f2", color: "#9f1239", border: "1px solid #fecdd3", fontSize: 13 },
    eventCard: { marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #e5e7eb" },
    eventImage: { width: "100%", height: 160, borderRadius: 8, background: "#f3f4f6", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 },
    note: { fontSize: 12, color: "#6b7280" },
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <Header />
      <div style={styles.container}>
        <style>{calendarStyles}</style>
        {/* 서브 헤더 - 캘린더 타이틀 */}
        <div style={styles.header}>
          <div style={{ fontSize: 18, fontWeight: 600, color: "rgb(244,133,37)" }}>
            {activeView === 'calendar' ? 'Discovery Calendar' : 'Saved Festivals'}
          </div>
        </div>

      {/* ✅ 축제 pSeq 입력 패널 */}
      {showFestivalInput && token && (
        <div style={{
          position: "fixed",
          top: 70,
          right: 20,
          background: "#fff",
          borderRadius: 12,
          padding: 16,
          boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
          zIndex: 500,
          minWidth: 300,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: "#111827" }}>
            🎪 축제 pSeq 입력
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              value={festivalPSeq}
              onChange={(e) => setFestivalPSeq(e.target.value)}
              placeholder="축제 pSeq 입력"
              style={{
                flex: 1,
                padding: "10px 12px",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                fontSize: 13,
                outline: "none",
              }}
              onKeyPress={(e) => {
                if (e.key === "Enter" && festivalPSeq.trim()) {
                  loadFestivalAndOpen(festivalPSeq);
                }
              }}
            />
            <button
              onClick={() => {
                if (festivalPSeq.trim()) {
                  loadFestivalAndOpen(festivalPSeq);
                }
              }}
              style={{
                ...styles.btn,
                padding: "10px 16px",
              }}
            >
              추가
            </button>
          </div>
        </div>
      )}

      {/* 사이드바 */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarSection}>
          <button
            style={{
              fontFamily: 'Pretendard, sans-serif',
              width: '100%',
              padding: '16px 0 16px 20px',
              borderRadius: 12,
              border: 'none',
              background: activeView === 'calendar' ? 'linear-gradient(90deg, #ff9800 0%, #ffb74d 100%)' : '#fff',
              color: activeView === 'calendar' ? '#fff' : '#1a3556',
              fontSize: 18,
              fontWeight: 900,
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              boxShadow: activeView === 'calendar' ? '0 4px 16px rgba(255, 168, 0, 0.13)' : 'none',
              marginBottom: 8,
              letterSpacing: '0.01em',
              borderBottom: activeView === 'calendar' ? 'none' : '1.5px solid #f3f3f3',
              transition: 'all 0.2s',
            }}
            onClick={() => setActiveView('calendar')}
          >
            <span style={{fontSize:22, marginRight:6, display:'flex', alignItems:'center'}}>
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="3" fill={activeView === 'calendar' ? '#fff' : 'none'} stroke={activeView === 'calendar' ? '#fff' : '#1a3556'} strokeWidth="1.5"/><rect x="7" y="2" width="2" height="4" rx="1" fill={activeView === 'calendar' ? '#fff' : '#1a3556'} /><rect x="15" y="2" width="2" height="4" rx="1" fill={activeView === 'calendar' ? '#fff' : '#1a3556'} /></svg>
            </span>
            Discovery Calendar
          </button>
        </div>
        <div style={styles.sidebarSection}>
          <button
            style={{
              fontFamily: 'Pretendard, sans-serif',
              width: '100%',
              padding: '16px 0 16px 20px',
              borderRadius: 12,
              border: 'none',
              background: activeView === 'saved' ? 'linear-gradient(90deg, #ff9800 0%, #ffb74d 100%)' : '#fff',
              color: activeView === 'saved' ? '#fff' : '#1a3556',
              fontSize: 18,
              fontWeight: 700,
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              boxShadow: activeView === 'saved' ? '0 4px 16px rgba(255, 168, 0, 0.13)' : 'none',
              marginBottom: 8,
              letterSpacing: '0.01em',
              borderBottom: activeView === 'saved' ? 'none' : '1.5px solid #f3f3f3',
              transition: 'all 0.2s',
            }}
            onClick={() => setActiveView('saved')}
          >
            <span style={{fontSize:22, marginRight:6, display:'flex', alignItems:'center'}}>
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke={activeView === 'saved' ? '#fff' : '#1a3556'} strokeWidth="1.5" fill="none"/></svg>
            </span>
            Saved Festivals
          </button>
        </div>
        <div style={{...styles.sidebarSection, marginTop: 32}}>
          <div style={{ 
            fontFamily: 'Pretendard, sans-serif',
            fontSize: 15,
            fontWeight: 900,
            color: '#4b5563',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            marginBottom: 18,
            paddingLeft: 4,
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            <span style={{fontSize:20}}>🔎</span> FILTER SEARCH
          </div>
          
          {/* 지역 필터 */}
          <div style={{ marginBottom: 16 }}>
            <button 
              style={{ 
                fontFamily: 'Pretendard, sans-serif',
                width: '100%',
                padding: '16px 20px',
                borderRadius: 16,
                border: 'none',
                background: filterSectionsOpen.region 
                  ? 'linear-gradient(135deg, #ff9800 0%, #ffd600 100%)' 
                  : 'linear-gradient(135deg, #fff8e1 0%, #fff3cd 100%)',
                color: filterSectionsOpen.region ? '#fff' : '#1f2937',
                fontSize: 17,
                fontWeight: 800,
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: filterSectionsOpen.region 
                  ? '0 4px 16px rgba(255, 168, 0, 0.18)' 
                  : '0 2px 8px rgba(0,0,0,0.04)',
                transition: 'all 0.3s cubic-bezier(.4,2,.6,1)',
                transform: filterSectionsOpen.region ? 'translateY(-2px) scale(1.01)' : 'translateY(0) scale(1)',
                marginBottom: 2
              }}
              onClick={() => setFilterSectionsOpen(prev => ({ ...prev, region: !prev.region }))}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20 }}>📍</span>
                <span style={{letterSpacing:'1.2px'}}>지역</span>
                {activeFilters.regions.length > 0 && (
                  <span style={{ 
                    background: filterSectionsOpen.region ? 'rgba(255,255,255,0.3)' : '#fff8e1',
                    color: filterSectionsOpen.region ? '#fff' : '#ff9800',
                    padding: '2px 10px',
                    borderRadius: 14,
                    fontSize: 12,
                    fontWeight: 800,
                    marginLeft: 6
                  }}>
                    {activeFilters.regions.length}
                  </span>
                )}
              </span>
              <span style={{ fontSize: 13, opacity: 0.7, fontWeight: 700 }}>
                {filterSectionsOpen.region ? '▲' : '▼'}
              </span>
            </button>
            {filterSectionsOpen.region && (
              <div style={{ 
                marginTop: 8,
                padding: '14px',
                background: 'linear-gradient(135deg, #fffde4 0%, #fff8e1 100%)',
                borderRadius: 16,
                border: '1.5px solid #ffe0b2',
                maxHeight: 240,
                overflowY: 'auto',
                scrollbarWidth: 'thin',
                scrollbarColor: '#ffe082 #fffde4'
              }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {['서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종', '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'].map(region => (
                    <button
                      key={region}
                      onClick={() => {
                        setActiveFilters(prev => ({
                          ...prev,
                          regions: prev.regions.includes(region)
                            ? prev.regions.filter(r => r !== region)
                            : [...prev.regions, region]
                        }));
                      }}
                      style={{
                        fontFamily: 'Pretendard, sans-serif',
                        padding: '11px 18px',
                        border: 'none',
                        borderRadius: 10,
                        background: activeFilters.regions.includes(region) ? 'linear-gradient(135deg, #ff9800 0%, #ffd600 100%)' : '#fff',
                        color: activeFilters.regions.includes(region) ? '#fff' : '#4b5563',
                        fontSize: 15,
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: activeFilters.regions.includes(region) 
                          ? '0 2px 8px rgba(255, 168, 0, 0.18)' 
                          : '0 1px 3px rgba(0,0,0,0.07)'
                      }}
                      onMouseEnter={(e) => {
                        if (!activeFilters.regions.includes(region)) {
                          e.target.style.backgroundColor = '#fef3e8';
                          e.target.style.transform = 'translateY(-1px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!activeFilters.regions.includes(region)) {
                          e.target.style.backgroundColor = 'white';
                          e.target.style.transform = 'translateY(0)';
                        }
                      }}
                    >
                      {region}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 기간 필터 */}
          <div style={{ marginBottom: 16 }}>
            <button 
              style={{ 
                width: '100%',
                padding: '16px 20px',
                borderRadius: 10,
                border: 'none',
                background: filterSectionsOpen.duration 
                  ? 'linear-gradient(135deg, #60a5fa 0%, #93c5fd 100%)' 
                  : 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                color: filterSectionsOpen.duration ? '#fff' : '#1f2937',
                fontSize: 17,
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: filterSectionsOpen.duration 
                  ? '0 4px 12px rgba(96, 165, 250, 0.3)' 
                  : '0 2px 6px rgba(0,0,0,0.06)',
                transition: 'all 0.3s ease',
                transform: filterSectionsOpen.duration ? 'translateY(-2px)' : 'translateY(0)'
              }}
              onClick={() => setFilterSectionsOpen(prev => ({ ...prev, duration: !prev.duration }))}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>⏱️</span>
                기간
                {activeFilters.duration && (
                  <span style={{ 
                    background: filterSectionsOpen.duration ? 'rgba(255,255,255,0.3)' : '#eff6ff',
                    color: filterSectionsOpen.duration ? '#fff' : '#60a5fa',
                    padding: '2px 8px',
                    borderRadius: 12,
                    fontSize: 11,
                    fontWeight: 700
                  }}>
                    ✓
                  </span>
                )}
              </span>
              <span style={{ fontSize: 12, opacity: 0.7 }}>
                {filterSectionsOpen.duration ? '▲' : '▼'}
              </span>
            </button>
            {filterSectionsOpen.duration && (
              <div style={{ 
                marginTop: 8,
                padding: '8px',
                backgroundColor: '#f9fafb',
                borderRadius: 10,
                border: '1px solid #e5e7eb'
              }}>
                {['당일', '단기(2~3일)', '장기(3~5일)'].map(duration => (
                  <button
                    key={duration}
                    onClick={() => {
                      setActiveFilters(prev => ({
                        ...prev,
                        duration: prev.duration === duration ? null : duration
                      }));
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      padding: '10px 12px',
                      margin: '4px 0',
                      border: 'none',
                      borderRadius: 8,
                      backgroundColor: activeFilters.duration === duration ? '#60a5fa' : 'white',
                      color: activeFilters.duration === duration ? 'white' : '#4b5563',
                      fontSize: 15,
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s',
                      boxShadow: activeFilters.duration === duration 
                        ? '0 2px 6px rgba(96, 165, 250, 0.3)' 
                        : '0 1px 2px rgba(0,0,0,0.05)'
                    }}
                    onMouseEnter={(e) => {
                      if (activeFilters.duration !== duration) {
                        e.target.style.backgroundColor = '#eff6ff';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeFilters.duration !== duration) {
                        e.target.style.backgroundColor = 'white';
                      }
                    }}
                  >
                    {duration}
                    {activeFilters.duration === duration && <span>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 유료/무료 필터 */}
          <div style={{ marginBottom: 16 }}>
            <button 
              style={{ 
                width: '100%',
                padding: '16px 20px',
                borderRadius: 10,
                border: 'none',
                background: filterSectionsOpen.price 
                  ? 'linear-gradient(135deg, #84cc16 0%, #a3e635 100%)' 
                  : 'linear-gradient(135deg, #f7fee7 0%, #ecfccb 100%)',
                color: filterSectionsOpen.price ? '#fff' : '#1f2937',
                fontSize: 17,
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: filterSectionsOpen.price 
                  ? '0 4px 12px rgba(132, 204, 22, 0.3)' 
                  : '0 2px 6px rgba(0,0,0,0.06)',
                transition: 'all 0.3s ease',
                transform: filterSectionsOpen.price ? 'translateY(-2px)' : 'translateY(0)'
              }}
              onClick={() => setFilterSectionsOpen(prev => ({ ...prev, price: !prev.price }))}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>💰</span>
                가격
                {activeFilters.isFree !== null && (
                  <span style={{ 
                    background: filterSectionsOpen.price ? 'rgba(255,255,255,0.3)' : '#f7fee7',
                    color: filterSectionsOpen.price ? '#fff' : '#84cc16',
                    padding: '2px 8px',
                    borderRadius: 12,
                    fontSize: 11,
                    fontWeight: 700
                  }}>
                    {activeFilters.isFree ? '무료' : '유료'}
                  </span>
                )}
              </span>
              <span style={{ fontSize: 12, opacity: 0.7 }}>
                {filterSectionsOpen.price ? '▲' : '▼'}
              </span>
            </button>
            {filterSectionsOpen.price && (
              <div style={{ 
                marginTop: 8,
                padding: '8px',
                backgroundColor: '#f9fafb',
                borderRadius: 10,
                border: '1px solid #e5e7eb'
              }}>
                {[{ label: '무료', value: true }, { label: '유료', value: false }].map(({ label, value }) => (
                  <button
                    key={label}
                    onClick={() => {
                      setActiveFilters(prev => ({
                        ...prev,
                        isFree: prev.isFree === value ? null : value
                      }));
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      padding: '10px 12px',
                      margin: '4px 0',
                      border: 'none',
                      borderRadius: 8,
                      backgroundColor: activeFilters.isFree === value ? '#84cc16' : 'white',
                      color: activeFilters.isFree === value ? 'white' : '#4b5563',
                      fontSize: 15,
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s',
                      boxShadow: activeFilters.isFree === value 
                        ? '0 2px 6px rgba(132, 204, 22, 0.3)' 
                        : '0 1px 2px rgba(0,0,0,0.05)'
                    }}
                    onMouseEnter={(e) => {
                      if (activeFilters.isFree !== value) {
                        e.target.style.backgroundColor = '#f7fee7';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeFilters.isFree !== value) {
                        e.target.style.backgroundColor = 'white';
                      }
                    }}
                  >
                    {label}
                    {activeFilters.isFree === value && <span>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 주말 포함 필터 */}
          <button 
            style={{ 
              fontFamily: 'Pretendard, sans-serif',
              width: '100%',
              padding: '16px 20px',
              borderRadius: 16,
              border: 'none',
              background: activeFilters.includesWeekend 
                ? 'linear-gradient(135deg, #a78bfa 0%, #c4b5fd 100%)' 
                : 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
              color: activeFilters.includesWeekend ? '#fff' : '#1f2937',
              fontSize: 17,
              fontWeight: 800,
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: activeFilters.includesWeekend 
                ? '0 4px 16px rgba(167, 139, 250, 0.18)' 
                : '0 2px 8px rgba(0,0,0,0.04)',
              transition: 'all 0.3s cubic-bezier(.4,2,.6,1)',
              transform: activeFilters.includesWeekend ? 'translateY(-2px) scale(1.01)' : 'translateY(0) scale(1)',
              marginBottom: 2
            }}
            onClick={() => {
              setActiveFilters(prev => {
                const newState = { ...prev, includesWeekend: !prev.includesWeekend };
                return newState;
              });
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>📅</span>
              주말 포함
            </span>
            <span style={{ 
              background: activeFilters.includesWeekend ? 'rgba(255,255,255,0.3)' : 'transparent',
              padding: '2px 8px',
              borderRadius: 12,
              fontSize: 16
            }}>
              {activeFilters.includesWeekend ? '✓' : ''}
            </span>
          </button>
        </div>
      </div>

      {/* 메인 */}
      <div style={styles.main}>
        {activeView === 'calendar' ? (
          /* ✅ Festival Calendar 뷰 - 좌측 캘린더 + 우측 선택된 축제 카드 */
          <>
            <div style={{ ...styles.calendarCard, flex: 1 }}>
          {/* 커스텀 상단 헤더 */}
          <div style={{ padding: '32px 24px 24px', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 32, fontWeight: 700, color: '#111', margin: 0, marginBottom: 8 }}>
                  {festivalCurrentTitle || 'October 2024'}
                </h2>
                <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>
                  Discover the vibrant autumn spirit of Korea.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button 
                  onClick={() => {
                    const calendarApi = festivalCalendarRef.current?.getApi();
                    if (calendarApi) calendarApi.prev();
                  }}
                  style={{
                    width: 32,
                    height: 32,
                    border: '1px solid #e5e7eb',
                    backgroundColor: '#fff',
                    borderRadius: 6,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                  }}>
                  <span style={{
                    width: 8,
                    height: 8,
                    borderLeft: '2px solid #374151',
                    borderBottom: '2px solid #374151',
                    transform: 'rotate(45deg)',
                    marginLeft: 2
                  }}></span>
                </button>
                <button 
                  onClick={() => {
                    const calendarApi = festivalCalendarRef.current?.getApi();
                    if (calendarApi) calendarApi.next();
                  }}
                  style={{
                  width: 32,
                  height: 32,
                  border: '1px solid #e5e7eb',
                  backgroundColor: '#fff',
                  borderRadius: 6,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}>
                  <span style={{
                    width: 8,
                    height: 8,
                    borderRight: '2px solid #374151',
                    borderTop: '2px solid #374151',
                    transform: 'rotate(45deg)',
                    marginRight: 2
                  }}></span>
                </button>
              </div>
            </div>
          </div>

          <div style={styles.calendarBody}>
            <FullCalendar
              ref={festivalCalendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              height="100%"
              selectable={false}
              editable={false}
              events={festivalEvents}
              headerToolbar={false}
              datesSet={() => {
                const calendarApi = festivalCalendarRef.current?.getApi();
                if (calendarApi) {
                  setFestivalCurrentTitle(calendarApi.view.title);
                }
              }}
              viewDidMount={(info) => {
                setFestivalCurrentTitle(info.view.title);
              }}
              eventClick={(info) => {
                const festival = info.event.extendedProps?.festival;
                if (festival) {
                  setSelectedFestival(festival);
                  // ✅ 모달 열지 않고 우측 카드에만 표시
                }
              }}
            />
          </div>
            </div>

            {/* Festival Calendar: Selected Festival 우측 패널 */}
            <div style={styles.rightPanel}>
              <div style={styles.sidebarSection}>
                <div style={styles.sidebarTitle}>Selected Festival</div>
                
                {selectedFestival ? (
                  <div>
                    <TownCard 
                      town={{
                        id: selectedFestival.pSeq,
                        name: selectedFestival.fstvlNm,
                        image: selectedFestival.ministry_image_url || '/placeholder-festival.jpg',
                        description: selectedFestival.festival_description || selectedFestival.ministry_description || '축제 정보'
                      }}
                      festival={selectedFestival}
                      onClick={() => setFestivalDetailOpen(true)}
                    />
                  </div>
                ) : (
                  <p style={{
                    fontSize: 13,
                    color: '#6b7280',
                    textAlign: 'center',
                    padding: '40px 0',
                    lineHeight: 1.6
                  }}>
                    캘린더에서 축제를 클릭하면<br/>여기에 표시됩니다
                  </p>
                )}
              </div>
            </div>
          </>
        ) : (
          /* ✅ Saved Festivals 뷰 */
          <>
            <div style={styles.calendarCard}>
          {/* 커스텀 상단 헤더 */}
          <div style={{ padding: '32px 24px 24px', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 32, fontWeight: 700, color: '#111', margin: 0, marginBottom: 8 }}>
                  {currentTitle || 'January 2026'}
                </h2>
                <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>
                  {token ? "날짜를 선택해서 일정을 추가하고 관리하세요" : "로그인하면 일정 추가/수정/삭제가 됩니다."}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ display: 'flex', backgroundColor: '#f3f4f6', borderRadius: 8, padding: 4 }}>
                  <button 
                    onClick={() => {
                      const calendarApi = calendarRef.current?.getApi();
                      if (calendarApi) {
                        calendarApi.changeView('dayGridMonth');
                        setCurrentView('dayGridMonth');
                      }
                    }}
                    style={{
                      padding: '6px 16px',
                      border: 'none',
                      backgroundColor: currentView === 'dayGridMonth' ? '#fff' : 'transparent',
                      color: currentView === 'dayGridMonth' ? '#111' : '#6b7280',
                      borderRadius: 6,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      boxShadow: currentView === 'dayGridMonth' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                    }}>
                    Month
                  </button>
                  <button 
                    onClick={() => {
                      const calendarApi = calendarRef.current?.getApi();
                      if (calendarApi) {
                        calendarApi.changeView('timeGridWeek');
                        setCurrentView('timeGridWeek');
                      }
                    }}
                    style={{
                      padding: '6px 16px',
                      border: 'none',
                      backgroundColor: currentView === 'timeGridWeek' ? '#fff' : 'transparent',
                      color: currentView === 'timeGridWeek' ? '#111' : '#6b7280',
                      borderRadius: 6,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      boxShadow: currentView === 'timeGridWeek' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                    }}>
                    Week
                  </button>
                </div>
                <button 
                  onClick={() => {
                    const calendarApi = calendarRef.current?.getApi();
                    if (calendarApi) calendarApi.prev();
                  }}
                  style={{
                    width: 32,
                    height: 32,
                    border: '1px solid #e5e7eb',
                    backgroundColor: '#fff',
                    borderRadius: 6,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16
                  }}>
                  ‹
                </button>
                <button 
                  onClick={() => {
                    const calendarApi = calendarRef.current?.getApi();
                    if (calendarApi) calendarApi.next();
                  }}
                  style={{
                    width: 32,
                    height: 32,
                    border: '1px solid #e5e7eb',
                    backgroundColor: '#fff',
                    borderRadius: 6,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16
                  }}>
                  ›
                </button>
              </div>
            </div>
          </div>

          {error ? <div style={styles.errorBox}>{error}</div> : null}

          <div style={styles.calendarBody}>
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              height="100%"
              selectable={!!token}
              editable={!!token}
              events={[...events, ...savedFestivalEvents]}
              headerToolbar={false}
              datesSet={(info) => {
                if (!token) return;
                fetchEvents(info.start.toISOString(), info.end.toISOString());
                // 타이틀 업데이트
                const calendarApi = calendarRef.current?.getApi();
                if (calendarApi) {
                  setCurrentTitle(calendarApi.view.title);
                }
              }}
              viewDidMount={(info) => {
                setCurrentTitle(info.view.title);
                setCurrentView(info.view.type);
              }}
              select={(info) => {
                if (!token) return;

                setFormData({
                  id: null,
                  title: "",
                  description: "",
                  startDateTime: info.startStr,
                  endDateTime: info.endStr,
                  allDay: info.allDay,
                });
                setModalMode("add");
                setModalOpen(true);
              }}
              eventClick={(info) => {
                // ✅ Saved Festival 이벤트인 경우 삭제 처리
                if (info.event.id.startsWith('saved-')) {
                  const pSeq = info.event.id.replace('saved-', '');
                  const festival = savedCalendarFestivals.find(f => String(f.pSeq) === pSeq);
                  if (festival) {
                    if (confirm(`"${festival.fstvlNm}"을(를) 저장된 축제에서 제거하시겠습니까?`)) {
                      toggleCalendarFestival(festival);
                    }
                  }
                  return;
                }

                if (!token) return;

                setFormData({
                  id: info.event.id,
                  title: info.event.title,
                  description: info.event.extendedProps?.description || "",
                  startDateTime: info.event.startStr || info.event.start.toISOString(),
                  endDateTime: info.event.endStr || (info.event.end ? info.event.end.toISOString() : info.event.start.toISOString()),
                  allDay: info.event.allDay,
                });
                setModalMode("edit");
                setModalOpen(true);
              }}
              eventDrop={(info) => {
                if (!token) return;

                updateEvent(info.event.id, {
                  title: info.event.title,
                  start: info.event.startStr || info.event.start.toISOString(),
                  end: info.event.endStr || (info.event.end ? info.event.end.toISOString() : info.event.start.toISOString()),
                  allDay: info.event.allDay,
                });
              }}
              eventResize={(info) => {
                if (!token) return;

                updateEvent(info.event.id, {
                  title: info.event.title,
                  start: info.event.startStr || info.event.start.toISOString(),
                  end: info.event.endStr || (info.event.end ? info.event.end.toISOString() : info.event.start.toISOString()),
                  allDay: info.event.allDay,
                });
              }}
            />

            {!token && (
              <div style={{ marginTop: 12, fontSize: 12, color: "#6b7280" }}>
                ※ 로그인 전에도 캘린더는 보이지만, Google 캘린더에 저장/동기화는 로그인 후 가능합니다.
              </div>
            )}
          </div>
            </div>

            {/* Saved Festivals: Upcoming Festivals 우측 패널 */}
            <div style={styles.rightPanel}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#111", marginBottom: 20 }}>
            🎉 UPCOMING FESTIVALS
          </div>

          {!token ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground text-center">
                  로그인하면 다가오는 일정이 표시됩니다.
                </p>
              </CardContent>
            </Card>
          ) : likedFestivals.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground text-center">
                  찜한 축제가 없습니다.<br/>
                  Festival Calendar에서 축제를 찜해보세요!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {likedFestivals.map((festival) => (
                <TownCard 
                  key={festival.pSeq}
                  town={{
                    id: festival.pSeq,
                    name: festival.fstvlNm || festival.festival_name,
                    image: festival.ministry_image_url || festival.image_url || '/placeholder-festival.jpg',
                    description: festival.festival_description || festival.ministry_description || '축제 정보'
                  }}
                  festival={festival}
                  onClick={() => {
                    setSelectedFestival(festival);
                    setFestivalDetailOpen(true);
                  }}
                />
              ))}
            </div>
          )}
            </div>
          </>
        )}
      </div>

      {/* ✅ 일정 추가/수정/삭제 모달 */}
      {modalOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}>
          <div style={{
            background: "#fff",
            borderRadius: 16,
            padding: 28,
            maxWidth: 450,
            width: "90%",
            boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
            fontFamily: "'Plus Jakarta Sans','Segoe UI',sans-serif",
          }}>
            {/* 헤더 */}
            <div style={{ marginBottom: 28 }}>
              <h2 style={{
                fontSize: 20,
                fontWeight: 700,
                margin: 0,
                color: "#111827",
              }}>
                {modalMode === "add" ? "🎉 새 일정 추가" : "✏️ 일정 수정"}
              </h2>
              <p style={{
                fontSize: 13,
                color: "#9ca3af",
                margin: "4px 0 0 0",
              }}>
                {modalMode === "add" ? "새로운 일정을 추가하세요" : "일정 정보를 수정하세요"}
              </p>
            </div>

            {/* 제목 */}
            <div style={{ marginBottom: 22 }}>
              <label style={{
                display: "block",
                fontSize: 12,
                fontWeight: 700,
                marginBottom: 8,
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}>
                제목
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="일정 제목을 입력하세요"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: "1px solid #e5e7eb",
                  borderRadius: 10,
                  fontSize: 14,
                  boxSizing: "border-box",
                  outline: "none",
                  transition: "all 0.2s",
                  color: "#111827",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#FF5F33";
                  e.target.style.boxShadow = "0 0 0 3px rgba(255,95,51,0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e5e7eb";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* 설명 */}
            <div style={{ marginBottom: 22 }}>
              <label style={{
                display: "block",
                fontSize: 12,
                fontWeight: 700,
                marginBottom: 8,
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}>
                설명
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="일정에 대한 설명을 추가하세요"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: "1px solid #e5e7eb",
                  borderRadius: 10,
                  fontSize: 14,
                  boxSizing: "border-box",
                  outline: "none",
                  minHeight: 80,
                  resize: "vertical",
                  fontFamily: "'Plus Jakarta Sans','Segoe UI',sans-serif",
                  transition: "all 0.2s",
                  color: "#111827",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#FF5F33";
                  e.target.style.boxShadow = "0 0 0 3px rgba(255,95,51,0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e5e7eb";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* 시작/종료 시간 (2열) */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 22 }}>
              {/* 시작 시간 */}
              <div>
                <label style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 700,
                  marginBottom: 8,
                  color: "#6b7280",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}>
                  시작
                </label>
                <input
                  type={formData.allDay ? "date" : "datetime-local"}
                  value={
                    formData.allDay
                      ? formData.startDateTime.split("T")[0]
                      : formData.startDateTime.includes("T")
                      ? formData.startDateTime.slice(0, 16)
                      : ""
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (formData.allDay) {
                      setFormData({ ...formData, startDateTime: val });
                    } else {
                      setFormData({ ...formData, startDateTime: val + ":00" });
                    }
                  }}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    border: "1px solid #e5e7eb",
                    borderRadius: 10,
                    fontSize: 13,
                    boxSizing: "border-box",
                    outline: "none",
                    transition: "all 0.2s",
                    color: "#111827",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#FF5F33";
                    e.target.style.boxShadow = "0 0 0 3px rgba(255,95,51,0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e5e7eb";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* 종료 시간 */}
              <div>
                <label style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 700,
                  marginBottom: 8,
                  color: "#6b7280",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}>
                  종료
                </label>
                <input
                  type={formData.allDay ? "date" : "datetime-local"}
                  value={
                    formData.allDay
                      ? formData.endDateTime.split("T")[0]
                      : formData.endDateTime.includes("T")
                      ? formData.endDateTime.slice(0, 16)
                      : ""
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (formData.allDay) {
                      setFormData({ ...formData, endDateTime: val });
                    } else {
                      setFormData({ ...formData, endDateTime: val + ":00" });
                    }
                  }}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    border: "1px solid #e5e7eb",
                    borderRadius: 10,
                    fontSize: 13,
                    boxSizing: "border-box",
                    outline: "none",
                    transition: "all 0.2s",
                    color: "#111827",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#FF5F33";
                    e.target.style.boxShadow = "0 0 0 3px rgba(255,95,51,0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e5e7eb";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            {/* 하루종일 토글 */}
            <div style={{
              marginBottom: 28,
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 14px",
              background: "#f9fafb",
              borderRadius: 10,
            }}>
              <input
                type="checkbox"
                id="allDayCheck"
                checked={formData.allDay}
                onChange={(e) => setFormData({ ...formData, allDay: e.target.checked })}
                style={{
                  cursor: "pointer",
                  width: 18,
                  height: 18,
                }}
              />
              <label htmlFor="allDayCheck" style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#374151",
                cursor: "pointer",
              }}>
                하루종일 일정
              </label>
            </div>

            {/* 버튼 영역 */}
            <div style={{
              display: "flex",
              gap: 10,
              justifyContent: "flex-end",
            }}>
              {modalMode === "edit" && (
                <button
                  onClick={() => {
                    deleteEvent(formData.id);
                    setModalOpen(false);
                  }}
                  style={{
                    padding: "11px 18px",
                    border: "1px solid #fee2e2",
                    background: "#fff",
                    color: "#dc2626",
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "#fef2f2";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "#fff";
                  }}
                >
                  🗑️ 삭제
                </button>
              )}
              <button
                onClick={() => setModalOpen(false)}
                style={{
                  padding: "11px 20px",
                  border: "1px solid #e5e7eb",
                  background: "#fff",
                  color: "#6b7280",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#f9fafb";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "#fff";
                }}
              >
                취소
              </button>
              <button
                onClick={async () => {
                  if (!formData.title.trim()) {
                    alert("제목을 입력하세요");
                    return;
                  }

                  if (modalMode === "add") {
                    await insertEvent({
                      title: formData.title,
                      description: formData.description,
                      start: formData.startDateTime,
                      end: formData.endDateTime,
                      allDay: formData.allDay,
                    });
                  } else {
                    await updateEvent(formData.id, {
                      title: formData.title,
                      description: formData.description,
                      start: formData.startDateTime,
                      end: formData.endDateTime,
                      allDay: formData.allDay,
                    });
                  }
                  setModalOpen(false);
                }}
                style={{
                  padding: "11px 20px",
                  background: "linear-gradient(90deg, rgb(244,133,37) 0%, rgb(255,153,102) 100%)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  boxShadow: "0 4px 12px rgba(244,133,37,0.3)",
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 6px 16px rgba(244,133,37,0.4)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 4px 12px rgba(244,133,37,0.3)";
                }}
              >
                {modalMode === "add" ? "➕ 추가" : "💾 수정"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ 축제 상세정보 모달 */}
      {festivalDetailOpen && selectedFestival && (
        <TownDetailModal
          festival={selectedFestival}
          onClose={() => setFestivalDetailOpen(false)}
        />
      )}
      </div>
    </>
  );
}

export default Calendar;
