import { get, writable } from "svelte/store";
import { encryptionKey, gun, swapSession } from "$lib/gun";
import { walletAddress } from "$lib/stores/provider";
import SEA from "gun/sea";

export const chatMessages = writable<{ from: string, message: string }[]>([])

export const sendMessage = async (content: string) => {
  // @ts-ignore
  const message = await SEA.encrypt(content, get(encryptionKey))
  const msg = { from: get(walletAddress), message };
  const id = `${Gun.state()}-${get(walletAddress)}`
  gun.get(`appSessions-${get(swapSession).sessionID}`).get('chat').put({ [id]: msg });
}
