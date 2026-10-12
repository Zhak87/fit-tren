import { Ionicons } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Linking, Text, View } from 'react-native';
import { youtubeSearchUrl } from '../data/exercises';
import { MUSCLES } from '../data/muscles';
import { colors, font, radius } from '../theme';
import type { Exercise, MediaAsset } from '../types';
import { BodyMap } from './BodyMap';
import { Button } from './ui';

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

/** Видео техники: показываем только разрешённое медиа; иначе честная заглушка и ссылка на поиск */
export function VideoBlock({ e, sex }: { e: Exercise; sex: 'male' | 'female' }) {
  if (e.video) return <Player media={e.video} />;
  const views: ('front' | 'back')[] = [];
  const all = [e.primary, ...e.secondary];
  if (all.some((m) => MUSCLES[m].view !== 'back')) views.push('front');
  if (all.some((m) => MUSCLES[m].view !== 'front')) views.push('back');
  return (
    <View style={{ backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 16, gap: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 20 }}>
        {views.map((v) => (
          <BodyMap key={v} sex={sex} view={v} selected={e.primary} secondary={e.secondary} onSelect={() => {}} height={180} />
        ))}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Ionicons name="videocam-off-outline" size={16} color={colors.textMuted} />
        <Text style={[font.small, { flex: 1 }]}>Собственное видео техники ещё не добавлено. Ниже ссылка на поиск видео на YouTube: проверяйте, что автор квалифицированный тренер.</Text>
      </View>
      <Button variant="secondary" icon="logo-youtube" title="Найти видео техники" onPress={() => Linking.openURL(youtubeSearchUrl(e))} />
    </View>
  );
}
