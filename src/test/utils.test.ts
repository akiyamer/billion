import { listDiff, getItemKey, getKeyIndexAndFree } from '../lib/utils'
import { IMoveItem, MoveType, VElement } from '../types/struct'

describe('Utils', function() {
  function perform(list: VElement[], moves: IMoveItem[]) {
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

  it('remove items', () => {
    var before = genVElementList([{id: 1}, {id: 2}, {id: 3}, {id: 4}, {id: 5}, {id: 6}])
    var after = genVElementList([{id: 2}, {id: 3}, {id: 1}])
    const diffs = listDiff(before, after, 'key')
    console.log(diffs.moves)
    // expect(diffs.children).toEqual()
    perform(before, diffs.moves)
    assertListEqual(before, after)
  })
})