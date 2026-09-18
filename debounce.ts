
type UnknownFn = (...args: any[]) => any;

interface DebFunction<T extends UnknownFn>{
    (this: ThisParameterType<T>, ...args: Parameters<T>) : void;
    cancel(): void;
    flush(): ReturnType<T> | undefined;
    pending(): boolean
}

function debounce<T extends UnknownFn>(
  fn: T,
  wait: number,
  {leading = false, trailing = true}: {leading?: boolean, trailing?: boolean} = {}
): DebFunction<T> {
    
    let timer: ReturnType<typeof setTimeout> | undefined;
    let lastArgs: Parameters<T> | undefined;
    let lastThis: ThisParameterType<T>;
    let result: ReturnType<T> | undefined;

    const invoke = () => {
    const args = lastArgs!;
    const ctx = lastThis;
    lastArgs = undefined;
    result = fn.apply(ctx, args);
    return result;
  };

  const debounced = function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    lastArgs = args;
    lastThis = this;
    const isFirst = timer === undefined;

    if (timer !== undefined) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = undefined;
      if (trailing && lastArgs) invoke();
    }, wait);

    if (leading && isFirst) invoke();
  } as DebFunction<T>;

  debounced.cancel = () => {
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
    lastArgs = undefined;
  };
    debounced.flush = () => {
    if (timer !== undefined && lastArgs) {
      clearTimeout(timer);
      timer = undefined;
      return invoke();
    }
    return result;
  };

  debounced.pending = () => timer !== undefined;

  return debounced;
    
};
