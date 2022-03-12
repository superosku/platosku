import Heap from "heap-js";
import {GameMap} from "./GameMap";
import {Entity} from "./Entity";
import {KeyboardHandler} from "./KeyboardHandler";
import {getPointScore, SearchPointScoreMap} from "./SearchPointScoreMap";
import {controlChoices, doNothingControls, IControls, tileSize} from "../common";
import {Camera} from "./Camera";

interface IPathItem {
  x: number,
  y: number,
  controls: IControls
}

export class Game {
  map: GameMap
  player: Entity
  follower: Entity
  keyboardHandler: KeyboardHandler
  debugPoints: { x: number, y: number }[]
  goalX: number
  goalY: number
  debugSearchPointScores: SearchPointScoreMap
  frameIndex: number
  followerPath: IPathItem[]
  camera: Camera

  constructor(keyboardHandler: KeyboardHandler, canvasWidth: number, canvasHeight: number) {
    this.map = new GameMap()
    this.player = new Entity()
    this.follower = new Entity()
    this.camera = new Camera(canvasWidth, canvasHeight)
    this.keyboardHandler = keyboardHandler
    this.debugPoints = []
    this.goalX = 0
    this.goalY = 0
    this.debugSearchPointScores = new SearchPointScoreMap(this.map)
    this.frameIndex = 0
    this.followerPath = []
  }

  updateGoalFromMouse(x: number, y: number) {
    // this.goalX = x
    // this.goalY = y
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.map.draw(ctx, this.camera, this.debugSearchPointScores)
    this.player.draw(ctx, this.camera)
    this.follower.draw(ctx, this.camera)

    // Draw debug points
    if (false) {
      for (let i = 0; i < this.debugPoints.length; i++) {
        const db = this.debugPoints[i]
        ctx.strokeStyle = 'rgba(32, 181, 39, 0.25)';
        ctx.beginPath();
        ctx.arc((db.x + this.follower.width / 2) * tileSize, (db.y + this.follower.height / 2) * tileSize, 1, 0, 2 * Math.PI);
        ctx.stroke();
      }
    }

    // Draw path
    if (this.followerPath.length > 3) {
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(
        this.camera.gameToScreenX(this.followerPath[0].x + this.follower.width / 2),
        this.camera.gameToScreenY(this.followerPath[1].y + this.follower.height / 2),
      )
      ctx.strokeStyle = '#cd264d';
      for (let i = 1; i < this.followerPath.length; i++) {
        const db = this.followerPath[i]
        ctx.lineTo(
          this.camera.gameToScreenX(db.x + this.follower.width / 2),
          this.camera.gameToScreenY(db.y + this.follower.height / 2)
        );
      }
      ctx.stroke();
    }
  }

  update() {
    if (this.frameIndex % (60 * 3) === 0 && this.frameIndex !== 0) {
      const path = this.routeSearch(this.follower, this.player.x, this.player.y)
      this.followerPath = path
    }
    // const searchResult = this.routeSearch(this.follower, this.goalX, this.goalY)
    if (this.followerPath.length > 0) {
      const pathItem = this.followerPath.shift()
      if (pathItem) {
        const {controls} = pathItem
        this.follower.updateFromControls(controls)
      }
    } else {
      this.follower.updateFromControls(doNothingControls) // Do nothing
    }
    this.player.updateFromKeyboard(this.keyboardHandler)

    this.follower.update(this.map)
    this.player.update(this.map)
    this.frameIndex += 1

    this.camera.moveTowards(this.player.x, this.player.y)
  }

  routeSearch(entity: Entity, goalX: number, goalY: number) {
    this.map.updatePointScoreMap(this.debugSearchPointScores, Math.floor(goalX), Math.floor(goalY))
    const pointScores = this.debugSearchPointScores

    interface HandledEntity {
      entity: Entity,
      parent: HandledEntity | undefined
      controls: IControls | undefined
    }

    this.debugPoints = []

    let hasher: { [key: string]: boolean } = {}
    let winner: HandledEntity | undefined = undefined

    const scoreEntity = (a: HandledEntity): number => {
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

    let path: IPathItem[] = []
    let current = winner
    let winningControls = undefined

    while (true) {
      if (current === undefined) {
        break
      }
      if (current.controls) {
        winningControls = current.controls
        path.push({
          x: current.entity.x,
          y: current.entity.y,
          controls: current.controls
        })
      }
      current = current.parent
    }

    path.reverse()
    return path
  }
}
