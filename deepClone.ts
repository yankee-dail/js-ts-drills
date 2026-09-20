type Cloneable =
  | null
  | undefined
  | boolean
  | number
  | string
  | bigint
  | symbol
  | ((...args: any[]) => any)
  | object;

export function deepClone<T extends Cloneable>(value: T): T {
  return cloneInternal(value, new WeakMap<object, unknown>());
}

function cloneInternal<T>(value: T, seen: WeakMap<object, unknown>): T {
  if (value === null || typeof value !== "object") {
    return value;
  }
  if (seen.has(value as object)) {
    return seen.get(value as object) as T;
  }

  if (value instanceof Date) {
    return new Date(value.getTime()) as unknown as T;
  }

  if (value instanceof RegExp) {
    return new RegExp(value.source, value.flags) as unknown as T;
  }

  if (Array.isArray(value)) {
    const clone: unknown[] = [];
    seen.set(value, clone); // реєстрація ДО рекурсії — критично для циклів
    for (const item of value) {
      clone.push(cloneInternal(item, seen));
    }
    return clone as unknown as T;
  }

  if (value instanceof Map) {
    const clone = new Map<unknown, unknown>();
    seen.set(value, clone);
    for (const [k, v] of value) {
      clone.set(cloneInternal(k, seen), cloneInternal(v, seen));
    }
    return clone as unknown as T;
  }

  if (value instanceof Set) {
    const clone = new Set<unknown>();
    seen.set(value, clone);
    for (const item of value) {
      clone.add(cloneInternal(item, seen));
    }
    return clone as unknown as T;
  }
  const proto = Object.getPrototypeOf(value);
  const clone = Object.create(proto);
  seen.set(value, clone); // реєстрація ДО рекурсії

  for (const key of Reflect.ownKeys(value as object)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor) continue;

    if ("value" in descriptor) {
      Object.defineProperty(clone, key, {
        ...descriptor,
        value: cloneInternal(descriptor.value, seen),
      });
    } else {
      Object.defineProperty(clone, key, descriptor);
    }
  }

  return clone as T;
}