import {IPoint, levelHeight, levelWidth, mapHeight, mapWidth, range, tileSize} from "../common";
import {getPointScore, SearchPointScoreMap} from "./SearchPointScoreMap";
import {ILevelData} from "../components/LevelEditor";
import {getRandomMap, IRandomMap} from "./levels";

import * as levelsJson from "../levels.json"
import {Camera} from "./Camera";

const levelData: ILevelData = (levelsJson as any).default as ILevelData

export class GameMap {
  data: number[][]
  width: number
  height: number

  constructor() {
    const randomMap: IRandomMap = getRandomMap(levelData)

    this.height = levelHeight * mapHeight
    this.width = levelWidth * mapWidth

    this.data = range(this.width).map(x => range(this.height).map(y => {
      return 0
    }))

    for (let xx = 0; xx < mapWidth; xx++) {
      for (let yy = 0; yy < mapHeight; yy++) {
        for (let x = 0; x < levelWidth; x++) {
          for (let y = 0; y < levelHeight; y++) {
            const outputX = x + xx * levelWidth
            const outputY = y + yy * levelHeight
            const level = randomMap.levels[xx][yy]
            this.data[outputX][outputY] = level.data[x][y]
          }
        }
      }
    }
  }

  getStartCoors(): IPoint {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.width; y++) {
        if (this.at(x, y) === 3) {
          return {x, y}
        }
      }
    }

    return {x: 2, y: 2}
  }

  updatePointScoreMap(pointScores: SearchPointScoreMap, goalX: number, goalY: number) {
    pointScores.reset()

    interface IScoredPoint extends IPoint {
      score: number,
      sinceGround: number
    }

    const queue: IScoredPoint[] = [{x: goalX, y: goalY, score: 1, sinceGround: 0}]

    let i = 0;

    while (queue) {
      i++
      if (i > 1000) {
        return pointScores
      }

      const point = queue.shift()

      if (!point) {
        break
      }

      if (pointScores.has(point.x, point.y)) {
        continue
      }

      pointScores.set(point.x, point.y, point.score)

      const neighbours: IPoint[] = [
        {x: point.x + 1, y: point.y},
        {x: point.x - 1, y: point.y},
        {x: point.x, y: point.y - 1},
        {x: point.x, y: point.y + 1},
      ]

      for (let i = 0; i < neighbours.length; i++) {
        const n = neighbours[i]


        // const isMovingDown = point.y - n.y < 0
        // let sinceGround = point.sinceGround + (isMovingDown ? 1 : 1)
        // let sinceGround = point.sinceGround + 1
        let sinceGround = 0

        if (
          this.at(n.x, n.y + 1) !== 0
          // this.at(point.x, point.y + 1) !== 0
        ) {
          sinceGround = 0
        }

        // Too long since touching ground
        if (sinceGround > 3) {
          continue
        }
        // Point already handled
        if (pointScores.has(n.x, n.y)) {
          continue
        }
        // Not moveable tile
        if (this.at(n.x, n.y) === 1) {
          continue
        }

        queue.push({
          ...n,
          score: point.score + 1,
          sinceGround: sinceGround
        })
      }

    }
    //
    // if (Object.keys(pointScores).length > 3) {
    //   debugger;
    // }
    // return pointScores
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera, debugPointScores: SearchPointScoreMap) {
    const boundaries = camera.getDrawBoundaries()

    const startDrawX = camera.gameToScreenX(0)
    const startDrawY = camera.gameToScreenY(0)

    for (let x = Math.max(0, boundaries.topLeftX); x < Math.min(boundaries.bottomRightX, this.width); x++) {
      for (let y = Math.max(0, boundaries.topLeftY); y < Math.min(boundaries.bottomRightY, this.height); y++) {
        ctx.fillStyle = '#1a1c1d'
        if (this.data[x][y] === 1) {
          ctx.fillStyle = '#8a8a8a';
        }
        if (this.data[x][y] === 3) {
          ctx.fillStyle = '#62b52b';
        }
        if (this.data[x][y] === 4) {
          ctx.fillStyle = '#b34949';
        }

        // if (debugPointScores && this.at(x, y) !== 1) {
        //   const ps = debugPointScores.get(x, y)
        //   if (ps !== undefined) {
        //     const score = 255 - Math.min(255, Math.max(0, Math.floor(ps * 10 + 128)))
        //     ctx.fillStyle = `rgb(${score}, ${score}, ${score})`
        //   }
        // }

        ctx.fillRect(
          startDrawX + tileSize * x,
          startDrawY + tileSize * y,
          // camera.gameToScreenX(x),
          // camera.gameToScreenY(y),
          tileSize,
          tileSize
        );
        if (this.data[x][y] === 2) {
          ctx.beginPath()
          ctx.lineWidth = 4
          ctx.strokeStyle = '#543f16'

          const ladderSpacing = tileSize / 4

          // ctx.moveTo(0,0)
          // ctx.lineTo(1000, 1000)
          ctx.moveTo(camera.gameToScreenX(x) + 4, camera.gameToScreenY(y))
          ctx.lineTo(camera.gameToScreenX(x) + 4, camera.gameToScreenY(y + 1))
          ctx.moveTo(camera.gameToScreenX(x + 1) - 4, camera.gameToScreenY(y))
          ctx.lineTo(camera.gameToScreenX(x + 1) - 4, camera.gameToScreenY(y + 1))
          for (let i = 0; i < 4; i++) {
            ctx.moveTo(camera.gameToScreenX(x), camera.gameToScreenY(y) + i * ladderSpacing)
            ctx.lineTo(camera.gameToScreenX(x + 1), camera.gameToScreenY(y) + i * ladderSpacing)
          }
          ctx.stroke();
        }
      }
    }

    /*
    if (!debugPointScores) {
      return
    }

    const res = 8
    for (let xx = 0; xx < this.width * res; xx++) {
      for (let yy = 0; yy < this.height * res; yy++) {
        const x = xx / res
        const y = yy / res

        if (this.at(x, y) !== 0) {
          continue
        }

        const score = 255 - Math.min(255, Math.max(0, Math.floor(
          getPointScore({x: x, y: y}, debugPointScores) * 20
        )))
        ctx.fillStyle = `rgb(${score}, ${0}, ${0})`

        ctx.fillRect(x * tileSize, y * tileSize, tileSize / res, tileSize / res);
      }
    }
     */
  }

  at(fx: number, fy: number) {
    const x = Math.floor(fx)
    const y = Math.floor(fy)

    if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
      return 1
    }

    return this.data[x][y]
  }
}
