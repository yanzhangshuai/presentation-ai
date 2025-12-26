import { nodeCacheDriver, nodeCacheDriverName } from '../providers/storage/nodeCacheDriver'

export default defineNitroPlugin(() => {
  const storage = useStorage()

  // Dynamically pass in credentials from runtime configuration, or other sources
  const driver = nodeCacheDriver()

  // Mount driver
  storage.mount(nodeCacheDriverName, driver)
})
