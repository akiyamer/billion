import { IMoveItem, MoveType, VElement, VNode } from "../types/struct"

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
export function listDiff(oldList: VNode[], newList: VNode[], key: string) {
  // 记录以旧代表为参照的变更
  const moves: IMoveItem[] = []

  // 拿到新旧列表中key和index的对应关系
  const oldMap = getKeyIndexAndFree(oldList, key)
  const newMap = getKeyIndexAndFree(newList, key)
  // 新列表中没有key的节点
  const newFree = newMap.free
  // { key: index } 的map
  const oldKeyIndex = oldMap.keyIndex
  const newKeyIndex = newMap.keyIndex
  
  // 已旧列表的key为顺序替换为新列表中对应key的节点
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
      children.push(newFree.shift() || null)
    }
  })

  // 剔除children中为null的节点
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

export function getKeyIndexAndFree(list: VNode[], key: string) {
  const keyIndex = {}
  const free = []

  list.forEach((item, i) => {
    const itemKey = getItemKey(item, key)
    // console.log(`itemKey: ${itemKey}`)
    if (itemKey) {
      keyIndex[itemKey] = i
    } else {
      free.push(item)
    }
  })

  // console.log(`keyIndex: ${JSON.stringify(keyIndex)} free: ${JSON.stringify(free)}`)
  return { keyIndex, free }
}

export function getItemKey(item: VNode, key: string | ((item:VNode) => any)) {
  if (typeof item === 'string' || !item) return ''
  return typeof key === 'string' ? item[key] : key(item)
}