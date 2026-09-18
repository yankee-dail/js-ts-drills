function throttle<F extends UnknownFn>(
  fn: F,
  wait: number,
  { leading = true, trailing = true }: { leading?: boolean; trailing?: boolean } = {}
): DebFunction<F> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let lastArgs: Parameters<F> | undefined;
  let lastThis: ThisParameterType<F>;
  let lastCallTime = 0;
  let result: ReturnType<F> | undefined;

  const invoke = (time: number) => {
    lastCallTime = time;
    const args = lastArgs!;
    const ctx = lastThis;
    lastArgs = undefined;
    result = fn.apply(ctx, args);
    return result;
  };

  const throttled = function (this: ThisParameterType<F>, ...args: Parameters<F>) {
    const now = Date.now();
    if (!lastCallTime && !leading) lastCallTime = now;

    const remaining = wait - (now - lastCallTime);
    lastArgs = args;
    lastThis = this;

    if (remaining <= 0 || remaining > wait) {
      if (timer !== undefined) {
        clearTimeout(timer);
        timer = undefined;
      }
      invoke(now);
    } else if (trailing && timer === undefined) {
      timer = setTimeout(() => {
        timer = undefined;
        lastCallTime = leading ? Date.now() : 0;
        if (lastArgs) invoke(Date.now());
      }, remaining);
    }
  } as DebFunction<F>;

  throttled.cancel = () => {
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
    lastArgs = undefined;
    lastCallTime = 0;
  };

  throttled.flush = () => {
    if (timer !== undefined && lastArgs) {
      clearTimeout(timer);
      timer = undefined;
      return invoke(Date.now());
    }
    return result;
  };

  throttled.pending = () => timer !== undefined;

  return throttled;
}