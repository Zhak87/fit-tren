import { Ionicons } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useState } from 'react';
import { Linking, Pressable, Text, View } from 'react-native';
import { EXERCISE_ANIMS } from '../data/animations';
import { youtubeSearchUrl } from '../data/exercises';
import { MUSCLES } from '../data/muscles';
import { EXERCISE_VIDEOS, VIDEOS_CHECKED_AT } from '../data/videos';
import { colors, font, radius } from '../theme';
import type { Exercise, MediaAsset } from '../types';
import { Body3D } from './Body3D';
import { BodyMap } from './BodyMap';
import { Segmented } from './ui';
import { YouTubeEmbed } from './YouTubeEmbed';

function Player({ media }: { media: MediaAsset }) {
  const player = useVideoPlayer(media.url, (p) => {
    p.loop = true;
    p.muted = true;
  });
  return (
    <View style={{ gap: 6 }}>
      <VideoView player={player} style={{ width: '100%', aspectRatio: 16 / 9, borderRadius: radius.lg, backgroundColor: '#000' }} nativeControls contentFit="contain" />
      <Text style={font.small}>Источник: {media.source} · {media.license} · проверено {media.checkedAt}</Text>
    </View>
  );
}

/** 2D-запасной вариант, если на устройстве нет WebGL */
function Flat({ e, sex }: { e: Exercise; sex: 'male' | 'female' }) {
  const views: ('front' | 'back')[] = [];
  const all = [e.primary, ...e.secondary];
  if (all.some((m) => MUSCLES[m].view !== 'back')) views.push('front');
  if (all.some((m) => MUSCLES[m].view !== 'front')) views.push('back');
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 20, paddingVertical: 12 }}>
      {views.map((v) => (
        <BodyMap key={v} sex={sex} view={v} selected={e.primary} secondary={e.secondary} onSelect={() => {}} height={180} />
      ))}
    </View>
  );
}

type Tab = '3d' | 'video';

/** Техника: анимация движения на 3D-модели и видео с YouTube (официальное встраивание с указанием автора) */
export function VideoBlock({ e, sex, height = 300 }: { e: Exercise; sex: 'male' | 'female'; height?: number }) {
  const anim = EXERCISE_ANIMS[e.id];
  const yt = EXERCISE_VIDEOS[e.id];
  const [tab, setTab] = useState<Tab>(anim ? '3d' : 'video');
  const [no3d, setNo3d] = useState(false);

  return (
    <View style={{ backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 12, gap: 10 }}>
      <Segmented<Tab>
        options={[
          { value: '3d', label: '3D-техника' },
          { value: 'video', label: 'Видео' },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === '3d' &&
        (anim && !no3d ? (
          <>
            <View style={{ borderRadius: radius.md, overflow: 'hidden', backgroundColor: colors.bg }}>
              <Body3D sex={sex} mode="demo" pattern={anim.pattern} prop={anim.prop} selected={e.primary} secondary={e.secondary} height={height} onError={() => setNo3d(true)} />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="hand-left-outline" size={14} color={colors.textMuted} />
              <Text style={[font.small, { flex: 1 }]}>Схема движения на 3D-модели. Крутите модель пальцем, лаймовым подсвечена основная мышца.</Text>
            </View>
          </>
        ) : (
          <>
            <Flat e={e} sex={sex} />
            <Text style={font.small}>3D недоступно на этом устройстве, показана схема мышц.</Text>
          </>
        ))}

      {tab === 'video' &&
        (e.video ? (
          <Player media={e.video} />
        ) : yt ? (
          <View style={{ gap: 8 }}>
            <YouTubeEmbed id={yt.id} title={yt.title} />
            <Text style={font.small}>
              Источник: <Text style={{ color: colors.text, fontWeight: '700' }}>{yt.author}</Text> · YouTube, официальное встраивание · проверено {VIDEOS_CHECKED_AT}
            </Text>
            <Pressable onPress={() => Linking.openURL(`https://www.youtube.com/watch?v=${yt.id}`)} accessibilityRole="link" style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="logo-youtube" size={16} color={colors.textDim} />
              <Text style={[font.small, { textDecorationLine: 'underline' }]}>Открыть на YouTube</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={() => Linking.openURL(youtubeSearchUrl(e))} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12 }}>
            <Ionicons name="logo-youtube" size={18} color={colors.textDim} />
            <Text style={[font.small, { flex: 1 }]}>Видео для этого упражнения ещё не подобрано. Найти на YouTube</Text>
          </Pressable>
        ))}
    </View>
  );
}
