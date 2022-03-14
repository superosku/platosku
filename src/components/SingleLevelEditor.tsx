import React from "react";
import {LevelTable} from "./LevelTable";
import {ILevel, levelSideTypes, tagTypes} from "./LevelEditor";

interface ISideTypeChooserProps {
  value: string
  setValue: (value: string) => void
}

const SideTypeChooser: React.FC<ISideTypeChooserProps> = (
  {
    value,
    setValue
  }
) => {
  return <div className={'side-type-chooser'}>
    <ul>
      {levelSideTypes.map(t => {
        return <li
          key={t}
          className={t === value ? 'active' : ''}
          onClick={() => {setValue(t)}}
        >
          {t}
        </li>
      })}

    </ul>
  </div>
}

interface ISingleLevelEditorProps {
  level: ILevel
  setLevel: (level: ILevel) => void
}

export const SingleLevelEditor: React.FC<ISingleLevelEditorProps> = (
  {
    level,
    setLevel
  }
) => {
  const [tool, setTool] = React.useState(0)

  return <div className={'level'}>
    <div className={'tool-chooser'}>
      {
        [0, 1, 2, 3, 4].map(n => {
          return <div
            key={n}
            className={`tile-type-${n}` + (n === tool ? ' active' : '')}
            onClick={() => {
              setTool(n)
            }}/>
        })
      }
    </div>
    <ul className={'tag-selector'}>
      {tagTypes.map(tag => {
        const currentTags = level.tags || []
        const selected = currentTags.indexOf(tag) >= 0
        return <li
          className={selected ? 'selected' : ''}
          key={tag}
          onClick={() => {
            if (selected) {
              setLevel({...level, tags: currentTags.filter(t => t !== tag)})
            } else {
              setLevel({...level, tags: [...currentTags, tag]})
            }
          }}
        >
          {tag}
        </li>
      })}
    </ul>
    <table>
      <tbody>
      <tr>
        <td/>
        <td><SideTypeChooser value={level.topType} setValue={(value) => {setLevel({...level, topType: value})}}/></td>
        <td/>
      </tr>
      <tr>
        <td><SideTypeChooser value={level.leftType} setValue={(value) => {setLevel({...level, leftType: value})}}/></td>
        <td>
          <LevelTable
            level={level}
            onChangeCell={(x, y) => {
              setLevel({
                ...level, data: level.data.map((column, xx) => column.map((value, yy) => {
                  if (xx === x && yy === y) {
                    return tool
                  }
                  return value
                }))
              })

            }}
          />
        </td>
        <td><SideTypeChooser value={level.rightType} setValue={(value) => {setLevel({...level, rightType: value})}}/></td>
      </tr>
      <tr>
        <td/>
        <td><SideTypeChooser value={level.bottomType} setValue={(value) => {setLevel({...level, bottomType: value})}}/></td>
        <td/>
      </tr>
      </tbody>
    </table>
  </div>
}
