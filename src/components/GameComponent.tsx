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

    let fps: number[] = []
    const fpsFrames = 10

    const interval = window.setInterval(() => {
        fps.push((new Date).getTime())
        if (fps.length === fpsFrames + 1) {
          const timeForDuration = fps[fps.length - 1] - fps[0]
          console.log('FPS', 1000 * 1 / (timeForDuration / (fpsFrames - 1)))
          fps = []
        }

        ctx.fillStyle = '#5d5d5d'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        game.update()
        game.draw(ctx)
      },
      // 1
      1000 / 60
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
