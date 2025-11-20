/* SOURCE: https://svelte.dev/playground/0ace7a508bd843b798ae599940a91783?version=3.16.7#H4sIAAAAAAAACpVTTY_TMBD9K1MfNm2VpluJU2groYLEAQnuFCHXnjTedezInvRDVf47spOUlIUDByv2fLx5M_NyY4ZXyHK200q8gm3IK4kg1Qmm3INUDgWpE85Yygql0bP8-43RtQ45wcDSAeFDXWf-hJqC7cA9_s0urCE05FnO1l44VdN2b_akqto6gpsILL52JFoonK0gyZZja_bik_chRSNBqAAbSM7WadmZwykaI0hZAyU3UuNulD7FExqawS3GEtfoaJo8ND9JZhGp7eDWy988zbpcbT-j1hZuoXY7WS_L1XZv1mFgjcd8TBWs6d4_e-TN7S2hNvb_OP0KJ6GuVKeuqKerxhgXyvTUS1THknJYPT_Xl651ElZbl8O5VIS96cDF69HZxshF7_WEqA-6uUdYJ9EtHJeq8Tm8u6NJ5WvNrzkUGgcb1-poFoqw8rlAQ-h6x0vjSRXXRb_gHEbeNk4xNsFSRnghlpNrsE3_IaU_Fv6op7fOkaiW8zl8VL7mJEqIuwZrQDyM1xZgrESYL_cGL1F4d8WMwachKkoFIBxhjaexpmDTl9hsuygAVUBMg6cnmIRLFshxZXynvIy4OyLNor-zSCx4o-mbi0-UswELIs1M9u18Cu7p4AIweIZd48lWnSd50FqSxuzZEN9f2vAJyg5isqKpAgMuZYT4ojyhQddDJem42RTCysKv0U3DITXODFwlenL2Oh2Rv8M7rOwJ_69CRzIop32UzI-UEVf6rIxkecG1x_YXqPxmJ8QEAAA= */

export function clickOutside(node) {
  const handleClick = (event) => {
    if (node && !node.contains(event.target) && !event.defaultPrevented) {
      node.dispatchEvent(new CustomEvent("click_outside", node));
    }
  };
  document.addEventListener("click", handleClick, true);

  return {
    destroy() {
      document.removeEventListener("click", handleClick, true);
    },
  };
}
