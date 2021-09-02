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

export enum MoveType {
  REMOVE = 0,
  INSERT = 1
}

export interface IMoveItem {
  type: MoveType
  index: number
  item?: VElement
}

export enum PatchType {
  TEXT = 0,
  PROPS = 1,
  REPLACE = 2,
  REORDER = 3
}

export interface IPatchItem {
  type: PatchType,
  payload?: any
}

export type Patches = {
  [index: number]: IPatchItem[]
}