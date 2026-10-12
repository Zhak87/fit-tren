import { createElement, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { colors } from '../theme';
import { SCENE_HTML } from './body3d/sceneHtml';
import { sceneConfig, type Body3DProps, type SceneMsg } from './body3d/types';

/** Веб-версия 3D-модели: та же сцена в iframe, обмен сообщениями через postMessage */
export function Body3D(props: Body3DProps) {
  const ref = useRef<HTMLIFrameElement | null>(null);
  const [ready, setReady] = useState(false);
  const cfg = JSON.stringify(sceneConfig(props));
  const cb = useRef(props);
  cb.current = props;
  // начальная конфигурация попадает в документ, дальше только сообщения
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const srcDoc = useMemo(() => SCENE_HTML.replace('<body>', `<body><script>window.__initConfig=${cfg}</script>`), []);

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (!ref.current || e.source !== ref.current.contentWindow) return;
      const m = e.data as SceneMsg & { __fitai?: boolean };
      if (!m || !m.__fitai) return;
      if (m.type === 'ready') setReady(true);
      else if (m.type === 'select' && m.muscle) cb.current.onSelect?.(m.muscle);
      else if (m.type === 'error') cb.current.onError?.();
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, []);

  useEffect(() => {
    if (ready) ref.current?.contentWindow?.postMessage(JSON.parse(cfg), '*');
  }, [cfg, ready]);

  return (
    <View style={{ height: props.height, width: '100%' }}>
      {createElement('iframe', {
        ref,
        srcDoc,
        title: '3D-модель тела',
        sandbox: 'allow-scripts',
        style: { border: 0, width: '100%', height: '100%', background: 'transparent', display: 'block' },
      })}
      {!ready && (
        <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.accent} />
        </View>
      )}
    </View>
  );
}
