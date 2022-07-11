import { gun, peer, selfPair, sessionID, sessionSig } from "$lib/gun"
import { walletAddress } from "$lib/stores/provider"
import { constants, utils } from "ethers"
import { getAddress } from "ethers/lib/utils"
import { get } from "svelte/store"

export const handleConnect = (method: { jsonRpc: string, method: string, params: string, id: string, result?: string, error?: string }) => {
  if (method.id) {
    if (method.result || method.error) connectResult(method)
    else connectRequest(method)
  }
}

const connectRequest = (method: { jsonRpc: string, method: string, params: string, id: string }) => {
  const params = JSON.parse(method.params)
  if (get(sessionID) && getAddress(params.walletAddress) !== get(walletAddress) && params.sig && params.pub) {
    if (!get(peer) || getAddress(get(peer).walletAddress) === getAddress(params.walletAddress)) {
      if (utils.verifyMessage(`WenSwap Session! \n\n Session Key: ${params.pub} \n Session ID: ${get(sessionID)}`, params.sig) === getAddress(params.walletAddress)) {
        peer.set({ walletAddress: getAddress(params.walletAddress), pub: params.pub })
        gun.get(`appSessions-${get(sessionID)}`).get('rpc').put({ jsonRpc: "2.0", method: "connect", result: JSON.stringify({ walletAddress: get(walletAddress), sessionID: get(sessionID), pub: get(selfPair).epub, sig: get(sessionSig) }), id: method.id });
      } else {
        gun.get(`appSessions-${get(sessionID)}`).get('rpc').put({ jsonRpc: "2.0", method: "connect", error: "INVALID SIG", id: method.id });
      }
    } else {
      gun.get(`appSessions-${get(sessionID)}`).get('rpc').put({ jsonRpc: "2.0", method: "connect", error: "ALREADY CONNECTED WITH PAIR", id: method.id });
    }
  }
}

const connectResult = (method: { jsonRpc: string, method: string, params: string, id: string, result?: string, error?: string }) => {
  if (!get(peer)) {
    if (method.error) {
      console.log("GOT CONNECT RESULT ERROR", method.error)
    } else if (method.result) {
      const result = JSON.parse(method.result)
      console.log(result)
      if (getAddress(result.walletAddress) !== constants.AddressZero && getAddress(get(walletAddress)) !== getAddress(result.walletAddress) && utils.verifyMessage(`WenSwap Session! \n\n Session Key: ${result.pub} \n Session ID: ${result.sessionID}`, result.sig) === getAddress(result.walletAddress)) {
        peer.set({ walletAddress: getAddress(result.walletAddress), pub: result.pub })
        sessionID.set(result.sessionID)
      }
    }
  }
}
