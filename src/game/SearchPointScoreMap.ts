import {IPoint, range} from "../common";
import {GameMap} from "./GameMap";

export const getPointScore = (pointt: IPoint, pointScores: SearchPointScoreMap): number => {
  const point: IPoint = {x: pointt.x - 0.5, y: pointt.y - 0.5}
  const x1 = Math.floor(pointt.x - 0.5)
  const x2 = Math.floor(pointt.x + 0.5)
  const y1 = Math.floor(pointt.y - 0.5)
  const y2 = Math.floor(pointt.y + 0.5)

  const q11 = pointScores.get(x1, y1)
  const q12 = pointScores.get(x1, y2)
  const q21 = pointScores.get(x2, y1)
  const q22 = pointScores.get(x2, y2)

  // Bilinear https://en.wikipedia.org/wiki/Bilinear_interpolation
  if (q11 && q12 && q21 && q22) {
    const w11 = (x2 - point.x) * (y2 - point.y) / (x2 - x1) * (y2 - y1)
    const w12 = (x2 - point.x) * (point.y - y1) / (x2 - x1) * (y2 - y1)
    const w21 = (point.x - x1) * (y2 - point.y) / (x2 - x1) * (y2 - y1)
    const w22 = (point.x - x1) * (point.y - y1) / (x2 - x1) * (y2 - y1)

    return (
      q11 * w11 +
      q12 * w12 +
      q21 * w21 +
      q22 * w22
    )
  }

  const remainingPoints = [
    {score: q11, point: {x: x1, y: y1}},
    {score: q12, point: {x: x1, y: y2}},
    {score: q21, point: {x: x2, y: y1}},
    {score: q22, point: {x: x2, y: y2}},
  ].filter(t => t.score !== undefined)

  const defaultValue = pointScores.get(Math.floor(point.x), Math.floor(point.y)) || 9999

  // Three points https://math.stackexchange.com/questions/1099390/billinear-interpolation-of-3-points
  if (remainingPoints.length === 3) {
    let s1 = remainingPoints[0].score!
    let p1 = remainingPoints[0].point
    let s2 = remainingPoints[1].score!
    let p2 = remainingPoints[1].point
    let s3 = remainingPoints[2].score!
    let p3 = remainingPoints[2].point

    const divider = (
      (p2.y - p3.y) * (p1.x - p3.x) +
      (p3.x - p2.x) * (p1.y - p3.y)
    )

    const w1 = (
      (p2.y - p3.y) * (point.x - p3.x) +
      (p3.x - p2.x) * (point.y - p3.y)
    ) / divider
    const w2 = (
      (p3.y - p1.y) * (point.x - p3.x) +
      (p1.x - p3.x) * (point.y - p3.y)
    ) / divider
    const w3 = 1 - w1 - w2

    return s1 * w1 + s2 * w2 + s3 * w3


    // if (
    //   p2.x * (p1.y - p2.y) +
    //   p1.x * (p2.y - p3.y) +
    //   p2.x * (p3.y - p1.y) === 0
    // ) {
    //   [s1, p1, s2, p2] = [s2, p2, s1, p1]
    //   if (
    //     p2.x * (p1.y - p2.y) +
    //     p1.x * (p2.y - p3.y) +
    //     p2.x * (p3.y - p1.y) === 0
    //   ) {
    //     [s1, p1, s3, p3] = [s3, p3, s1, p1]
    //   }
    // }
    //
    // const divider = (
    //   p3.x * (p1.y - p2.y) +
    //   p1.x * (p2.y - p3.y) +
    //   p2.x * (p3.y - p1.y)
    // )
    //
    // const a = (
    //   s3 * (p1.y - p2.y) +
    //   s1 * (p2.y - p3.y) +
    //   s2 * (p3.y - p1.y)
    // ) / divider
    // const b = (
    //   s3 * (p2.x - p1.x) +
    //   s2 * (p1.x - p3.x) +
    //   s1 * (p3.x - p2.x)
    // ) / divider
    // const c = (
    //   s3 * (p1.x * p2.y - p2.x * -p1.y) +
    //   s2 * (p3.x * p1.y - p1.x * -p3.y) +
    //   s1 * (p2.x * p3.y - p3.x * -p2.y)
    // ) / divider
    //
    // if (a === Infinity || a === -Infinity) {
    //   // console.log(p1, p2, p3, s1, s2, s3)
    //   debugger;
    //   // console.log(a, c)
    // }
    //
    // const val = a * point.x + b * point.y + c
    //
    // // debugger;
    // console.log(s1, p1, s2, p2, s3, p3, a, b, c, val)
    // console.log(a, b, c)
    // console.log(val)
    //
    // return val
    //
    // // return 10
    // // return defaultValue
    // // return pointScores.get(Math.floor(point.x), Math.floor(point.y)) || 9999
  }

  // Two points
  if (remainingPoints.length === 2) {
    const s1 = remainingPoints[0].score!
    const p1 = remainingPoints[0].point
    const s2 = remainingPoints[1].score!
    const p2 = remainingPoints[1].point

    if (p1.x === p2.x) {
      const ratio = (p1.y - point.y) / (p1.y - p2.y)
      return s2 * ratio + s1 * (1 - ratio)
    }
    if (p1.y === p2.y) {
      const ratio = (p1.x - point.x) / (p1.x - p2.x)
      return s2 * ratio + s1 * (1 - ratio)
    }

    const k = (p2.y - p1.y) / (p2.x - p1.x)
    const a = p2.y - k * p2.x

    const b = point.y + 1 / k * point.x

    const nx = (b - a) / (k + 1 / k)

    const ratio = (p2.x - nx) / (p2.x - p1.x)
    const retVal = s1 * ratio + s2 * (1 - ratio)

    return retVal
  }

  return 10
  // return defaultValue
}

export class SearchPointScoreMap {
  data: number[]
  width: number
  height: number

  constructor(gameMap: GameMap) {
    this.height = gameMap.height
    this.width = gameMap.width
    this.data = range(this.width * this.height).map(n => -1)
  }

  reset() {
    for (let i = 0; i < this.data.length; i++) {
      this.data[i] = -1
    }
  }

  has(x: number, y: number) {
    return this.get(x, y) !== undefined
  }

  get(x: number, y: number) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
      return undefined
    }
    if (this.data[x * this.height + y] === -1) {
      return undefined
    }
    return this.data[x * this.height + y]
  }

  set(x: number, y: number, value: number) {
    this.data[x * this.height + y] = value
  }
}
