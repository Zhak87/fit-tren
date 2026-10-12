import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { colors } from '../theme';
import { SCENE_HTML } from './body3d/sceneHtml';
import { sceneConfig, type Body3DProps, type SceneMsg } from './body3d/types';

/** 3D-модель тела (three.js в WebView). Та же сцена работает в вебе через iframe — см. Body3D.web.tsx */
export function Body3D(props: Body3DProps) {
  const ref = useRef<WebView>(null);
  const [ready, setReady] = useState(false);
  const cfg = JSON.stringify(sceneConfig(props));
  const initial = useRef(cfg);
  const cb = useRef(props);
  cb.current = props;

  useEffect(() => {
    if (ready) ref.current?.injectJavaScript(`window.__recv(${cfg});true;`);
  }, [cfg, ready]);

  const onMessage = (e: WebViewMessageEvent) => {
    let m: SceneMsg;
    try {
      m = JSON.parse(e.nativeEvent.data);
    } catch {
      return;
    }
    if (m.type === 'ready') setReady(true);
    else if (m.type === 'select' && m.muscle) cb.current.onSelect?.(m.muscle);
    else if (m.type === 'error') cb.current.onError?.();
  };

  return (
    <View style={{ height: props.height, width: '100%' }}>
      <WebView
        ref={ref}
        source={{ html: SCENE_HTML }}
        originWhitelist={['*']}
        injectedJavaScriptBeforeContentLoaded={`window.__initConfig=${initial.current};true;`}
        onMessage={onMessage}
        javaScriptEnabled
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        setBuiltInZoomControls={false}
        androidLayerType="hardware"
        style={{ backgroundColor: 'transparent' }}
        containerStyle={{ backgroundColor: 'transparent' }}
        onError={() => cb.current.onError?.()}
      />
      {!ready && (
        <View pointerEvents="none" style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.accent} />
        </View>
      )}
    </View>
  );
}
