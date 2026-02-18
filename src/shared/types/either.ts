/**
 * Either is a type that represents a value that can be either a left or a right value.
 * It is useful for representing a value that can be either a success or an error.
 * @param L - The type of the left value.
 * @param R - The type of the right value.
 * @returns An Either type.
 */

export type Either<L, R> = Left<L> | Right<R>;

/**
 * Left is a type that represents a left value.
 * @param L - The type of the left value.
 * @returns A Left type.
 */
export type Left<L> = {
  left: L;
  right?: never;
};

/**
 * Right is a type that represents a right value.
 * @param R - The type of the right value.
 * @returns A Right type.
 */
export type Right<R> = {
  left?: never;
  right: R;
};

// Example usages:
// const result: Either<string, number> = {
//   left: "error",
// };

// const result2: Either<string, number> = {
//   right: 1,
// };