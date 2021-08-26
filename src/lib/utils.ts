import { IMoveItem, MoveType, VElement } from "../types/struct"

export function setAttr(el: HTMLElement, key: string, value: any) {
  switch(key) {
    case 'style':
      el.style.cssText = value
      break
    case 'value':
      const tagName = el.tagName.toLowerCase()
      if (tagName === 'input' || tagName === 'inputarea') {
        el.nodeValue = value
      } else {
        el.setAttribute(key, value)
      }
      break
    default:
      el.setAttribute(key, value)
  }
}

/**
 * 列表对比算法
 */
export function listDiff(oldList: VElement[], newList: VElement[], key: string) {
  const moves: IMoveItem[] = []

  const oldMap = getKeyIndexAndFree(oldList, key)
  const newMap = getKeyIndexAndFree(newList, key)
  // newList item without key
  const newFree = newMap.free
  const oldKeyIndex = oldMap.keyIndex
  const newKeyIndex = newMap.keyIndex
  
  const children = []
  oldList.forEach(item => {
    const itemKey = getItemKey(item, key)
    if (itemKey) {
      if (!(itemKey in newKeyIndex)) {
        children.push(null)
      } else {
        const newItemIndex = newKeyIndex[itemKey]
        children.push(newList[newItemIndex])
      }
    } else {
      children.push(newFree.shift())
    }
  })

  const simulateList = children.slice(0)
  simulateList.forEach((item, i) => {
    if (item === null) {
      moves.push({type: MoveType.REMOVE, index: i})
      simulateList.splice(i, 1)
    }
  })

  // simmulateList和newList的滑动对比
  let j = 0
  newList.forEach((newItem, i) => {
    const newItemKey = getItemKey(newItem, key)
    const simulateItem = simulateList[j]
    const simulateItemKey = getItemKey(simulateItem, key)
    if (simulateItem) {
      if (newItemKey === simulateItemKey) {
        j++
      } else {
        if (!(newItemKey in oldKeyIndex)) {
          moves.push({type: MoveType.INSERT, index: i, item: newItem})
        } else {
          const nextItemKey = getItemKey(simulateList[j+1], key)
          // 滑动simulateList
          if (nextItemKey === newItemKey) {
            moves.push({type: MoveType.REMOVE, index: i})
            simulateList.splice(j, 1)
            j++
          } else {
            moves.push({type: MoveType.INSERT, index: i, item: newItem})
          }
        }
      }
    } else {
      moves.push({type: MoveType.INSERT, index: i, item: newItem})
    }
  })

  // TODO: usage?
  // remove rest items
  let k = simulateList.length - j
  while (j++ < simulateList.length) {
    k--
    moves.push({type: MoveType.REMOVE, index: k + newList.length})
  }

  return { moves, children }
}

function getKeyIndexAndFree(list: VElement[], key: string) {
  const keyIndex = {}
  const free = []

  list.forEach((item, i) => {
    const itemKey = getItemKey(item, key)
    if (itemKey) {
      keyIndex[itemKey] = i
    } else {
      free.push(item)
    }
  })

  return { keyIndex, free }
}

function getItemKey(item: VElement, key: string | ((item: VElement) => any)) {
  return typeof key === 'string' ? item[key] : key(item)
}