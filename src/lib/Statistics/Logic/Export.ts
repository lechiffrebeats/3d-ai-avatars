export const downloadChart=(name = null)=>{
    return {
      right: 8,
      /* legend: { type: "scroll" }, */
      feature: { saveAsImage: { pixelRatio: 6, name: name || randomString() } },
    }
}

function randomString() {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}

export function filterNoVariante(sessions) {
  for(const s of sessions) {
    const variantRatings = [];
    for (const step of s.steps) {
      const variant = step.stable_key === "avatar-variant-rate-v1" || step.stable_key === "text-variant-rate-v1" || step.stable_key?.includes("variant") || step.titleKey?.includes("variant")
      if (variant) {
        variantRatings.push(step); 
      }
    }
    if(!variantRatings || variantRatings.length === 0) {
      console.log("NO VARIAETN ", s);
    }
  }
}
