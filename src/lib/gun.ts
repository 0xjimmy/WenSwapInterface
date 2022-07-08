import GUN from 'gun'
import { derived, writable } from 'svelte/store';
import { walletAddress } from '$lib/stores/provider';
import SEA from 'gun/sea';

export const gun = GUN(['https://gun-manhattan.herokuapp.com/gun']);

export const swapSession = writable<{ sessionID: string, host: any, client?: any }>(null)
export const userPair = writable(null)
export const peer = derived([swapSession, walletAddress], ([$swapSession, $walletAddress]) => {
  if ($swapSession) {
    const isHost = $swapSession.host.walletAddress === $walletAddress
    if (isHost && $swapSession.client) return $swapSession.client
    else if (!isHost) return $swapSession.host
    else return null
  } else {
    return null;
  }
})

export const encryptionKey = derived([peer, userPair], ([$peer, $userPair], set) => {
  if ($peer && $userPair) SEA.secret($peer.pub, $userPair).then(key => set(String(key)))
  else set("")
})
