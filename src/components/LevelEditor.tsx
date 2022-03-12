import './LevelEditor.scss'
import * as levelsJson from "../levels.json"
import React from "react";
import {range} from "../common";

const levelHeight = 8
const levelWidth = 12

interface ILevel {
  data: number[][]
}

interface ILevelData {
  levels: ILevel[]
}

const getInitialLevel = (): ILevel => {
  const data = range(levelWidth).map(x => range(levelHeight).map(y => {
    if (x === 0 || x === levelWidth - 1 || y === 0 || y === levelHeight - 1) {
      return 1
    }
    return 0
  }))

  return {
    data
  }
}

interface ILevelProps {
  level: ILevel
  setLevel: (level: ILevel) => void
}

const Level: React.FC<ILevelProps> = (
  {
    level,
    setLevel
  }
) => {
  const [tool, setTool] = React.useState(0)

  return <div className={'level'}>
    <div className={'tool-chooser'}>
      {
        [0, 1, 2].map(n => {
          return <div
            key={n}
            className={`tile-type-${n}` + (n === tool ? ' active' : '')}
            onClick={() => {
              setTool(n)
            }}/>
        })
      }
    </div>
    <table className={'level-table'}>
      <tbody>
      {range(levelHeight).map(y => {
        return <tr key={y}>
          {range(levelWidth).map(x => {
            return <td
              className={`tile-type-${level.data[x][y]}`}
              key={x}
              onClick={() => {
                setLevel({
                  ...level, data: level.data.map((column, xx) => column.map((value, yy) => {
                    if (xx === x && yy === y) {
                      return tool
                    }
                    return value
                  }))
                })
              }}
            >
            </td>
          })}
        </tr>
      })}
      </tbody>
    </table>
  </div>
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
    <div className={'left'}>
      <button
        onClick={() => {
          // console.log(JSON.stringify(levelData, null, 2))
          console.log(JSON.stringify(levelData))
        }}
      >Stringify level data
      </button>
      <ul>
        {levelData.levels.map((level, index) => {
          return <li
            key={index}
            onClick={() => {
              setSelectedLevelNumber(index)
            }}
          >Level {index}
          </li>
        })}
      </ul>
      <button
        onClick={() => {
          setLevelData({...levelData, levels: [...levelData.levels, getInitialLevel()]})
        }}
      >Add
      </button>
    </div>
    <div className={'right'}>
      {
        level && <Level
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
}
