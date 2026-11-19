import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExercicePolygonesArcsSecteurs } from "../../core5e/polygonesArcsSecteurs.types";
import type { PhasePolygonesArcsSecteurs } from "../../moteur5e/typesPolygonesArcsSecteurs";
import {
  formatAireTotaleAttendueLatex,
  formatArcElementaireAttendueLatex,
  formatArcMultiPasAttendueLatex,
  formatCirconferenceAttendueLatex,
  formatSecteurElementaireAttendueLatex,
  formatSecteurMultiPasAttendueLatex,
  latexAideNiveau2,
} from "../../ui5e/formatPolygonesArcsSecteurs";
import { COURS_POLYGONES, approche, finaliserCorrige, jf, lignesArrondi, ligneSimplifierPi, piBrut, piQ, q, sansDoublons } from "../../ui5e/corrigeTrigonometrie1";
import { aireCercle, aireSecteur, circonference, longueurArc } from "./index";

/**
 * Corrigé détaillé « comme au tableau » de 5gen7 (polygones, arcs et secteurs) — règle
 * `.claude/rules/feuilles-evaluations.md`. Une étape par ÉCRAN (`sequencePolygone` : cercle entier,
 * arc élémentaire, [arc couvrant k côtés], secteur élémentaire, [secteur couvrant k côtés]) :
 * « Ce qu'on utilise » (fraction k/n du cercle, angle au centre 2π/n, cours § 2), « Calcul »
 * (substitution de l'aide de niveau 2 — k lu ou donné —, produit, simplification, arrondi au
 * centième), « Résultat » (réponse de l'écran, `format…AttendueLatex`, et son arrondi), vérification
 * k × élémentaire, pièges. SANS `docx` : importé par l'adaptateur ET par `App5gen7.tsx`.
 */

const LETTRES = "abcdefghijklmnopqrstuvwxyz";
const t = texte;
const f = latex;

/** Écrans réellement traversés, dans l'ordre du générateur (`phaseApres`). */
export function sequencePolygone(e: ExercicePolygonesArcsSecteurs): PhasePolygonesArcsSecteurs[] {
  const phases: PhasePolygonesArcsSecteurs[] = ["cercleEntier", "arcElementaire"];
  if (e.arcMultiPas !== null) phases.push("arcMultiPas");
  phases.push("secteurElementaire");
  if (e.secteurMultiPas !== null) phases.push("secteurMultiPas");
  return phases;
}

export function lettrePolygone(e: ExercicePolygonesArcsSecteurs, phase: PhasePolygonesArcsSecteurs): string {
  return LETTRES[sequencePolygone(e).indexOf(phase)] ?? "a";
}

/** « s = \dfrac{6\pi}{7} \approx 2{,}69 » : réponse de l'écran suivie de son arrondi au centième. */
function avecArrondi(nom: string, exact: string, v: number): string {
  return `${nom}=${exact}${Number.isInteger(Math.round(v * 1e9) / 1e9) ? "" : `\\approx ${approche(v, 2)}`}`;
}

export function valeurPhaseLatex(e: ExercicePolygonesArcsSecteurs, phase: PhasePolygonesArcsSecteurs): string {
  const { r, n } = e;
  switch (phase) {
    case "cercleEntier":
      return avecArrondi("\\text{Circonférence}", formatCirconferenceAttendueLatex(e), circonference(r));
    case "arcElementaire":
      return avecArrondi("s", formatArcElementaireAttendueLatex(e), longueurArc(r, n, 1));
    case "arcMultiPas":
      return avecArrondi("s", formatArcMultiPasAttendueLatex(e) ?? "", longueurArc(r, n, e.arcMultiPas?.k ?? 1));
    case "secteurElementaire":
      return avecArrondi("A", formatSecteurElementaireAttendueLatex(e), aireSecteur(r, n, 1));
    case "secteurMultiPas":
      return avecArrondi("A", formatSecteurMultiPasAttendueLatex(e) ?? "", aireSecteur(r, n, e.secteurMultiPas?.k ?? 1));
  }
}

/** k/n × (aπ) : substitution de l'aide (déjà écrite), « = k/n × aπ », produit, simplification, arrondi. */
function lignesFraction(k: number, n: number, a: number, substitution: string, justifSub: string, justifA: FragmentConsigne[]): LigneCalcul[] {
  return sansDoublons([
    ligne(substitution.replace(/\s+/g, " "), justifSub),
    ligne(`=\\dfrac{${k}}{${n}}\\times ${piBrut(a, 1)}`, justifA),
    ligne(`=${piBrut(k * a, n)}`, "on multiplie"),
    ...ligneSimplifierPi(k * a, n),
    ...lignesArrondi((k * a * Math.PI) / n, 2),
  ]);
}

function etapesCercleEntier(e: ExercicePolygonesArcsSecteurs, sq: string): EtapeCorrection[] {
  const { r } = e;
  return [
    utilise(sq, [t("Circonférence et aire d'un disque de rayon r : "), f("\\text{Circonférence}=2\\pi r"), t(" et "), f("\\text{Aire}=\\pi r^2"), t(".")]),
    calcul(sq, sansDoublons([ligne(`\\text{Circonférence}=2\\pi\\times ${r}`, `on remplace r par ${r}`), ligne(`=${piBrut(2 * r, 1)}`, "on multiplie"), ...lignesArrondi(circonference(r), 2)]), [], "Circonférence"),
    calcul(sq, sansDoublons([ligne(`\\text{Aire}=\\pi\\times ${r}^2`, `on remplace r par ${r}`), ligne(`=${piBrut(r * r, 1)}`, jf("on calcule ", { l: `${r}^2=${r * r}` })), ...lignesArrondi(aireCercle(r), 2)]), [], "Aire"),
    resultat(sq, [f(valeurPhaseLatex(e, "cercleEntier")), t(" ; "), f(avecArrondi("\\text{Aire}", formatAireTotaleAttendueLatex(e), aireCercle(r)))]),
    piege(sq, [t("La circonférence est "), f("2\\pi r"), t(" (ou "), f("\\pi d"), t(" avec le diamètre d = 2r), pas "), f("\\pi r"), t(".")]),
  ];
}

