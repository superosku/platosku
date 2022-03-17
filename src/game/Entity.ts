import {IControls, IPoint, tileSize} from "../common";
import {GameMap} from "./GameMap";
import {KeyboardHandler} from "./KeyboardHandler";
import {Camera} from "./Camera";


export class Entity {
  x: number
  y: number
  width: number
  height: number
  speedx: number
  speedy: number
  isOnGround: boolean

  couldUseLadder: boolean
  isUsingLadder: boolean

  // couldHang: boolean
  isHanging: boolean

  jumpedSinceFrames: number
  jumpNeedsReset: boolean

  couldCrouchDown: boolean
  couldSideFromLadder: boolean

  constructor(pos: IPoint) {
    this.x = pos.x
    this.y = pos.y
    this.width = 0.55
    this.height = 0.75
    this.speedx = 0
    this.speedy = 0
    this.isOnGround = false

    this.couldUseLadder = false
    this.isUsingLadder = false

    // this.couldHang = false
    this.isHanging = false

    this.jumpedSinceFrames = 0
    this.jumpNeedsReset = false

    this.couldCrouchDown = false
    this.couldSideFromLadder = false
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera) {
    ctx.fillStyle = '#b38333';
    if (this.isOnGround) {
      ctx.fillStyle = '#886427';
    }
    if (this.isHanging) {
      ctx.fillStyle = '#275388';
    }
    if (this.isUsingLadder) {
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
    // return Math.random().toString()
    // return `
    // ${Math.floor(this.x / 0.7)}|
    // ${Math.floor(this.y / 0.012)}|
    // `
    // For step 1:
    // return `
    // ${(this.x)}|
    // ${(this.y)}|
    // ${this.isUsingLadder}|
    // ${this.isHanging}|
    // `
    return `
    ${Math.floor(this.x * 12)}|
    ${Math.floor(this.y * 12)}|
    ${Math.floor(this.speedy * 100)}|
    ${this.isUsingLadder}|
    ${this.isHanging}|
    `
    // ${this.isUsingLadder}`
    // For step 4:
    return `
    ${Math.floor(this.x * 4)}|
    ${Math.floor(this.y * 4)}|
    ${Math.floor(this.speedy * 5)}|
    ${this.isUsingLadder}|
    ${this.couldUseLadder}|
    ${this.isUsingLadder}`
  }

  updateFromControls(controls: IControls) {
    if (!this.couldUseLadder && this.isUsingLadder) {
      this.isUsingLadder = false
    }

    // Left and right
    // const couldSideFromLadder = (
    //   this.isUsingLadder &&
    // )
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

  innerUpdate(map: GameMap, sm: number) {
    const eps = 0.05

    if (!this.isUsingLadder) {
      // this.speedy = Math.min(this.speedy + 0.01, eps - 0.001)
      this.speedy = this.speedy + 0.01 * sm
    }

    if (this.isHanging) {
      this.speedx = 0
      this.speedy = 0
    }

    this.y += this.speedy * sm
    this.x += this.speedx * sm
    const center = this.getCenter()
    const ladderTile = map.at(center.x, this.y + this.height - eps)
    this.couldUseLadder = ladderTile === 2 || ladderTile === 5

    const wallsOnLeft = (
      map.blockedAt(this.x, this.y + eps) ||
      map.blockedAt(this.x, this.y + this.height - eps)
    )
    const wallsOnRight = (
      map.blockedAt(this.x + this.width, this.y + eps) ||
      map.blockedAt(this.x + this.width, this.y + this.height - eps)
    )

    // Hanging
    if (this.speedy > 0 && map.at(center.x, center.y + this.height) !== 1) {
      const lowEnoughForHanging = this.y - Math.floor(this.y) > 0.85
      if (
        lowEnoughForHanging &&
        this.speedx < 0 &&
        wallsOnLeft &&
        !map.blockedAt(this.x, this.y)
      ) {
        this.isHanging = true
        this.y = Math.floor(this.y - eps) + 1
      }
      // Right
      if (
        lowEnoughForHanging &&
        this.speedx > 0 &&
        wallsOnRight &&
        !map.blockedAt(this.x + this.width + eps, this.y)
      ) {
        this.isHanging = true
        this.y = Math.floor(this.y - eps) + 1
      }
    }

    // Ceiling
    if (
      this.speedy < 0 &&
      (
        map.blockedAt(this.x + eps, this.y) ||
        map.blockedAt(this.x + this.width - eps, this.y)
      )
    ) {
      this.y = Math.floor(this.y) + 1
      this.speedy = 0
    }

    // Floor
    this.isOnGround = false
    if (
      this.speedy > 0 &&
      (
        map.blockedAt(this.x + eps, this.y + this.height) ||
        map.blockedAt(this.x + this.width - eps, this.y + this.height) ||
        (
          (
            map.at(this.x + eps, this.y + this.height) === 5 ||
            map.at(this.x + this.width - eps, this.y + this.height) === 5 ||
            map.at(this.x + eps, this.y + this.height) === 6 ||
            map.at(this.x + this.width - eps, this.y + this.height) === 6
          ) && (
            (this.y + this.height) - Math.floor((this.y + this.height)) < 0.05
          )
        )
      )
    ) {
      if (!this.isUsingLadder || map.at(center.x, this.y + this.height + eps) === 1) {
        this.speedy = 0
        this.y = Math.floor(this.y + this.height) - this.height
        this.isOnGround = true
      }
    }

    this.couldCrouchDown = (
      this.isOnGround &&
      (
        (
          map.at(this.x + eps, this.y + this.height + eps) === 5 ||
          map.at(this.x + eps, this.y + this.height + eps) === 6
        ) &&
        (
          map.at(this.x + this.width - eps, this.y + this.height) === 5 ||
          map.at(this.x + this.width - eps, this.y + this.height) === 6
        )
      ) ||
      (
        (
          map.at(this.x + eps, this.y + this.height + eps) === 0
        ) &&
        (
          map.at(this.x + this.width - eps, this.y + this.height) === 5 ||
          map.at(this.x + this.width - eps, this.y + this.height) === 6
        )
      ) ||
      (
        (
          map.at(this.x + eps, this.y + this.height + eps) === 5 ||
          map.at(this.x + eps, this.y + this.height + eps) === 6
        ) &&
        (
          map.at(this.x + this.width - eps, this.y + this.height) === 0
        )
      )
    )

    // // Was on floor and should still be able to jump
    // if (
    //   (
    //     this.speedx > 0 &&
    //     map.at(this.x + eps, this.y + this.height) !== 1 &&
    //     map.at(this.x + eps - 0.2, this.y + this.height) === 1 &&
    //     map.at(this.x + eps - 0.2, this.y + this.height - 0.2) !== 1
    //   )
    // ) {
    //   this.isOnGround = true
    // }

    // Walls left
    if (wallsOnLeft) {
      this.x = Math.floor(this.x) + 1
    }
    // Walls right
    if (wallsOnRight) {
      this.x = Math.floor(this.x + this.width) - this.width
    }

    // Going side from bottom of ladders
    if (
      this.isUsingLadder &&
      (this.y + this.height - eps) - Math.floor(this.y + this.height - eps) > 0.5 &&
      (
        map.blockedAt(center.x, Math.floor(this.y + this.height - eps + 0.5)) ||
        map.at(center.x, Math.floor(this.y + this.height - eps + 0.5)) === 5 ||
        map.at(center.x, Math.floor(this.y + this.height - eps + 0.5)) === 6
      )
    ) {
      this.couldSideFromLadder = true
    } else {
      this.couldSideFromLadder = false
    }
  }

  update(map: GameMap) {
    this.jumpedSinceFrames += 1
    const steps = 10
    for (let i = 0; i < steps; i++) {
      this.innerUpdate(map, 1 / steps)
    }

    // const storeRes = 8
    // this.x = Math.floor(this.x * storeRes) / storeRes
    // this.y = Math.floor(this.y * storeRes) / storeRes
  }

  clone(): Entity {
    const clone = {...this}
    Object.setPrototypeOf(clone, Entity.prototype)
    return clone
  }
}
