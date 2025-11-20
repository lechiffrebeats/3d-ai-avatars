import { generate_observation, inputRequest } from "$lib/Agent/Agent";
import { coolDownStore } from "$lib/Misc/generalStore";
import { userStore } from "$lib/User/User";
import { get } from "svelte/store";


export function checkEmotions(detections: any) {
    if (detections.length === 0) return;

    const expressions = detections[0].expressions;
    const sorted = Object.entries(expressions).sort(
      (a, b) => b[1] - a[1]
    ); /* look for biggestr,  */
    const topEmotion = sorted[0][0];

    /* ractive r+über zu openai api */
    if (topEmotion !== get(userStore).userEmotion
    ) {
        
      userStore.update((s) => ({ ...s, userEmotion: topEmotion }));
      coolDownStore.update((s) => ({ ...s, DETECT_EMOTION: false }));
      console.log("Emotion detected:", topEmotion);
      /* eleveate request to agent */
      const observation = generate_observation({ emotion: topEmotion });
      inputRequest(observation);
      
    }
  }

  