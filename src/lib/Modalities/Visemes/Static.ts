export const PH66_TO_OVR_VISEME: Record<string, string> = {
  // Silence / special
  "SIL": "sil",
  "noise": "sil",

  // Bilabial closure (P/B/M)
  "p": "PP", "b": "PP", "m": "PP",

  // Alveolar/dental stops (T/D)
  "t": "DD", "d": "DD",

  // Velar/uvular stops (K/G/Q)
  "k": "kk", "g": "kk", "ɡ": "kk", "q": "kk",

  // Affricates (voiceless/voiced; alveolar & postalveolar)
  "ts": "CH", "t͡s": "CH",
  "tʃ": "CH", "t͡ʃ": "CH",
  "dʒ": "CH", "d͡ʒ": "CH",
  "tɕ": "CH", "dʑ": "CH",
  "dz": "CH", "pf": "CH",

  // Fricatives
  "f": "FF", "v": "FF",

  // Sibilants & other fricatives share the "SS" mouth here
  "s": "SS", "z": "SS",
  "ʃ": "SS", "ʒ": "SS",
  "ɕ": "SS", "ʑ": "SS",
  "θ": "SS", "ð": "SS",
  "ç": "SS", "x": "SS", "ɣ": "SS", "h": "SS",

  // Nasals
  "n": "nn", "ŋ": "nn", "ɲ": "nn",

  // Laterals (group with nasals for a compact set)
  "l": "nn", "ɫ": "nn", "ɭ": "nn", "ɭʲ": "nn",

  // Taps / rhotics
  "ɾ": "RR", "ɹ": "RR", "r": "RR", "rʲ": "RR", "ʁ": "RR",

  // Glides
  "j": "RR",
  "w": "U",

  // Central vowels -> aa (open/central look) unless rhoticized
  "ə": "aa", "ɐ": "aa", "ɜ": "aa", "ɜː": "aa", "ʌ": "aa",
  "ɚ": "RR", "ɝ": "RR",

  // Front unrounded vowels
  "i": "I", "iː": "I", "ɪ": "I",
  "e": "E", "eː": "E", "ɛ": "E", "æ": "aa",

  // Front rounded vowels
  "y": "U", "yː": "U", "ʏ": "U",
  "ø": "O", "øː": "O", "œ": "O",

  // Back vowels
  "u": "U", "uː": "U", "ʊ": "U",
  "o": "O", "oː": "O", "ɔ": "O",
  "ɑ": "aa", "a": "aa", "aː": "aa", "ɒ": "aa",

  // Extra vowel inventory PH66 normalizes to
  "ɨ": "I", "ɯ": "U", "ɤ": "O", "o̞": "O",

  // Diphthongs (nearest stable mouth shape)
  "aɪ": "aa", "aʊ": "aa",
  "eɪ": "E",
  "oʊ": "O", "ɔɪ": "O"
};

/* https://developers.meta.com/horizon/documentation/unity/audio-ovrlipsync-viseme-reference/ */
/* https://www.researchgate.net/profile/Tomaso-Poggio-2/publication/3752723/figure/fig4/AS:643526316531724@1530440038772/The-7-monophthong-visemes-2-diphthong-visemes-and-the-silence-viseme.png */

export const OVR_VISEMES = ["sil","PP","FF","TH","DD","kk","CH","SS","nn","RR","aa","E","I","O","U"] as const;
export type OVRViseme = typeof OVR_VISEMES[number];
export const DAMPING_FACTOR = 0.9;

