export const tileSize = 32

export const range = (n: number) => {
  let l = []
  for (let i = 0; i < n; i++) {
    l.push(i)
  }
  return l
}

export const pow2 = (n: number) => {
  return n * n
}

export interface IPoint {
  x: number,
  y: number
}

export interface IControls {
  left: boolean
  right: boolean
  down: boolean
  up: boolean
  jump: boolean
}

export const controlChoices: IControls[] = [
  {left: false, right: false, down: false, up: false, jump: false}, // Do nothing
  {left: false, right: false, down: false, up: true, jump: false}, // Go up
  {left: false, right: false, down: true, up: false, jump: false}, // Go down

  {left: true, right: false, down: false, up: false, jump: false}, // Move left
  {left: false, right: true, down: false, up: false, jump: false}, // Move right
  {left: false, right: false, down: false, up: false, jump: true}, // Jump

  {left: true, right: false, down: false, up: false, jump: true}, // Jump move left
  {left: false, right: true, down: false, up: false, jump: true}, // Jump move right
]
