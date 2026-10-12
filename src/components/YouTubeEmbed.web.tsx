import { createElement, useState } from 'react';
import { View } from 'react-native';
import { radius } from '../theme';
import { Poster, embedUrl } from './YouTubeEmbed.shared';

/** Веб-версия плеера: обычный iframe YouTube */
export function YouTubeEmbed({ id, title }: { id: string; title: string }) {
  const [play, setPlay] = useState(false);
  const box = { width: '100%' as const, aspectRatio: 16 / 9, borderRadius: radius.lg, overflow: 'hidden' as const, backgroundColor: '#000' };
  if (!play) return <Poster id={id} title={title} onPress={() => setPlay(true)} style={box} />;
  return (
    <View style={box}>
      {createElement('iframe', {
        src: embedUrl(id, true),
        title,
        referrerPolicy: 'strict-origin-when-cross-origin',
        allow: 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen',
        allowFullScreen: true,
        style: { border: 0, width: '100%', height: '100%' },
      })}
    </View>
  );
}
