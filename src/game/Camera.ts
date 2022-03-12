import {tileSize} from "../common";

export class Camera {
  centerX: number
  centerY: number
  canvasWidth: number
  canvasHeight: number

  constructor(canvasWidth: number, canvasHeight: number) {
    this.centerX = 0
    this.centerY = 0
    this.canvasWidth = canvasWidth
    this.canvasHeight = canvasHeight
  }

  moveTowards(x: number, y: number) {
    this.centerX = x
    this.centerY = y
  }

  gameToScreenX(x: number) {
    return Math.floor((x - this.centerX) * tileSize + this.canvasWidth / 2)
  }

  gameToScreenY(y: number) {
    return Math.floor((y - this.centerY) * tileSize + this.canvasHeight / 2)
  }
}
