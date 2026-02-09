import { Gateway, Contract, Network } from 'fabric-network';
import { fabricGatewayService } from './FabricGatewayService';

export class FabricService {
    private static instance: FabricService;

    private constructor() { }

    public static getInstance(): FabricService {
        if (!FabricService.instance) {
            FabricService.instance = new FabricService();
        }
        return FabricService.instance;
    }

    /**
     * Submit a transaction to the blockchain
     */
    public async submitTransaction(
        channelName: string,
        chaincodeName: string,
        functionName: string,
        args: string[],
        username: string,
        mspId: string
    ): Promise<string> {
        let gateway: Gateway | null = null;

        try {
            console.log(`Submitting transaction: ${functionName} with args:`, args);

            const contract = await this.getContract(
                channelName,
                chaincodeName,
                username,
                mspId
            );

            gateway = contract.gateway;

            // Submit transaction
            const result = await contract.contract.submitTransaction(functionName, ...args);

            console.log('Transaction submitted successfully');
            return result.toString('utf8');
        } catch (error) {
            console.error('Error submitting transaction:', error);
            throw new Error(`Failed to submit transaction: ${error}`);
        } finally {
            if (gateway) {
                gateway.disconnect();
            }
        }
    }

    /**
     * Evaluate a transaction (query) on the blockchain
     */
    public async evaluateTransaction(
        channelName: string,
        chaincodeName: string,
        functionName: string,
        args: string[],
        username: string,
        mspId: string
    ): Promise<string> {
        let gateway: Gateway | null = null;

        try {
            console.log(`Evaluating transaction: ${functionName} with args:`, args);

            const contract = await this.getContract(
                channelName,
                chaincodeName,
                username,
                mspId
            );

            gateway = contract.gateway;

            // Evaluate transaction (read-only)
            const result = await contract.contract.evaluateTransaction(functionName, ...args);

            console.log('Transaction evaluated successfully');
            return result.toString('utf8');
        } catch (error) {
            console.error('Error evaluating transaction:', error);
            throw new Error(`Failed to evaluate transaction: ${error}`);
        } finally {
            if (gateway) {
                gateway.disconnect();
            }
        }
    }

    /**
     * Get contract instance from gateway
     */
    private async getContract(
        channelName: string,
        chaincodeName: string,
        username: string,
        mspId: string
    ): Promise<{ gateway: Gateway; contract: Contract }> {
        try {
            const gateway = await fabricGatewayService.getFabricGateway(username, mspId);
            const network: Network = await gateway.getNetwork(channelName);
            const contract: Contract = network.getContract(chaincodeName);

            return { gateway, contract };
        } catch (error) {
            console.error('Error getting contract:', error);
            throw new Error(`Failed to get contract: ${error}`);
        }
    }
}

export const fabricService = FabricService.getInstance();
