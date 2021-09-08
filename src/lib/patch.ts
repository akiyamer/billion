import { IMoveItem, IPatchItem, MoveType, Patches, PatchType, VProps } from "../types/struct";
import { render } from "./h";
import { getItemKey, setAttr } from "./utils";

type Walker = { index: number }

function patch(node: HTMLElement, patches: Patches) {
  const walker = { index: 0 }
  dfsWalk(node, walker, patches)
}

function dfsWalk(node: HTMLElement, walker: Walker, patches: Patches) {
  const currentPatch = patches[walker.index]

  node.childNodes.forEach(child => {
    walker.index++
    dfsWalk(child as HTMLElement, walker, patches)
  })

  if (currentPatch) {
    applyPatches(node, currentPatch)
  }
}

function setProps(node: HTMLElement, props: VProps) {
  for (const key in props) {
    if (!props[key]) {
      node.removeAttribute(key)
    } else {
      setAttr(node, key, props[key])
    }
  }
}

function applyPatches(node: HTMLElement, currentPatch: IPatchItem[]) {
  currentPatch.forEach(patchItem => {
    switch(patchItem.type) {
      case PatchType.PROPS:
        setProps(node, patchItem.payload)
        break
      case PatchType.REORDER:
        reorderChildren(node, patchItem.payload)
        break
      case PatchType.REPLACE:
        const newNode = typeof patchItem.payload === 'string'
          ? document.createTextNode(patchItem.payload)
          : render(patchItem.payload)
        node.parentNode.replaceChild(newNode, node)
        break
      case PatchType.TEXT:
        if (node.textContent) {
          node.textContent = patchItem.payload
        } else {
          // 兼容IE
          node.nodeValue = patchItem.payload
        }
        break
    }
  })
}

function reorderChildren(node: HTMLElement, moves: IMoveItem[]) {
  // 拷贝一份旧树子节点列表
  const staticNodeList = Array.from(node.childNodes)

  // 旧树子节点列表key值与节点的映射
  const map = {}
  staticNodeList.forEach(childNode => {
    if (childNode.nodeType === 1) {
      const key = (childNode as HTMLElement).getAttribute('key')
      if (key) {
        map[key] = childNode
      }
    }
  })

  moves.forEach(move => {
    const index = move.index
    if (move.type === MoveType.REMOVE) {
      // 判断是因为当前位置的节点有可能已经插入了新节点
      if (staticNodeList[index] === node.childNodes[index]) {
        node.removeChild(node.childNodes[index])
      }
    } else {
      const itemKey = getItemKey(move.item, 'key')
      const insertNode = map[itemKey]
        // 传入参数为true表示深度克隆，所有子节点也会被复制
        // key值相同的节点直接复制，由于更新自下至上，所以其子节点已经全部被更新了
        ? map[itemKey].cloneNode(true)
        : (typeof move.item === 'object'
          ? render(move.item)
          : document.createTextNode(move.item))
      staticNodeList.splice(index, 0, insertNode)
      // 第二个参数为null会将新增节点移动到子节点列表的末尾
      node.insertBefore(insertNode, node.childNodes[index] || null)
    }
  })
}

export { patch }