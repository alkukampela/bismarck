declare module 'bidirectional-map' {
  export default class BiMap<K extends string | number | symbol, V> {
    constructor(map?: Record<K, V>);
    get(key: K): V;
    getKey(value: V): K;
    set(key: K, value: V): void;
    delete(key: K): void;
    deleteValue(value: V): void;
    readonly size: number;
  }
}
