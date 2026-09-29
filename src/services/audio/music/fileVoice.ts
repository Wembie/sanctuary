/**
 * Plays a local audio file through the Web Audio graph (so it shares fades,
 * the limiter and the analyser). A media element streams instead of decoding
 * the whole file into memory: right for long ambient tracks.
 */
export function createFileVoice(
  ctx: AudioContext,
  out: AudioNode,
  src: string,
): { dispose: () => void } {
  const element = new Audio();
  element.src = src;
  element.loop = true;
  element.preload = 'auto';
  let node: MediaElementAudioSourceNode | null = null;
  try {
    node = ctx.createMediaElementSource(element);
    node.connect(out);
  } catch {
    // Graph unavailable: this track simply stays silent.
  }
  // A missing or undecodable file must never surface as an error.
  element.addEventListener('error', () => node?.disconnect(), { once: true });
  if (node) void element.play().catch(() => undefined);

  return {
    dispose: () => {
      element.pause();
      node?.disconnect();
      element.removeAttribute('src');
      element.load();
    },
  };
}
