import type { ExerciceModeleTableau } from "../core6e/modeleTableau.types";
import { CONTEXTES, instants, valeurModele } from "../generateurs6e/modeleTableau";
import type { AideEcran, ChampEcran, Frag, OptionEcran, TableauDonnees } from "./ecransExp.types";
import { lx, tx } from "./ecransExp.types";
import { decL, decT, estDecimal, qDiv, qL, qSub, qVal } from "./nombresExp";
import type { Q } from "./nombresExp";

/**
 * Couche C — textes de 6gen147 « Modèle exponentiel lu dans un tableau » : situation, tableau,
 * consignes, champs, aides à deux niveaux, réponses. Source unique de l'écran, du récapitulatif, du
 * corrigé et du papier.
 */

type E = ExerciceModeleTableau;
export type PhaseModeleTableau = "rapports" | "verdict" | "parametres" | "prevision";
export const PHASES: PhaseModeleTableau[] = ["rapports", "verdict", "parametres", "prevision"];
export const COURS_MODELE = "(cours, point 7)";

export const ctx = (e: E) => CONTEXTES[e.contexte];

/** Rationnel écrit en décimal exact s'il l'est (≤ 6 décimales), sinon en fraction. */
export function nombreL(x: Q): string {
  const v = qVal(x);
  return estDecimal(v, 6) ? decL(v, 6) : qL(x);
}

export function mesures(e: E): Q[] {
  return instants(e).map((t) => valeurModele(e, t));
}

/** Rapports successifs (exacts). */
export function rapports(e: E): Q[] {
  const y = mesures(e);
  return [0, 1, 2].map((i) => qDiv(y[i + 1], y[i]));
}

export function differences(e: E): Q[] {
  const y = mesures(e);
  return [0, 1, 2].map((i) => qSub(y[i + 1], y[i]));
}

/** Rapport écrit : exact s'il est décimal, sinon « ≈ » au centième. */
export function rapportL(r: Q): { rel: "=" | "\\approx"; val: string } {
  const v = qVal(r);
  return estDecimal(v, 4) ? { rel: "=", val: decL(v, 4) } : { rel: "\\approx", val: decL(Math.round(v * 100) / 100, 2) };
}

/** Modèle f(t) en LaTeX (décimaux à virgule). */
export function modeleL(e: E): string {
  if (e.genre === "exponentiel") return `${nombreL(e.b)}\\cdot ${nombreL(e.a)}^{t}`;
  const m = qVal(e.m);
  return `${nombreL(e.m)}t${m === 0 ? "" : "+"}${nombreL(e.b)}`;
}

/** Prévision : arrondi à l'unité (effectif) ou au centième. */
export function pasArrondi(e: E): number {
  return ctx(e).entier ? 1 : 0.01;
}
export function previsionArrondie(e: E): number {
  const p = pasArrondi(e);
  return Math.round(qVal(valeurModele(e, e.T)) / p) * p;
}
export function previsionL(e: E): string {
  return decL(previsionArrondie(e), ctx(e).entier ? 0 : 2);
}

/** « = » quand la prévision arrondie EST la valeur exacte du modèle (781,25), sinon « ≈ ». */
export function relPrevisionL(e: E): "=" | "\\approx" {
  return Math.abs(qVal(valeurModele(e, e.T)) - previsionArrondie(e)) < 1e-9 ? "=" : "\\approx";
}

// ============================================================================
// Énoncé.
// ============================================================================

export function situation(e: E): Frag[] {
  const c = ctx(e);
  return [tx(`${c.sujet} (${c.lettre}, en ${c.unite}) est mesuré${c.sujet.startsWith("La") ? "e" : ""} ${/^(mois|jours)$/.test(c.temps) ? "tous" : "toutes"} les ${e.h === 1 ? "" : "deux "}${c.temps} ; `), lx("t"), tx(` est le temps écoulé, en ${c.temps}.`)];
}

export function tableau(e: E): TableauDonnees {
  const c = ctx(e);
  const y = mesures(e);
  return {
    entetes: [[tx(`t (${c.temps})`)], [tx(`${c.lettre} (${c.unite})`)]],
    lignes: instants(e).map((t, i) => [String(t), decT(qVal(y[i]), 3)]),
    horizontal: true,
  };
}

