import './LevelEditor.scss'
import * as levelsJson from "../levels.json"
import React from "react";
import {levelHeight, levelWidth, range} from "../common";
import {LevelTable} from "./LevelTable";
import {LevelRandomizer} from "./LevelRandomizer";
import {SingleLevelEditor} from "./SingleLevelEditor";

export const levelSideTypes = [
  'blocked',
  'open',
  'middle-open',
  'top-open',
  'bottom-open',
  'left-open',
  'right-open',
]

export interface ILevel {
  data: number[][]
  leftType: string
  rightType: string
  bottomType: string
  topType: string
}

export interface ILevelData {
  levels: ILevel[]
}

const getInitialLevel = (): ILevel => {
  const data = range(levelWidth).map(x => range(levelHeight).map(y => {
    if (x < 2 || x >= levelWidth - 2 || y < 2 || y >= levelHeight - 2) {
      return 1
    }
    return 0
  }))

  return {
    data,
    leftType: 'blocked',
    rightType: 'blocked',
    topType: 'blocked',
    bottomType: 'blocked',
  }
}


export const LevelEditor = () => {
  const [levelData, setLevelData] = React.useState<ILevelData>((levelsJson as any).default as ILevelData)
  const [selectedLevelNumber, setSelectedLevelNumber] = React.useState<undefined | number>(0)

  const level = React.useMemo(() => {
    if (selectedLevelNumber === undefined) {
      return undefined
    }
    return levelData.levels[selectedLevelNumber]
  }, [selectedLevelNumber, levelData])

  return <div className={'level-editor'}>
    <div className={'upper'}>
      <div className={'left'}>
        <button
          onClick={() => {
            // console.log(JSON.stringify(levelData, null, 2))
            console.log(JSON.stringify(levelData))
          }}
        >Stringify level data
        </button>
        <ul className={'level-list'}>
          {levelData.levels.map((level, index) => {
            return <li
              className={index === selectedLevelNumber ? 'active' : ''}
              key={index}
              onClick={() => {
                setSelectedLevelNumber(index)
              }}
            ><LevelTable level={level}/></li>
          })}
        </ul>
        <button
          onClick={() => {
            setLevelData({...levelData, levels: [...levelData.levels, getInitialLevel()]})
            setSelectedLevelNumber(levelData.levels.length)
          }}
        >Add
        </button>
      </div>
      <div className={'right'}>
        {
          level && <SingleLevelEditor
            level={level}
            setLevel={(newLevel) => {
              setLevelData({
                ...levelData, levels: levelData.levels.map((l, i) => {
                  if (selectedLevelNumber === i) {
                    return newLevel
                  }
                  return l
                })
              })
            }}
          />
        }
      </div>
    </div>
    {levelData.levels.length > 3 &&
    <LevelRandomizer levelData={levelData}/>
    }
  </div>
}
