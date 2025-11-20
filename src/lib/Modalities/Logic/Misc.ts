
/* https://stackoverflow.com/questions/42464569/javascript-convert-blob-to-float32array-or-other-typed-arrays */
/* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float32Array */
export async function convertBlobToFloat32Array(audioBlob) {
  const arrayBuffer = await audioBlob.arrayBuffer();
  const audioContext = new AudioContext();
  const decodedAudio = await audioContext.decodeAudioData(arrayBuffer);
  //Resample  16,000 Hz mono
  const targetSampleRate = 16000;
  const offlineContext = new OfflineAudioContext(
    decodedAudio.numberOfChannels,
    decodedAudio.duration * targetSampleRate,
    targetSampleRate
  );

  const source = offlineContext.createBufferSource();
  source.buffer = decodedAudio;
  source.connect(offlineContext.destination);
  source.start();
  const resampledAudio = await offlineContext.startRendering();
  //raw audio data as a Float32Array from the first channel
  return resampledAudio.getChannelData(0);
}