import { computed } from 'vue'
import { UploadImageModel, UserSettingsModel } from '@/common/model'
import { starredRepo } from '@/common/api'
import { store } from '@/stores'
import { createUploadImageObject } from '@/utils'

const userSettings = computed(() => store.getters.getUserSettings).value

export const starred = async (userSettings: UserSettingsModel) => {
  const { starred } = userSettings
  if (!starred) {
    const res = await starredRepo()
    if (res) {
      await store.dispatch('SET_USER_SETTINGS', {
        starred: true
      })
    }
  }
}

export const generateUploadImageObject = (obj: {
  uuid: string
  file: File
  base64: string
}): UploadImageModel => {
  const tmp: UploadImageModel = createUploadImageObject()
  tmp.uuid = obj.uuid
  tmp.base64.originalBase64 = obj.base64
  tmp.fileInfo.originalFile = obj.file

  const { prefixNaming, defaultHash } = userSettings

  const hash = obj.uuid

  // 处理文件名，去除空格字符
  const nameHandled = obj.file.name.trim().replaceAll(' ', '-')

  const tmpIdx = nameHandled.lastIndexOf('.')
  const name = nameHandled.slice(0, tmpIdx)
  const suffix = nameHandled.slice(tmpIdx + 1)

  tmp.filename.initName = name
  tmp.filename.name = prefixNaming.enable ? `${prefixNaming.prefix}${name}` : name
  tmp.filename.prefixName = prefixNaming.prefix
  tmp.filename.hash = hash
  tmp.filename.suffix = suffix
  tmp.filename.final = defaultHash
    ? `${tmp.filename.name}.${hash}.${suffix}`
    : `${tmp.filename.name}.${suffix}`
  tmp.filename.isHashRename = defaultHash
  tmp.filename.isPrefix = prefixNaming.enable

  return tmp
}
