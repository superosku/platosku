import {IControls, IPoint, tileSize} from "../common";
import {GameMap} from "./GameMap";
import {KeyboardHandler} from "./KeyboardHandler";
import {Camera} from "./Camera";


const eps = 0.05

type TTraitName = 'gravity-trait' | 'game-map-trait'

class Trait {
  traitName: TTraitName

  constructor(traitName: TTraitName) {
    this.traitName = traitName
  }

  update(entity: BaseEntity, map: GameMap, frameIndex: number) {

  }
}

class GravityTrait extends Trait {
  constructor() {
    super('gravity-trait');
  }

  update(entity: BaseEntity, map: GameMap, frameIndex: number) {
    super.update(entity, map, frameIndex)

    if (!entity.isUsingLadder) {
      entity.speedy = entity.speedy + 0.01
    }
  }
}

class GameMapTrait extends Trait {
  constructor() {
    super('game-map-trait');
  }

  innerUpdate(entity: BaseEntity, map: GameMap, sm: number) {
    if (entity.isHanging) {
      entity.speedx = 0
      entity.speedy = 0
    }

    entity.y += entity.speedy * sm
    entity.x += entity.speedx * sm
    const center = entity.getCenter()
    const ladderTile = map.at(center.x, entity.y + entity.height - eps)
    entity.couldUseLadder = ladderTile === 2 || ladderTile === 5

    const wallsOnLeft = (
      map.blockedAt(entity.x, entity.y + eps) ||
      map.blockedAt(entity.x, entity.y + entity.height - eps)
    )
    const wallsOnRight = (
      map.blockedAt(entity.x + entity.width, entity.y + eps) ||
      map.blockedAt(entity.x + entity.width, entity.y + entity.height - eps)
    )

    entity.hittingX = wallsOnRight || wallsOnLeft
    entity.blockedLeft = wallsOnLeft
    entity.blockedRight = wallsOnRight

    entity.fallingLeft = (
      entity.isOnGround &&
      !map.walkableAt(entity.x - eps, entity.y + entity.height + eps)
    )
    entity.fallingRight = (
      entity.isOnGround &&
      !map.walkableAt(entity.x + eps + entity.width, entity.y + entity.height + eps)
    )

    // Hanging
    if (entity.speedy > 0 && map.at(center.x, center.y + entity.height) !== 1) {
      const lowEnoughForHanging = entity.y - Math.floor(entity.y) > 0.85
      if (
        entity.canHang &&
        lowEnoughForHanging &&
        entity.speedx < 0 &&
        wallsOnLeft &&
        !map.blockedAt(entity.x, entity.y)
      ) {
        entity.isHanging = true
        entity.y = Math.floor(entity.y - eps) + 1
      }
      // Right
      if (
        entity.canHang &&
        lowEnoughForHanging &&
        entity.speedx > 0 &&
        wallsOnRight &&
        !map.blockedAt(entity.x + entity.width + eps, entity.y)
      ) {
        entity.isHanging = true
        entity.y = Math.floor(entity.y - eps) + 1
      }
    }

    // Ceiling
    if (
      entity.speedy < 0 &&
      (
        map.blockedAt(entity.x + eps, entity.y) ||
        map.blockedAt(entity.x + entity.width - eps, entity.y)
      )
    ) {
      entity.y = Math.floor(entity.y) + 1
      entity.speedy = 0
      entity.hittingY = true
    }

    // Floor
    entity.isOnGround = false
    if (
      // entity.speedy > 0 &&
      (
        map.blockedAt(entity.x + eps, entity.y + entity.height) ||
        map.blockedAt(entity.x + entity.width - eps, entity.y + entity.height) ||
        (
          (
            map.at(entity.x + eps, entity.y + entity.height) === 5 ||
            map.at(entity.x + entity.width - eps, entity.y + entity.height) === 5 ||
            map.at(entity.x + eps, entity.y + entity.height) === 6 ||
            map.at(entity.x + entity.width - eps, entity.y + entity.height) === 6
          ) && (
            (entity.y + entity.height) - Math.floor((entity.y + entity.height)) < 0.05
          )
        )
      )
    ) {
      if (!entity.isUsingLadder || map.at(center.x, entity.y + entity.height + eps) === 1) {
        entity.speedy = 0
        entity.y = Math.floor(entity.y + entity.height) - entity.height
        entity.isOnGround = true
        entity.hittingY = true
      }
    }

    // Crouching down
    entity.couldCrouchDown = (
      entity.isOnGround &&
      (
        (
          map.at(entity.x + eps, entity.y + entity.height + eps) === 5 ||
          map.at(entity.x + eps, entity.y + entity.height + eps) === 6
        ) &&
        (
          map.at(entity.x + entity.width - eps, entity.y + entity.height) === 5 ||
          map.at(entity.x + entity.width - eps, entity.y + entity.height) === 6
        )
      ) ||
      (
        (
          map.at(entity.x + eps, entity.y + entity.height + eps) === 0
        ) &&
        (
          map.at(entity.x + entity.width - eps, entity.y + entity.height) === 5 ||
          map.at(entity.x + entity.width - eps, entity.y + entity.height) === 6
        )
      ) ||
      (
        (
          map.at(entity.x + eps, entity.y + entity.height + eps) === 5 ||
          map.at(entity.x + eps, entity.y + entity.height + eps) === 6
        ) &&
        (
          map.at(entity.x + entity.width - eps, entity.y + entity.height) === 0
        )
      )
    )

    // Walls left
    if (wallsOnLeft) {
      entity.x = Math.floor(entity.x) + 1
    }
    // Walls right
    if (wallsOnRight) {
      entity.x = Math.floor(entity.x + entity.width) - entity.width
    }

    // Going side from bottom of ladders
    if (
      entity.isUsingLadder &&
      (entity.y + entity.height - eps) - Math.floor(entity.y + entity.height - eps) > 0.5 &&
      (
        map.blockedAt(center.x, Math.floor(entity.y + entity.height - eps + 0.5)) ||
        map.at(center.x, Math.floor(entity.y + entity.height - eps + 0.5)) === 5 ||
        map.at(center.x, Math.floor(entity.y + entity.height - eps + 0.5)) === 6
      )
    ) {
      entity.couldSideFromLadder = true
    } else {
      entity.couldSideFromLadder = false
    }
  }

