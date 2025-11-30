import { PublicKey } from '@solana/web3.js'
import { ErrorBoundary } from 'next/dist/client/components/error-boundary'
import { useSolana } from '@/components/solana/use-solana'
import { AccountUiModalAirdrop } from './account-ui-modal-airdrop'
import { AccountUiModalReceive } from './account-ui-modal-receive'
import { AccountUiModalSend } from './account-ui-modal-send'

export function AccountUiButtons({ address }: { address: PublicKey | string }) {
  const { publicKey, cluster } = useSolana()

  let addressPubkey: PublicKey | null = null
  try {
    addressPubkey = typeof address === 'string' ? new PublicKey(address) : address
  } catch (err) {
    // If conversion fails, log and don't render the account action buttons
    console.error('Invalid account address passed to AccountUiButtons:', err)
    return null
  }

  return publicKey ? (
    <div>
      <div className="space-x-2">
        {cluster.network === 'mainnet-beta' ? null : <AccountUiModalAirdrop address={addressPubkey} />}
        <ErrorBoundary errorComponent={() => null}>
          <AccountUiModalSend address={addressPubkey} />
        </ErrorBoundary>
        <AccountUiModalReceive address={addressPubkey} />
      </div>
    </div>
  ) : null
}
