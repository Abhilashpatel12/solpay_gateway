// Minimal shape of the program IDL to provide typed `program.account.*`
// properties used across the codebase. Keep this small to avoid regenerating
// the full IDL here; the canonical IDL JSON is in `src/idl/solpay_smartcontract.json`.

import type { PublicKey } from '@solana/web3.js'
import type BN from 'bn.js'

// Account types based on the IDL
export interface MerchantRegistration {
	merchantName: string
	merchantAddress: PublicKey
	isActive: boolean
	createdAt: BN
	merchantWeburl: string
	supportedTokens: PublicKey[]
}

export interface PaymentTransaction {
	txSignature: string
	payerAddress: PublicKey
	merchantAddress: PublicKey
	amount: BN
	tokenMint: PublicKey
	status: number
	createdAt: BN
}

export interface SubscriptionPlan {
	planName: string
	planPrice: BN
	tokenMint: PublicKey
	billingCycle: number
	isActive: boolean
	createdAt: BN
	merchantAddress: PublicKey
	supportedTokens: PublicKey[]
}

export interface UserSubscription {
	subscriber: PublicKey
	subscriptionPlan: PublicKey
	startDate: BN
	nextBillingDate: BN
	isActive: boolean
	merchantAddress: PublicKey
	supportedTokens: PublicKey[]
	canceledAt: BN | null
}

// Account wrapper returned by Anchor's .all() calls
export interface AccountWrapper<T> {
	publicKey: PublicKey
	account: T
}

// Subscription plan with publicKey for UI
export interface SubscriptionPlanWithPubkey extends SubscriptionPlan {
	publicKey: PublicKey
}

// User subscription with plan details
export interface EnrichedUserSubscription {
	publicKey: PublicKey
	account: UserSubscription
	plan: SubscriptionPlan | null
}

// Payment transaction processed for UI
export interface ProcessedPaymentTransaction {
	publicKey: PublicKey
	txSignature: string
	payerAddress: PublicKey
	merchantAddress: PublicKey
	amount: number
	tokenMint: PublicKey
	status: number
	createdAt: number
}

// Chart data point
export interface ChartDataPoint {
	date: string
	amount: number
	timestamp?: number
}

// IDL type definition (kept for compatibility)
export type SolpaySmartcontract = {
	name?: string
	version?: string
	instructions?: unknown[]
	accounts: {
		merchantRegistration: unknown
		paymentTransaction: unknown
		subscriptionPlan: unknown
		userSubscription: unknown
		[k: string]: unknown
	}
	types?: unknown[]
	errors?: unknown[]
}

export default SolpaySmartcontract
