import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'
import '@testing-library/jest-dom/vitest'

// jsdom doesn't implement this; components that auto-scroll (e.g. a message thread) call it.
Element.prototype.scrollIntoView = Element.prototype.scrollIntoView ?? (() => {})

afterEach(() => {
  cleanup()
})
