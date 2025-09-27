export interface DesktopInputHandlers {
  up?: () => void;
  down?: () => void;
  left?: () => void;
  right?: () => void;
  select?: () => void;
}

const KEY_MAP: Record<string, keyof DesktopInputHandlers> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  Enter: 'select',
  ' ': 'select'
};

export interface DesktopInputController {
  handle(key: string): boolean;
}

export function createDesktopInput(handlers: DesktopInputHandlers = {}): DesktopInputController {
  return {
    handle(key: string) {
      const action = KEY_MAP[key];
      const callback = action ? handlers[action] : undefined;
      if (callback) {
        callback();
        return true;
      }
      return false;
    }
  };
}
