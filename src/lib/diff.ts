import { VElement, VNode, IPatchItem, Patches, PatchType } from "../types/struct";
import { listDiff } from "./utils";

function diff(oldTree: VNode, newTree: VNode) {
  const patches: Patches = []
  dfsWalk(oldTree, newTree, 0, patches)
  return patches
}

function dfsWalk(oldNode: VNode, newNode: VNode, index: number, patches: Patches) {
  const currentPatch: IPatchItem[] = []

  if (newNode === null) {
    // do nothing
  } else if (typeof newNode === 'string' || typeof oldNode === 'string') {
    if ((typeof newNode === 'string' && typeof oldNode === 'string') && 
    newNode !== oldNode) {
      currentPatch.push({type: PatchType.TEXT, payload: newNode})
    } else {
      currentPatch.push({type: PatchType.REPLACE, payload: newNode})
    }
  } else if (newNode.tag === oldNode.tag && newNode.key === oldNode.key) {
    const propsPatches = diffProps(oldNode, newNode)
    if (propsPatches) {
      currentPatch.push({type: PatchType.PROPS, payload: propsPatches})
    }

    // ignore children tag
    if (!oldNode.ignoreChildren) {
      diffChildren(oldNode.children, newNode.children, index, patches, currentPatch)
    }
  } else {
    currentPatch.push({type: PatchType.REPLACE, payload: newNode})
  }

  if (currentPatch.length) {
    patches[index] = currentPatch
  }
}

function diffChildren(oldNode: VNode[], newNode: VNode[], index: number, pathces: Patches, currentPatch: IPatchItem[]) {
  // newChildren是按照oldChildren的key顺序排列、由新child组成的列表
  const { moves, children: newChildren } = listDiff(oldNode, newNode, 'key')
  if (moves.length) {
    currentPatch.push({type: PatchType.REORDER, payload: moves})
  }

  let leftNode: any = null
  let currentNodeIndex = index
  oldNode.forEach((oldChild, i) => {
    const newChild = newChildren[i]
    currentNodeIndex = (leftNode && leftNode.count)
      ? currentNodeIndex + leftNode.count + 1
      : currentNodeIndex + 1
    // key相同的节点进行比对
    dfsWalk(oldChild, newChild, currentNodeIndex, pathces)
    leftNode = oldChild
  })
}

function diffProps(oldNode: VElement, newNode: VElement) {
  const oldProps = oldNode.props || {}
  const newProps = newNode.props || {}
  let count = 0
  const propsPatches = {}

  for (const key in oldProps) {
    if (newProps[key] !== oldProps[key]) {
      count++
      propsPatches[key] = newProps[key]
    }
  }

  for (const key in newProps) {
    if (!(key in oldProps)) {
      count++
      propsPatches[key] = newProps[key]
    }
  }

  if (!count) return null
  return propsPatches
}

export { diff }