export function consigneGenerale(e: E): Frag[] {
  return [...situation(e), tx(" Les mesures suivent-elles un modèle exponentiel ou un modèle linéaire ? On veut aussi prévoir "), lx(ctx(e).lettre), tx(" pour "), lx(`t=${e.T}`), tx(".")];
}

export function consigne(e: E, phase: PhaseModeleTableau): Frag[] {
  const L = ctx(e).lettre;
  switch (phase) {
    case "rapports":
      return [tx("Calcule les trois rapports de deux mesures consécutives, "), lx(`\\dfrac{${L}_1}{${L}_0}`), tx(", "), lx(`\\dfrac{${L}_2}{${L}_1}`), tx(" et "), lx(`\\dfrac{${L}_3}{${L}_2}`), tx(", où "), lx(`${L}_0,\\ ${L}_1,\\ ${L}_2,\\ ${L}_3`), tx(" sont les quatre mesures dans l'ordre (valeur exacte, ou arrondie au centième).")];
    case "verdict":
      return [tx("Quel modèle convient à ces mesures ?")];
    case "parametres":
      return e.genre === "exponentiel"
        ? [tx("Le modèle s'écrit "), lx("f(t)=b\\cdot a^{t}"), tx(", avec "), lx("t"), tx(` en ${ctx(e).temps}. Donne `), lx("b"), tx(" et "), lx("a"), tx(" (valeurs exactes).")]
        : [tx("Le modèle s'écrit "), lx("f(t)=m\\,t+p"), tx(", avec "), lx("t"), tx(` en ${ctx(e).temps}. Donne `), lx("m"), tx(" et "), lx("p"), tx(" (valeurs exactes).")];
    case "prevision":
      return [tx("Prévois "), lx(L), tx(" pour "), lx(`t=${e.T}`), tx(ctx(e).entier ? " (arrondi à l'unité)." : " (arrondi au centième).")];
  }
}

export function libelle(_e: E, phase: PhaseModeleTableau): string {
  return { rapports: "Rapports successifs", verdict: "Modèle", parametres: "Paramètres", prevision: "Prévision" }[phase];
}

export function champs(e: E, phase: PhaseModeleTableau): ChampEcran[] {
  const L = ctx(e).lettre;
  if (phase === "rapports") return [1, 2, 3].map((i) => ({ label: `Rapport ${L}${i}/${L}${i - 1}`, labelLatex: `\\dfrac{${L}_${i}}{${L}_${i - 1}}=`, placeholder: "ex. : 0,25" }));
  if (phase === "parametres")
    return e.genre === "exponentiel"
      ? [
          { label: "b", labelLatex: "b=", placeholder: "ex. : 7" },
          { label: "a", labelLatex: "a=", placeholder: "ex. : 0,25" },
        ]
      : [
          { label: "m", labelLatex: "m=", placeholder: "ex. : −7" },
          { label: "p", labelLatex: "p=", placeholder: "ex. : 7" },
        ];
  return [{ label: `Prévision de ${L} pour t = ${e.T}`, labelLatex: `f(${e.T})\\approx`, unite: ctx(e).unite, placeholder: "ex. : 12,34" }];
}

export function options(): OptionEcran[] {
  return [
    { id: "exponentiel", fragments: [tx("Modèle exponentiel : les rapports successifs sont égaux")] },
    { id: "lineaire", fragments: [tx("Modèle linéaire : les différences successives sont égales")] },
  ];
}

export function reponse(e: E, phase: PhaseModeleTableau): Frag[] {
  const L = ctx(e).lettre;
  switch (phase) {
    case "rapports":
      return rapports(e).flatMap((r, i) => {
        const w = rapportL(r);
        return [...(i > 0 ? [tx(" ; ")] : []), lx(`\\dfrac{${L}_${i + 1}}{${L}_${i}}${w.rel}${w.val}`)];
      });
    case "verdict":
      return [tx(e.genre === "exponentiel" ? "Modèle exponentiel (rapports égaux)" : "Modèle linéaire (différences égales)")];
    case "parametres":
      return e.genre === "exponentiel" ? [lx(`b=${nombreL(e.b)}`), tx(" et "), lx(`a=${nombreL(e.a)}`), tx(", donc "), lx(`f(t)=${modeleL(e)}`)] : [lx(`m=${nombreL(e.m)}`), tx(" et "), lx(`p=${nombreL(e.b)}`), tx(", donc "), lx(`f(t)=${modeleL(e)}`)];
    case "prevision":
      return [lx(`f(${e.T})${relPrevisionL(e)}${previsionL(e)}`), tx(` ${ctx(e).unite}`)];
  }
}

