
import { dhanService } from './dhanService';
import { mobileBackendService } from './mobileBackendService';
import { BrokerId } from '../types';

export const getBrokerService = () => {
  const directService = dhanService; // Always Dhan

  // If Mobile Backend is enabled, wrap the placeOrder method
  if (mobileBackendService.isEnabled()) {
    return {
       ...directService,
       // Override placeOrder to route through Firebase
       placeOrder: async (order: any) => {
         console.log(`Routing order for DHAN via Mobile Backend...`);
         return await mobileBackendService.placeOrderViaCloud('DHAN', order);
       },
       getProfile: directService.getProfile.bind(directService),
       getHoldings: directService.getHoldings.bind(directService),
       isConfigured: directService.isConfigured.bind(directService),
       fetchIndicesMarketData: directService.fetchIndicesMarketData.bind(directService),
       // FIX: Removed reference to non-existent method addIndicesToWatchlist
    };
  }

  return directService;
};

export const setBroker = (broker: BrokerId) => {
    // No-op or log warning as only Dhan is supported
    console.warn("Only Dhan broker is supported.");
};

export const getActiveBrokerId = (): BrokerId => {
    return 'DHAN';
};
