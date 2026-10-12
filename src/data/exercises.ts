import type { Equipment, Exercise, Level, MuscleId } from '../types';

export const EFFICIENCY_CRITERIA = [
  'Нагрузка на целевую мышцу во всей амплитуде, особенно в растянутом положении',
  'Возможность постепенно добавлять вес или повторения',
  'Стабильность и безопасность при правильной технике',
  'Общий вывод по данным ЭМГ и исследований гипертрофии (ориентировочно)',
];
export const EFFICIENCY_DISCLAIMER =
  'Оценка эффективности 1–10 редакционная: она помогает выбрать упражнение, но не является научно доказанным показателем. Лучшее упражнение то, которое вы выполняете технично и регулярно.';

type Def = Omit<Exercise, 'alternatives' | 'breathing'> & {
  alternatives?: string[];
  breathing?: string;
};

const BREATH_PUSH = 'Вдох в лёгкой части движения, выдох на усилии.';

function ex(d: Def): Exercise {
  return { breathing: BREATH_PUSH, alternatives: [], ...d };
}

const RAW: Exercise[] = [
  // ───────────── ГРУДЬ ─────────────
  ex({
    id: 'pushup', name: 'Отжимания от пола', primary: 'chest', secondary: ['triceps', 'shoulders', 'abs'],
    equipment: ['none'], place: 'both', level: 'beginner', kind: 'compound', score: 7,
    steps: ['Ладони чуть шире плеч, тело прямое от пяток до макушки.', 'Опускайтесь, пока грудь почти не коснётся пола, локти под углом ~45° к корпусу.', 'Мощно оттолкнитесь и вернитесь в упор, не прогибая поясницу.'],
    mistakes: ['Провисает поясница', 'Локти разведены в стороны под 90°', 'Неполная амплитуда'],
    tips: ['Напрягите ягодицы и пресс', 'Смотрите в пол перед собой'],
    easier: 'Отжимания от возвышения или с колен', harder: 'Отжимания с ногами на возвышении или с паузой внизу',
    alternatives: ['incline_pushup', 'db_bench_press', 'band_chest_press'],
  }),
  ex({
    id: 'incline_pushup', name: 'Отжимания от опоры', primary: 'chest', secondary: ['triceps', 'shoulders'],
    equipment: ['none'], place: 'home', level: 'beginner', kind: 'compound', score: 5,
    steps: ['Поставьте ладони на устойчивую опору: стол, диван, подоконник.', 'Тело прямое, опускайтесь грудью к краю опоры.', 'Выжмите себя вверх до прямых рук.'],
    mistakes: ['Неустойчивая опора', 'Таз уходит вверх'],
    tips: ['Чем ниже опора, тем тяжелее', 'Хороший первый шаг к отжиманиям от пола'],
    harder: 'Отжимания от пола', alternatives: ['pushup', 'band_chest_press'],
  }),
  ex({
    id: 'decline_pushup', name: 'Отжимания с ногами на возвышении', primary: 'chest', secondary: ['shoulders', 'triceps'],
    equipment: ['none'], place: 'home', level: 'intermediate', kind: 'compound', score: 7,
    steps: ['Стопы на стуле или диване, ладони на полу шире плеч.', 'Опуститесь грудью к полу, держа корпус прямым.', 'Выжмите себя вверх.'],
    mistakes: ['Прогиб в пояснице', 'Голова тянется к полу раньше груди'],
    tips: ['Акцент смещается на верх груди и плечи'],
    easier: 'Отжимания от пола', alternatives: ['pushup', 'incline_db_press'],
  }),
  ex({
    id: 'band_chest_press', name: 'Жим от груди с резинкой', primary: 'chest', secondary: ['triceps', 'shoulders'],
    equipment: ['bands'], place: 'home', level: 'beginner', kind: 'compound', score: 6,
    steps: ['Закрепите резинку за спиной на уровне груди.', 'Выжмите руки вперёд до полного выпрямления.', 'Подконтрольно верните руки к груди.'],
    mistakes: ['Резинка без натяжения в начальной точке', 'Плечи поднимаются к ушам'],
    tips: ['Сделайте шаг вперёд, чтобы увеличить натяжение'],
    alternatives: ['pushup', 'db_bench_press'],
  }),
  ex({
    id: 'db_bench_press', name: 'Жим гантелей лёжа', primary: 'chest', secondary: ['triceps', 'shoulders'],
    equipment: ['dumbbells', 'bench'], place: 'both', level: 'beginner', kind: 'compound', score: 8,
    steps: ['Лягте на скамью, лопатки сведены и опущены, стопы на полу.', 'Опустите гантели по бокам груди до лёгкого растяжения.', 'Выжмите вверх по небольшой дуге, не стукая гантелями.'],
    mistakes: ['Отрыв таза от скамьи', 'Локти разведены под 90°', 'Слишком короткая амплитуда'],
    tips: ['Гантели дают большую амплитуду, чем штанга', 'Держите запястья ровно над локтями'],
    easier: 'Отжимания', harder: 'Жим штанги лёжа',
    alternatives: ['bb_bench_press', 'machine_chest_press', 'pushup'],
  }),
  ex({
    id: 'bb_bench_press', name: 'Жим штанги лёжа', primary: 'chest', secondary: ['triceps', 'shoulders'],
    equipment: ['barbell', 'bench'], place: 'gym', level: 'intermediate', kind: 'compound', score: 9,
    steps: ['Глаза под грифом, лопатки сведены, лёгкий прогиб в груди, стопы упёрты.', 'Снимите штангу и опустите на низ груди, локти ~45–70°.', 'Выжмите вверх и чуть назад к стойкам.'],
    mistakes: ['Отбив от груди', 'Отрыв ягодиц', 'Работа без страховки с тяжёлым весом'],
    tips: ['Используйте ограничители или страхующего', 'Сжимайте гриф и «ломайте» его наружу'],
    easier: 'Жим гантелей лёжа', alternatives: ['db_bench_press', 'machine_chest_press'],
  }),
  ex({
    id: 'incline_db_press', name: 'Жим гантелей на наклонной', primary: 'chest', secondary: ['shoulders', 'triceps'],
    equipment: ['dumbbells', 'bench'], place: 'both', level: 'intermediate', kind: 'compound', score: 8,
    steps: ['Спинка скамьи под 30°, гантели у верха груди.', 'Выжмите вверх над ключицами.', 'Медленно опустите до растяжения в груди.'],
    mistakes: ['Слишком крутой наклон (работают плечи)', 'Пружинящий низ'],
    tips: ['Акцент на верх груди'],
    alternatives: ['decline_pushup', 'db_bench_press'],
  }),
  ex({
    id: 'machine_chest_press', name: 'Жим в тренажёре на грудь', primary: 'chest', secondary: ['triceps', 'shoulders'],
    equipment: ['machines'], place: 'gym', level: 'beginner', kind: 'compound', score: 7,
    steps: ['Настройте сиденье: рукояти на уровне середины груди.', 'Выжмите рукояти вперёд, не выпрямляя локти до щелчка.', 'Подконтрольно вернитесь до растяжения.'],
    mistakes: ['Плечи уходят вперёд', 'Рывки'],
    tips: ['Удобно для новичков и для добивки после свободных весов'],
    alternatives: ['db_bench_press', 'bb_bench_press'],
  }),
  ex({
    id: 'cable_fly', name: 'Сведение рук в кроссовере', primary: 'chest', secondary: ['shoulders'],
    equipment: ['cable'], place: 'gym', level: 'intermediate', kind: 'isolation', score: 7,
    steps: ['Встаньте между блоками, шаг вперёд, руки слегка согнуты.', 'Сведите руки перед грудью по дуге.', 'Медленно разведите до растяжения груди.'],
    mistakes: ['Сгибание локтей превращает движение в жим', 'Слишком большой вес'],
    tips: ['Думайте о том, чтобы «обнять дерево»'],
    alternatives: ['db_bench_press', 'band_chest_press'],
  }),

  // ───────────── ПЛЕЧИ ─────────────
  ex({
    id: 'db_ohp', name: 'Жим гантелей над головой', primary: 'shoulders', secondary: ['triceps', 'traps'],
    equipment: ['dumbbells'], place: 'both', level: 'beginner', kind: 'compound', score: 8,
    steps: ['Сидя или стоя, гантели у плеч, ладони вперёд.', 'Выжмите гантели вверх над головой.', 'Опустите до уровня ушей.'],
    mistakes: ['Сильный прогиб в пояснице', 'Неполное опускание'],
    tips: ['Напрягите пресс и ягодицы'],
    harder: 'Жим штанги стоя', alternatives: ['bb_ohp', 'pike_pushup'],
  }),
  ex({
    id: 'bb_ohp', name: 'Жим штанги стоя', primary: 'shoulders', secondary: ['triceps', 'traps', 'abs'],
    equipment: ['barbell'], place: 'gym', level: 'intermediate', kind: 'compound', score: 9,
    steps: ['Штанга на передних дельтах, хват чуть шире плеч.', 'Выжмите вверх, убирая голову назад, затем под гриф.', 'Опустите к верху груди.'],
    mistakes: ['Отклонение корпуса назад', 'Толчок ногами'],
    tips: ['Сожмите ягодицы, чтобы защитить поясницу'],
    easier: 'Жим гантелей сидя', alternatives: ['db_ohp'],
  }),
  ex({
    id: 'pike_pushup', name: 'Отжимания «пайк»', primary: 'shoulders', secondary: ['triceps', 'chest'],
    equipment: ['none'], place: 'home', level: 'intermediate', kind: 'compound', score: 7,
    steps: ['Встаньте в позу «домик»: таз высоко, руки и ноги прямые.', 'Опустите макушку к полу между ладонями.', 'Выжмите себя обратно.'],
    mistakes: ['Голова опускается вперёд, а не вниз', 'Сгибание спины'],
    tips: ['Ноги на возвышении усложняют упражнение'],
    alternatives: ['db_ohp', 'band_lateral_raise'],
  }),
  ex({
    id: 'lateral_raise', name: 'Махи гантелями в стороны', primary: 'shoulders', secondary: ['traps'],
    equipment: ['dumbbells'], place: 'both', level: 'beginner', kind: 'isolation', score: 8,
    steps: ['Стоя, гантели у бёдер, лёгкий наклон вперёд.', 'Поднимите руки в стороны до уровня плеч, локти чуть согнуты.', 'Медленно опустите.'],
    mistakes: ['Раскачка корпусом', 'Подъём плеч к ушам'],
    tips: ['Лёгкий вес и чистая техника важнее килограммов', 'Ведите движение локтями'],
    alternatives: ['band_lateral_raise', 'db_ohp'],
  }),
  ex({
    id: 'band_lateral_raise', name: 'Махи с резинкой в стороны', primary: 'shoulders', secondary: [],
    equipment: ['bands'], place: 'home', level: 'beginner', kind: 'isolation', score: 6,
    steps: ['Наступите на резинку, концы в руках.', 'Поднимите руки в стороны до уровня плеч.', 'Медленно опустите.'],
    mistakes: ['Слишком тугая резинка ломает технику'], tips: ['Можно выполнять по одной руке'],
    alternatives: ['lateral_raise'],
  }),
  ex({
    id: 'reverse_fly', name: 'Разведения гантелей в наклоне', primary: 'shoulders', secondary: ['traps'],
    equipment: ['dumbbells'], place: 'both', level: 'beginner', kind: 'isolation', score: 7,
    steps: ['Наклонитесь вперёд с прямой спиной, гантели под грудью.', 'Разведите руки в стороны, работая задней дельтой.', 'Медленно опустите.'],
    mistakes: ['Сведение лопаток вместо работы плеча', 'Округление спины'],
    tips: ['Задняя дельта важна для осанки и здоровья плеч'],
    alternatives: ['face_pull', 'band_pull_apart'],
  }),
  ex({
    id: 'face_pull', name: 'Тяга каната к лицу', primary: 'shoulders', secondary: ['traps'],
    equipment: ['cable'], place: 'gym', level: 'beginner', kind: 'isolation', score: 7,
    steps: ['Канат на верхнем блоке, хват сверху.', 'Тяните к лицу, разводя концы каната и локти в стороны.', 'Вернитесь под контролем.'],
    mistakes: ['Тяга к груди вместо лица'], tips: ['Отлично для профилактики боли в плечах'],
    breathing: 'Выдох на тяге к лицу, вдох при возврате.',
    alternatives: ['reverse_fly', 'band_pull_apart'],
  }),
  ex({
    id: 'band_pull_apart', name: 'Разведение резинки перед грудью', primary: 'shoulders', secondary: ['traps'],
    equipment: ['bands'], place: 'home', level: 'beginner', kind: 'isolation', score: 6,
    steps: ['Резинка в прямых руках перед грудью.', 'Разведите руки в стороны до касания груди резинкой.', 'Медленно вернитесь.'],
    mistakes: ['Сгибание локтей', 'Прогиб в пояснице'], tips: ['Подходит как разминка плеч'],
    alternatives: ['reverse_fly', 'face_pull'],
  }),

  // ───────────── БИЦЕПС ─────────────
  ex({
    id: 'db_curl', name: 'Сгибания рук с гантелями', primary: 'biceps', secondary: ['forearms'],
    equipment: ['dumbbells'], place: 'both', level: 'beginner', kind: 'isolation', score: 8,
    steps: ['Стоя, гантели в опущенных руках, ладони вперёд.', 'Согните руки, не сдвигая локти вперёд.', 'Медленно опустите до полного выпрямления.'],
    mistakes: ['Раскачка корпусом', 'Локти уходят вперёд'],
    tips: ['Медленный негатив 2–3 секунды'],
    breathing: 'Выдох при подъёме, вдох при опускании.',
    alternatives: ['bb_curl', 'band_curl', 'hammer_curl'],
  }),
  ex({
    id: 'incline_db_curl', name: 'Сгибания на наклонной скамье', primary: 'biceps', secondary: [],
    equipment: ['dumbbells', 'bench'], place: 'both', level: 'intermediate', kind: 'isolation', score: 9,
    steps: ['Сядьте на скамью с наклоном 45–60°, руки свисают.', 'Согните руки, удерживая плечи неподвижными.', 'Опустите до полного растяжения.'],
    mistakes: ['Плечи уходят вперёд'], tips: ['Растянутое положение даёт сильный стимул к росту'],
    breathing: 'Выдох при подъёме, вдох при опускании.',
    alternatives: ['db_curl'],
  }),
  ex({
    id: 'hammer_curl', name: 'Молотковые сгибания', primary: 'biceps', secondary: ['forearms'],
    equipment: ['dumbbells'], place: 'both', level: 'beginner', kind: 'isolation', score: 7,
    steps: ['Гантели нейтральным хватом (ладони друг к другу).', 'Согните руки, локти прижаты.', 'Опустите под контролем.'],
    mistakes: ['Раскачка'], tips: ['Хорошо нагружает плечевую мышцу и предплечья'],
    breathing: 'Выдох при подъёме, вдох при опускании.',
    alternatives: ['db_curl'],
  }),
  ex({
    id: 'bb_curl', name: 'Сгибания со штангой', primary: 'biceps', secondary: ['forearms'],
    equipment: ['barbell'], place: 'gym', level: 'beginner', kind: 'isolation', score: 8,
    steps: ['Хват снизу на ширине плеч.', 'Поднимите штангу к груди, локти неподвижны.', 'Опустите полностью.'],
    mistakes: ['Читинг корпусом', 'Неполная амплитуда'], tips: ['EZ-гриф снижает нагрузку на запястья'],
    breathing: 'Выдох при подъёме, вдох при опускании.',
    alternatives: ['db_curl'],
  }),
  ex({
    id: 'band_curl', name: 'Сгибания рук с резинкой', primary: 'biceps', secondary: ['forearms'],
    equipment: ['bands'], place: 'home', level: 'beginner', kind: 'isolation', score: 6,
    steps: ['Наступите на резинку, концы в руках.', 'Согните руки, локти у корпуса.', 'Медленно опустите.'],
    mistakes: ['Ослабление натяжения внизу'], tips: ['Пиковое сопротивление в верхней точке'],
    breathing: 'Выдох при подъёме, вдох при опускании.',
    alternatives: ['db_curl'],
  }),
  ex({
    id: 'chinup', name: 'Подтягивания обратным хватом', primary: 'biceps', secondary: ['lats', 'forearms'],
    equipment: ['pullupbar'], place: 'both', level: 'intermediate', kind: 'compound', score: 9,
    steps: ['Хват снизу на ширине плеч, вис на прямых руках.', 'Подтянитесь, пока подбородок не окажется над перекладиной.', 'Опуститесь до полного выпрямления рук.'],
    mistakes: ['Рывки ногами', 'Полуамплитуда'], tips: ['Если не получается, начните с негативов'],
    breathing: 'Выдох при подъёме, вдох при опускании.',
    easier: 'Негативные подтягивания или с резинкой', alternatives: ['pullup', 'db_curl'],
  }),

  // ───────────── ТРИЦЕПС ─────────────
  ex({
    id: 'bench_dips', name: 'Обратные отжимания от стула', primary: 'triceps', secondary: ['chest', 'shoulders'],
    equipment: ['none'], place: 'home', level: 'beginner', kind: 'compound', score: 6,
    steps: ['Ладони на краю устойчивого стула за спиной, ноги вперёд.', 'Согните локти до ~90°, держа спину близко к стулу.', 'Выпрямите руки.'],
    mistakes: ['Слишком глубокое опускание при дискомфорте в плечах', 'Локти в стороны'],
    tips: ['Согнутые колени облегчают упражнение'],
    alternatives: ['close_grip_pushup', 'overhead_db_ext'],
  }),
  ex({
    id: 'close_grip_pushup', name: 'Отжимания узким хватом', primary: 'triceps', secondary: ['chest', 'shoulders'],
    equipment: ['none'], place: 'home', level: 'intermediate', kind: 'compound', score: 7,
    steps: ['Ладони под плечами или чуть уже.', 'Опуститесь, прижимая локти к корпусу.', 'Выжмите себя вверх.'],
    mistakes: ['Локти расходятся', 'Провис корпуса'], tips: ['Можно с колен'],
    alternatives: ['bench_dips', 'close_grip_bench'],
  }),
  ex({
    id: 'overhead_db_ext', name: 'Разгибание гантели из-за головы', primary: 'triceps', secondary: [],
    equipment: ['dumbbells'], place: 'both', level: 'beginner', kind: 'isolation', score: 8,
    steps: ['Возьмите гантель двумя руками над головой.', 'Опустите её за голову, сгибая локти.', 'Разогните руки вверх.'],
    mistakes: ['Локти разводятся широко', 'Прогиб в пояснице'],
    tips: ['Растяжение длинной головки трицепса даёт хороший стимул'],
    alternatives: ['cable_pushdown', 'skull_crusher'],
  }),
  ex({
    id: 'skull_crusher', name: 'Французский жим с гантелями', primary: 'triceps', secondary: [],
    equipment: ['dumbbells', 'bench'], place: 'both', level: 'intermediate', kind: 'isolation', score: 8,
    steps: ['Лёжа, гантели над грудью на прямых руках.', 'Согните локти, опуская гантели к ушам.', 'Разогните руки.'],
    mistakes: ['Локти гуляют'], tips: ['Слегка заведите плечи за голову для большего растяжения'],
    alternatives: ['overhead_db_ext'],
  }),
  ex({
    id: 'cable_pushdown', name: 'Разгибания на блоке', primary: 'triceps', secondary: [],
    equipment: ['cable'], place: 'gym', level: 'beginner', kind: 'isolation', score: 7,
    steps: ['Рукоять или канат на верхнем блоке, локти прижаты.', 'Разогните руки вниз до конца.', 'Медленно вернитесь до угла ~90°.'],
    mistakes: ['Локти уходят вперёд', 'Наклон корпусом'], tips: ['Канат позволяет развести руки внизу'],
    alternatives: ['overhead_db_ext', 'bench_dips'],
  }),
  ex({
    id: 'close_grip_bench', name: 'Жим штанги узким хватом', primary: 'triceps', secondary: ['chest', 'shoulders'],
    equipment: ['barbell', 'bench'], place: 'gym', level: 'intermediate', kind: 'compound', score: 9,
    steps: ['Хват на ширине плеч.', 'Опустите штангу к низу груди, локти у корпуса.', 'Выжмите вверх.'],
    mistakes: ['Слишком узкий хват бьёт по запястьям'], tips: ['Позволяет работать с большим весом'],
    alternatives: ['dips', 'close_grip_pushup'],
  }),
  ex({
    id: 'dips', name: 'Отжимания на брусьях', primary: 'triceps', secondary: ['chest', 'shoulders'],
    equipment: ['machines'], place: 'gym', level: 'intermediate', kind: 'compound', score: 9,
    steps: ['Упор на брусьях на прямых руках.', 'Опуститесь до угла в локтях ~90°.', 'Выжмите себя вверх.'],
    mistakes: ['Слишком глубоко при боли в плечах', 'Раскачка'],
    tips: ['Корпус вертикально — акцент на трицепс, наклон вперёд — на грудь'],
    easier: 'Гравитрон или отжимания от стула', alternatives: ['bench_dips', 'close_grip_bench'],
  }),

  // ───────────── ПРЕДПЛЕЧЬЯ ─────────────
  ex({
    id: 'farmers_walk', name: 'Прогулка фермера', primary: 'forearms', secondary: ['traps', 'abs'],
    equipment: ['dumbbells'], place: 'both', level: 'beginner', kind: 'compound', score: 8, timeBased: true,
    steps: ['Возьмите тяжёлые гантели по бокам.', 'Идите короткими шагами с прямой спиной.', 'Держите плечи опущенными.'],
    breathing: 'Ровное дыхание, не задерживайте его надолго.',
    mistakes: ['Сутулость', 'Слишком широкие шаги'], tips: ['Развивает хват и стабильность корпуса'],
    alternatives: ['dead_hang'],
  }),
  ex({
    id: 'dead_hang', name: 'Вис на перекладине', primary: 'forearms', secondary: ['lats'],
    equipment: ['pullupbar'], place: 'both', level: 'beginner', kind: 'isolation', score: 7, timeBased: true,
    steps: ['Возьмитесь за перекладину хватом сверху.', 'Повисните на прямых руках, плечи слегка активны.', 'Держите позицию заданное время.'],
    breathing: 'Спокойное ровное дыхание.',
    mistakes: ['Полностью расслабленные плечи'], tips: ['Готовит к подтягиваниям'],
    alternatives: ['farmers_walk'],
  }),
  ex({
    id: 'wrist_curl', name: 'Сгибания запястий', primary: 'forearms', secondary: [],
    equipment: ['dumbbells'], place: 'both', level: 'beginner', kind: 'isolation', score: 6,
    steps: ['Предплечья на бёдрах, ладони вверх.', 'Согните кисти, поднимая гантели.', 'Опустите полностью.'],
    mistakes: ['Слишком большой вес'], tips: ['Делайте 15–20 повторений'],
    alternatives: ['farmers_walk'],
  }),

  // ───────────── ПРЕСС ─────────────
  ex({
    id: 'plank', name: 'Планка', primary: 'abs', secondary: ['obliques', 'shoulders'],
    equipment: ['none'], place: 'both', level: 'beginner', kind: 'isolation', score: 7, timeBased: true,
    steps: ['Упор на предплечья, локти под плечами.', 'Тело прямое, ягодицы и пресс напряжены.', 'Держите позицию.'],
    breathing: 'Дышите ровно и неглубоко, не задерживая дыхание.',
    mistakes: ['Провис поясницы', 'Таз слишком высоко'], tips: ['Лучше 3 подхода по 30 с идеально, чем 2 минуты с провисом'],
    alternatives: ['dead_bug', 'side_plank'],
  }),
  ex({
    id: 'crunch', name: 'Скручивания', primary: 'abs', secondary: [],
    equipment: ['none'], place: 'home', level: 'beginner', kind: 'isolation', score: 6,
    steps: ['Лёжа на спине, колени согнуты, руки у висков.', 'Скрутите корпус, отрывая лопатки от пола.', 'Медленно опуститесь.'],
    mistakes: ['Тянуть голову руками'], tips: ['Думайте о том, чтобы приблизить рёбра к тазу'],
    alternatives: ['reverse_crunch', 'cable_crunch'],
  }),
  ex({
    id: 'reverse_crunch', name: 'Обратные скручивания', primary: 'abs', secondary: ['obliques'],
    equipment: ['none'], place: 'home', level: 'beginner', kind: 'isolation', score: 7,
    steps: ['Лёжа на спине, ноги согнуты под 90°.', 'Подкрутите таз, отрывая его от пола.', 'Медленно вернитесь.'],
    mistakes: ['Рывок ногами вместо подкручивания таза'], tips: ['Медленный негатив'],
    alternatives: ['hanging_leg_raise', 'crunch'],
  }),
  ex({
    id: 'dead_bug', name: '«Мёртвый жук»', primary: 'abs', secondary: ['obliques'],
    equipment: ['none'], place: 'home', level: 'beginner', kind: 'isolation', score: 7,
    steps: ['Лёжа на спине, руки вверх, ноги согнуты под 90°.', 'Опустите противоположные руку и ногу, прижимая поясницу к полу.', 'Вернитесь и смените сторону.'],
    breathing: 'Выдох при опускании конечностей.',
    mistakes: ['Поясница отрывается от пола'], tips: ['Отлично учит стабилизировать корпус'],
    alternatives: ['plank'],
  }),
  ex({
    id: 'hanging_leg_raise', name: 'Подъём ног в висе', primary: 'abs', secondary: ['obliques', 'forearms'],
    equipment: ['pullupbar'], place: 'both', level: 'advanced', kind: 'isolation', score: 9,
    steps: ['Вис на перекладине.', 'Поднимите прямые или согнутые ноги, подкручивая таз.', 'Медленно опустите без раскачки.'],
    mistakes: ['Раскачка', 'Подъём только бёдрами без подкручивания таза'],
    tips: ['Начните с согнутых коленей'], easier: 'Обратные скручивания',
    alternatives: ['reverse_crunch'],
  }),
  ex({
    id: 'cable_crunch', name: 'Скручивания на блоке', primary: 'abs', secondary: [],
    equipment: ['cable'], place: 'gym', level: 'intermediate', kind: 'isolation', score: 8,
    steps: ['Стоя на коленях, канат у головы.', 'Скрутитесь вниз, приближая локти к бёдрам.', 'Вернитесь под контролем.'],
    mistakes: ['Тянуть руками', 'Сгибание в тазобедренных вместо скручивания'],
    tips: ['Позволяет прогрессировать в весе'],
    alternatives: ['crunch'],
  }),
  ex({
    id: 'mountain_climber', name: '«Скалолаз»', primary: 'abs', secondary: ['quads', 'shoulders'],
    equipment: ['none'], place: 'home', level: 'beginner', kind: 'compound', score: 5, timeBased: true,
    steps: ['Упор лёжа на прямых руках.', 'Поочерёдно подтягивайте колени к груди в быстром темпе.', 'Держите таз на одной линии.'],
    breathing: 'Ритмичное дыхание в темпе движения.',
    mistakes: ['Таз прыгает вверх'], tips: ['Хорошо подходит для кардио-финишера'],
    alternatives: ['plank'],
  }),

  // ───────────── КОСЫЕ ─────────────
  ex({
    id: 'side_plank', name: 'Боковая планка', primary: 'obliques', secondary: ['abs', 'glutes'],
    equipment: ['none'], place: 'home', level: 'beginner', kind: 'isolation', score: 7, timeBased: true,
    steps: ['Лягте на бок, упор на предплечье.', 'Поднимите таз, тело в одну линию.', 'Держите и поменяйте сторону.'],
    breathing: 'Ровное дыхание.', mistakes: ['Таз провисает'], tips: ['Колени на полу облегчают вариант'],
    alternatives: ['pallof_press'],
  }),
  ex({
    id: 'russian_twist', name: 'Русские скручивания', primary: 'obliques', secondary: ['abs'],
    equipment: ['none'], place: 'home', level: 'beginner', kind: 'isolation', score: 5,
    steps: ['Сидя, корпус отклонён назад, ноги на полу.', 'Поворачивайте корпус влево-вправо.', 'Держите спину прямой.'],
    mistakes: ['Поворачиваются только руки', 'Круглая спина'], tips: ['Не подходит при проблемах с поясницей'],
    alternatives: ['side_plank', 'pallof_press'],
  }),
  ex({
    id: 'pallof_press', name: 'Жим Паллофа', primary: 'obliques', secondary: ['abs'],
    equipment: ['bands'], place: 'both', level: 'beginner', kind: 'isolation', score: 8,
    steps: ['Резинка закреплена сбоку на уровне груди.', 'Выжмите руки вперёд, не давая корпусу повернуться.', 'Удержите 2 с и верните.'],
    mistakes: ['Корпус поворачивается'], tips: ['Учит корпус сопротивляться скручиванию'],
    alternatives: ['side_plank', 'cable_woodchop'],
  }),
  ex({
    id: 'cable_woodchop', name: '«Дровосек» на блоке', primary: 'obliques', secondary: ['abs', 'shoulders'],
    equipment: ['cable'], place: 'gym', level: 'intermediate', kind: 'compound', score: 8,
    steps: ['Блок вверху сбоку, рукоять двумя руками.', 'Тяните по диагонали вниз через корпус, поворачиваясь.', 'Вернитесь под контролем.'],
    mistakes: ['Работа только руками'], tips: ['Поворот идёт от бёдер и корпуса'],
    alternatives: ['pallof_press'],
  }),

  // ───────────── ТРАПЕЦИИ ─────────────
  ex({
    id: 'db_shrug', name: 'Шраги с гантелями', primary: 'traps', secondary: ['forearms'],
    equipment: ['dumbbells'], place: 'both', level: 'beginner', kind: 'isolation', score: 7,
    steps: ['Гантели по бокам, руки прямые.', 'Поднимите плечи вверх к ушам.', 'Задержитесь на секунду и опустите.'],
    mistakes: ['Вращение плечами', 'Сгибание рук'], tips: ['Пауза вверху усиливает эффект'],
    alternatives: ['bb_shrug', 'farmers_walk'],
  }),
  ex({
    id: 'bb_shrug', name: 'Шраги со штангой', primary: 'traps', secondary: ['forearms'],
    equipment: ['barbell'], place: 'gym', level: 'beginner', kind: 'isolation', score: 8,
    steps: ['Штанга в прямых руках перед бёдрами.', 'Поднимите плечи вверх.', 'Опустите под контролем.'],
    mistakes: ['Рывки'], tips: ['Используйте лямки при слабом хвате'],
    alternatives: ['db_shrug'],
  }),

  // ───────────── ШИРОЧАЙШИЕ ─────────────
  ex({
    id: 'pullup', name: 'Подтягивания', primary: 'lats', secondary: ['biceps', 'forearms', 'traps'],
    equipment: ['pullupbar'], place: 'both', level: 'intermediate', kind: 'compound', score: 10,
    steps: ['Хват сверху чуть шире плеч, вис на прямых руках.', 'Опустите лопатки и подтянитесь грудью к перекладине.', 'Опуститесь подконтрольно до прямых рук.'],
    breathing: 'Выдох при подъёме, вдох при опускании.',
    mistakes: ['Рывки и киппинг', 'Неполное опускание'], tips: ['Думайте о том, чтобы тянуть локти к карманам'],
    easier: 'Негативные подтягивания или тяга верхнего блока', harder: 'Подтягивания с отягощением',
    alternatives: ['lat_pulldown', 'negative_pullup', 'inverted_row'],
  }),
  ex({
    id: 'negative_pullup', name: 'Негативные подтягивания', primary: 'lats', secondary: ['biceps'],
    equipment: ['pullupbar'], place: 'both', level: 'beginner', kind: 'compound', score: 7,
    steps: ['Запрыгните или встаньте на опору в верхнюю точку подтягивания.', 'Медленно опускайтесь 3–5 секунд.', 'Повторите.'],
    breathing: 'Ровное дыхание при опускании.',
    mistakes: ['Падение вниз без контроля'], tips: ['Лучший путь к первому подтягиванию'],
    harder: 'Подтягивания', alternatives: ['pullup', 'band_row'],
  }),
  ex({
    id: 'lat_pulldown', name: 'Тяга верхнего блока', primary: 'lats', secondary: ['biceps', 'traps'],
    equipment: ['cable'], place: 'gym', level: 'beginner', kind: 'compound', score: 9,
    steps: ['Сядьте, зафиксируйте бёдра валиками, хват шире плеч.', 'Тяните рукоять к верху груди, сводя лопатки.', 'Вернитесь до полного растяжения.'],
    breathing: 'Выдох при тяге, вдох при возврате.',
    mistakes: ['Отклонение корпуса назад', 'Тяга за голову'], tips: ['Отличная замена подтягиваниям'],
    alternatives: ['pullup', 'band_row'],
  }),
  ex({
    id: 'db_row', name: 'Тяга гантели в наклоне', primary: 'lats', secondary: ['biceps', 'traps', 'shoulders'],
    equipment: ['dumbbells'], place: 'both', level: 'beginner', kind: 'compound', score: 8,
    steps: ['Упор рукой и коленом в скамью или стул, спина прямая.', 'Тяните гантель к поясу, локоть вдоль корпуса.', 'Опустите до растяжения.'],
    breathing: 'Выдох при тяге, вдох при опускании.',
    mistakes: ['Скручивание корпуса', 'Тяга бицепсом'], tips: ['Представьте, что заводите мотор пилы'],
    alternatives: ['bb_row', 'seated_cable_row', 'band_row'],
  }),
  ex({
    id: 'bb_row', name: 'Тяга штанги в наклоне', primary: 'lats', secondary: ['traps', 'biceps', 'lowerback'],
    equipment: ['barbell'], place: 'gym', level: 'intermediate', kind: 'compound', score: 9,
    steps: ['Наклон ~45°, спина прямая, колени согнуты.', 'Тяните штангу к низу живота.', 'Опустите под контролем.'],
    breathing: 'Выдох при тяге, вдох при опускании.',
    mistakes: ['Круглая спина', 'Подъём корпуса при тяге'], tips: ['Держите шею нейтрально'],
    alternatives: ['db_row', 'seated_cable_row'],
  }),
  ex({
    id: 'seated_cable_row', name: 'Тяга горизонтального блока', primary: 'lats', secondary: ['traps', 'biceps'],
    equipment: ['cable'], place: 'gym', level: 'beginner', kind: 'compound', score: 8,
    steps: ['Сидя, ноги упёрты, спина прямая.', 'Тяните рукоять к животу, сводя лопатки.', 'Вернитесь, позволяя лопаткам разойтись.'],
    breathing: 'Выдох при тяге, вдох при возврате.',
    mistakes: ['Раскачка корпусом'], tips: ['Пауза в точке сокращения'],
    alternatives: ['db_row', 'band_row'],
  }),
  ex({
    id: 'band_row', name: 'Тяга резинки к поясу', primary: 'lats', secondary: ['biceps', 'traps'],
    equipment: ['bands'], place: 'home', level: 'beginner', kind: 'compound', score: 6,
    steps: ['Сидя, резинка вокруг стоп или закреплена спереди.', 'Тяните концы к поясу, сводя лопатки.', 'Медленно вернитесь.'],
    breathing: 'Выдох при тяге, вдох при возврате.',
    mistakes: ['Сутулость'], tips: ['Удобно для дома и поездок'],
    alternatives: ['db_row', 'inverted_row'],
  }),
  ex({
    id: 'inverted_row', name: 'Австралийские подтягивания', primary: 'lats', secondary: ['biceps', 'traps', 'abs'],
    equipment: ['none'], place: 'home', level: 'beginner', kind: 'compound', score: 7,
    steps: ['Лягте под прочный стол или низкую перекладину, возьмитесь за край.', 'Подтяните грудь к краю, тело прямое.', 'Опуститесь до прямых рук.'],
    breathing: 'Выдох при подъёме, вдох при опускании.',
    mistakes: ['Провисание таза', 'Ненадёжная опора'], tips: ['Проверьте, что стол выдержит ваш вес'],
    alternatives: ['band_row', 'pullup'],
  }),

  // ───────────── ПОЯСНИЦА ─────────────
  ex({
    id: 'superman', name: '«Супермен»', primary: 'lowerback', secondary: ['glutes'],
    equipment: ['none'], place: 'home', level: 'beginner', kind: 'isolation', score: 5,
    steps: ['Лёжа на животе, руки вытянуты вперёд.', 'Одновременно поднимите руки и ноги на несколько сантиметров.', 'Задержитесь и опустите.'],
    mistakes: ['Сильное запрокидывание головы'], tips: ['Небольшая амплитуда достаточна'],
    alternatives: ['bird_dog', 'hyperextension'],
  }),
  ex({
    id: 'bird_dog', name: '«Птица-собака»', primary: 'lowerback', secondary: ['abs', 'glutes'],
    equipment: ['none'], place: 'home', level: 'beginner', kind: 'isolation', score: 6,
    steps: ['На четвереньках, спина ровная.', 'Вытяните противоположные руку и ногу.', 'Вернитесь и смените сторону.'],
    mistakes: ['Перекос таза'], tips: ['Двигайтесь медленно'],
    alternatives: ['superman', 'dead_bug'],
  }),
  ex({
    id: 'hyperextension', name: 'Гиперэкстензия', primary: 'lowerback', secondary: ['glutes', 'hamstrings'],
    equipment: ['machines'], place: 'gym', level: 'beginner', kind: 'compound', score: 8,
    steps: ['Валик под тазом, стопы зафиксированы.', 'Наклонитесь вниз с прямой спиной.', 'Поднимитесь до прямой линии тела, без переразгибания.'],
    mistakes: ['Переразгибание в верхней точке', 'Рывки'], tips: ['Можно держать блин у груди'],
    alternatives: ['superman', 'db_rdl'],
  }),
  ex({
    id: 'deadlift', name: 'Становая тяга', primary: 'lowerback', secondary: ['glutes', 'hamstrings', 'traps', 'forearms', 'quads'],
    equipment: ['barbell'], place: 'gym', level: 'advanced', kind: 'compound', score: 10,
    steps: ['Гриф над серединой стопы, хват чуть шире ног.', 'Спина прямая, грудь вперёд, вдох и напряжение пресса.', 'Встаньте, ведя гриф вдоль ног; опустите тем же путём.'],
    breathing: 'Вдох и напряжение корпуса перед подъёмом, выдох наверху.',
    mistakes: ['Круглая спина', 'Гриф далеко от ног', 'Переразгибание наверху'],
    tips: ['Освойте технику с лёгким весом под присмотром тренера'],
    easier: 'Румынская тяга с гантелями', alternatives: ['rdl', 'db_rdl'],
  }),

  // ───────────── ЯГОДИЦЫ ─────────────
  ex({
    id: 'glute_bridge', name: 'Ягодичный мост', primary: 'glutes', secondary: ['hamstrings'],
    equipment: ['none'], place: 'home', level: 'beginner', kind: 'isolation', score: 7,
    steps: ['Лёжа на спине, стопы на полу у таза.', 'Поднимите таз, сжимая ягодицы.', 'Задержитесь и опустите.'],
    mistakes: ['Прогиб поясницы вместо работы ягодиц'], tips: ['Подбородок к груди помогает держать таз'],
    harder: 'Мост на одной ноге или ягодичный мост со штангой',
    alternatives: ['hip_thrust', 'single_leg_bridge'],
  }),
  ex({
    id: 'single_leg_bridge', name: 'Мост на одной ноге', primary: 'glutes', secondary: ['hamstrings'],
    equipment: ['none'], place: 'home', level: 'intermediate', kind: 'isolation', score: 7,
    steps: ['Лёжа на спине, одна стопа на полу, другая нога вытянута.', 'Поднимите таз за счёт опорной ноги.', 'Опустите, не касаясь пола.'],
    mistakes: ['Перекос таза'], tips: ['Отличная домашняя прогрессия'],
    alternatives: ['glute_bridge', 'hip_thrust'],
  }),
  ex({
    id: 'hip_thrust', name: 'Ягодичный мост со штангой', primary: 'glutes', secondary: ['hamstrings', 'quads'],
    equipment: ['barbell', 'bench'], place: 'gym', level: 'intermediate', kind: 'compound', score: 10,
    steps: ['Лопатки на скамье, штанга на тазу (с подушкой).', 'Поднимите таз до прямой линии от плеч до колен.', 'Опустите под контролем.'],
    mistakes: ['Переразгибание поясницы', 'Стопы слишком далеко'], tips: ['Голени вертикальны в верхней точке'],
    alternatives: ['db_hip_thrust', 'glute_bridge'],
  }),
  ex({
    id: 'db_hip_thrust', name: 'Ягодичный мост с гантелью', primary: 'glutes', secondary: ['hamstrings'],
    equipment: ['dumbbells'], place: 'both', level: 'beginner', kind: 'compound', score: 8,
    steps: ['Лопатки на диване или скамье, гантель на тазу.', 'Поднимите таз, сжимая ягодицы.', 'Опустите под контролем.'],
    mistakes: ['Работа поясницей'], tips: ['Пауза в верхней точке 1–2 с'],
    alternatives: ['hip_thrust', 'glute_bridge'],
  }),
  ex({
    id: 'bulgarian_split_squat', name: 'Болгарские выпады', primary: 'glutes', secondary: ['quads', 'adductors'],
    equipment: ['none'], place: 'both', level: 'intermediate', kind: 'compound', score: 9,
    steps: ['Задняя стопа на скамье или стуле, передняя в шаге впереди.', 'Опуститесь вниз до почти касания коленом пола.', 'Поднимитесь за счёт передней ноги.'],
    mistakes: ['Слишком короткий шаг', 'Колено заваливается внутрь'],
    tips: ['Наклон корпуса вперёд усиливает ягодицы', 'Возьмите гантели для прогрессии'],
    alternatives: ['lunges', 'step_up'],
  }),
  ex({
    id: 'band_abduction', name: 'Отведение ног с резинкой', primary: 'glutes', secondary: [],
    equipment: ['bands'], place: 'home', level: 'beginner', kind: 'isolation', score: 6,
    steps: ['Резинка над коленями, полуприсед или сидя.', 'Разводите колени в стороны.', 'Медленно сведите.'],
    mistakes: ['Потеря натяжения'], tips: ['Работает средняя ягодичная мышца'],
    alternatives: ['glute_bridge', 'cable_kickback'],
  }),
  ex({
    id: 'cable_kickback', name: 'Отведение ноги назад на блоке', primary: 'glutes', secondary: ['hamstrings'],
    equipment: ['cable'], place: 'gym', level: 'beginner', kind: 'isolation', score: 6,
    steps: ['Манжета на щиколотке, лёгкий наклон вперёд.', 'Отведите ногу назад, сжимая ягодицу.', 'Вернитесь медленно.'],
    mistakes: ['Прогиб в пояснице'], tips: ['Небольшой вес, полный контроль'],
    alternatives: ['band_abduction', 'glute_bridge'],
  }),

  // ───────────── КВАДРИЦЕПСЫ ─────────────
  ex({
    id: 'bw_squat', name: 'Приседания без веса', primary: 'quads', secondary: ['glutes', 'adductors'],
    equipment: ['none'], place: 'home', level: 'beginner', kind: 'compound', score: 6,
    steps: ['Стопы на ширине плеч, носки слегка развёрнуты.', 'Опуститесь, отводя таз назад, колени по линии носков.', 'Поднимитесь, отталкиваясь всей стопой.'],
    mistakes: ['Колени заваливаются внутрь', 'Отрыв пяток'], tips: ['Руки вперёд помогают балансу'],
    harder: 'Гоблет-присед или присед с прыжком', alternatives: ['goblet_squat', 'lunges'],
  }),
  ex({
    id: 'goblet_squat', name: 'Гоблет-присед', primary: 'quads', secondary: ['glutes', 'adductors', 'abs'],
    equipment: ['dumbbells'], place: 'both', level: 'beginner', kind: 'compound', score: 8,
    steps: ['Держите гантель вертикально у груди.', 'Присядьте глубоко, локти между коленями.', 'Встаньте, сохраняя корпус вертикально.'],
    mistakes: ['Округление спины', 'Колени внутрь'], tips: ['Лучший присед для освоения техники'],
    harder: 'Присед со штангой', alternatives: ['back_squat', 'bw_squat', 'leg_press'],
  }),
  ex({
    id: 'back_squat', name: 'Приседания со штангой', primary: 'quads', secondary: ['glutes', 'adductors', 'lowerback'],
    equipment: ['barbell'], place: 'gym', level: 'intermediate', kind: 'compound', score: 10,
    steps: ['Штанга на трапециях, стопы на ширине плеч.', 'Вдох, напряжение пресса, присед до параллели или ниже.', 'Встаньте, выталкивая пол.'],
    breathing: 'Вдох и задержка внизу, выдох после прохождения трудной точки.',
    mistakes: ['Круглая спина внизу', 'Колени внутрь', 'Отрыв пяток'],
    tips: ['Работайте в силовой раме с ограничителями'],
    easier: 'Гоблет-присед', alternatives: ['leg_press', 'goblet_squat', 'front_squat'],
  }),
  ex({
    id: 'front_squat', name: 'Фронтальный присед', primary: 'quads', secondary: ['glutes', 'abs'],
    equipment: ['barbell'], place: 'gym', level: 'advanced', kind: 'compound', score: 9,
    steps: ['Штанга на передних дельтах, локти высоко.', 'Присядьте с вертикальным корпусом.', 'Встаньте, держа локти вверх.'],
    breathing: 'Вдох и задержка внизу, выдох после трудной точки.',
    mistakes: ['Локти опускаются'], tips: ['Меньше нагрузки на поясницу, больше на квадрицепсы'],
    alternatives: ['back_squat', 'goblet_squat'],
  }),
  ex({
    id: 'leg_press', name: 'Жим ногами', primary: 'quads', secondary: ['glutes', 'adductors'],
    equipment: ['machines'], place: 'gym', level: 'beginner', kind: 'compound', score: 9,
    steps: ['Стопы на платформе на ширине плеч.', 'Опустите платформу, пока таз не начнёт отрываться.', 'Выжмите, не выпрямляя колени до щелчка.'],
    mistakes: ['Отрыв таза внизу', 'Полное разгибание коленей с весом'], tips: ['Низкая постановка стоп — больше квадрицепсов'],
    alternatives: ['back_squat', 'goblet_squat'],
  }),
  ex({
    id: 'lunges', name: 'Выпады', primary: 'quads', secondary: ['glutes', 'adductors'],
    equipment: ['none'], place: 'both', level: 'beginner', kind: 'compound', score: 8,
    steps: ['Сделайте шаг вперёд.', 'Опуститесь, пока заднее колено почти не коснётся пола.', 'Оттолкнитесь передней ногой и вернитесь.'],
    mistakes: ['Колено заваливается внутрь', 'Короткий шаг'], tips: ['Гантели в руках для прогрессии'],
    alternatives: ['bulgarian_split_squat', 'step_up'],
  }),
  ex({
    id: 'step_up', name: 'Зашагивания на опору', primary: 'quads', secondary: ['glutes'],
    equipment: ['none'], place: 'home', level: 'beginner', kind: 'compound', score: 7,
    steps: ['Поставьте стопу на устойчивую опору высотой до колена.', 'Зашагните, отталкиваясь верхней ногой.', 'Медленно спуститесь.'],
    mistakes: ['Толчок нижней ногой'], tips: ['Проверьте устойчивость опоры'],
    alternatives: ['lunges', 'bulgarian_split_squat'],
  }),
  ex({
    id: 'leg_extension', name: 'Разгибания ног в тренажёре', primary: 'quads', secondary: [],
    equipment: ['machines'], place: 'gym', level: 'beginner', kind: 'isolation', score: 7,
    steps: ['Валик над щиколотками, колени на оси тренажёра.', 'Разогните ноги до конца.', 'Медленно опустите.'],
    mistakes: ['Рывки', 'Отрыв таза'], tips: ['Пауза в верхней точке'],
    alternatives: ['leg_press', 'bw_squat'],
  }),
  ex({
    id: 'jump_squat', name: 'Приседания с выпрыгиванием', primary: 'quads', secondary: ['glutes', 'calves'],
    equipment: ['none'], place: 'home', level: 'intermediate', kind: 'compound', score: 6,
    steps: ['Присядьте до параллели.', 'Взрывом выпрыгните вверх.', 'Мягко приземлитесь и сразу уйдите в присед.'],
    mistakes: ['Жёсткое приземление на прямые ноги'], tips: ['Подходит для кардио и взрывной силы'],
    breathing: 'Выдох на прыжке.', alternatives: ['bw_squat'],
  }),
  ex({
    id: 'pistol_squat', name: 'Пистолетик', primary: 'quads', secondary: ['glutes', 'abs'],
    equipment: ['none'], place: 'home', level: 'advanced', kind: 'compound', score: 8,
    steps: ['Стоя на одной ноге, вторая вытянута вперёд.', 'Присядьте на опорной ноге как можно ниже.', 'Встаньте, не касаясь пола второй ногой.'],
    mistakes: ['Колено заваливается внутрь'], tips: ['Начните с приседа на одной ноге до скамьи'],
    easier: 'Болгарские выпады', alternatives: ['bulgarian_split_squat'],
  }),
  ex({
    id: 'burpee', name: 'Бёрпи', primary: 'quads', secondary: ['chest', 'abs', 'shoulders'],
    equipment: ['none'], place: 'home', level: 'intermediate', kind: 'compound', score: 5, timeBased: true,
    steps: ['Присядьте и поставьте руки на пол.', 'Прыжком уйдите в упор лёжа, вернитесь прыжком.', 'Выпрыгните вверх с хлопком.'],
    breathing: 'Ритмичное дыхание.', mistakes: ['Провис поясницы в упоре'], tips: ['Для кардио-финишера'],
    alternatives: ['mountain_climber', 'jump_squat'],
  }),

  // ───────────── БИЦЕПС БЕДРА ─────────────
  ex({
    id: 'rdl', name: 'Румынская тяга со штангой', primary: 'hamstrings', secondary: ['glutes', 'lowerback', 'forearms'],
    equipment: ['barbell'], place: 'gym', level: 'intermediate', kind: 'compound', score: 10,
    steps: ['Стоя, штанга у бёдер, колени чуть согнуты.', 'Отводите таз назад, опуская гриф вдоль ног до растяжения задней поверхности.', 'Вернитесь, двигая таз вперёд.'],
    breathing: 'Вдох при опускании, выдох при подъёме.',
    mistakes: ['Круглая спина', 'Сгибание коленей как в приседе'], tips: ['Гриф скользит по ногам'],
    easier: 'Румынская тяга с гантелями', alternatives: ['db_rdl', 'leg_curl'],
  }),
  ex({
    id: 'db_rdl', name: 'Румынская тяга с гантелями', primary: 'hamstrings', secondary: ['glutes', 'lowerback'],
    equipment: ['dumbbells'], place: 'both', level: 'beginner', kind: 'compound', score: 9,
    steps: ['Гантели перед бёдрами, колени чуть согнуты.', 'Отведите таз назад, опуская гантели вдоль ног.', 'Вернитесь в вертикаль, сжимая ягодицы.'],
    breathing: 'Вдох при опускании, выдох при подъёме.',
    mistakes: ['Округление спины'], tips: ['Опускайтесь до ощущения сильного растяжения'],
    alternatives: ['rdl', 'nordic_curl'],
  }),
  ex({
    id: 'leg_curl', name: 'Сгибания ног в тренажёре', primary: 'hamstrings', secondary: ['calves'],
    equipment: ['machines'], place: 'gym', level: 'beginner', kind: 'isolation', score: 8,
    steps: ['Настройте валик над пятками.', 'Согните ноги до конца.', 'Медленно разогните.'],
    mistakes: ['Отрыв таза'], tips: ['Сидячий вариант даёт больше растяжения'],
    alternatives: ['nordic_curl', 'db_rdl'],
  }),
  ex({
    id: 'nordic_curl', name: 'Скандинавские сгибания', primary: 'hamstrings', secondary: ['glutes'],
    equipment: ['none'], place: 'home', level: 'advanced', kind: 'isolation', score: 9,
    steps: ['На коленях, пятки зафиксированы (партнёр или под диваном).', 'Медленно наклоняйтесь вперёд с прямым корпусом.', 'Подставьте руки и вернитесь.'],
    breathing: 'Ровное дыхание при опускании.',
    mistakes: ['Сгиб в тазу'], tips: ['Снижает риск травм задней поверхности бедра'],
    easier: 'Мост на одной ноге', alternatives: ['leg_curl', 'db_rdl'],
  }),
  ex({
    id: 'kb_swing', name: 'Махи гирей', primary: 'hamstrings', secondary: ['glutes', 'lowerback', 'shoulders'],
    equipment: ['kettlebell'], place: 'both', level: 'intermediate', kind: 'compound', score: 7,
    steps: ['Гиря между ног, наклон с прямой спиной.', 'Взрывом бёдер выбросите гирю до уровня груди.', 'Пропустите гирю назад между ног.'],
    breathing: 'Резкий выдох на выбросе.',
    mistakes: ['Подъём руками', 'Присед вместо наклона'], tips: ['Движение из тазобедренных'],
    alternatives: ['db_rdl'],
  }),

  // ───────────── ПРИВОДЯЩИЕ ─────────────
  ex({
    id: 'sumo_squat', name: 'Присед сумо с гантелью', primary: 'adductors', secondary: ['glutes', 'quads'],
    equipment: ['dumbbells'], place: 'both', level: 'beginner', kind: 'compound', score: 7,
    steps: ['Широкая стойка, носки развёрнуты, гантель в руках внизу.', 'Присядьте, колени по линии носков.', 'Встаньте, сжимая ягодицы.'],
    mistakes: ['Колени внутрь'], tips: ['Без гантели тоже работает'],
    alternatives: ['side_lunge', 'adductor_machine'],
  }),
  ex({
    id: 'side_lunge', name: 'Боковые выпады', primary: 'adductors', secondary: ['glutes', 'quads'],
    equipment: ['none'], place: 'home', level: 'beginner', kind: 'compound', score: 7,
    steps: ['Широкий шаг в сторону.', 'Присядьте на эту ногу, вторая прямая.', 'Вернитесь в центр.'],
    mistakes: ['Отрыв пятки'], tips: ['Растягивает и укрепляет внутреннюю поверхность бедра'],
    alternatives: ['sumo_squat'],
  }),
  ex({
    id: 'adductor_machine', name: 'Сведение ног в тренажёре', primary: 'adductors', secondary: [],
    equipment: ['machines'], place: 'gym', level: 'beginner', kind: 'isolation', score: 7,
    steps: ['Сядьте, колени упираются в подушки.', 'Сведите ноги.', 'Медленно разведите до растяжения.'],
    mistakes: ['Рывки'], tips: ['Подконтрольный негатив'],
    alternatives: ['sumo_squat', 'copenhagen_plank'],
  }),
  ex({
    id: 'copenhagen_plank', name: 'Копенгагенская планка', primary: 'adductors', secondary: ['obliques'],
    equipment: ['bench'], place: 'both', level: 'advanced', kind: 'isolation', score: 8, timeBased: true,
    steps: ['Боковая планка, верхняя нога на скамье, нижняя под ней.', 'Поднимите таз и удерживайте.', 'Смените сторону.'],
    breathing: 'Ровное дыхание.', mistakes: ['Таз провисает'], tips: ['Начните с опоры коленом'],
    alternatives: ['side_lunge'],
  }),

  // ───────────── ИКРЫ ─────────────
  ex({
    id: 'calf_raise', name: 'Подъёмы на носки стоя', primary: 'calves', secondary: [],
    equipment: ['none'], place: 'both', level: 'beginner', kind: 'isolation', score: 6,
    steps: ['Встаньте носками на край ступеньки.', 'Опустите пятки до растяжения.', 'Поднимитесь на носки максимально высоко.'],
    mistakes: ['Пружинящие повторы'], tips: ['Пауза внизу 1–2 с'],
    harder: 'На одной ноге или с гантелью', alternatives: ['single_calf_raise', 'machine_calf_raise'],
  }),
  ex({
    id: 'single_calf_raise', name: 'Подъёмы на носок одной ноги', primary: 'calves', secondary: [],
    equipment: ['none'], place: 'home', level: 'intermediate', kind: 'isolation', score: 7,
    steps: ['Стоя на одной ноге на ступеньке, держитесь за опору.', 'Опустите пятку вниз.', 'Поднимитесь на носок.'],
    mistakes: ['Короткая амплитуда'], tips: ['Возьмите гантель для прогрессии'],
    alternatives: ['calf_raise'],
  }),
  ex({
    id: 'machine_calf_raise', name: 'Подъёмы на носки в тренажёре', primary: 'calves', secondary: [],
    equipment: ['machines'], place: 'gym', level: 'beginner', kind: 'isolation', score: 8,
    steps: ['Плечи под подушками, носки на платформе.', 'Опустите пятки вниз.', 'Поднимитесь на носки.'],
    mistakes: ['Сгибание коленей'], tips: ['Медленный темп'],
    alternatives: ['calf_raise', 'seated_calf_raise'],
  }),
  ex({
    id: 'seated_calf_raise', name: 'Подъёмы на носки сидя', primary: 'calves', secondary: [],
    equipment: ['machines'], place: 'gym', level: 'beginner', kind: 'isolation', score: 7,
    steps: ['Сидя, валик на коленях, носки на платформе.', 'Опустите пятки вниз.', 'Поднимитесь на носки.'],
    mistakes: ['Короткая амплитуда'], tips: ['Нагружает камбаловидную мышцу'],
    alternatives: ['machine_calf_raise'],
  }),
];

