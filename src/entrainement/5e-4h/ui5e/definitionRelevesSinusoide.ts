import type { ExerciceRelevesSinusoide } from "../core5e/relevesSinusoide";
import type { DefinitionEcrans, TableauDonnees } from "./ecransTrigo.types";
import type { PhaseReleves } from "./formatRelevesSinusoide";
import { aide1, aide2, champs, consigne, consigneGenerale, libelle, messageIllisible, PHASES_RELEVES, recap, reponse, tableau } from "./formatRelevesSinusoide";
import { diagnostiquer, piege } from "../moteur5e/verificationRelevesSinusoide";
import { correctionDetailleeRelevesSinusoide } from "../generateurs5e/relevesSinusoide/corrigeDetaille";

/** Cinq écrans : lecture (max, min, T), A, b, ω, φ (modèle), prévision, durée au-dessus d'un seuil. */
export const DEFINITION_RELEVES_SINUSOIDE: DefinitionEcrans<ExerciceRelevesSinusoide, PhaseReleves> = {
  phases: () => PHASES_RELEVES,
  estChoix: () => false,
  mode: (e, p) => ({ type: "champs", champs: champs(e, p) }),
  libelle,
  consigneGenerale,
  tableau,
  consigne,
  aide1,
  aide2,
  diagnostiquer,
  piege,
  messageIllisible,
  reponseAttendue: reponse,
  recap,
  correction: correctionDetailleeRelevesSinusoide,
};

const echapper = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

/** Tableau des relevés pour le papier (HTML autonome, noir et blanc). */
export function tableauHtml(t: TableauDonnees): string {
  const cell = "border:1px solid #444;padding:3px 6px;text-align:center;font-size:12px";
  const th = `${cell};background:#f2f2f2;font-weight:600`;
  const ent = (i: number) => t.entetes[i].map((f) => (f.type === "latex" ? `<i>${echapper(f.valeur)}</i>` : echapper(f.valeur))).join("");
  let corps: string;
  if (t.horizontal) corps = t.entetes.map((_, i) => `<tr><th style="${th}">${ent(i)}</th>${t.lignes.map((l) => `<td style="${cell}">${echapper(l[i])}</td>`).join("")}</tr>`).join("");
  else corps = `<tr>${t.entetes.map((_, i) => `<th style="${th}">${ent(i)}</th>`).join("")}</tr>${t.lignes.map((l) => `<tr>${l.map((c) => `<td style="${cell}">${echapper(c)}</td>`).join("")}</tr>`).join("")}`;
  return `<table style="border-collapse:collapse;margin:6px auto">${corps}</table>`;
}
