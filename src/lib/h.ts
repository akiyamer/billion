import { VElement, VNode, VProps } from '../types/struct'
import { setAttr } from './utils'

function h(tag: string, props?: VProps, children?: VNode[]): VElement {
  let count = 0
  children.forEach(child => {
    if (typeof child !== 'string') count += child.count
    count++
  })

  let key
  if (props?.key) {
    key = props.key
    delete props.key
  }

  return {
    tag,
    props,
    key,
    children,
    count
  }
}

function render(vdom: VElement) {
  const el = document.createElement(vdom.tag)
  for (const key in vdom.props) {
    setAttr(el, key, vdom.props[key])
  }
  
  vdom.children.forEach(child => {
    const childEl = typeof child === 'string' ? 
      document.createTextNode(child) : render(child)
    el.appendChild(childEl)
  })

  return el
}

export { h, render } 