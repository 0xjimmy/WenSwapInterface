import { providers, utils } from "ethers";
import { get } from "svelte/store";
import { accountProvider, walletAddress } from "$lib/stores/provider";
import { createSessionListners, gun, selfPair, sessionID, sessionSig } from "$lib/gun";

// Join or create session
export const createSession = async () => {
  const signer = new providers.Web3Provider(get(accountProvider)).getSigner()
  const _sessionID = utils.solidityKeccak256(['string'], [`${Gun.state()}-${get(selfPair).pub}`])
  const sig = await signer.signMessage(`WenSwap Session! \n\n Session Key: ${get(selfPair).epub} \n Session ID: ${_sessionID}`)
  sessionID.set(_sessionID)
  sessionSig.set(sig)
  const session = gun.get(`appSessions-${_sessionID}`)
  session.put(null)
  session.put({ rpc: null })
  createSessionListners(session)
}

export const joinSession = async (_sessionID: string) => {
  const signer = new providers.Web3Provider(get(accountProvider)).getSigner()
  const sig = await signer.signMessage(`WenSwap Session! \n\n Session Key: ${get(selfPair).epub} \n Session ID: ${_sessionID}`)
  sessionSig.set(sig)
  const session = gun.get(`appSessions-${_sessionID}`)
  createSessionListners(session)
  const payload = { walletAddress: get(walletAddress), pub: get(selfPair).epub, sig }
  session.get('rpc').put({ jsonRpc: "2.0", method: "connect", params: JSON.stringify(payload), id: "1" });
}
