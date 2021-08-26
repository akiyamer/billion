import { VElement, VNode } from "../types/struct";

function diff(oldTree: VNode, newTree: VNode) {
  
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