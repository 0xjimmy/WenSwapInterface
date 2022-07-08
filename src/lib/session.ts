import { browser } from "$app/env";
import { providers, utils } from "ethers";
import { getAddress } from "ethers/lib/utils";
import SEA from "gun/sea";
import { get, writable } from "svelte/store";
import { chatMessages } from "$lib/chat";
import { encryptionKey, gun, peer, swapSession, userPair } from "$lib/gun";
import { accountProvider, walletAddress } from "$lib/stores/provider";

export const sessionListeners = writable<() => void>(undefined);

const createSessionListners = (session: any, host: boolean) => {
  // Track listners to remove
  const eves = {
    chat: undefined,
    client: undefined
  }

  // Handle client joins
  if (host) {
    session.get('client').on((client: { walletAddress: string, walletSig: string, pub: string }, _: null, __: null, eve: any) => {
      if (!eves.client) eves.client = eve
      if (!get(swapSession).client && utils.verifyMessage(`Join Swap Session \n Session Key: ${client.pub} \n Session ID: ${get(swapSession).sessionID}`, client.walletSig) === getAddress(client.walletAddress)) {
        swapSession.update(data => ({ ...data, client }))
      }
    })
  }

  // Handle chat
  session.get('chat').map().on((chat: { from: string, message: string }, id: string, _: null, eve: any) => {
    if (!eves.chat) eves.chat = eve
    if (chat && chat.message && chat.from && get(encryptionKey) !== "") {
      const { from, message } = chat;
      // @ts-ignore
      SEA.decrypt(message, get(encryptionKey)).then(message => {
        if (get(walletAddress) === from || (get(peer) && get(peer).walletAddress === from)) {
          chatMessages.update(msgs => {
            msgs[id] = { from, message }
            return msgs
          })
        }
      })
    }
  })

  // Remove listners
  sessionListeners.set(() => {
    if (eves.client) eves.client.off()
    if (eves.chat) eves.chat.off()
  })
}


// Load Session from sessionStorage
if (browser) {
  userPair.set(JSON.parse(sessionStorage.getItem("session-keypair")))
  swapSession.set(JSON.parse(sessionStorage.getItem("swap-session")))
  if (get(swapSession)) {
    const isHost = get(swapSession).host.walletAddress === get(walletAddress)
    const session = gun.get(`appSessions-${get(swapSession).sessionID}`)
    session.put({ chat: null })
    createSessionListners(session, isHost)
  }
  userPair.subscribe(pair => sessionStorage.setItem("session-keypair", JSON.stringify(pair)))
  swapSession.subscribe(sessionData => sessionStorage.setItem("swap-session", JSON.stringify(sessionData)))
}

// Join or create session
export const createSession = async () => {
  if (!get(userPair)) {
    const user = await SEA.pair()
    userPair.set(user)
  }
  const signer = new providers.Web3Provider(get(accountProvider)).getSigner()
  const sessionID = `${Gun.state()}-${get(userPair).pub}`
  const walletSig = await signer.signMessage(`Create Swap Session \n Session Key: ${get(userPair).epub} \n Session ID: ${sessionID}`)
  const session = gun.get(`appSessions-${sessionID}`)
  session.put(null)
  session.put({ chat: null })
  const host = { walletAddress: get(walletAddress), pub: get(userPair).epub, walletSig }
  session.put({ host })
  createSessionListners(session, true)
  swapSession.set({
    sessionID, host
  })
}
export const joinSession = (sessionID: string) => new Promise<void>(async (resolve, reject) => {
  if (!get(userPair)) {
    const user = await SEA.pair()
    userPair.set(user)
  }
  const session = gun.get(`appSessions-${sessionID}`)
  const host: { walletAddress?: string, pub?: string, walletSig?: string } = {}
  session.get('host').map().once((value, key) => host[key] = value)
  if (utils.verifyMessage(`Create Swap Session \n Session Key: ${host.pub} \n Session ID: ${sessionID}`, host.walletSig) !== getAddress(host.walletAddress)) {
    reject("Invalid Session")
  } else {
    const signer = new providers.Web3Provider(get(accountProvider)).getSigner()
    const walletSig = await signer.signMessage(`Join Swap Session \n Session Key: ${get(userPair).epub} \n Session ID: ${sessionID}`)
    const client = { walletAddress: get(walletAddress), pub: get(userPair).epub, walletSig }
    session.put({ client })
    createSessionListners(session, false)
    swapSession.set({
      sessionID, host, client
    })
    resolve()
  }
})
