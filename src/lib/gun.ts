import { derived, get, writable } from 'svelte/store';
import { browser } from '$app/env';
import GUN, { type ISEAPair } from 'gun'
import SEA from 'gun/sea';

export const gun = GUN(['https://gun-manhattan.herokuapp.com/gun']);

export const sessionID = writable<string>()
export const sessionSig = writable<string>()
export const selfPair = writable<ISEAPair>()
export const peer = writable<{ walletAddress: string, pub: string }>()
export const encryptionKey = derived([peer, selfPair], ([$peer, $self], set: (value: any) => void) => {
  if ($peer && $self) SEA.secret($peer.pub, $self).then(epriv => set(epriv))
  else set(undefined)
})

import { handleConnect } from "$lib/methods/connect";
import { handleChat } from './methods/chat';

const methodHandlers = {
  connect: handleConnect,
  chat: handleChat
}
const supportedRpcMethods = Object.keys(methodHandlers)
let lastRequest: any = ""
const isValidPacket = (request: { jsonRpc: string, method: string, params?: string, result?: string, error?: string, id?: string }) => {
  if (!request) return false;
  if (!request.jsonRpc) return false;
  if (!request.method) return false;
  if (!(request.params || request.result || request.error)) return false;
  let compare: any = { method: request.method }
  if (request.result) compare['result'] = request.result
  if (request.params) compare['params'] = request.params
  if (request.error) compare['error'] = request.error
  if (request.id) compare['id'] = request.id
  compare = JSON.stringify(compare)
  if (compare === lastRequest) return false;
  lastRequest = compare;
  if (request.jsonRpc !== "2.0") return false;
  if (!supportedRpcMethods.includes(request.method)) return false;
  return true
}

export const sessionListeners = writable<() => void>(undefined);

export const createSessionListners = (session: any) => {
  // Track listner to remove
  let eve = undefined;
  console.log("START RPC SERVER");

  // Handle client joins
  // if (host) {
  //   session.get('client').on((client: { walletAddress: string, walletSig: string, pub: string }, _: null, __: null, eve: any) => {
  //     if (!eves.client) eves.client = eve
  //     if (!get(swapSession).client && utils.verifyMessage(`Join Swap Session \n Session Key: ${client.pub} \n Session ID: ${get(swapSession).sessionID}`, client.walletSig) === getAddress(client.walletAddress)) {
  //       swapSession.update(data => ({ ...data, client }))
  //     }
  //   })
  // }
  // // Handle chat
  // session.get('chat').map().on((chat: { from: string, message: string }, id: string, _: null, eve: any) => {
  //   if (!eves.chat) eves.chat = eve
  //   if (chat && chat.message && chat.from && get(encryptionKey) !== "") {
  //     const { from, message } = chat;

  //   }
  // })

  // Handle RPC
  session.get('rpc').on((request: any, _: null, __: null, eve: any) => {
    if (!eve) eve = eve

    if (isValidPacket(request)) {
      methodHandlers[request.method](request)
    }
  })

  // Remove listners
  sessionListeners.set(() => {
    if (eve) eve.off()
    console.log("STOP RPC SERVER");
  })
}

if (browser) {
  if (localStorage.getItem("selfKey")) {
    selfPair.set(JSON.parse(localStorage.getItem("selfKey")))
  } else {
    SEA.pair().then(pair => selfPair.set(pair))
  }
  selfPair.subscribe(($self) => {
    localStorage.setItem("selfKey", JSON.stringify($self))
  })

  if (localStorage.getItem("sessionID")) {
    sessionID.set(JSON.parse(localStorage.getItem("sessionID")))
    const session = gun.get(`appSessions-${get(sessionID)}`)
    createSessionListners(session)
  }
  sessionID.subscribe(($sessionID) => {
    localStorage.setItem("sessionID", JSON.stringify($sessionID))
  })

  if (localStorage.getItem("sessionSig")) {
    sessionSig.set(JSON.parse(localStorage.getItem("sessionSig")))
  }
  sessionSig.subscribe(($sessionSig) => {
    localStorage.setItem("sessionSig", JSON.stringify($sessionSig))
  })
}
