import React from "react";
import {tileSize} from "../common";
import {KeyboardHandler} from "../game/KeyboardHandler";
import {Game} from "../game/Game";

export const GameComponent = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    if (canvasRef.current === null) {
      return
    }

    const canvas: HTMLCanvasElement = canvasRef.current
    const ctx: CanvasRenderingContext2D = canvas.getContext("2d")!

    const keyboardHandler = new KeyboardHandler()
    const game = new Game(keyboardHandler, canvas.width, canvas.height)

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
    let fpsNumbers: number[] = []
    const fpsFrames = 10

    const frameTimes: number[][] = []

    const interval = window.setInterval(() => {
        fpsNumbers.push((new Date).getTime())
        if (fpsNumbers.length === fpsFrames + 1) {
          const timeForDuration = fpsNumbers[fpsNumbers.length - 1] - fpsNumbers[0]
          console.log('FPS', 1000 * 1 / (timeForDuration / (fpsFrames - 1)))
          fpsNumbers = []
        }

        const startTime = window.performance.now()
        game.update()
        const updateTime = window.performance.now() - startTime
        ctx.fillStyle = '#5d5d5d'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        game.draw(ctx)
        const drawTime = window.performance.now() - startTime - updateTime
        if (frameTimes.length >= 120) {
          frameTimes.shift()
        }

        const barWidth = 1
        frameTimes.push([updateTime, drawTime])
        const heightMultiplier = 10
        for (let i = 0; i < frameTimes.length; i++) {
          const updateHeight = frameTimes[i][0] * heightMultiplier
          const drawHeight = frameTimes[i][1] * heightMultiplier

          ctx.fillStyle = '#3e2083'
          ctx.fillRect(i * barWidth, 0, barWidth, updateHeight)
          ctx.fillStyle = '#692083'
          ctx.fillRect(i * barWidth, updateHeight, barWidth, drawHeight)
          // const
          // ctx.fillRect(i, canvas.height - barHeight, 2, barHeight)
          // ctx.fillRect(i, 0, 4, barHeight)
        }
        const lagLimit = 1000 / fps * heightMultiplier
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, lagLimit, barWidth * frameTimes.length, 2)
      },
      // 1
      1000 / fps
    )

    return () => {
      console.log('interval cleared')
      window.clearInterval(interval)
    }
  }, [canvasRef])

  return <div>
    <canvas
      ref={canvasRef}
      width={1000}
      height={600}
    />
  </div>
}
