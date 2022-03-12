import React from 'react';
import './App.css';
import {GameComponent} from "./components/GameComponent";
import {LevelEditor} from "./components/LevelEditor";
import {LevelTable} from "./components/LevelTable";

const App = () => {
  const [state, setState] = React.useState<'game' | 'editor'>('game')

  return <div>
    <button onClick={() => {setState('game')}}>Game</button>
    <button onClick={() => {setState('editor')}}>Editor</button>
    {state === 'game' && <GameComponent/>}
    {state === 'editor' && <LevelEditor/>}
  </div>
}

export default App
