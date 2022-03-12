

export class KeyboardHandler {
  keysPressed: { [key: string]: boolean }

  constructor() {
    this.keysPressed = {}
  }

  keyup(event: KeyboardEvent) {
    this.keysPressed[event.key] = false
  }

  keydown(event: KeyboardEvent) {
    console.log('keydown', event.key)
    this.keysPressed[event.key] = true
  }

  pressed(key: string) {
    return this.keysPressed[key] ? true : false
  }
}
