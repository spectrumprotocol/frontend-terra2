/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export type Uint128 = string;
export type HumanAddr = string;

export interface InitMsg {
  distribution_schedule: [number, number, Uint128][];
  pylon_token: HumanAddr;
  staking_token: HumanAddr;
  [k: string]: unknown;
}
