/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * Represents the type of an fungible asset
 *
 * Each **asset info** instance can be one of two variants:
 *
 * - Native SDK coins. To create an **asset info** instance of this type, provide the denomination. - CW20 tokens. To create an **asset info** instance of this type, provide the contract address.
 */
export type AssetInfoBaseFor_Addr =
  | {
      native: string;
    }
  | {
      cw20: Addr;
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

export interface MarketsListResponse {
  markets_list: MarketInfo[];
  [k: string]: unknown;
}
export interface MarketInfo {
  /**
   * Asset info
   */
  asset_info: AssetInfoBaseFor_Addr;
  /**
   * Either denom if native asset or contract address if cw20
   */
  asset_label: string;
  /**
   * Bytes used as key on the kv store for data related to the asset
   */
  asset_reference: number[];
  /**
   * Address for the corresponding alToken
   */
  ib_token_address: Addr;
  /**
   * Asset symbol
   */
  symbol: string;
  [k: string]: unknown;
}
