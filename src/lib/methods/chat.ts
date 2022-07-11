import { chatMessages } from "$lib/chat"
import { encryptionKey } from "$lib/gun"
import { get } from "svelte/store"

export const handleChat = (method: { jsonRpc: string, method: string, params: string, id: string, result?: string, error?: string }) => {
  const params = JSON.parse(method.params);
  if (get(encryptionKey) && params.from && params.message && params.when) {
    // @ts-ignore
    SEA.decrypt(params.message, get(encryptionKey)).then((message: string) => {
      console.log({ message })
      if (message) {
        chatMessages.update(msgs => {
          msgs[params.when] = { from: params.from, message }
          return msgs
        })
      }
    })
  }
}
