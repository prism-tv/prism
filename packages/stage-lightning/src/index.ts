export interface StageHostConfig {
  id?: string;
  onReady?: (id: string) => void;
}

export interface StageHost {
  readonly id: string;
  start(): string;
}

export function createStageHost(config: StageHostConfig = {}): StageHost {
  const stageId = config.id ?? 'prism-stage';
  return {
    id: stageId,
    start() {
      config.onReady?.(stageId);
      return `Stage ${stageId} ready`;
    }
  };
}
