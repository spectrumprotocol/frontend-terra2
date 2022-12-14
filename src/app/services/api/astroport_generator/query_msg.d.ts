/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export type QueryMsg =
  | {
      active_pool_length: {
        [k: string]: unknown;
      };
    }
  | {
      pool_length: {
        [k: string]: unknown;
      };
    }
  | {
      deposit: {
        lp_token: string;
        user: string;
        [k: string]: unknown;
      };
    }
  | {
      user_virtual_amount: {
        lp_token: string;
        user: string;
        [k: string]: unknown;
      };
    }
  | {
      total_virtual_supply: {
        generator: string;
        [k: string]: unknown;
      };
    }
  | {
      pending_token: {
        lp_token: string;
        user: string;
        [k: string]: unknown;
      };
    }
  | {
      config: {
        [k: string]: unknown;
      };
    }
  | {
      reward_info: {
        lp_token: string;
        [k: string]: unknown;
      };
    }
  | {
      orphan_proxy_rewards: {
        lp_token: string;
        [k: string]: unknown;
      };
    }
  | {
      pool_info: {
        lp_token: string;
        [k: string]: unknown;
      };
    }
  | {
      simulate_future_reward: {
        future_block: number;
        lp_token: string;
        [k: string]: unknown;
      };
    }
  | {
      pool_stakers: {
        limit?: number | null;
        lp_token: string;
        start_after?: string | null;
        [k: string]: unknown;
      };
    }
  | {
      blocked_tokens_list: {
        [k: string]: unknown;
      };
    };
