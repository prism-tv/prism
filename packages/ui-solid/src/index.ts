export type MountTarget<T> = () => T;

export interface MountResult<T> {
  view: T;
  dispose(): void;
  isDisposed(): boolean;
}

export function mountUI<T>(render: MountTarget<T>): MountResult<T> {
  const view = render();
  let disposed = false;

  return {
    view,
    dispose() {
      disposed = true;
    },
    isDisposed() {
      return disposed;
    }
  };
}
