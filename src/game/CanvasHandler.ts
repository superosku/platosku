import * as canvasMapJson from "../canvasMap.json"
import {ICanvasMap} from "../components/CanvasGenerator";
import {tileSize} from "../common";
const canvasMap: ICanvasMap = (canvasMapJson as any).default as ICanvasMap

export class CanvasHandler {
  image: HTMLImageElement
  canvasMap: ICanvasMap

  constructor(image: HTMLImageElement) {
    this.image = image
    this.canvasMap = canvasMap
  }

  drawKeyTo(ctx: CanvasRenderingContext2D , type: string, key: string, x: number, y: number) {
    if (!this.canvasMap[type] || !this.canvasMap[type][key]) {
      console.log('canvas handler not found')
      return
    }
    const sourceCoords = this.canvasMap[type][key]
    ctx.drawImage(
      this.image,
      sourceCoords.x,
      sourceCoords.y,
      tileSize,
      tileSize,
      x,
      y,
      tileSize,
      tileSize,
    );
  }
}