export const recap = reponse;

export function messageIllisible(_e: E, phase: PhaseModeleTableau): string {
  if (phase === "prevision") return "Je n'arrive pas à lire ta prévision (écris un nombre, par exemple 1708,59). Cela ne compte pas comme une tentative.";
  return "Je n'arrive pas à lire ta réponse (exemples d'écritures acceptées : 1,5 ; 3/2 ; 0,8 ; 4/5). Cela ne compte pas comme une tentative.";
}

// ============================================================================
// Aides.
// ============================================================================

export function aide1(e: E, phase: PhaseModeleTableau): AideEcran {
  const L = ctx(e).lettre;
  switch (phase) {
    case "rapports":
      return { texte: [tx("Divise chaque mesure par la précédente (les mesures sont prises à intervalles égaux) :")], latex: `\\dfrac{${L}_1}{${L}_0},\\quad\\dfrac{${L}_2}{${L}_1},\\quad\\dfrac{${L}_3}{${L}_2}` };
    case "verdict":
      return { texte: [tx("Rapports constants : modèle exponentiel ; différences constantes : modèle linéaire "), tx(`${COURS_MODELE}.`)] };
    case "parametres":
      return e.genre === "exponentiel"
        ? { texte: [lx("b"), tx(" est la valeur en "), lx("t=0"), tx(". Sur un écart de "), lx("d"), tx(" unités, le rapport vaut "), lx("a^{d}"), tx(" :")], latex: "\\dfrac{f(t+d)}{f(t)}=a^{d}" }
        : { texte: [lx("p"), tx(" est la valeur en "), lx("t=0"), tx(". Sur un écart de "), lx("d"), tx(" unités, la différence vaut "), lx("m\\cdot d"), tx(" :")], latex: "f(t+d)-f(t)=m\\cdot d" };
    case "prevision":
      return { texte: [tx("Remplace "), lx("t"), tx(" par "), lx(`${e.T}`), tx(" dans le modèle, puis arrondis.")] };
  }
}

export function aide2(e: E, phase: PhaseModeleTableau): AideEcran | null {
  const y = mesures(e);
  switch (phase) {
    case "rapports":
      return { texte: [tx("Le premier rapport : "), lx(`\\dfrac{${nombreL(y[1])}}{${nombreL(y[0])}}`), tx(" ; fais de même pour les deux autres.")] };
    case "verdict":
      return { texte: [tx("Compare tes trois rapports ; calcule aussi les différences, par exemple "), lx(`${nombreL(y[1])}-${nombreL(y[0])}`), tx(" et "), lx(`${nombreL(y[2])}-${nombreL(y[1])}`), tx(".")] };
    case "parametres":
      if (e.genre === "exponentiel")
        return e.h === 1
          ? { texte: [tx("Ici les mesures sont espacées d'une unité : "), lx("a"), tx(" est le rapport commun trouvé au premier écran.")] }
          : { texte: [tx("Ici les mesures sont espacées de deux unités : le rapport commun vaut "), lx("a^{2}"), tx(" ; "), lx("a"), tx(" est le nombre positif dont le carré vaut ce rapport.")] };
      return e.h === 1
        ? { texte: [tx("Ici les mesures sont espacées d'une unité : "), lx("m"), tx(" est la différence commune.")] }
        : { texte: [tx("Ici les mesures sont espacées de deux unités : la différence commune vaut "), lx("2m"), tx(".")] };
    case "prevision":
      return { texte: [tx("Calcule "), lx(e.genre === "exponentiel" ? `${nombreL(e.b)}\\cdot ${nombreL(e.a)}^{${e.T}}` : `${nombreL(e.m)}\\cdot ${e.T}+${nombreL(e.b)}`), tx(" à la calculatrice.")] };
  }
}

/** Ratio « par unité » à partir du rapport sur h unités (pour les messages). */
export function rapportCommun(e: E): Q {
  return rapports(e)[0];
}

export function differenceCommune(e: E): Q {
  return differences(e)[0];
}

export function explicationChoix(e: E): string {
  return e.genre === "exponentiel" ? "Les rapports successifs sont égaux, les différences ne le sont pas." : "Les différences successives sont égales, les rapports ne le sont pas.";
}

