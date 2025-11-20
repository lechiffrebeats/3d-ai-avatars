import { chatStore } from "$lib/User/chatStore";


export function disposeMaterial(m: any) {
    if (!m) return;
    const mats = Array.isArray(m) ? m : [m];
    for (const mat of mats) {
      for (const k in mat) {
        const v = mat[k];
        if (v && v.isTexture) v.dispose();
      }
      mat.dispose && mat.dispose();
    }
  }

  /* https://www.reddit.com/r/threejs/comments/103cjae/lerpvector_with_deltatime/ */
  /* https://discourse.threejs.org/t/smooth-transition/24977 */
  /* https://la.disneyresearch.com/wp-content/uploads/Modeling-and-Animating-Eye-Blinks-Paper.pdf */
  /* https://www.youtube.com/watch?v=RWlNHPZe93g */

  
export type LightPreset = {
  hemi: { color: number; ground: number; intensity: number };
  sun: { color: number; intensity: number; pos: readonly [number, number, number] };
  fill: { color: number; intensity: number; pos: readonly [number, number, number] };
};

export const lightPresets = (lite: boolean) => ({
  day: {
    hemi: { color: 0xfff3e0, ground: 0xe6dac4, intensity: 0.9 },
    sun: { color: 0xffe2b0, intensity: lite ? 0.9 : 1.0, pos: [6, 12, 4] as const },
    fill: { color: 0xfff6e8, intensity: lite ? 0.25 : 0.15, pos: [-8, 6, -4] as const },
  },
  sunset: {
    hemi: { color: 0xfff1db, ground: 0xe2b48a, intensity: 1.35 },
    sun:  { color: 0xffa75a, intensity: lite ? 1.15 : 1.65, pos: [-6, 6, 2] as const },
    fill: { color: 0xffe3c6, intensity: lite ? 0.80 : 0.95, pos: [3, 3, -4] as const },
  },
    night: {
    hemi: { color: 0xfff3e0, ground: 0xd8bfa6, intensity: 0.9 },
    sun:  { color: 0x9bbcff, intensity: 0.65, pos: [2, 8, 1] as const },
    fill: { color: 0xffd28a, intensity: 0.85, pos: [-2, 4, -1] as const },
  },
  default: {
    hemi: { color: 0xfff3e0, ground: 0xe6dac4, intensity: 1.5 },
    sun: { color: 0xffe2b0, intensity: 1 , pos: [6, 12, 4] as const },
    fill: { color: 0xfff6e8, intensity: 1, pos: [-8, 6, -4] as const },
  },
});

export const backgrounds = {
  day: [
    {
      type: "day",
      author: "https://www.google.com/maps/contrib/111129122953921252585",
      src: "/backgrounds/Bremen_Day_2.jpg",
      authorName: "Knice Guy",
      time: "day",
      yawDeg: -65,
      brightness: 1.05,
      lightPresets: lightPresets(false).day,
    },
    /* {
      type: "day",
      author: "https://www.google.com/maps/contrib/101024603341362800184",
      src: "/backgrounds/Bremen_Day_3.jpg",
      authorName: "Björn Gudd",
      time: "day",
      yawDeg: -24,
      brightness: 1.05,
      lightPresets: lightPresets(false).day,
    }, */
  ],
  night: [
    {
      type: "night",
      author: "https://www.google.com/maps/contrib/107142538711258214497",
      src: "/backgrounds/Bremen_Night_1.jpg",
      authorName: "Frederik T",
      time: "night",
      yawDeg: 45,
      brightness: 0.9,
      lightPresets: lightPresets(false).night,
    },
  ],
  sunset: [
    {
      type: "sunset",
      author: "https://www.google.com/maps/contrib/107142538711258214497",
      src: "/backgrounds/Bremen_Sunset_2.jpg",
      authorName: "Frederik T",
      time: "sunset",
      yawDeg: 180,
      brightness: 0.8,
      lightPresets: lightPresets(false).sunset,
    },
  ],
  default: [
    {
      author: "https://www.google.com/maps/contrib/106698957070582352854",
      src: "/backgrounds/Bremen_Birdview_1.jpg",
      authorName: "Tim Paulawitz",
      time: "default",
      yawDeg: 0,
      brightness: 0.8,
      lightPresets: lightPresets(false).default,  

    },
    {
      author: "",
      src: "/backgrounds/defaultBlack.jpg",
      authorName: "None",
      time: "default",
      yawDeg: 0,
      brightness: 1,
      lightPresets: lightPresets(false).default,
    },
  ],
};

export const setBackgroundImage = (date = new Date()) => {
  const h = date.getHours();
  const key = h >= 6 && h <= 17 ? "day" : h > 17 && h <= 22 ? "sunset" : "night";
  const list = backgrounds[key];
  chatStore.update((s) => ({ ...s, backgroundImage: list[Math.floor(Math.random() * list.length)]}));
};

export const setBackgroundImageByName = (name) => {
  const list = backgrounds[name];
  chatStore.update((s) => ({ ...s, backgroundImage: list[Math.floor(Math.random() * list.length)]}));
}