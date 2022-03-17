import React from 'react';
import './App.css';
import './components/LevelEditor.scss'
import {GameComponent} from "./components/GameComponent";
import {LevelEditor} from "./components/LevelEditor";
import {CanvasGenerator} from "./components/CanvasGenerator";

const App = () => {
  const [state, setState] = React.useState<'game' | 'editor' | 'canvas-generator'>('game')

  return <div>
    <button onClick={() => {setState('game')}}>Game</button>
    <button onClick={() => {setState('editor')}}>Level editor</button>
    <button onClick={() => {setState('canvas-generator')}}>Canvas generator</button>
    {state === 'game' && <GameComponent/>}
    {state === 'editor' && <LevelEditor/>}
    {state === 'canvas-generator' && <CanvasGenerator/>}
  </div>
}

export default App
