// Minimal shape of the program IDL to provide typed `program.account.*`
// properties used across the codebase. Keep this small to avoid regenerating
// the full IDL here; the canonical IDL JSON is in `src/idl/solpay_smartcontract.json`.

/* eslint-disable @typescript-eslint/no-explicit-any */
export type SolpaySmartcontract = {
	name?: string
	version?: string
	instructions?: any[]
	accounts: {
		merchantRegistration: any
		paymentTransaction: any
		subscriptionPlan: any
		userSubscription: any
		[k: string]: any
	}
	types?: any[]
	errors?: any[]
}

export default SolpaySmartcontract