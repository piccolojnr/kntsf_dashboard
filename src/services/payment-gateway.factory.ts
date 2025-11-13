import { IPaymentGateway } from './payment-gateway.interface'
import { PaystackGateway } from './gateways/paystack.gateway'
import { ExpressPayGateway } from './gateways/expresspay.gateway'

let gatewayInstance: IPaymentGateway | null = null

export function getPaymentGateway(): IPaymentGateway {
    if (gatewayInstance) {
        return gatewayInstance
    }

    const gatewayType = (process.env.PAYMENT_GATEWAY || 'expresspay').toLowerCase()

    switch (gatewayType) {
        case 'paystack':
            gatewayInstance = new PaystackGateway()
            break
        case 'expresspay':
        default:
            gatewayInstance = new ExpressPayGateway()
            break
    }

    return gatewayInstance
}

export function resetPaymentGateway(): void {
    gatewayInstance = null
}

