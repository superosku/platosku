import Heap from "heap-js";
import {GameMap} from "./GameMap";
import {BaseEntity, Coin, FlyingEnemy, Player, WalkingEnemy} from "./Entity";
import {KeyboardHandler} from "./KeyboardHandler";
import {getPointScore, SearchPointScoreMap} from "./SearchPointScoreMap";
import {controlChoices, doNothingControls, IControls, IPoint} from "../common";
import {Camera} from "./Camera";
import {worker} from "./worker";
import {CanvasHandler} from "./CanvasHandler";

interface IPathItem {
  x: number,
  y: number,
  controls: IControls
}

export class Game {
  map: GameMap

  player: Player
  follower: Player

  enemies: BaseEntity[]
  coins: Coin[]

  keyboardHandler: KeyboardHandler
  debugPoints: IPoint[]
  goalX: number
  goalY: number
  debugSearchPointScores: SearchPointScoreMap
  frameIndex: number
  followerPath: IPathItem[]
  camera: Camera
  canvasHandler: CanvasHandler

  constructor(
    keyboardHandler: KeyboardHandler,
    canvasWidth: number,
    canvasHeight: number,
    canvasHandler: CanvasHandler
  ) {
    this.canvasHandler = canvasHandler
    this.map = new GameMap(this.canvasHandler)
    const startPos = this.map.getStartCoors()
    this.player = new Player(startPos)
    this.follower = new Player(startPos)
    this.camera = new Camera(canvasWidth, canvasHeight)
    this.keyboardHandler = keyboardHandler
    this.debugPoints = []
    this.goalX = 0
    this.goalY = 0
    this.debugSearchPointScores = new SearchPointScoreMap(this.map)
    this.frameIndex = 0
    this.followerPath = []

    this.enemies = []
    for (let i = 0; i < 200; i++) {
      const x = Math.floor(Math.random() * this.map.width)
      const y = Math.floor(Math.random() * this.map.height)
      if (this.map.blockedAt(x, y)) {
        i -= 1
        continue
      }
      if (i % 2 === 0) {
        this.enemies.push(new WalkingEnemy({x, y}))
      } else {
        this.enemies.push(new FlyingEnemy({x, y}))
      }
    }
    this.coins = []
    for (let i = 0; i < 200; i++) {
      const x = Math.floor(Math.random() * this.map.width)
      const y = Math.floor(Math.random() * this.map.height)
      if (this.map.blockedAt(x, y)) {
        i -= 1
        continue
      }
      let coin = new Coin({x, y}, Math.random() < 0.5 ? 'diamond' : 'coin')
      coin.x = coin.x + Math.random() * (1 - coin.width)
      this.coins.push(coin)
    }

    worker.onmessage = (messageEvent) => {
      // console.log('worker got message', messageEvent, messageEvent.data)
      if (messageEvent.data.type === 'route-search-result') {
        this.followerPath = messageEvent.data.payload.path
        console.log('game: set followerPath', this.followerPath)
      }
    }
    worker.onerror = (errorEvent) => {
      console.log('game: worker got error')
    }
    worker.onmessageerror = (e) => {
      console.log('game: worker got message error')
    }

    worker.postMessage({
      type: 'set-game',
      payload: {
        game: {...this, canvasHandler: undefined, map: {...this.map, canvasHandler: undefined}}
      }
    });
  }

