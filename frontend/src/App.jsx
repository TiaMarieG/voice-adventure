import { GameProvider } from './context/GameContext';
import GameScreen from './components/GameScreen';

export default function App() {
   return (
      <GameProvider>
         <GameScreen />
      </GameProvider>
   );
}