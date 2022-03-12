import Heap from "heap-js";
import {GameMap} from "./GameMap";
import {Entity} from "./Entity";
import {KeyboardHandler} from "./KeyboardHandler";
import {getPointScore, SearchPointScoreMap} from "./SearchPointScoreMap";
import {controlChoices, IControls, tileSize} from "../common";

export class Game {
  map: GameMap
  player: Entity
  keyboardHandler: KeyboardHandler
  debugPoints: { x: number, y: number }[]
  goalX: number
  goalY: number
  debugRoute: { x: number, y: number }[]
  debugSearchPointScores: SearchPointScoreMap

  constructor(keyboardHandler: KeyboardHandler) {
    this.map = new GameMap()
    this.player = new Entity()
    this.keyboardHandler = keyboardHandler
    this.debugPoints = []
    this.debugRoute = []
    this.goalX = 0
    this.goalY = 0
    this.debugSearchPointScores = new SearchPointScoreMap()
  }

  updateGoal(x: number, y: number) {
    this.goalX = x
    this.goalY = y
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.map.draw(ctx, this.debugSearchPointScores)
    this.player.draw(ctx)

    for (let i = 0; i < this.debugPoints.length; i++) {
      const db = this.debugPoints[i]
      ctx.strokeStyle = 'rgba(32, 181, 39, 0.25)';
      ctx.beginPath();
      ctx.arc((db.x + this.player.width / 2) * tileSize, (db.y + this.player.height / 2) * tileSize, 1, 0, 2 * Math.PI);
      ctx.stroke();
    }

    if (this.debugRoute.length < 2) {
      return
    }
    // console.log('drawing debugRoute', this.debugRoute.length)
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo((this.debugRoute[0].x + this.player.width / 2) * tileSize, (this.debugRoute[1].y + this.player.height / 2) * tileSize)
    ctx.strokeStyle = '#cd264d';
    for (let i = 1; i < this.debugRoute.length; i++) {
      const db = this.debugRoute[i]
      ctx.lineTo((db.x + this.player.width / 2) * tileSize, (db.y + this.player.height / 2) * tileSize);
    }
    ctx.stroke();
  }

  update() {
    const searchResult = this.routeSearch(this.player, this.goalX, this.goalY)
    this.debugRoute = searchResult.path
    if (searchResult.winningControls) {
      this.player.updateFromControls(searchResult.winningControls)
    }
    this.player.update(this.map)
  }

  routeSearch(entity: Entity, goalX: number, goalY: number) {
    this.map.updatePointScoreMap(this.debugSearchPointScores, goalX, goalY)
    const pointScores = this.debugSearchPointScores
    // const pointScores = this.debugSearchPointScores
    // pointScores.reset()
    // const pointScores = new Map()
    // this.debugSearchPointScores = pointScores

    interface HandledEntity {
      entity: Entity,
      parent: HandledEntity | undefined
      controls: IControls | undefined
    }

    this.debugPoints = []

    // let entities: HandledEntity[] = [{entity: entity.clone(), parent: undefined, controls: undefined}]

    let hasher: { [key: string]: boolean } = {}

    let winner: HandledEntity | undefined = undefined


    const scoreEntity = (a: HandledEntity): number => {
      // const distScore = Math.pow(a.entity.x - (goalX + 0.5), 2) + Math.pow(a.entity.y - (goalY + 0.5), 2)
      // return distScore

      // const tileScore = pointScores.get(
      //   Math.floor(a.entity.x + a.entity.width / 2),
      //   Math.floor(a.entity.y + a.entity.height / 2)
      // ) || 9999
      // return tileScore

      // return tileScore * 20 + distScore

      const center = a.entity.getCenter()
      return getPointScore(center, pointScores)
    }

    const compareEntity = (a: HandledEntity, b: HandledEntity) => {
      const scoreA = scoreEntity(a)
      const scoreB = scoreEntity(b)
      if (scoreA === scoreB) {
        return 0
      }
      return scoreA < scoreB ? -1 : 1
    }

    let entities = new Heap<HandledEntity>(compareEntity);
    entities.push({
      entity: entity.clone(),
      parent: undefined,
      controls: undefined
    })

    outerLoop: for (let i = 0; i < 500; i++) {
      // entities = entities.sort((a, b) => {
      //   return (
      //     scoreEntity(a) < scoreEntity(b)
      //     // 10 * aTileScore + aDistScore < 10 * bTileScore + bDistScore
      //     // Math.pow(a.entity.x - goalX, 2) + Math.pow(a.entity.y - goalY, 2) <
      //     // Math.pow(b.entity.x - goalX, 2) + Math.pow(b.entity.y - goalY, 2)
      //   ) ? -1 : 1
      // })

      const handledEntity = entities.pop()

      if (!handledEntity) {
        break outerLoop
      }

      for (let c = 0; c < controlChoices.length; c++) {
        const controls = controlChoices[c]
        const newEntity = handledEntity.entity.clone()

        const asdf = 1//i < 10 ? 1 : 10
        for (let x = 0; x < asdf; x++) {
          newEntity.updateFromControls(controls)
          newEntity.update(this.map)
        }

        if (hasher[newEntity.getSearchHash()]) {
          continue
        }

        const newHandledEntity = {
          entity: newEntity,
          parent: handledEntity,
          controls: controls,
        }

        if (Math.floor(newEntity.x) === goalX && Math.floor(newEntity.y) === goalY) {
          winner = newHandledEntity
          break outerLoop
        }

        if (!winner) {
          winner = newHandledEntity
        }
        if (
          scoreEntity(newHandledEntity) < scoreEntity(winner)
        ) {
          winner = newHandledEntity
        }

        this.debugPoints.push({x: newEntity.x, y: newEntity.y})
        entities.push(newHandledEntity)
        hasher[newEntity.getSearchHash()] = true
      }
    }

    let path: { x: number, y: number }[] = []
    let current = winner
    let winningControls = undefined

    while (true) {
      if (current === undefined) {
        break
      }
      if (current.controls) {
        winningControls = current.controls
      }
      path.push({x: current.entity.x, y: current.entity.y})
      current = current.parent
    }

    // console.log('path len', path.length)

    return {
      path,
      winningControls
    }
  }
}
