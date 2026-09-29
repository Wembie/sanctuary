import type { Messages } from '../../../i18n';
import type { MusicTrack } from './library';

type PieceId = keyof Messages['sounds']['pieces'];

/** Display title and one-line detail for any track, in the current language. */
export function trackText(t: Messages, track: MusicTrack): { title: string; detail: string } {
  if (track.kind === 'file') {
    return { title: track.title, detail: track.credit ?? t.sounds.yourTrack };
  }
  const piece = t.sounds.pieces[track.id as PieceId];
  return { title: piece?.title ?? track.id, detail: piece?.description ?? '' };
}
