
import { PH66_TO_OVR_VISEME, VISEME_TO_CUSTOM_BLENDSHAPE, type OVRViseme } from "./Static";

const missing = new Set<string>();


export function phonemes_to_blendshapes(phonemeData, frameRate, damping = 1) {
  if (!phonemeData || phonemeData.length === 0) return [];
    const animationFrames = [];
    const totalDuration = phonemeData[phonemeData.length - 1].end;
    const numFrames = Math.floor(totalDuration * frameRate) + 1;

    let currentIndex = 0;
    for (let frameNum = 0; frameNum < numFrames; frameNum++) {
      const currframeTime = frameNum / frameRate;

      /* sucghe die sekunden wo die frames reinfallen */
      while (
        currentIndex + 1 < phonemeData.length &&
        phonemeData[currentIndex].end <= currframeTime
      ) {
        currentIndex++;
      }

      const currentPhoneme = phonemeData[currentIndex];
      const raw = (currentPhoneme.phoneme ?? "").trim();
      const norm = ph66_normalize(raw);
      const viseme = PH66_TO_OVR_VISEME[norm] || "sil";

      const blendshapePose =
        VISEME_TO_CUSTOM_BLENDSHAPE[viseme] || VISEME_TO_CUSTOM_BLENDSHAPE["sil"];
        
      animationFrames.push(blendshapePose);
    }
  return animationFrames;
}

export function ph66_normalize(raw: string): string {
  let s = raw.normalize("NFC");

  // Affricate ligatures → simple
  s = s.replace(/t͡ʃ/g, "tʃ")
       .replace(/d͡ʒ/g, "dʒ")
       .replace(/t͡s/g, "ts");

  // ASCII long marks ":" → IPA length mark "ː"
  // (only when following a vowel we care about)
  s = s.replace(/([aeiouyøœɛeioauɯɨoɔɜyʏuioæɑɒ]):/g, "$1ː");

  // Explicit common cases seen in your logs
  s = s.replace(/i:/g, "iː")
       .replace(/u:/g, "uː")
       .replace(/o:/g, "oː");

  // Map any lowercase "sil" → "SIL"
  if (s.toLowerCase() === "sil") s = "SIL";

  return s;
}

