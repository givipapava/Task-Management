
import type { Active, Over } from '@dnd-kit/core';

export interface DragStartEvent {
  active: Active;
}

export interface DragEndEvent {
  active: Active;
  over: Over | null;
}

export interface DragCancelEvent {
  active: Active;
}
