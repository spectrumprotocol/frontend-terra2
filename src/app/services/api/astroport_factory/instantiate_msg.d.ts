/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * This enum describes available pair types. ## Available pool types ``` # use astroport::factory::PairType::{Custom, Stable, Xyk}; Xyk {}; Stable {}; Custom(String::from("Custom")); ```
 */
export type PairType =
  | {
      xyk: {
        [k: string]: unknown;
      };
    }
  | {
      stable: {
        [k: string]: unknown;
      };
    }
  | {
      custom: string;
    };

/**
 * This structure stores the basic settings for creating a new factory contract.
 */
export interface InstantiateMsg {
  /**
   * Contract address to send governance fees to (the Maker)
   */
  fee_address?: string | null;
  /**
   * Address of contract that is used to auto_stake LP tokens once someone provides liquidity in a pool
   */
  generator_address?: string | null;
  /**
   * Address of owner that is allowed to change factory contract parameters
   */
  owner: string;
  /**
   * IDs of contracts that are allowed to instantiate pairs
   */
  pair_configs: PairConfig[];
  /**
   * CW20 token contract code identifier
   */
  token_code_id: number;
  /**
   * CW1 whitelist contract code id used to store 3rd party rewards for staking Astroport LP tokens
   */
  whitelist_code_id: number;
  [k: string]: unknown;
}
/**
 * This structure stores a pair type's configuration.
 */
export interface PairConfig {
  /**
   * ID of contract which is allowed to create pairs of this type
   */
  code_id: number;
  /**
   * Whether a pair type is disabled or not. If it is disabled, new pairs cannot be created, but existing ones can still read the pair configuration
   */
  is_disabled: boolean;
  /**
   * Setting this to true means that pairs of this type will not be able to get an ASTRO generator
   */
  is_generator_disabled: boolean;
  /**
   * The amount of fees (in bps) collected by the Maker contract from this pair type
   */
  maker_fee_bps: number;
  /**
   * The pair type (provided in a [`PairType`])
   */
  pair_type: PairType;
  /**
   * The total fees (in bps) charged by a pair of this type
   */
  total_fee_bps: number;
  [k: string]: unknown;
}
