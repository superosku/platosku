import React from 'react';
import './App.css';
import {GameComponent} from "./components/GameComponent";
import {LevelEditor} from "./components/LevelEditor";

const App = () => {
  const [state, setState] = React.useState<'game' | 'editor'>('game')
  // const [state, setState] = React.useState<'game' | 'editor'>('editor')

  return <div>
    <button onClick={() => {setState('game')}}>Game</button>
    <button onClick={() => {setState('editor')}}>Editor</button>
    {state === 'game' && <GameComponent/>}
    {state === 'editor' && <LevelEditor/>}
  </div>
}

export default App
