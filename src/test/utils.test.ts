import { listDiff, getItemKey, getKeyIndexAndFree } from '../lib/utils'
import { IMoveItem, MoveType, VElement, VNode } from '../types/struct'

describe('Utils', function() {
  function perform(list: VNode[], moves: IMoveItem[]) {
    moves.forEach(move => {
      if (move.type === MoveType.INSERT) {
        list.splice(move.index, 0, move.item)
      } else {
        list.splice(move.index, 1)
      }
    })
  }

  function genVElementList(list: any[]): VElement[] {
    return list.map(item => {
      if (item === null) return null
      return {
        tag: 'div',
        key: item.id,
        count: 1,
      }
    })
  }

  function assertListEqual(before: VElement[], after: VElement[]) {
    after.forEach((item, i) => {
      expect(item).toEqual(before[i])
    })
  }

  it('get item key', () => {
    const item = { key: 'curry', tag: 'div', count: 1 }
    expect(getItemKey(item, 'key')).toBe('curry')
  })

  it('get key index and free', () => {
    const item = genVElementList([{id: 'k1'}, {id: 'k2'}, {id: 'k3'}])
    expect(getKeyIndexAndFree(item, 'key').keyIndex).toEqual({k1: 0, k2: 1, k3: 2})
  })

  // when the value of key is number, test will failed, I don't know why?
  it('Remove items', () => {
    const before = genVElementList([{id: 'k1'}, {id: 'k2'}, {id: 'k3'}])
    const after = genVElementList([{id: 'k1'}, {id: 'k3'}])
    const diffs = listDiff(before, after, 'key')
    expect(diffs.children).toEqual([{"tag":"div","key":"k1","count":1},null,{"tag":"div","key":"k3","count":1}])
    console.log(`diffs children: ${JSON.stringify(diffs.children)}`)
    perform(before, diffs.moves)
    assertListEqual(before, after)
  })

  it('Insert items', () => {
    const before = genVElementList([{id: 'k1'}, {id: 'k2'}, {id: 'k3'}])
    const after = genVElementList([{id: 'k1'}, { id: 'k4' }, {id: 'k2'}, {id: 'k3'}])

    const diffs = listDiff(before, after, 'key')
    console.log(`diff moves: ${JSON.stringify(diffs.moves)}`)
    perform(before, diffs.moves)
    assertListEqual(before, after)
  })

  it('Moving items from back to front', () => {
    const before = genVElementList([{id: 'k1'}, {id: 'k2'}, {id: 'k3'}, {id: 'k4'}, {id: 'k5'}])
    const after = genVElementList([{id: 'k4'}, {id: 'k5'}, {id: 'k1'}, {id: 'k2'}, {id: 'k3'}])

    const diffs = listDiff(before, after, 'key')
    perform(before, diffs.moves)
    assertListEqual(before, after)
  })

  it('Moving items from front to back', () => {
    const before = genVElementList([{id: 'k1'}, {id: 'k2'}, {id: 'k3'}, {id: 'k4'}, {id: 'k5'}])
    const after = genVElementList([{id: 'k3'}, {id: 'k4'}, {id: 'k5'}, {id: 'k1'}, {id: 'k2'}])

    const diffs = listDiff(before, after, 'key')
    perform(before, diffs.moves)
    assertListEqual(before, after)
  })

  
})