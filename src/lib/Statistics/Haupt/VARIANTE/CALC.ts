  /* groupby eval_questions ids, so eval_questions.length * 2 ids mit {id: {values,labelKey, ...metrics }} */
  /*1-7 scale group by avatat text = > A_ B_ || eval_type === AVATAR || TEXT */

import { VARIANT_RATE_AVATAR, VARIANT_RATE_TEXT } from "$lib/Evaluation/Evaluation";
import {  metric_form_general, metricFrom } from "$lib/Statistics/Logic/HelpersMath";

const SUFFIX_ORDER = ["note", "presence", "natural", "likeable", "enjoy"];
const isNote=(id) => id === "A_vr_note" || id === "B_vr_note"

export function getVariantStatisitcs(varianteRatings: []) {
  const all_eval_questions = Object.values(varianteRatings)?.map((q) => q.eval_questions).flat() || []

  const groupedByQuestionId: Object = all_eval_questions.reduce((acc, curr) => {
      const { id, ...rest } = curr; 
      acc[id] ||= [];
      acc[id].push(rest);
      return acc;
  }, {});

  let groupAvatar_pre = Object.entries(groupedByQuestionId).filter(([id,_]) => id.startsWith("A") && !isNote(id))
  let groupText_pre = Object.entries(groupedByQuestionId).filter(([id,_]) => id.startsWith("B") && !isNote(id))

  const groupAvatar_noorder = groupAvatar_pre.map(([id, arr]) => 
      ({ id, ...metric_form_general(arr?.map((v) => v.answer)), labelKey: VARIANT_RATE_AVATAR.find((q) => q.id === id)?.labelKey, values_x_session_id: arr?.map((v) => v.values_x_session_id) }))
  const groupText_noorder  = groupText_pre.map(([id, arr]) =>
          ({ id, ...metric_form_general(arr?.map((v) => v.answer)), labelKey: VARIANT_RATE_TEXT.find((q) => q.id === id)?.labelKey, values_x_session_id: arr?.map((v) => v.values_x_session_id) }))

  const groupAvatar = groupAvatar_noorder.sort((a,b) => SUFFIX_ORDER.indexOf(a.id.split("_").pop() as string) - SUFFIX_ORDER.indexOf(b.id.split("_").pop() as string))
  const groupText = groupText_noorder.sort((a,b) => SUFFIX_ORDER.indexOf(a.id.split("_").pop() as string) - SUFFIX_ORDER.indexOf(b.id.split("_").pop() as string))

  return { groupAvatar, groupText }
}