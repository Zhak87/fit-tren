import { useState } from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import { radius } from '../theme';
import { Poster, embedUrl } from './YouTubeEmbed.shared';

/** Плеер YouTube (официальное встраивание). Загружается только после нажатия на превью. */
export function YouTubeEmbed({ id, title }: { id: string; title: string }) {
  const [play, setPlay] = useState(false);
  const box = { width: '100%' as const, aspectRatio: 16 / 9, borderRadius: radius.lg, overflow: 'hidden' as const, backgroundColor: '#000' };
  if (!play) return <Poster id={id} title={title} onPress={() => setPlay(true)} style={box} />;
  const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;height:100%;background:#000}iframe{position:absolute;inset:0;width:100%;height:100%;border:0}</style></head><body><iframe src="${embedUrl(id, true)}" title="${title.replace(/"/g, '&quot;')}" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen></iframe></body></html>`;
  return (
    <View style={box}>
      {/* baseUrl задаёт origin/referrer: без него YouTube отказывается воспроизводить встроенное видео */}
      <WebView source={{ html, baseUrl: 'https://fit-ai.app' }} allowsInlineMediaPlayback allowsFullscreenVideo mediaPlaybackRequiresUserAction={false} javaScriptEnabled style={{ backgroundColor: '#000' }} />
    </View>
  );
}
