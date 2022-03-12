import {IControls, tileSize} from "../common";
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
  jumpedSinceFrames: number

  constructor() {
    this.x = 3
    this.y = 3
    this.width = 0.7
    this.height = 0.9
    this.speedx = 0
    this.speedy = 0
    this.isOnGround = false
    this.couldUseLadder = false
    this.isUsingLadder = false
    this.jumpedSinceFrames = 0
  }

  draw(ctx: CanvasRenderingContext2D, camera: Camera) {
    ctx.fillStyle = '#9137a9';
    if (this.isOnGround) {
      ctx.fillStyle = '#312853';
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
    return `
    ${Math.floor(this.x * 12)}|
    ${Math.floor(this.y * 12)}|
    ${Math.floor(this.speedy * 100)}|
    ${this.isUsingLadder}|
    ${this.couldUseLadder}|
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
    // Left and right
    if (controls.left) {
      this.isUsingLadder = false
      this.speedx = -0.1
    } else if (controls.right) {
      this.isUsingLadder = false
      this.speedx = 0.1
    } else {
      this.speedx = 0
    }

    // Juping
    if (
      controls.jump &&
      (
        this.isOnGround || this.isUsingLadder || this.jumpedSinceFrames === 6
      )
    ) {
      this.speedy = -0.16
      this.isUsingLadder = false
      if (this.isOnGround || this.isUsingLadder) {
        this.jumpedSinceFrames = 0
      }
    }

    // Laddering
    if (this.couldUseLadder && this.isUsingLadder) {
      this.speedy = 0
    }
    if (controls.up && this.couldUseLadder) {
      this.isUsingLadder = true
      this.speedy = -0.07
      this.speedx = 0
      this.x = Math.floor(this.x + this.width / 2) + (1 - this.width) / 2
    }
    if (controls.down && this.couldUseLadder) {
      this.isUsingLadder = true
      this.speedy = 0.07
      this.speedx = 0
      this.x = Math.floor(this.x + this.width) + (1 - this.width) / 2
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

  update(map: GameMap) {
    const eps = 0.11

    if (!this.isUsingLadder) {
      this.speedy += 0.01
    }

    this.jumpedSinceFrames += 1
    this.y += this.speedy
    this.x += this.speedx
    const center = this.getCenter()
    this.couldUseLadder = map.at(center.x, center.y) === 2

    // Ceiling
    if (
      map.at(this.x + eps, this.y) === 1 ||
      map.at(this.x + this.width - eps, this.y) === 1
    ) {
      this.y = Math.floor(this.y) + 1
      this.speedy = 0
    }

    // Floor
    this.isOnGround = false
    if (
      map.at(this.x + eps, this.y + this.height) === 1 ||
      map.at(this.x + this.width - eps, this.y + this.height) === 1
    ) {
      this.speedy = 0
      this.y = Math.floor(this.y + this.height) - this.height
      this.isOnGround = true
    }
    // Was on floor and should still be able to jump
    if (
      (
        this.speedx > 0 &&
        map.at(this.x + eps, this.y + this.height) !== 1 &&
        map.at(this.x + eps - 0.2, this.y + this.height) === 1 &&
        map.at(this.x + eps - 0.2, this.y + this.height - 0.2) !== 1
      )
    ) {
      this.isOnGround = true
    }

    // Walls left
    if (
      map.at(this.x, this.y + eps) === 1 ||
      map.at(this.x, this.y + this.height - eps) === 1
    ) {
      this.x = Math.floor(this.x) + 1
    }
    // Walls right
    if (
      map.at(this.x + this.width, this.y + eps) === 1 ||
      map.at(this.x + this.width, this.y + this.height - eps) === 1
    ) {
      this.x = Math.floor(this.x + this.width) - this.width
    }
  }

  clone(): Entity {
    const clone = {...this}
    Object.setPrototypeOf(clone, Entity.prototype)
    return clone
  }
}
