// MetaMaskButton.tsx
import React, { useEffect, useState } from 'react'
import { useSDK as useMetamaskSDK } from '@metamask/sdk-react'
import { GambaUi } from 'gamba-react-ui-v2'
import { Modal } from '../components/Modal'
import { truncateString } from '../utils'

export const MetaMaskButton = () => {
  const [account, setAccount] = useState<string>()
  const [modal, setModal] = useState(false)
  const { sdk, connected, connecting, chainId } = useMetamaskSDK()

  useEffect(() => {
    const checkIfWalletIsConnected = async () => {
      if (window.ethereum) {
        try {
          const accounts = (await window.ethereum.request({ method: 'eth_accounts' })) as string[]
          if (accounts && accounts.length > 0) {
            setAccount(accounts[0])
          }
        } catch (error) {
          console.error('Error checking if MetaMask is connected:', error)
        }
      }
    }

    checkIfWalletIsConnected()
  }, [])

  const connectMetaMask = async () => {
    if (!sdk) {
      console.warn('MetaMask SDK is not available')
      return
    }
    try {
      const accounts = await sdk.connect()
      setAccount(accounts?.[0])
    } catch (err) {
      console.warn('Failed to connect to MetaMask:', err)
    }
  }

  const disconnectMetaMask = () => {
    setAccount(undefined) // Clear the account state to "disconnect"
    sdk?.terminate()
    setModal(false)
  }

  return (
    <>
      {connected && account ? (
        <>
          {modal && (
            <Modal onClose={() => setModal(false)}>
              <h1>{truncateString(account, 6, 3)}</h1>
              <p>Connected chain: {chainId}</p>
              <GambaUi.Button onClick={disconnectMetaMask}>Disconnect MetaMask</GambaUi.Button>
            </Modal>
          )}
          <div style={{ position: 'relative' }}>
            <GambaUi.Button onClick={() => setModal(true)}>
              <div style={{ display: 'flex', gap: '.5em', alignItems: 'center' }}>
                <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" height="20px" />
                {truncateString(account, 3)}
              </div>
            </GambaUi.Button>
          </div>
        </>
      ) : (
        <GambaUi.Button onClick={connectMetaMask} disabled={connecting}>
          {connecting ? 'Connecting to MetaMask...' : 'Connect to MetaMask'}
        </GambaUi.Button>
      )}
    </>
  )
}
