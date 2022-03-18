import './CanvasGenerator.scss'
import React from "react";
import {range, tileSize} from "../common";

interface ICanvasCoords {
  x: number
  y: number
}

interface ICanvasType {
  [key: string]: ICanvasCoords
}

export interface ICanvasMap {
  [key: string]: ICanvasType
}

const asdf: ICanvasMap = {
  'ground': {
    '#___': {x: 123, y: 123},
    '_#__': {x: 123, y: 123},
    '##__': {x: 123, y: 123},
  },
}

export const CanvasGenerator = () => {
  const {choices, dataURL, canvasMap} = React.useMemo(() => {
    const rot90 = (values: boolean[]) => {
      // 0 1 2
      // 3 4 5
      // 6 7 8

      // 6 3 0
      // 7 4 1
      // 8 5 2
      return [
        values[6],
        values[3],
        values[0],
        values[7],
        values[4],
        values[1],
        values[8],
        values[5],
        values[2],
      ]
    }

    const choices = range(Math.pow(2, 9)).map(n => {
      return range(9).map(i => (n >> i & 1) === 1)
    }).filter(a => a[4]).filter(a => {
      let thing = [...a]
      for (let i = 0; i < 4; i++) {
        if (thing[0] && (!thing[3] || !thing[1])) {
          return false
        }
        if (!thing[0] && thing[3] && thing[1]) {
          return false
        }
        thing = rot90(thing)
      }
      return true
    }).map(d => {
      return {
        data: d,
      }
    })

    interface IChoice {
      type: string
      data: boolean[]
      extras: string[]
    }

    const allChoices: IChoice[] = [
      ...choices.map(c => ({...c, type: 'ground', extras: []})),
      ...choices.map(c => ({...c, type: 'wood', extras: []})),
      {type: 'background', data: [], extras: []},
      {type: 'background', data: [], extras: ['ladder']},
      {type: 'background', data: [], extras: ['platform']},
      {type: 'background', data: [], extras: ['platform', 'ladder']},
    ]

    const tilesSideCount = 10
    const tilesTopCount = Math.ceil(allChoices.length / tilesSideCount)

    const canvas = document.createElement('canvas')
    const spacing = 4
    canvas.width = (tileSize + spacing) * tilesSideCount - spacing
    canvas.height = (tileSize + spacing) * tilesTopCount - spacing

    const ctx = canvas.getContext('2d')!
    ctx.fillRect(0, 0, 100000, 100000)

    const groundMap: ICanvasType = {}
    const woodMap: ICanvasType = {}
    const backgroundMap: ICanvasType = {}
    const canvasMap: ICanvasMap = {
      ground: groundMap,
      wood: woodMap,
      background: backgroundMap,
    }

    for (let i = 0; i < allChoices.length; i++) {
      const choice = allChoices[i]

      const x = (i % tilesSideCount) * tileSize + (i % tilesSideCount) * spacing
      const y = Math.floor(i / tilesSideCount) * tileSize + Math.floor(i / tilesSideCount) * spacing

      // ctx.fillStyle = `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`
      // // ctx.fillStyle = '#F0F'
      // ctx.fillRect(x, y, tileSize, tileSize)

      if (choice.type === 'background') {
        ctx.fillStyle = 'rgb(18,36,50)'
        ctx.fillRect(x, y, tileSize, tileSize)

        const cs = [
          // '#1a385344',
          // '#2a3b4c44',
          // '#8da3b711',
          'rgba(12,27,34,0.27)',
          'rgba(18,29,34,0.27)',
          'rgba(74,84,93,0.07)',
        ]
        for (let i = 0; i < 500; i++) {
          for (let j = 0; j < cs.length; j++) {
            ctx.fillStyle = cs[j]
            ctx.strokeStyle = cs[j]
            ctx.beginPath()
            ctx.arc(
              Math.random() * (tileSize - 10) + x + 5,
              Math.random() * (tileSize - 10) + y + 5,
              5,
              0,
              Math.PI * 2
            )
            ctx.fill()

            if (choice.extras.indexOf('ladder') >= 0) {
              ctx.beginPath()
              const ladderSpacing = tileSize / 4

              ctx.lineWidth = tileSize / 8
              ctx.strokeStyle = '#79512d'
              ctx.moveTo(x + tileSize / 6, y)
              ctx.lineTo(x + tileSize / 6, y + tileSize)
              ctx.moveTo(x + tileSize - tileSize / 6, y)
              ctx.lineTo(x + tileSize - tileSize / 6, y + tileSize)
              for (let i = 0; i < 4; i++) {
                ctx.moveTo(x + tileSize / 8, y + i * ladderSpacing + ladderSpacing / 2)
                ctx.lineTo(x - tileSize / 8 + tileSize, y + i * ladderSpacing + ladderSpacing / 2)
              }
              ctx.stroke();

              ctx.lineWidth = tileSize / 10
              ctx.strokeStyle = '#4c321f'
              ctx.moveTo(x + tileSize / 6, y)
              ctx.lineTo(x + tileSize / 6, y + tileSize)
              ctx.moveTo(x + tileSize - tileSize / 6, y)
              ctx.lineTo(x + tileSize - tileSize / 6, y + tileSize)
              for (let i = 0; i < 4; i++) {
                ctx.moveTo(x + tileSize / 8, y + i * ladderSpacing + ladderSpacing / 2)
                ctx.lineTo(x - tileSize / 8 + tileSize, y + i * ladderSpacing + ladderSpacing / 2)
              }
              ctx.stroke();
            }

            if (choice.extras.indexOf('platform') >= 0) {
              ctx.fillStyle = '#322111'
              ctx.fillRect(x, y, tileSize, tileSize / 8)
              ctx.fillRect(x + tileSize / 12, y, tileSize / 8, tileSize / 4)
              ctx.fillRect(x + tileSize - tileSize / 12 - tileSize / 8, y, tileSize / 8, tileSize / 4)
              ctx.fillStyle = '#513921'
              ctx.fillRect(x, y, tileSize, tileSize / 20)
              ctx.fillRect(x + tileSize / 12, y + tileSize / 8, tileSize / 16, tileSize / 8)
              ctx.fillRect(x + tileSize - tileSize / 12 - tileSize / 8, y + tileSize / 8, tileSize / 16, tileSize / 8)
            }
          }
        }

        let typeKey = 'regular'
        if (choice.extras.indexOf('ladder') >= 0) {
          typeKey = 'ladder'
        }
        if (choice.extras.indexOf('platform') >= 0) {
          typeKey = 'platform'
        }
        if (
          choice.extras.indexOf('platform') >= 0 &&
          choice.extras.indexOf('ladder') >= 0
        ) {
          typeKey = 'platform-ladder'
        }

        backgroundMap[typeKey] = {x, y}

        continue
      }

      ctx.fillStyle = choice.type === 'wood' ? '#7e5438' : '#888c8d'
      ctx.fillRect(x, y, tileSize, tileSize)

      const cs = choice.type === 'wood' ? [
        '#5b3d2866',
        '#8d624666',
      ] : [
        '#72767766',
        '#61656666',
        '#585b5b66',
      ]
      for (let i = 0; i < 500; i++) {
        for (let j = 0; j < cs.length; j++) {
          ctx.fillStyle = cs[j]
          ctx.strokeStyle = cs[j]
          ctx.beginPath()
          if (choice.type === 'wood') {
            const height = Math.floor(Math.random() * tileSize / 2)
            const xx = Math.random() * (tileSize - 10) + x + 5
            const yy = Math.random() * (tileSize - height) + y
            // const yy = y
            ctx.lineWidth = Math.floor(Math.random() * 3 + 1)
            ctx.moveTo(xx, yy)
            ctx.lineTo(xx, yy + height)
            // ctx.lineTo(xx, yy + tileSize)
            ctx.stroke()
          } else {
            ctx.arc(
              Math.random() * (tileSize - 10) + x + 5,
              Math.random() * (tileSize - 10) + y + 5,
              5,
              0,
              Math.PI * 2
            )
            ctx.fill()
          }
        }
      }

      ctx.fillStyle = choice.type === 'wood' ? '#452c1d' : 'rgb(61,61,62,1.0)'
      // ctx.fillStyle = 'rgb(61,61,62,0.7)'
      let sideWidth = choice.type === 'wood' ? 8 : 6
      if (!choice.data[3]) {
        ctx.fillRect(x, y, tileSize / sideWidth, tileSize)
      }
      if (!choice.data[5]) {
        ctx.fillRect(x + tileSize * ((sideWidth - 1) / sideWidth), y, tileSize / sideWidth, tileSize)
      }
      if (!choice.data[7]) {
        ctx.fillRect(x, y + tileSize * ((sideWidth - 1) / sideWidth), tileSize, tileSize / sideWidth)
      }
      ctx.fillStyle = choice.type === 'wood' ? ctx.fillStyle : 'rgb(60,93,37, 0.9)'
      if (choice.type !== 'wood') {
        sideWidth = 4
      }
      if (!choice.data[1]) {
        ctx.fillRect(x, y, tileSize, tileSize / sideWidth)
      }

      // let a = ''
      // if (b === 10) {
      //   a = 'moi'
      // } else {
      //   a = 'hei'
      // }
      // let a = ((b === 10) ? 'moi' : 'hei')

      const bm = {true: '#', false: '_'}
      const mapKey = (
        (choice.data[1] ? '#' : '_') +
        (choice.data[3] ? '#' : '_') +
        (choice.data[5] ? '#' : '_') +
        (choice.data[7] ? '#' : '_')
      )
      if (choice.type === 'wood') {
        woodMap[mapKey] = {x, y}
      } else {
        groundMap[mapKey] = {x, y}
      }
    }

    const dataURL = canvas.toDataURL()

    return {choices, dataURL, canvasMap}
  }, [])

  return <div className={'canvas-generator'}>
    <h2>{choices.length}</h2>
    <img src={dataURL}/>
    <div>{JSON.stringify(canvasMap)}</div>
    <ul>
      {choices.map(c => {
        return <li>
          {c.toString()}
          <table className={'corner-table'}>
            <tbody>
            <tr>
              <td className={c.data[0] ? 'full' : ''}/>
              <td className={c.data[1] ? 'full' : ''}/>
              <td className={c.data[2] ? 'full' : ''}/>
            </tr>
            <tr>
              <td className={c.data[3] ? 'full' : ''}/>
              <td className={c.data[4] ? 'full' : ''}/>
              <td className={c.data[5] ? 'full' : ''}/>
            </tr>
            <tr>
              <td className={c.data[6] ? 'full' : ''}/>
              <td className={c.data[7] ? 'full' : ''}/>
              <td className={c.data[8] ? 'full' : ''}/>
            </tr>
            </tbody>
          </table>
        </li>
      })}
    </ul>
  </div>
}
