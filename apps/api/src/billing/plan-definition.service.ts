import { Injectable } from '@nestjs/common';
import { PLAN_CONFIGS, PlanTier, PlanConfig } from './plan-config';

@Injectable()
export class PlanDefinitionService {
  /**
   * Returns the complete configuration for a given plan tier.
   * Throws if the tier is unknown (though TypeScript guarantees it for valid inputs).
   */
  getPlanConfig(tier: PlanTier): PlanConfig {
    const config = PLAN_CONFIGS[tier];
    if (!config) {
      throw new Error(`Unknown plan tier: ${tier}`);
    }
    return config;
  }
}
