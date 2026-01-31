/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai from "../ai.js";
import type * as characters from "../characters.js";
import type * as diary from "../diary.js";
import type * as goals from "../goals.js";
import type * as memories from "../memories.js";
import type * as messages from "../messages.js";
import type * as notes from "../notes.js";
import type * as settings from "../settings.js";
import type * as starter from "../starter.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ai: typeof ai;
  characters: typeof characters;
  diary: typeof diary;
  goals: typeof goals;
  memories: typeof memories;
  messages: typeof messages;
  notes: typeof notes;
  settings: typeof settings;
  starter: typeof starter;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
