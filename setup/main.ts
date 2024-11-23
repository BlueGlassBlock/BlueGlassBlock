// setup/main.ts
import { defineAppSetup } from 'valaxy'
import { useContentGroups } from '../client/composables/contentGroup'

export default defineAppSetup(() => {
  useContentGroups()
})