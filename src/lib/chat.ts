import { get, writable } from "svelte/store";
import { encryptionKey, gun, sessionID } from "$lib/gun";
import { walletAddress } from "$lib/stores/provider";
import SEA from "gun/sea";

export const chatMessages = writable<{ from: string, message: string }[]>([])

export const sendMessage = async (content: string) => {
  const key = get(encryptionKey)
  console.log({ key })
  if (key) {
    // @ts-ignore
    const message = await SEA.encrypt(content, key)
    const msg = JSON.stringify({ when: Gun.state(), from: get(walletAddress), message });
    gun.get(`appSessions-${get(sessionID)}`).get('rpc').put({ jsonRpc: "2.0", method: "chat", params: msg });
  }
}