  update(entity: BaseEntity, map: GameMap, frameIndex: number) {
    super.update(entity, map, frameIndex)

    entity.hittingY = false
    entity.hittingX = false

    entity.jumpedSinceFrames += 1
    const steps = 10
    for (let i = 0; i < steps; i++) {
      this.innerUpdate(entity, map, 1 / steps)
    }
  }
}

export const entityTraitMap = new Map<TTraitName, Trait>()
entityTraitMap.set('game-map-trait', GameMapTrait.prototype)
entityTraitMap.set('gravity-trait', GravityTrait.prototype)

export class BaseEntity {
  traits: Trait[]

  x: number
  y: number
  width: number
  height: number
  speedx: number
  speedy: number

  isOnGround: boolean
  couldUseLadder: boolean
  couldCrouchDown: boolean
  couldSideFromLadder: boolean
  jumpedSinceFrames: number
  jumpNeedsReset: boolean
  isUsingLadder: boolean
  isHanging: boolean

  blockedLeft: boolean
  blockedRight: boolean
  fallingRight: boolean
  fallingLeft: boolean

  hittingY: boolean
  hittingX: boolean

  isDead: boolean
  canHang: boolean

  constructor(pos: IPoint, size: IPoint) {
    this.traits = []

    this.x = pos.x
    this.y = pos.y
    this.width = size.x
    this.height = size.y
    this.speedx = 0
    this.speedy = 0

    this.isOnGround = false
    this.couldUseLadder = false
    this.isUsingLadder = false
    this.isHanging = false
    this.jumpedSinceFrames = 0
    this.jumpNeedsReset = false
    this.couldCrouchDown = false
    this.couldSideFromLadder = false

    this.blockedLeft = false
    this.blockedRight = false
    this.fallingLeft = false
    this.fallingRight = false

    this.hittingX = false
    this.hittingY = false

    this.isDead = false
    this.canHang = true
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera, fillStyle: string | undefined = undefined) {
    ctx.fillStyle = fillStyle || '#b38333';
    if (this.isOnGround && !fillStyle) {
      ctx.fillStyle = '#886427';
    }
    if (this.isHanging && !fillStyle) {
      ctx.fillStyle = '#275388';
    }
    if (this.isUsingLadder && !fillStyle) {
      ctx.fillStyle = '#226638';
    }
    ctx.fillRect(
      camera.gameToScreenX(this.x),
      camera.gameToScreenY(this.y),
      // this.x * tileSize,
      // this.y * tileSize,
      tileSize * this.width,
      tileSize * this.height
    );
  }

