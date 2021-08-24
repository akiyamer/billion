export type VProps = Record<string, string | boolean | (() => void)>

export type VNode = VElement | string

export interface VElement {
  tag: string
  props?: VProps
  children?: VNode[]
  key?: string
  // num of child nodes
  count: number
}