import {ILevel, ILevelData} from "../components/LevelEditor";
import {IPoint, mapHeight, mapWidth} from "../common";

export interface IRandomMap {
  levels: ILevel[][]
  route: IPoint[]
}

const getRandomRoute = () => {
  type TDirection = 'left' | 'right'

  const start: IPoint = {x: Math.floor(Math.random() * mapWidth), y: 0}
  const end: IPoint = {x: Math.floor(Math.random() * mapWidth), y: mapHeight - 1}

  const getRandomDirection = (point: IPoint): TDirection => {
    if (point.x === 0) {
      return 'right'
    }
    if (point.x === mapWidth - 1) {
      return 'left'
    }
    if (Math.random() < 0.5) {
      return 'left'
    }
    return 'right'
  }

  let route: IPoint[] = [start]
  let direction: TDirection = getRandomDirection(start)
  for (let i = 0; i < 80; i++) {
    const currentPoint = route[route.length - 1]
    let newPoint = {...currentPoint}
    const isLastRow = currentPoint.y === mapHeight - 1
    const goDown = Math.random() < 0.5
    if (isLastRow) {
      const dir = Math.max(-1, Math.min(1, currentPoint.x - end.x))
      if (dir === 0) {
        break
      }
      newPoint = {x: currentPoint.x - dir, y: currentPoint.y}
    } else if (goDown) {
      newPoint = {x: currentPoint.x, y: currentPoint.y + 1}
      direction = getRandomDirection(newPoint)
    } else if (direction === 'left') {
      if (currentPoint.x === 0) {
        newPoint = {x: currentPoint.x, y: currentPoint.y + 1}
        direction = getRandomDirection(newPoint)
      } else {
        newPoint = {x: currentPoint.x - 1, y: currentPoint.y}
      }
    } else if (direction === 'right') {
      if (currentPoint.x === mapWidth - 1) {
        newPoint = {x: currentPoint.x, y: currentPoint.y + 1}
        direction = getRandomDirection(newPoint)
      } else {
        newPoint = {x: currentPoint.x + 1, y: currentPoint.y}
      }
    }

    route.push(newPoint)

    if (newPoint.x === end.x && newPoint.y === end.y) {
      break
    }
  }

  return route
}

export const getRandomMap = (levelData: ILevelData): IRandomMap => {
  console.log('getRandomMap')
  let levels: ILevel[][] = []

  const route = getRandomRoute()
  for (let x = 0; x < mapWidth; x++) {
    let col: ILevel[] = []
    levels.push(col)
    for (let y = 0; y < mapHeight; y++) {
      const routeIndex = route.findIndex(p => p.x === x && p.y === y)
      const previousRouteIndex = routeIndex > 0 ? routeIndex - 1 : undefined
      const nextRouteIndex = routeIndex < route.length - 1 ? routeIndex + 1 : undefined

      type TDir = 'top' | 'left' | 'right' | 'down'
      const nextMapper: { [key: number]: TDir } = {}
      nextMapper[1] = 'left'
      nextMapper[-1] = 'right'
      nextMapper[0] = 'down'
      const prevMapper: { [key: number]: TDir } = {}
      prevMapper[1] = 'left'
      prevMapper[-1] = 'right'
      prevMapper[0] = 'top'
      const previousDir = previousRouteIndex !== undefined ? (
        prevMapper[x - route[previousRouteIndex].x]
      ) : undefined
      const nextDir = nextRouteIndex !== undefined ? (
        nextMapper[x - route[nextRouteIndex].x]
      ) : undefined

      if (routeIndex > 0 && y < 3 && (!previousDir || !nextDir)) {
        debugger;
      }

      let possibleLevels = levelData.levels.filter((level, i) => {
        // Skip first debug level
        if (i === 0) {
          return false
        }

        // If start of the route, must have start door, otherwise cant have start door
        const isStartDoor = level.tags.indexOf('start-door') >= 0
        if (routeIndex === 0) {
          return isStartDoor
        } else if (isStartDoor) {
          return false
        }

        // If end of the route, must have end door, otherwise cant have end door
        const isEndDoor = level.tags.indexOf('end-door') >= 0
        if (routeIndex > 0 && nextDir === undefined) {
          return isEndDoor
        } else if (isEndDoor) {
          return false
        }

        // Must follow route
        if (
          routeIndex >= 0 &&
          (
            (previousDir && previousDir === 'top' && level.topType === 'blocked') ||
            (previousDir && previousDir === 'left' && level.leftType === 'blocked') ||
            (previousDir && previousDir === 'right' && level.rightType === 'blocked') ||
            (nextDir && nextDir === 'down' && level.bottomType === 'blocked') ||
            (nextDir && nextDir === 'left' && level.leftType === 'blocked') ||
            (nextDir && nextDir === 'right' && level.rightType === 'blocked')
          )
        ) {
          return false
        }
        // Map corners must be blocked
        if (
          (x === 0 && level.leftType !== 'blocked') ||
          (y === 0 && level.topType !== 'blocked') ||
          (y === mapHeight - 1 && level.bottomType !== 'blocked') ||
          (x === mapWidth - 1 && level.rightType !== 'blocked')
        ) {
          return false
        }

        // Must match surrounding types
        const leftLevel = x > 0 ? levels[x - 1][y] : undefined
        const topLevel = y > 0 ? levels[x][y - 1] : undefined
        if (
          (leftLevel && leftLevel.rightType !== level.leftType) ||
          (topLevel && topLevel.bottomType !== level.topType)
        ) {
          return false
        }

        return true
      })

      if (possibleLevels.length === 0) {
        console.log(previousDir, nextDir)
        possibleLevels = [levelData.levels[0]]
      }

      const index = Math.floor(Math.random() * possibleLevels.length)
      const randomLevel = possibleLevels[index]

      col.push(randomLevel)
    }
  }

  return {
    levels,
    route,
  }
}
