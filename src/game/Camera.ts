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

  getDrawBoundaries() {
    return {
      topLeftX: Math.floor((this.centerX - this.canvasWidth/ 2 / tileSize) + 0),
      topLeftY: Math.floor((this.centerY - this.canvasHeight/ 2 / tileSize) + 0),
      bottomRightX: Math.floor((this.centerX + this.canvasWidth/ 2 / tileSize) + 1),
      bottomRightY: Math.floor((this.centerY + this.canvasHeight/ 2 / tileSize) + 1),
    }
  }

  moveTowards(x: number, y: number) {
    this.centerX -= (this.centerX - x) * 0.5
    this.centerY -= (this.centerY - y) * 0.5
  }

  gameToScreenX(x: number) {
    return Math.floor((x - this.centerX) * tileSize + this.canvasWidth / 2)
  }

  gameToScreenY(y: number) {
    return Math.floor((y - this.centerY) * tileSize + this.canvasHeight / 2)
  }
}