/* Ich weiß das sieht nicht so aus aber das wurde manuell erstellt. Die zahlen sind z.T. eher geschätzt bzw. kopiert von ähnlichen mundbewegungen,  */
export const VISEME_TO_CUSTOM_BLENDSHAPE = {
  sil: {
    V_Wide: 0.1,
    V_Open: 0.1,
    Mouth_Smile_L: 0.1,
    Mouth_Smile_R: 0.1,
  },
  PP: {
    Mouth_Plosive: 0.2,
    Mouth_Press_L: 1,
    Mouth_Press_R: 1,
    Mouth_Smile_L: 0,
    Mouth_Smile_R: 0,
    Mouth_Snarl_Upper_L: 0.3,
    Mouth_Bottom_Lip_Bite: 0.6,
    Mouth_Bottom_Lip_Under: 0.3,
    Mouth_Lips_Tuck: 0.3,
    Mouth_Top_Lip_Under: 0.3,
    Mouth_Widen: 0.3,
    Mouth_Widen_Sides: 0,
    Mouth_Lips_Tight: 0.2,
    Mouth_Down: 0.3,
    V_Tight: 0.5,
    Cheek_Blow_L: 0.3,
    Cheek_Blow_R: 0.4,
    V_Dental_Lip: 0.5,
  },
  FF: {
    Mouth_Pucker_Open: 0.8,
    Mouth_Top_Lip_Up: 1,
    Mouth_Bottom_Lip_Down: 0.2,
    Mouth_Top_Lip_Under: 0.7,
    Mouth_Bottom_Lip_Under: 0.9,
    Mouth_Widen_Sides: 0.2,
    Cheek_Blow_L: 0.2,
    Cheek_Blow_R: 0.2,
    V_Dental_Lip: 0.8,
    Mouth_Lips_Tuck: 0.8,
    Mouth_Pucker: 0.3,
  },
  TH: {
    V_Open: 0.5,
    V_Explosive: 0.7,
    V_Tight_O: 0.5,
    Mouth_Smile: 0.4,
   /*  Cheek_Raise_L: 0.8,
    Cheek_Raise_R: 0.8, */
    Mouth_Frown: 0.4,
    Mouth_Blow: 0.3,
    Mouth_Widen: 0.3,
    Mouth_Lips_Part: 0.3,
    Mouth_Dimple_L: 0.6,
    Mouth_Dimple_R: 0.6,
    Mouth_Top_Lip_Up: 0.3,
    Mouth_Snarl_Upper_L: 0.1,
    Mouth_Snarl_Upper_R: 0.1,
    Mouth_Open: 0.25,
  },
  DD: {
    V_Open: 0.1,
    V_Explosive: 0.1,
    V_Tight_O: 0.3,
    Mouth_Smile: 0.4,
   /*  Cheek_Raise_L: 0.8,
    Cheek_Raise_R: 0.8, */
    Mouth_Frown: 0.3,
    Mouth_Widen: 1,
    Mouth_Widen_Sides: 0.7,
    V_Tight: 0.5,
    Mouth_Dimple_L: 0.9,
    Mouth_Dimple_R: 0.9,
    Mouth_Blow: 0.5,
    Mouth_Top_Lip_Up: 0.3,
    Mouth_Open: 0.1,
  },
  kk: {
    V_Open: 0.1,
    V_Explosive: 0.1,
    V_Tight_O: 0.8,
    Mouth_Smile: 0.4,
    /* Cheek_Raise_L: 0.8,
    Cheek_Raise_R: 0.8, */
    Mouth_Frown: 0.3,
    Mouth_Widen: 1,
    Mouth_Widen_Sides: 0.7,
    V_Tight: 0.5,
    Mouth_Dimple_L: 0.9,
    Mouth_Dimple_R: 0.9,
    Mouth_Blow: 0.5,
    Mouth_Top_Lip_Up: 0.3,
    V_Lip_Open: 0.4,
    Mouth_Open: 0.1,
  },
  CH: {
    V_Open: 0.1,
    V_Explosive: 0.1,
    V_Tight_O: 0.8,
    Mouth_Smile: 0.4,
    /* Cheek_Raise_L: 0.8,
    Cheek_Raise_R: 0.8, */
    Mouth_Frown: 0.3,
    V_Dental_Lip: 0.3,
    Mouth_Widen: 1,
    Mouth_Widen_Sides: 0.7,
    V_Lip_Open: 0.9,
    V_Tight: 0.5,
    Mouth_Smile_L: 0.2,
    Mouth_Smile_R: 0.2,
    Mouth_Dimple_L: 0.9,
    Mouth_Dimple_R: 0.9,
    Mouth_Blow: 0.5,
    Mouth_Top_Lip_Up: 0.3,
    Mouth_Open: 0.1,
  },
  SS: {
    V_Open: 0.5,
    V_Affricate: 0.8,
    V_Wide: 0.1,
    V_Dental_Lip: 0.7,
  },
  nn: {
    V_Open: 0.1,
    V_Explosive: 0.1,
    V_Tight_O: 0.8,
    Mouth_Smile: 0.4,
/*     Cheek_Raise_L: 0.7,
    Cheek_Raise_R: 0.5, */
    Mouth_Frown: 0.3,
    V_Dental_Lip: 0.3,
    Mouth_Widen: 1,
    Mouth_Widen_Sides: 0.7,
    V_Lip_Open: 0.9,
    V_Tight: 0.5,
    Mouth_Smile_L: 0.2,
    Mouth_Smile_R: 0.2,
    Mouth_Dimple_L: 0.9,
    Mouth_Dimple_R: 0.7,
    Mouth_Blow: 0.4,
    Mouth_Top_Lip_Up: 0.4,
    Mouth_Open: 0.1,
  },
  RR: {
    V_Explosive: 0.2,
    V_Open: 1,
    V_Affricate: 0.6,
    Mouth_Smile_L: 0.14,
    V_Lip_Open: 0.2,
    Mouth_Smile_R: 0.14,
  },
  aa: {
    V_Explosive: 0.2,
    V_Open: 1,
    V_Affricate: 1,
    Mouth_Smile_L: 0.14,
    V_Lip_Open: 0.2,
    Mouth_Smile_R: 0.14,
    Mouth_Widen: 0.5,
  },
  E: {
    V_Explosive: 0.2,
    Mouth_Widen_Sides: 0.8,
    V_Open: 0.9,
    Mouth_Dimple_L: 0.7,
    Mouth_Dimple_R: 0.7,
    V_Affricate: 0.5,
    Mouth_Smile_L: 0.14,
    V_Lip_Open: 0.2,
    Mouth_Smile_R: 0.14,
    Mouth_Lips_Open: 0.2,
    Mouth_Widen: 0.4,
  },
  I: {
    V_Explosive: 0.2,
    Mouth_Widen_Sides: 0.8,
    V_Open: 0.9,
    Mouth_Dimple_L: 0.7,
    Mouth_Dimple_R: 0.7,
    V_Affricate: 0.5,
    Mouth_Smile_L: 0.14,
    V_Lip_Open: 0.2,
    Mouth_Frown: 0.4,
    Mouth_Smile_R: 0.14,
    Mouth_Lips_Open: 0.2,
    Mouth_Widen: 0.4,
  },
  O: {
    V_Open: 0.8,
    V_Tight_O: 0.5,
    Mouth_Pucker_Open: 0.5,
    V_Affricate: 0.5,
    Cheeks_Suck: 0.4,
  },
  U: {
    V_Tight_O: 0.5,
    V_Affricate: 0.4,
  },
};
