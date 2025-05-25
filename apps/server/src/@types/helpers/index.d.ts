/**
  The Replace utility type is used when you need to replace a property with another type, for example:
  ```
    type A = { a: string, b: number }
    type C = Replace<A, { b: string }>
    typeof C => { a: string, b: string }
  ```
*/
export type Replace<T extends {}, R> = Omit<T, keyof R> & R;

/**
  The Remove utility type is used when you need to remove a property, for example:
  ```
    type A = { a: string, b: number}
    type C = Remove<A, 'b'>
    typeof C => { a: string }
  ```
*/
export type Remove<T extends {}, R extends keyof T> = Omit<T, R>;

/**
  The Property utility type is used when you need to choose a single property, replacing the use of typeof Student["id"], for example:
  ```
    type A = { a: string, b: number}
    type C = Property<A, 'b'>
    typeof C => { b: number }
  ```
*/
export type Property<T extends {}, R extends keyof T> = Extract<T, R>;

type Only<T, U> = {
  [P in keyof T]: T[P];
} & {
  [P in keyof U]?: never;
};

type Either<T, U> = Only<T, U> | Only<U, T>;

type Entity = {
  [key: string]: Relation<any>;
};

/**
  The RelationsFromEntity utility type is used when you need an object containing keys whose type is Relation<T> from within an object, for example:
  ```
    type A = { a: Relation<any>, b: number}
    type C = RelationsFromEntity<A>
    typeof C => { a: Relation<any> }
  ```
*/
export type RelationsFromEntity<T extends Entity> = {
  [K in keyof T]: T[K] extends Relation<infer R>
    ? R extends Entity
      ? K
      : never
    : never;
}[keyof T];

/**
  The KeysFromRelations utility type is used when you need an array containing the keys whose type is Relation<T> from within an object, for example:
  ```
    type A = { a: Relation<any>, b: number}
    type C = KeysFromRelations<A>
    typeof C => ['a']

    type B = { a: Relation<any>, b: number, c: Relation<any>, d: string}
    type D = KeysFromRelations<B>
    typeof D => ['a', 'c']
  ```
*/
export type KeysFromRelations<T extends Entity> = Array<RelationsFromEntity<T>>;

export type Common<T extends any[]> = {
  [K in keyof T[number]]: Extract<T[number][K], T[number][K]>;
};
