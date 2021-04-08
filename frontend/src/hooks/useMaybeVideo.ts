import { useContext } from 'react';
import Video from '../classes/Video/Video';
import VideoContext from '../contexts/VideoContext';

/**
 * Use this hook to access the video instance.
 */
export default function useMaybeVideo(): Video | null {
  return useContext(VideoContext);
}