export const EXERCISES: Record<string, Exercise> = Object.fromEntries(RAW.map((e) => [e.id, e]));
export const EXERCISE_LIST = RAW;

export const EQUIPMENT_LABEL: Record<Equipment, string> = {
  none: 'Без инвентаря',
  dumbbells: 'Гантели',
  bands: 'Резинки',
  pullupbar: 'Турник',
  bench: 'Скамья',
  kettlebell: 'Гиря',
  barbell: 'Штанга',
  machines: 'Тренажёры',
  cable: 'Блоки',
};

export const LEVEL_LABEL: Record<Level, string> = {
  beginner: 'Новичок',
  intermediate: 'Средний',
  advanced: 'Профи',
};

const LEVEL_RANK: Record<Level, number> = { beginner: 0, intermediate: 1, advanced: 2 };
export const levelRank = (l: Level) => LEVEL_RANK[l];

/** Упражнение доступно с данным набором оборудования */
export function isAvailable(e: Exercise, eq: Equipment[]): boolean {
  return e.equipment.every((x) => x === 'none' || eq.includes(x));
}

/** Упражнения для мышцы, отсортированные по редакционной оценке */
export function exercisesForMuscle(m: MuscleId, includeSecondary = false): Exercise[] {
  return RAW.filter((e) => e.primary === m || (includeSecondary && e.secondary.includes(m))).sort(
    (a, b) => (b.primary === m ? 1 : 0) - (a.primary === m ? 1 : 0) || b.score - a.score,
  );
}

export function youtubeSearchUrl(e: Exercise) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(e.name + ' техника выполнения')}`;
}
