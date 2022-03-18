import {Game} from "../src/game/Game";
import {GameMap} from "../src/game/GameMap";
import {SearchPointScoreMap} from "../src/game/SearchPointScoreMap";
import {BaseEntity, entityTraitMap} from "../src/game/Entity";

const ctx: Worker = self as any;

console.log('asdf')

let game: Game | undefined = undefined

// Respond to message from parent thread
ctx.addEventListener(
  'message',
  (event) => {
    console.log('worker: got message', event.data)

    if (event.data.type === 'set-game') {
      console.log('worker: set-game event')
      // game = Object.setPrototypeOf(event.data.data, Game.prototype)
      game = Object.assign(event.data.payload.game, Game.prototype)
      if (game) {
        game.map = Object.assign(game.map, GameMap.prototype)
        game.debugSearchPointScores = Object.assign(game.debugSearchPointScores, SearchPointScoreMap.prototype)
      }
      console.log('worker: set game', game)
    }

    if (event.data.type === 'route-search') {
      console.log('worker: route-search event')
      if (!game) {
        console.log('worker: game not set')
        return
      }
      const startTime = performance.now()
      let entity = Object.assign(event.data.payload.entity, BaseEntity.prototype)
      for (let i = 0; i < entity.traits.length; i++) {
        entity.traits[i] = Object.assign(
          entity.traits[i],
          entityTraitMap.get(entity.traits[i].traitName)
        )
      }
      const {path, debugPoints} = game.routeSearch(
        entity,
        event.data.payload.x,
        event.data.payload.y,
        5000
      )
      const searchTime = performance.now() - startTime
      console.log('search took', searchTime / 1000, 's, used', debugPoints.length, 'points')
      ctx.postMessage({
        type: 'route-search-result',
        payload: {
          path,
        }
      })
    }
  }
);

export {}

