import { expect, test } from 'vitest'
import { getCandidates } from '../src/utils/candidates.js'
import { comparator } from '../src/utils/comparator.js'

const noDuplication = [
  `
  interface User {
    accessToken: string
  }

  interface WorkflowMessage {
    actionName?: string
  }
  `
]

test('Duplication Detection - No False Positives', async () => {
  for (const text of noDuplication) {
    const files = [{ name: 'test.tsx', content: text }]
    const candidates = await getCandidates(files)
    const matches = comparator(candidates, files, 0)

    expect(matches.length).toBe(0)
  }
})
