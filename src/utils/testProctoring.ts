type StreamType = 'camera' | 'screen';

let cameraStream: MediaStream | null = null;
let screenStream: MediaStream | null = null;

const attachEndedHandlers = (stream: MediaStream, type: StreamType) => {
  stream.getTracks().forEach((track) => {
    track.onended = () => {
      if (type === 'camera') {
        cameraStream = null;
      } else {
        screenStream = null;
      }
    };
  });
};

export const setCameraStream = (stream: MediaStream | null) => {
  if (cameraStream && cameraStream !== stream) {
    cameraStream.getTracks().forEach((track) => track.stop());
  }
  cameraStream = stream;
  if (stream) attachEndedHandlers(stream, 'camera');
};

export const setScreenStream = (stream: MediaStream | null) => {
  if (screenStream && screenStream !== stream) {
    screenStream.getTracks().forEach((track) => track.stop());
  }
  screenStream = stream;
  if (stream) attachEndedHandlers(stream, 'screen');
};

export const getCameraStream = () => cameraStream;
export const getScreenStream = () => screenStream;

export const stopCameraStream = () => {
  cameraStream?.getTracks().forEach((track) => track.stop());
  cameraStream = null;
};

export const stopScreenStream = () => {
  screenStream?.getTracks().forEach((track) => track.stop());
  screenStream = null;
};

export const stopAllProctoring = () => {
  stopCameraStream();
  stopScreenStream();
};
