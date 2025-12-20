import z from 'zod'

export default defineEventHandler(async (event) => {
  return [
    {
      provider: 'deepseek',
      name    : 'Deepseek-Chat',
      modelId : 'deepseek-chat',
    },
    {
      provider: 'deepseek',
      name    : 'Deepseek-Reasoner',
      modelId : 'deepseek-reasoner',
    },
  ]
})
