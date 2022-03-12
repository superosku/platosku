import {levelHeight, levelWidth, range} from "../common";
import React from "react";
import {ILevel} from "./LevelEditor";

interface ILevelTableProps {
  onChangeCell?: (x: number, y: number) => void
  level: ILevel
}

export const LevelTable: React.FC<ILevelTableProps> = (
  {
    onChangeCell,
    level
  }
) => {
  const [dragging, setDragging] = React.useState(false)

  const onChangeHandler = (x: number, y: number) => {
    if (onChangeCell) {
      onChangeCell(x, y)
    }
  }

  return <table
    className={'level-table'}
  >
    <tbody
    >
    {range(levelHeight).map(y => {
      return <tr key={y}>
        {range(levelWidth).map(x => {
          return <td
            className={`tile-type-${level.data[x][y]}`}
            key={x}
            onMouseDown={() => {
              setDragging(true)
            }}
            onMouseUp={() => {
              setDragging(false)
            }}
            onClick={() => {
              onChangeHandler(x, y)
            }}
            onMouseMove={() => {
              if (dragging) {
                onChangeHandler(x, y)
              }
            }}
          >
          </td>
        })}
      </tr>
    })}
    </tbody>
  </table>
}
