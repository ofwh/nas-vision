'use client';

import { VideoPlayer } from '@videojs/react/video';
import MediaModal from '../MediaModal';
import type { ImmichVideo } from '../../types';
import useVideoPlayback from '../../hooks/useVideoPlayback';
import VideoContent from './VideoContent';
import VideoFooter from './VideoFooter';

type VideoModalProps = {
  video: ImmichVideo;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
};

function VideoPlayback({ video, onClose, onPrevious, onNext }: VideoModalProps) {
  const playback = useVideoPlayback(video);

  return (
    <MediaModal
      fit
      title={video.name}
      ratio={playback.ratio}
      onClose={onClose}
      footer={
        <VideoFooter paused={playback.paused} onToggle={playback.toggle} onPrevious={onPrevious} onNext={onNext} />
      }
    >
      <VideoContent name={video.name} playback={playback} />
    </MediaModal>
  );
}

export default function VideoModal(props: VideoModalProps) {
  return (
    <VideoPlayer>
      <VideoPlayback {...props} />
    </VideoPlayer>
  );
}
