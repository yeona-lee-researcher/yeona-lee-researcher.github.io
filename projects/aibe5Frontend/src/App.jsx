import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import After_Home from "./pages/After_Home";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Map from "./pages/Map";
import Calendar from "./pages/Calendar";
import Signup from "./pages/Signup";
import TasteTest from "./pages/TasteTest";
import Testresult from "./pages/Testresult";
import OAuthKakaoCallback from "./pages/OAuthKakaoCallback";
import Festival_List from "./pages/Festival_List";
import Mypage from "./pages/Mypage";
import Dateregistration from "./pages/Dateregistration";
import Plancuration from "./pages/Plancuration";
import Review from "./pages/Review";
import Loading from "./pages/Loading";
import ChatBot from "./components/ChatBot";


function App() {
  const location = useLocation();
  const isLandingPage = location.pathname === "/";

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/after_home" element={<After_Home />} />
        <Route path="/festivals" element={<Festival_List />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/map" element={<Map />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/mypage" element={<Mypage />} />
        <Route path="/tastetest" element={<TasteTest />} />
        <Route path="/testresult" element={<Testresult />} />
        <Route path="/oauth/kakao/callback" element={<OAuthKakaoCallback />} />
        <Route path="/dateregistration" element={<Dateregistration />} />
        <Route path="/Plancuration" element={<Plancuration />} />
        <Route path="/review" element={<Review />} />
        <Route path="/loading" element={<Loading />} />
      </Routes>
      {!isLandingPage && <ChatBot />}
    </>
  );
}

export default App;
