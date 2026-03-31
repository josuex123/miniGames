import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import GameSetWord from './pages/Games/GameSetWord'
import GameHangMan from './pages/Games/GameHangMan'
import GameTetris from './pages/Games/GameTetris'
import GameDyno from './pages/Games/GameDyno'
import GameCars from './pages/Games/GameCars'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      
      <Route path="/game_set_word" element={<GameSetWord/>}/>
      <Route path="/game_hang_man" element={<GameHangMan/>}/>
      <Route path="/game_cars" element={<GameCars/>}/>
      <Route path="/game_dyno" element={<GameDyno/>}/>
      <Route path="/game_tetris" element={<GameTetris/>}/>
    </Routes>
  )
}

export default App