import type { ProviderFactory } from './types'

import { createVolcImageProvider } from './VolcImageProvider'
import { createBailianImageProvider } from './BailianImageProvider'

const providers: Record<string, ProviderFactory> = {
  volc   : createVolcImageProvider,
  bailian: createBailianImageProvider,
}

export function imageModelPicker(modelProvider = 'volc', modelId = 'v1') {
  if (!providers[modelProvider]) {
    throw new Error(`Unknown provider: ${modelProvider}`)
  }
  return providers[modelProvider]({ modelId })
}
