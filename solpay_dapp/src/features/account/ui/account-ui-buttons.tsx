import { PublicKey } from '@solana/web3.js'
import { ErrorBoundary } from 'next/dist/client/components/error-boundary'
import { useSolana } from '@/components/solana/use-solana'
import { AccountUiModalAirdrop } from './account-ui-modal-airdrop'
import { AccountUiModalReceive } from './account-ui-modal-receive'
import { AccountUiModalSend } from './account-ui-modal-send'

export function AccountUiButtons({ address }: { address: PublicKey }) {
  const { publicKey, cluster } = useSolana()

  return publicKey ? (
    <div>
      <div className="space-x-2">
        {cluster.network === 'mainnet-beta' ? null : <AccountUiModalAirdrop address={address} />}
        <ErrorBoundary errorComponent={() => null}>
          <AccountUiModalSend address={address} />
        </ErrorBoundary>
        <AccountUiModalReceive address={address} />
      </div>
    </div>
  ) : null
}
