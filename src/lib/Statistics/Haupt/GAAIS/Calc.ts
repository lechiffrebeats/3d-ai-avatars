
/* https://www.sciencedirect.com/science/article/pii/S2451958820300142 */
/* 0. Vorbertugn: alles negativen reversen */
/* 1. Alle 20 mit disagree, neutral, agree in einem balken  */
/* Item	Pos	Neg	U	IRC	Mean	SD */
/* Disagreement and agreement combine the “somewhat” and “strongly” categories of (dis)agreement. */

import { statistics } from "$lib/Statistics/Logic/Aggregate"
import { metric_form_general } from "$lib/Statistics/Logic/HelpersMath"
import { get } from "svelte/store"

export function isPositiveGaais(g) {
    const stringGaaisUno = String(g.labelKey).split(".")[1]
    const stringGaaisDuo = String(stringGaaisUno).split("_")[1]

    return stringGaaisUno && stringGaaisUno[0] === "p" || stringGaaisDuo &&  stringGaaisDuo[0] === "p"
}

export function isPositiveGaaisLabel(labelKey) {
    const stringGaais = String(labelKey).split("_")[1]
    return stringGaais[0] === "p"
}

export function normalizeGaaisEntry(g) {
    return isPositiveGaais(g) ? g: {...g, values: g.values.map((v) => -v)}
}

export function calc_gaais_totals() {
    const positiveVals = get(statistics).gaais.positive.map((g) => g.values).flat();
    const posValsXSid = get(statistics).gaais.positive.map((g) => g.values_x_session_id).flat();
    const negativeVals = get(statistics).gaais.negative.map((g) => g.values).flat();
    const negValsXSid = get(statistics).gaais.negative.map((g) => g.values_x_session_id).flat();

    const all_normalized = get(statistics).gaais.normalized;
    const all_normalizedVals = Object.values(all_normalized).map((g) => g.values).flat();
    const vals_x_sessionids = Object.values(all_normalized).map((g) => g.values_x_session_id).flat();

    gaais_totals[0] = {...gaais_totals[0],...metric_form_general(all_normalizedVals, {scaleMin: 1, scaleMax: 5, metric_type: "INVERTED"}), values_x_session_id: vals_x_sessionids}
    gaais_totals[1] = {...gaais_totals[1],...metric_form_general(positiveVals, {scaleMin: 1, scaleMax: 5, metric_type: "NOT_INVERTED"}), values_x_session_id: posValsXSid}
    gaais_totals[2] = {...gaais_totals[2],...metric_form_general(negativeVals , {scaleMin: 1, scaleMax: 5, metric_type: "NOT_INVERTED"}), values_x_session_id: negValsXSid}
    
    const finalForm = Object.values(gaais_totals) 
    return finalForm
}

const gaais_totals = [
  { id: "gaais_total", label: "Allgemeine Einstellungen gegenüber KI", group: "GAAIS", direction: "höher = positiver", note: "negative Items invertiert" },
  { id: "gaais_pos",   label: "Positive allgemeine Einstellungen gegenüber KI", group: "GAAIS", direction: "höher = positiver" },
  { id: "gaais_neg",   label: "Negative allgemeine Einstellungen gegenüber KI", group: "GAAIS", direction: "höher = negativer" },

  { id: "tri_total",   label: "Technology Readiness Index", group: "TRI 2.0", direction: "höher = höhere Technologie-Bereitschaft", note: "Discomfort & Insecurity invertiert" },
  { id: "tri_innov",   label: "Innovationsneigung", group: "TRI 2.0", direction: "höher = innovativer" },
  { id: "tri_optim",   label: "Optimismus", group: "TRI 2.0", direction: "höher = optimistischer" },
  { id: "tri_discomf", label: "Unbehagen", group: "TRI 2.0", direction: "höher = mehr Unbehagen (negativ)" },
  { id: "tri_insec",   label: "Unsicherheit", group: "TRI 2.0", direction: "höher = mehr Unsicherheit (negativ)" }
];

/* Empty Cell	Empty Cell	Innovativeness	Optimism	Discomfort	Insecurity
Positive General Attitudes towards AI	r	0.42	0.58	0.20	0.22
p	<. 001	<. 001	0.051	0.029
F	1.91	22.12	0.15	0.22
p	0.17	<.001	0.696	0.643
Negative General Attitudes towards AI	r	0.27	0.44	0.27	0.43
p	0.008	<. 001	0.007	<. 001
F	0.08	7.19	0.32	9.94
p	0.773	0.009	0.576	0.002 */