import { describe, expect, it } from 'vitest'

import { calculateLevel, calculateScore } from './scoring'
import type { CheckItem } from '@/types'

const check = (score: number, maxScore: number): CheckItem => ({
  name: `${score}/${maxScore}`,
  category: 'file',
  status: score === maxScore ? 'pass' : score > 0 ? 'partial' : 'fail',
  score,
  maxScore,
  reason: 'test fixture',
})

describe('scoring', () => {
  it('classifies level boundaries into four stable buckets', () => {
    const excellent = calculateLevel(90)
    const complete = calculateLevel(75)
    const usable = calculateLevel(60)
    const needsWork = calculateLevel(59)

    expect(calculateLevel(100)).toBe(excellent)
    expect(calculateLevel(89)).toBe(complete)
    expect(calculateLevel(74)).toBe(usable)
    expect(calculateLevel(0)).toBe(needsWork)
    expect(new Set([excellent, complete, usable, needsWork]).size).toBe(4)
  })

  it('sums check scores and maximum scores', () => {
    expect(calculateScore([check(20, 20), check(5, 10), check(0, 5)])).toEqual({
      total: 25,
      maxScore: 35,
      level: calculateLevel(25),
    })
  })
})
