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

/** 列表对比算法 */
export function listDiff() {
  
}