
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PlayOffline from './pages/PlayOffline';
import Login from './pages/Login';
import Register from './pages/Register';
import PlayWithAI from './pages/PlayWithAI';
import PlayOnline from './pages/PlayOnline';
import MainPage from './pages/MainPage';
import ExplainRules from './pages/ExplainRules'
import GameLobby from './pages/GameLobby';
import Profile from './pages/Profile';


function App() {
  return (
   <BrowserRouter>
   <Routes>
   <Route path='/' element={<HomePage />}/>
    <Route path='/main' element={<MainPage />}/>
    <Route path='/login' element={<Login />}/>
    <Route path='/register' element={<Register />}/>
    <Route path="/playoffline" element={<PlayOffline />}/>
    <Route path="/playai" element={<PlayWithAI />}/>
    <Route path="/playonline" element={<PlayOnline />}/>
    <Route path="/rules" element={<ExplainRules />}/>
    <Route path="/lobby" element={<GameLobby/>}/>
    <Route path="/profile" element={<Profile />} />
    

   </Routes>
   </BrowserRouter>
  );
}

export default App;