  getSearchHash() {
    return `
    ${Math.floor(this.x * 12)}|
    ${Math.floor(this.y * 12)}|
    ${Math.floor(this.speedy * 100)}|
    ${this.isUsingLadder}|
    ${this.isHanging}|`
  }

  updateFromControls(controls: IControls) {
    if (!this.couldUseLadder && this.isUsingLadder) {
      this.isUsingLadder = false
    }
    if (controls.left && (!this.isUsingLadder || this.couldSideFromLadder)) {
      this.speedx = -0.13
      this.isUsingLadder = false
    } else if (controls.right && (!this.isUsingLadder || this.couldSideFromLadder)) {
      this.speedx = 0.13
      this.isUsingLadder = false
    } else {
      this.speedx = 0
    }

    if (!controls.jump) {
      this.jumpNeedsReset = false
    }

    // Juping
    if (
      controls.jump &&
      (
        this.isHanging ||
        this.isOnGround ||
        this.isUsingLadder ||
        this.jumpedSinceFrames === 8 ||
        (controls.down && this.couldCrouchDown)
      ) &&
      (
        !this.jumpNeedsReset || this.jumpedSinceFrames === 8
      )
    ) {
      this.jumpNeedsReset = true
      this.speedy = controls.down ? 0 : -0.13
      if (controls.down && this.couldCrouchDown) {
        this.y += 0.06
      }
      this.isUsingLadder = false
      this.isHanging = false
      if (this.isOnGround || this.isUsingLadder || this.isHanging) {
        this.jumpedSinceFrames = 0
      }
    }

    // Laddering
    if (this.isUsingLadder) {
      this.speedy = 0
    }
    if (controls.up && this.couldUseLadder && !this.isHanging) {
      this.isUsingLadder = true
      this.speedy = -0.07
      this.speedx = 0
      this.x = Math.floor(this.x + this.width / 2) + (1 - this.width) / 2
    }
    if (controls.down && (this.couldUseLadder || this.isUsingLadder) && !this.isHanging) {
      this.isUsingLadder = true
      this.speedy = 0.07
      this.speedx = 0
      this.x = Math.floor(this.x + this.width / 2) + (1 - this.width) / 2
    }
    if (controls.up && this.isUsingLadder && !this.couldUseLadder) {
      this.speedy = 0
    }
  }

  getCenter() {
    return {x: this.x + this.width / 2, y: this.y + this.height / 2}
  }

  updateFromKeyboard(keyboardHandler: KeyboardHandler) {
    this.updateFromControls({
      left: keyboardHandler.pressed('a'),
      right: keyboardHandler.pressed('d'),
      down: keyboardHandler.pressed('s'),
      up: keyboardHandler.pressed('w'),
      jump: keyboardHandler.pressed(' '),
    })
  }

  update(map: GameMap, frameIndex: number) {
    for (let i = 0; i < this.traits.length; i++) {
      const trait = this.traits[i]
      trait.update(this, map, frameIndex)
    }
  }

  clone(): BaseEntity {
    const clone = {...this}
    Object.setPrototypeOf(clone, BaseEntity.prototype)
    return clone
  }

  gotHit() {
    this.isDead = true
  }

  touches(other: BaseEntity) {
    return (
      other.x + other.width > this.x &&
      other.x < this.x + this.width &&
      other.y + other.height > this.y &&
      other.y < this.y + this.height
    )
  }
}

export class Player extends BaseEntity {
  constructor(pos: IPoint) {
    super(pos, {x: 0.55, y: 0.75});
    this.traits = [
      new GameMapTrait(),
      new GravityTrait(),
    ]
  }