function etapesArc(e: ExercicePolygonesArcsSecteurs, phase: "arcElementaire" | "arcMultiPas", sq: string): EtapeCorrection[] {
  const { r, n } = e;
  const k = phase === "arcMultiPas" ? (e.arcMultiPas?.k ?? 1) : 1;
  const lignesK: LigneCalcul[] = phase === "arcMultiPas" ? [ligne(`k=${k}`, "nombre de côtés du polygone couverts par l'arc")] : [];
  const utilisation: FragmentConsigne[] =
    phase === "arcElementaire"
      ? [t(`Les ${n} sommets partagent le cercle en ${n} arcs égaux, d'angle au centre `), f(`\\dfrac{2\\pi}{${n}}`), t(" : l'arc entre deux sommets consécutifs vaut "), f(`\\dfrac{1}{${n}}`), t(` de la circonférence ${COURS_POLYGONES}.`)]
      : [t(`L'arc couvre k côtés du polygone sur ${n} : son angle au centre vaut `), f(`k\\times\\dfrac{2\\pi}{${n}}`), t(", il représente "), f(`\\dfrac{k}{${n}}`), t(` de la circonférence ${COURS_POLYGONES}.`)];
  const etapes: EtapeCorrection[] = [
    utilise(sq, utilisation),
    calcul(sq, [
      ...lignesK,
      ...lignesFraction(k, n, 2 * r, latexAideNiveau2(e, phase).replace("\\dfrac{k}", `\\dfrac{${k}}`), phase === "arcMultiPas" ? "on remplace k, n et r" : "on remplace n et r", jf("on calcule ", { l: `2\\pi\\times ${r}=${piBrut(2 * r, 1)}` })),
    ]),
    resultat(sq, [f(valeurPhaseLatex(e, phase))]),
  ];
  if (phase === "arcMultiPas") {
    etapes.push(verification(sq, [t(`L'arc couvre ${k} arcs élémentaires :`)], sansDoublons([ligne(`${k}\\times ${formatArcElementaireAttendueLatex(e)}=${piBrut(2 * r * k, n)}`), ligne(`=${piQ(q(2 * r * k, n))}`, "même longueur ✓")])));
    etapes.push(piege(sq, [t(`On compte les côtés couverts (${k}), pas les sommets (${k + 1}).`)]));
  }
  return etapes;
}

function etapesSecteur(e: ExercicePolygonesArcsSecteurs, phase: "secteurElementaire" | "secteurMultiPas", sq: string): EtapeCorrection[] {
  const { r, n } = e;
  const k = phase === "secteurMultiPas" ? (e.secteurMultiPas?.k ?? 1) : 1;
  const lignesK: LigneCalcul[] = phase === "secteurMultiPas" ? [ligne(`k=${k}`, "nombre de côtés du polygone couverts par le secteur")] : [];
  const utilisation: FragmentConsigne[] =
    phase === "secteurElementaire"
      ? [t(`Les ${n} rayons menés aux sommets partagent le disque en ${n} secteurs égaux : le secteur entre deux sommets consécutifs vaut `), f(`\\dfrac{1}{${n}}`), t(` de l'aire du disque ${COURS_POLYGONES}.`)]
      : [t(`Le secteur couvre k côtés du polygone sur ${n} : il vaut `), f(`\\dfrac{k}{${n}}`), t(` de l'aire du disque ${COURS_POLYGONES}.`)];
  const etapes: EtapeCorrection[] = [
    utilise(sq, utilisation),
    calcul(sq, [
      ...lignesK,
      ...lignesFraction(k, n, r * r, latexAideNiveau2(e, phase).replace("\\dfrac{k}", `\\dfrac{${k}}`), phase === "secteurMultiPas" ? "on remplace k, n et r" : "on remplace n et r", jf("on calcule ", { l: `\\pi\\times ${r}^2=${piBrut(r * r, 1)}` })),
    ]),
    resultat(sq, [f(valeurPhaseLatex(e, phase))]),
  ];
  if (phase === "secteurMultiPas") {
    etapes.push(verification(sq, [t(`Le secteur couvre ${k} secteurs élémentaires :`)], sansDoublons([ligne(`${k}\\times ${formatSecteurElementaireAttendueLatex(e)}=${piBrut(r * r * k, n)}`), ligne(`=${piQ(q(r * r * k, n))}`, "même aire ✓")])));
    etapes.push(piege(sq, [t(`On compte les côtés couverts (${k}), pas les sommets (${k + 1}).`)]));
  } else {
    etapes.push(piege(sq, [t("Un secteur est une fraction de l'aire du disque "), f("\\pi r^2"), t(", pas de la circonférence.")]));
  }
  return etapes;
}

export function correctionDetailleePolygonesArcsSecteurs(e: ExercicePolygonesArcsSecteurs): EtapeCorrection[] {
  return finaliserCorrige(
    sequencePolygone(e).flatMap((phase) => {
      const sq = lettrePolygone(e, phase);
      if (phase === "cercleEntier") return etapesCercleEntier(e, sq);
      if (phase === "arcElementaire" || phase === "arcMultiPas") return etapesArc(e, phase, sq);
      return etapesSecteur(e, phase, sq);
    }),
  );
}
