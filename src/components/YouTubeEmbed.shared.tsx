import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, View } from 'react-native';
import { colors } from '../theme';

export const embedUrl = (id: string, autoplay: boolean) => `https://www.youtube-nocookie.com/embed/${id}?playsinline=1&rel=0&modestbranding=1${autoplay ? '&autoplay=1' : ''}`;

/** Превью ролика: сам плеер YouTube загружается только после нажатия */
export function Poster({ id, title, onPress, style }: { id: string; title: string; onPress: () => void; style: object }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`Смотреть видео: ${title}`} style={({ pressed }) => [style, pressed && { opacity: 0.85 }]}>
      <Image source={{ uri: `https://i.ytimg.com/vi/${id}/hqdefault.jpg` }} style={{ width: '100%', height: '100%', opacity: 0.8 }} resizeMode="cover" />
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="play" size={30} color={colors.onAccent} style={{ marginLeft: 4 }} />
        </View>
      </View>
    </Pressable>
  );
}

