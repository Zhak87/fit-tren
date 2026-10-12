import type { Prop3D } from '../../data/animations';
import type { MuscleId, Sex } from '../../types';

export interface Body3DProps {
  sex: Sex;
  /** map — вращаемая модель с выбором мышцы; demo — анимация техники */
  mode: 'map' | 'demo';
  selected?: MuscleId | null;
  secondary?: MuscleId[];
  pattern?: string;
  prop?: Prop3D;
  height: number;
  onSelect?: (m: MuscleId) => void;
  /** WebGL недоступен: экран может показать 2D-схему */
  onError?: () => void;
}

export interface SceneMsg {
  type: 'ready' | 'select' | 'error';
  muscle?: MuscleId;
  message?: string;
}

export function sceneConfig(p: Body3DProps) {
  return {
    type: 'config' as const,
    sex: p.sex,
    mode: p.mode,
    selected: p.selected ?? null,
    secondary: p.secondary ?? [],
    pattern: p.pattern,
    prop: p.prop ?? 'none',
  };
}
