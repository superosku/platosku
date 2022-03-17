import React from "react";
import {tileSize} from "../common";
import {KeyboardHandler} from "../game/KeyboardHandler";
import {Game} from "../game/Game";
import tiles from "../game/tiles.png"
import {CanvasHandler} from "../game/CanvasHandler";

export const GameComponent = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const tilesRef = React.useRef<HTMLImageElement>(null)

  React.useEffect(() => {
    if (canvasRef.current === null) {
      return
    }
    if (tilesRef.current === null) {
      return
    }

    const canvasHandler = new CanvasHandler(tilesRef.current)

    const canvas: HTMLCanvasElement = canvasRef.current
    const ctx: CanvasRenderingContext2D = canvas.getContext("2d")!

    const keyboardHandler = new KeyboardHandler()
    const game = new Game(keyboardHandler, canvas.width, canvas.height, canvasHandler)

    window.addEventListener('keyup', (event) => {
      keyboardHandler.keyup(event)
    })
    window.addEventListener('keydown', (event) => {
      keyboardHandler.keydown(event)
    })

    window.addEventListener('mousemove', (event) => {
      game.updateGoalFromMouse(
        Math.floor(event.pageX / tileSize),
        Math.floor(event.pageY / tileSize)
      )
    })

    const fps = 60
    // let fpsNumbers: number[] = []
    // const fpsFrames = 10

    const frameTimes: { update: number, draw: number, wait: number }[] = []

    let timeoutId: undefined | number = undefined

    let nextFrameTime = window.performance.now() + 1000 / fps
    const gameLoop = () => {
      // fpsNumbers.push((new Date).getTime())
      // if (fpsNumbers.length === fpsFrames + 1) {
      //   const timeForDuration = fpsNumbers[fpsNumbers.length - 1] - fpsNumbers[0]
      //   console.log('FPS', 1000 * 1 / (timeForDuration / (fpsFrames - 1)))
      //   fpsNumbers = []
      // }

      const startTime = window.performance.now()
      game.update()
      const updateTime = window.performance.now() - startTime
      ctx.fillStyle = '#5d5d5d'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      game.draw(ctx)
      const drawTime = window.performance.now() - startTime - updateTime

      if (frameTimes.length >= 60) {
        frameTimes.shift()
      }
      const barWidth = 2
      const heightMultiplier = 10

      const lagLimit = (1000 / fps) * heightMultiplier
      for (let i = 0; i < frameTimes.length; i++) {
        const updateHeight = frameTimes[i].draw * heightMultiplier
        const drawHeight = frameTimes[i].update * heightMultiplier

        if (frameTimes[i].wait > 0) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
          ctx.fillRect(i * barWidth, lagLimit, barWidth, frameTimes[i].wait)
        }

        ctx.fillStyle = 'rgba(118,55,181, 0.5)'
        ctx.fillRect(i * barWidth, 0, barWidth, updateHeight)
        ctx.fillStyle = 'rgb(55,170,181, 0.5)'
        ctx.fillRect(i * barWidth, updateHeight, barWidth, drawHeight)
      }
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, lagLimit, barWidth * frameTimes.length, 2)

      nextFrameTime = nextFrameTime + 1000 / fps
      const waitTime = nextFrameTime - window.performance.now()

      frameTimes.push({update: updateTime, draw: drawTime, wait: waitTime < 0 ? -waitTime : 0})

      const maxWaitTime = 300
      if (waitTime < -maxWaitTime) {
        nextFrameTime = window.performance.now() - maxWaitTime
      }

      if (waitTime <= 0) {
        if (timeoutId !== undefined) {
          window.clearTimeout(timeoutId)
        }
        timeoutId = window.setTimeout(gameLoop, 0)
      } else {
        if (timeoutId !== undefined) {
          window.clearTimeout(timeoutId)
        }
        timeoutId = window.setTimeout(gameLoop, waitTime)
      }
    }

    timeoutId = window.setTimeout(gameLoop, 1)

    return () => {
      console.log('interval cleared')
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId)
      }
      // window.clearInterval(interval)
    }
  }, [canvasRef, tilesRef])

  return <div>
    <img
      ref={tilesRef}
      src={tiles}
      style={{display: 'none'}}
    />
    <canvas
      ref={canvasRef}
      width={1000}
      height={600}
    />
  </div>
}
