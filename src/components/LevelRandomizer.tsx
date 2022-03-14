import {ILevelData} from "./LevelEditor";
import React from "react";
import {mapHeight, mapWidth, range} from "../common";
import {LevelTable} from "./LevelTable";
import {getRandomMap} from "../game/levels";

interface ILevelRandomizerProps {
  levelData: ILevelData
}

export const LevelRandomizer: React.FC<ILevelRandomizerProps> = (
  {
    levelData
  }
) => {

  const [map, setMap] = React.useState(getRandomMap(levelData))

  return <div className={'level-randomizer'}>
    <button onClick={() => {
      setMap(getRandomMap(levelData))
    }}>Randomize
    </button>
    <table className={'map-table'}>
      <tbody>
      {
        range(mapHeight).map(y => {
          return <tr key={y}>
            {
              range(mapWidth).map(x => {
                const partOfRoute = map.route.findIndex((point) => point.x === x && point.y === y) >= 0

                return <td
                  key={x}
                  className={'map-table-item ' + (partOfRoute ? 'route' : '')}
                >
                  <LevelTable level={map.levels[x][y]}/>
                </td>
              })
            }
          </tr>
        })
      }
      </tbody>
    </table>

  </div>
}
