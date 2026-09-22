export interface PromisePoolOptions {
  failFast?: boolean;
  onSettle?: (index: number, result: PromiseSettledResult<unknown>) => void;
}

export function promisePool<T>(
  tasks: Array<() => Promise<T>>,
  limit: number,
  options?: { failFast?: false } & PromisePoolOptions
): Promise<PromiseSettledResult<T>[]>;
export function promisePool<T>(
  tasks: Array<() => Promise<T>>,
  limit: number,
  options?: { failFast?: true } & PromisePoolOptions
): Promise<T[]>;
export function promisePool<T>(
  tasks: Array<() => Promise<T>>,
  limit: number,
  options: PromisePoolOptions = {}
): Promise<T[] | PromiseSettledResult<T>[]> {
  const { failFast = true, onSettle } = options;

  if (limit <= 0) {
    throw new RangeError("limit має бути додатним числом");
  }

  if (tasks.length === 0) {
    return Promise.resolve([]);
  }

  return new Promise((resolve, reject) => {
    const results: PromiseSettledResult<T>[] = new Array(tasks.length);
    let nextIndex = 0;
    let completed = 0;
    let settled = false;

    const runWorker = async (): Promise<void> => {
      while (nextIndex < tasks.length) {
        if (failFast && settled) return;

        const currentIndex = nextIndex;
        nextIndex += 1;

        try {
          const value = await tasks[currentIndex]();
          results[currentIndex] = { status: "fulfilled", value };
          onSettle?.(currentIndex, results[currentIndex]);
        } catch (reason) {
          const settledResult: PromiseSettledResult<T> = { status: "rejected", reason };
          results[currentIndex] = settledResult;
          onSettle?.(currentIndex, settledResult);

          if (failFast && !settled) {
            settled = true;
            reject(reason);
            return;
          }
        }

        completed += 1;
      }
    };

    const workerCount = Math.min(limit, tasks.length);
    const workers = Array.from({ length: workerCount }, () => runWorker());

    Promise.all(workers).then(() => {
      if (settled) return;
      if (failFast) {
        resolve(results.map((r) => (r as PromiseFulfilledResult<T>).value));
      } else {
        resolve(results);
      }
    });
    void completed;
  });
}