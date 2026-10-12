import type { MuscleId } from '../types';

export interface MuscleInfo {
  id: MuscleId;
  name: string;
  latin: string;
  view: 'front' | 'back' | 'both';
  function: string;
  movements: string;
}

export const MUSCLES: Record<MuscleId, MuscleInfo> = {
  chest: {
    id: 'chest',
    name: 'Грудные',
    latin: 'Pectoralis major',
    view: 'front',
    function: 'Приводят плечо к корпусу и выводят руки вперёд, отвечают за толчок от себя.',
    movements: 'Жимы лёжа и под углом, отжимания, сведения рук.',
  },
  shoulders: {
    id: 'shoulders',
    name: 'Дельтовидные',
    latin: 'Deltoideus',
    view: 'both',
    function: 'Поднимают руку вперёд, в стороны и назад; три пучка: передний, средний и задний.',
    movements: 'Жимы над головой, махи в стороны, тяги к подбородку и разведения в наклоне.',
  },
  biceps: {
    id: 'biceps',
    name: 'Бицепс',
    latin: 'Biceps brachii',
    view: 'front',
    function: 'Сгибает руку в локте и разворачивает предплечье ладонью вверх.',
    movements: 'Сгибания рук, подтягивания обратным хватом, тяги.',
  },
  triceps: {
    id: 'triceps',
    name: 'Трицепс',
    latin: 'Triceps brachii',
    view: 'back',
    function: 'Разгибает руку в локте; длинная головка также участвует в отведении плеча назад.',
    movements: 'Отжимания на брусьях, жимы узким хватом, разгибания рук.',
  },
  forearms: {
    id: 'forearms',
    name: 'Предплечья',
    latin: 'Flexores / Extensores',
    view: 'both',
    function: 'Сгибают и разгибают кисть, отвечают за силу хвата.',
    movements: 'Вис на перекладине, прогулка фермера, сгибания запястий.',
  },
  abs: {
    id: 'abs',
    name: 'Пресс',
    latin: 'Rectus abdominis',
    view: 'front',
    function: 'Сгибает позвоночник и стабилизирует корпус, защищает поясницу под нагрузкой.',
    movements: 'Скручивания, подъёмы ног, планка, ролик.',
  },
  obliques: {
    id: 'obliques',
    name: 'Косые мышцы',
    latin: 'Obliquus externus',
    view: 'front',
    function: 'Поворачивают и наклоняют корпус, удерживают его от скручивания.',
    movements: 'Боковая планка, «дровосек», русские скручивания.',
  },
  traps: {
    id: 'traps',
    name: 'Трапеции',
    latin: 'Trapezius',
    view: 'back',
    function: 'Поднимают и сводят лопатки, держат осанку.',
    movements: 'Шраги, тяги, фермерская прогулка.',
  },
  lats: {
    id: 'lats',
    name: 'Широчайшие',
    latin: 'Latissimus dorsi',
    view: 'back',
    function: 'Тянут руку вниз и назад к корпусу, создают ширину спины.',
    movements: 'Подтягивания, тяга верхнего блока, тяги в наклоне.',
  },
  lowerback: {
    id: 'lowerback',
    name: 'Поясница',
    latin: 'Erector spinae',
    view: 'back',
    function: 'Разгибает и стабилизирует позвоночник, держит спину прямой в наклонах.',
    movements: 'Гиперэкстензия, становая тяга, «супермен».',
  },
  glutes: {
    id: 'glutes',
    name: 'Ягодичные',
    latin: 'Gluteus maximus / medius',
    view: 'back',
    function: 'Разгибают и отводят бедро, отвечают за мощность в приседе, беге и прыжке.',
    movements: 'Ягодичный мост, приседания, выпады, румынская тяга.',
  },
  quads: {
    id: 'quads',
    name: 'Квадрицепсы',
    latin: 'Quadriceps femoris',
    view: 'front',
    function: 'Разгибают колено; главная мышца при подъёме по лестнице и вставании из приседа.',
    movements: 'Приседания, выпады, жим ногами, разгибания ног.',
  },
  hamstrings: {
    id: 'hamstrings',
    name: 'Бицепс бедра',
    latin: 'Hamstrings',
    view: 'back',
    function: 'Сгибают колено и разгибают бедро, работают как тормоз при беге.',
    movements: 'Румынская тяга, сгибания ног, «скандинавские» сгибания.',
  },
  adductors: {
    id: 'adductors',
    name: 'Приводящие',
    latin: 'Adductores',
    view: 'front',
    function: 'Сводят бёдра и стабилизируют таз в приседе и выпаде.',
    movements: 'Приседания сумо, боковые выпады, сведения ног.',
  },
  calves: {
    id: 'calves',
    name: 'Икры',
    latin: 'Gastrocnemius / Soleus',
    view: 'both',
    function: 'Поднимают на носки и амортизируют шаг, бег и прыжок.',
    movements: 'Подъёмы на носки стоя и сидя, прыжки.',
  },
};

export const MUSCLE_LIST = Object.values(MUSCLES);