  updateGoalFromMouse(x: number, y: number) {
    // this.goalX = x
    // this.goalY = y
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.map.draw(ctx, this.camera, this.debugSearchPointScores)
    this.player.draw(ctx, this.camera)
    this.follower.draw(ctx, this.camera)

    for (let i = 0; i < this.enemies.length; i++) {
      const enemy = this.enemies[i]
      enemy.draw(ctx, this.camera)
    }
    for (let i = 0; i < this.coins.length; i++) {
      const coin = this.coins[i]
      coin.draw(ctx, this.camera)
    }

    // Draw debug points
    for (let i = 0; i < this.debugPoints.length; i++) {
      const db = this.debugPoints[i]
      // ctx.strokeStyle = 'rgba(32, 181, 39, 0.25)';
      ctx.strokeStyle = 'rgb(32, 181, 39)';
      ctx.beginPath();
      ctx.arc(
        this.camera.gameToScreenX(db.x + this.follower.width / 2),
        this.camera.gameToScreenY(db.y + this.follower.height / 2),
        1,
        0,
        2 * Math.PI
      );
      ctx.stroke();
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
    this.enemies = this.enemies.filter(e => !e.isDead)
    this.coins = this.coins.filter(c => !c.touches(this.player))

    if (this.keyboardHandler.pressed('t')) {
      const {debugPoints} = this.routeSearch(this.player, 0, 0, 250, false)
      this.debugPoints = debugPoints
    }

    if (
      this.frameIndex % (60 * 3) === 0 &&
      this.frameIndex !== 0 &&
      this.followerPath.length === 0
    ) {
      // const {path} = this.routeSearch(this.follower, this.player.x, this.player.y)
      // this.followerPath = path
      worker.postMessage({
        type: 'route-search',
        payload: {
          entity: this.follower,
          x: this.player.x,
          y: this.player.y
        }
      });
    }
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

    this.follower.update(this.map, this.frameIndex)
    this.player.update(this.map, this.frameIndex)

    for (let i = 0; i < this.enemies.length; i++) {
      const enemy = this.enemies[i]
      enemy.update(this.map, this.frameIndex)
      this.player.interact(enemy)
    }

    for (let i = 0; i < this.coins.length; i++) {
      const coin = this.coins[i]
      coin.update(this.map, this.frameIndex)
      // this.player.interact(coin)
    }

    this.camera.moveTowards(this.player.x, this.player.y)

    this.frameIndex += 1
  }

  routeSearch(
    entity: BaseEntity,
    goalX: number,
    goalY: number,
    maxPoints: number = 500,
    sort: boolean = true,
  ) {
    this.map.updatePointScoreMap(this.debugSearchPointScores, Math.floor(goalX), Math.floor(goalY))
    const pointScores = this.debugSearchPointScores

    interface HandledEntity {
      entity: BaseEntity,
      parent: HandledEntity | undefined
      controls: IControls | undefined
    }

    const debugPoints: IPoint[] = []

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

    class UnsortedHeap<T> {
      data: T[]

      constructor() {
        this.data = []
      }

      push(item: T) {
        this.data.push(item)
      }

      pop(): T {
        if (this.data.length === 0) {
          throw "Could not pop"
        }
        return this.data.shift() as T
      }
    }

    // let entities = new Heap<HandledEntity>(compareEntity);
    // let entities = new UnsortedHeap<HandledEntity>()
    let entities = sort ? new Heap<HandledEntity>(compareEntity) : new UnsortedHeap<HandledEntity>()

    entities.push({
      entity: entity.clone(),
      parent: undefined,
      controls: undefined
    })

    outerLoop: for (let i = 0; i < maxPoints; i++) {
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
          newEntity.update(this.map, this.frameIndex) // TODO: This might not be ok for everything in the future
        }

        if (hasher[newEntity.getSearchHash()]) {
          continue
        }

        const newHandledEntity = {
          entity: newEntity,
          parent: handledEntity,
          controls: controls,
        }

        const isSteady = (
          newHandledEntity.entity.isUsingLadder ||
          newHandledEntity.entity.isOnGround ||
          newHandledEntity.entity.isHanging
        )

        if (
          Math.floor(newEntity.x) === Math.floor(goalX) &&
          Math.floor(newEntity.y) === Math.floor(goalY) &&
          isSteady
        ) {
          winner = newHandledEntity
          break outerLoop
        }

        if (!winner) {
          winner = newHandledEntity
        }
        if (
          scoreEntity(newHandledEntity) < scoreEntity(winner) &&
          isSteady
        ) {
          winner = newHandledEntity
        }

        debugPoints.push({x: newEntity.x, y: newEntity.y})
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
    return {
      path,
      debugPoints
    }
  }
}
