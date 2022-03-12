import {ILevel, ILevelData} from "../components/LevelEditor";
import {mapHeight, mapWidth} from "../common";

export interface IRandomMap {
  levels: ILevel[][]
}

export const getRandomMap = (levelData: ILevelData): IRandomMap => {
  let levels: ILevel[][] = []
  for (let x = 0; x < mapWidth; x++) {
    let col: ILevel[] = []
    levels.push(col)
    for (let y = 0; y < mapHeight; y++) {

      let possibleLevels = levelData.levels.filter((l, i) => {
        if (i === 0) { // Skip first debug level
          return false
        }
        if (x === 0 && l.leftType !== 'blocked') {
          return false
        }
        if (y === 0 && l.topType !== 'blocked') {
          return false
        }
        if (y === mapHeight - 1 && l.bottomType !== 'blocked') {
          return false
        }
        if (x === mapWidth - 1 && l.rightType !== 'blocked') {
          return false
        }
        const leftLevel = x > 0 ? levels[x - 1][y] : undefined
        const topLevel = y > 0 ? levels[x][y - 1] : undefined
        if (leftLevel && leftLevel.rightType !== l.leftType) {
          return false
        }
        if (topLevel && topLevel.bottomType !== l.topType) {
          return false
        }

        return true
      })

      if (!possibleLevels) {
        possibleLevels = [levelData.levels[0]]
      }

      const index = Math.floor(Math.random() * possibleLevels.length)
      const randomLevel = possibleLevels[index]
      col.push(randomLevel)
    }
  }
  return {
    levels: levels
  }
}
