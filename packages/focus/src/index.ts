export type FocusTarget = string;

export interface FocusManager {
  getCurrent(): FocusTarget | null;
  focus(target: FocusTarget): FocusTarget;
  clear(): void;
}

export function createFocusManager(initial: FocusTarget | null = null): FocusManager {
  let current = initial;

  return {
    getCurrent() {
      return current;
    },
    focus(target: FocusTarget) {
      current = target;
      return current;
    },
    clear() {
      current = null;
    }
  };
}
