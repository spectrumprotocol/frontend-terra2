/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export type ExecuteMsg =
  | {
      update_config: {
        /**
         * The amount of generators
         */
        checkpoint_generator_limit?: number | null;
        /**
         * The new generator controller contract address
         */
        generator_controller?: string | null;
        /**
         * The new generator guardian
         */
        guardian?: string | null;
        /**
         * The new vesting contract address
         */
        vesting_contract?: string | null;
        /**
         * The new voting escrow contract address
         */
        voting_escrow?: string | null;
        [k: string]: unknown;
      };
    }
  | {
      setup_pools: {
        /**
         * The list of pools with allocation point.
         */
        pools: [string, Uint128][];
        [k: string]: unknown;
      };
    }
  | {
      update_pool: {
        /**
         * This flag determines whether the pool gets 3rd party token rewards
         */
        has_asset_rewards: boolean;
        /**
         * The address of the LP token contract address whose allocation we change
         */
        lp_token: string;
        [k: string]: unknown;
      };
    }
  | {
      claim_rewards: {
        /**
         * the LP token contract address
         */
        lp_tokens: string[];
        [k: string]: unknown;
      };
    }
  | {
      withdraw: {
        /**
         * The amount to withdraw
         */
        amount: Uint128;
        /**
         * The address of the LP token to withdraw
         */
        lp_token: string;
        [k: string]: unknown;
      };
    }
  | {
      emergency_withdraw: {
        /**
         * The address of the LP token to withdraw
         */
        lp_token: string;
        [k: string]: unknown;
      };
    }
  | {
      set_allowed_reward_proxies: {
        /**
         * The full list of allowed proxy contracts
         */
        proxies: string[];
        [k: string]: unknown;
      };
    }
  | {
      send_orphan_proxy_reward: {
        /**
         * The address of the LP token contract for which we send orphaned rewards
         */
        lp_token: string;
        /**
         * The transfer recipient
         */
        recipient: string;
        [k: string]: unknown;
      };
    }
  | {
      receive: Cw20ReceiveMsg;
    }
  | {
      set_tokens_per_block: {
        /**
         * The new amount of ASTRO to distro per block
         */
        amount: Uint128;
        [k: string]: unknown;
      };
    }
  | {
      propose_new_owner: {
        /**
         * The validity period of the proposal to change the contract owner
         */
        expires_in: number;
        /**
         * The newly proposed owner
         */
        owner: string;
        [k: string]: unknown;
      };
    }
  | {
      drop_ownership_proposal: {
        [k: string]: unknown;
      };
    }
  | {
      claim_ownership: {
        [k: string]: unknown;
      };
    }
  | {
      update_allowed_proxies: {
        /**
         * Allowed proxy contract
         */
        add?: string[] | null;
        /**
         * Proxy contracts to remove
         */
        remove?: string[] | null;
        [k: string]: unknown;
      };
    }
  | {
      move_to_proxy: {
        lp_token: string;
        proxy: string;
        [k: string]: unknown;
      };
    }
  | {
      migrate_proxy: {
        lp_token: string;
        new_proxy: string;
        [k: string]: unknown;
      };
    }
  | {
      update_blocked_tokenslist: {
        /**
         * Tokens to add
         */
        add?: AssetInfo[] | null;
        /**
         * Tokens to remove
         */
        remove?: AssetInfo[] | null;
        [k: string]: unknown;
      };
    }
  | {
      deactivate_pool: {
        lp_token: string;
        [k: string]: unknown;
      };
    }
  | {
      deactivate_pools: {
        pair_types: PairType[];
        [k: string]: unknown;
      };
    }
  | {
      checkpoint_user_boost: {
        generators: string[];
        user?: string | null;
        [k: string]: unknown;
      };
    };
/**
 * A thin wrapper around u128 that is using strings for JSON encoding/decoding, such that the full u128 range can be used for clients that convert JSON numbers to floats, like JavaScript and jq.
 *
 * # Examples
 *
 * Use `from` to create instances of this and `u128` to get the value out:
 *
 * ``` # use cosmwasm_std::Uint128; let a = Uint128::from(123u128); assert_eq!(a.u128(), 123);
 *
 * let b = Uint128::from(42u64); assert_eq!(b.u128(), 42);
 *
 * let c = Uint128::from(70u32); assert_eq!(c.u128(), 70); ```
 */
export type Uint128 = string;
/**
 * Binary is a wrapper around Vec<u8> to add base64 de/serialization with serde. It also adds some helper methods to help encode inline.
 *
 * This is only needed as serde-json-{core,wasm} has a horrible encoding for Vec<u8>
 */
export type Binary = string;
/**
 * This enum describes available Token types. ## Examples ``` # use cosmwasm_std::Addr; # use astroport::asset::AssetInfo::{NativeToken, Token}; Token { contract_addr: Addr::unchecked("terra...") }; NativeToken { denom: String::from("uluna") }; ```
 */
export type AssetInfo =
  | {
      token: {
        contract_addr: Addr;
        [k: string]: unknown;
      };
    }
  | {
      native_token: {
        denom: string;
        [k: string]: unknown;
      };
    };
/**
 * A human readable address.
 *
 * In Cosmos, this is typically bech32 encoded. But for multi-chain smart contracts no assumptions should be made other than being UTF-8 encoded and of reasonable length.
 *
 * This type represents a validated address. It can be created in the following ways 1. Use `Addr::unchecked(input)` 2. Use `let checked: Addr = deps.api.addr_validate(input)?` 3. Use `let checked: Addr = deps.api.addr_humanize(canonical_addr)?` 4. Deserialize from JSON. This must only be done from JSON that was validated before such as a contract's state. `Addr` must not be used in messages sent by the user because this would result in unvalidated instances.
 *
 * This type is immutable. If you really need to mutate it (Really? Are you sure?), create a mutable copy using `let mut mutable = Addr::to_string()` and operate on that `String` instance.
 */
export type Addr = string;
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
 * Cw20ReceiveMsg should be de/serialized under `Receive()` variant in a ExecuteMsg
 */
export interface Cw20ReceiveMsg {
  amount: Uint128;
  msg: Binary;
  sender: string;
  [k: string]: unknown;
}
