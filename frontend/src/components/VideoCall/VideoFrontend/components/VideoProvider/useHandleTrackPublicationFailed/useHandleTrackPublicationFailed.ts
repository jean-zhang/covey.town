import { useEffect } from 'react';
import { Room } from 'twilio-video';
import { Callback } from '../../../types';

export default function useHandleTrackPublicationFailed(room: Room, onError: Callback) {
  const { localParticipant } = room;
  useEffect(() => {
    if (localParticipant) {
      localParticipant.on('trackPublicationFailed', onError);
      return () => {
        localParticipant.off('trackPublicationFailed', onError);
      };
    }
    return () => {};
  }, [localParticipant, onError]);
}