  interact(entity: BaseEntity) {
    if (this.speedy < 0) {
      return
    }
    if (
      entity.x + entity.width > this.x &&
      entity.x < this.x + this.width &&
      this.y + this.height > entity.y &&
      this.y + this.height < entity.y + 0.2
    ) {
      this.isHanging = false
      this.isUsingLadder = false
      this.speedy = -0.15
      entity.gotHit()
    }
  }
}

export class FlyingEnemy extends BaseEntity {
  speedxGoal: number
  speedyGoal: number
  randomOffset: number

  constructor(pos: IPoint) {
    super(pos, {x: 0.7, y: 0.4});
    this.traits = [
      new GameMapTrait(),
    ]
    this.speedxGoal = 0
    this.speedyGoal = 0
    this.canHang = false
    this.randomOffset = Math.floor(Math.random() * 1000)
    this.setRandomSpeed()
  }

  setRandomSpeed() {
    const randomAngle = Math.random() * Math.PI * 2
    const speedMultiplier = 0.02
    const speedx = Math.sin(randomAngle) * speedMultiplier
    const speedy = Math.cos(randomAngle) * speedMultiplier
    this.speedxGoal = speedx
    this.speedyGoal = speedy
  }

  update(map: GameMap, frameIndex: number) {
    // const randomAngle = Math.sin(Math.random() * Math.PI * 2)
    if ((frameIndex + this.randomOffset) % (60 * 5) === 0) {
      this.setRandomSpeed()
    }

    if (this.hittingY) {
      this.speedyGoal = -this.speedyGoal
    }
    if (this.hittingX) {
      this.speedxGoal = -this.speedxGoal
    }

    this.speedx = this.speedxGoal
    this.speedy = this.speedyGoal

    super.update(map, frameIndex)
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera) {
    super.draw(ctx, camera, '#8d2991')
  }
}

export class WalkingEnemy extends BaseEntity {
  direction: 'left' | 'right'

  constructor(pos: IPoint) {
    super(pos, {x: 0.5, y: 0.5});
    this.traits = [
      new GameMapTrait(),
      new GravityTrait(),
    ]
    this.direction = Math.random() < 0.5 ? 'left' : 'right'
    this.canHang = false
  }

  update(map: GameMap, frameIndex: number) {
    if (this.direction === 'left') {
      this.speedx = -0.02 - Math.random() * 0.002
      if (this.blockedLeft || this.fallingLeft) {
        this.direction = 'right'
      }
    } else {
      this.speedx = +0.02 + Math.random() * 0.002
      if (this.blockedRight || this.fallingRight) {
        this.direction = 'left'
      }
    }

    super.update(map, frameIndex)
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera) {
    super.draw(ctx, camera, '#507a25')
  }
}

type TCoinType = 'coin' | 'diamond'

export class Coin extends BaseEntity {
  type: TCoinType

  constructor(pos: IPoint, type: TCoinType) {
    super(pos, {x: 0.35, y: 0.35});
    this.traits = [
      new GameMapTrait(),
      new GravityTrait(),
    ]
    this.canHang = false
    this.type = type
  }

  update(map: GameMap, frameIndex: number) {
    super.update(map, frameIndex)
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera) {
    if (this.type === 'coin') {
      ctx.fillStyle = '#cba722'
      ctx.beginPath()
      ctx.arc(
        camera.gameToScreenX(this.x + this.width / 2),
        camera.gameToScreenY(this.y + this.height / 2),
        this.width / 2 * tileSize,
        0,
        Math.PI * 2,
      );
      ctx.fill()
    } else {
      const topX = camera.gameToScreenX(this.x)
      const topY = camera.gameToScreenY(this.y)
      ctx.fillStyle = '#1849c6'
      ctx.beginPath()
      // Top center
      ctx.moveTo(
        topX + this.width / 2 * tileSize,
        topY
      )
      // Right middle
      ctx.lineTo(
        topX + this.width * tileSize,
        topY + this.height * tileSize * 0.3
      )
      // Bottom center
      ctx.lineTo(
        topX + this.width / 2 * tileSize,
        topY + this.height * tileSize
      )
      // Left middle
      ctx.lineTo(
        topX,
        topY + this.height * tileSize * 0.3
      )
      // Top center
      ctx.lineTo(
        topX + this.width / 2 * tileSize,
        topY
      )
      ctx.fill()
    }
  }
}
