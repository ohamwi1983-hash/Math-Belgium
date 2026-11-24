import type { ExerciceFamilleC, ZoneVennTrois } from "../core6e/probabilitesEnsembles.types";
import { NOMS_C, ZONES_ECRAN1_C, ZONES_ECRAN2_C, effectifEnsembleC, effectifInterC, fractionEcran3C, fractionEcran4C } from "../moteur6e/verificationVennTrois";
import { vennTroisHtml } from "./corrigeProbabilites";

/**
 * Couche C (6e) — textes, champs, aides et figure de la famille C de `6gen30` (diagramme de Venn à
 * trois ensembles), partagés par l'écran, le récapitulatif, l'adaptateur papier et le corrigé.
 * Méthode imposée par les écrans : « du centre vers l'extérieur » (centre, puis les zones « deux
 * seulement », puis les zones « un seul », puis l'extérieur).
 */

type Fragment = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };
const t = (valeur: string): Fragment => ({ type: "texte", valeur });
const l = (valeur: string): Fragment => ({ type: "latex", valeur });

const ANNONCE_PRECISION = " Donne chaque probabilité sous forme exacte, ou décimale arrondie au centième (au millième si la probabilité est inférieure à 0,1), ou en %.";

function pgcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) || 1 : pgcd(b, a % b);
}

function fractionL(n: number, d: number): string {
  if (n === 0) return "0";
  const g = pgcd(n, d);
  return d / g === 1 ? String(n / g) : `\\dfrac{${n / g}}{${d / g}}`;
}

/** Probabilité exacte puis « = » décimal court ou « ≈ » arrondi (centième, millième sous 0,1). */
export function probaL(n: number, d: number): string {
  const f = fractionL(n, d);
  if (n % d === 0) return f;
  const v = n / d;
  for (let k = 0; k <= 4; k++) if (Math.abs(v * 10 ** k - Math.round(v * 10 ** k)) < 1e-9) return `${f}=${v.toFixed(k).replace(".", "{,}")}`;
  return `${f}\\approx ${v.toFixed(v >= 0.1 ? 2 : 3).replace(".", "{,}")}`;
}

/** Zone en LaTeX : « A\cap B\cap\overline{C} ». */
export function zoneL(z: ZoneVennTrois): string {
  return [0, 1, 2].map((i) => (z[i] === "1" ? NOMS_C[i] : `\\overline{${NOMS_C[i]}}`)).join("\\cap ");
}

/** Zone en clair (libellé de champ) : « A, B et C », « A et B seulement », « A seulement », « aucun ». */
export function zoneTexte(z: ZoneVennTrois): string {
  const dedans = [0, 1, 2].filter((i) => z[i] === "1").map((i) => NOMS_C[i]);
  if (dedans.length === 3) return "A, B et C";
  if (dedans.length === 2) return `${dedans[0]} et ${dedans[1]} seulement`;
  if (dedans.length === 1) return `${dedans[0]} seulement`;
  return "aucun des trois";
}

export function consigneGeneraleC(e: ExerciceFamilleC): Fragment[] {
  const c = e.contexte;
  return [t(`${c.introduction.replace("{N}", String(e.total))} On choisit ${c.individu} au hasard. A : ${c.definitions[0]}. B : ${c.definitions[1]}. C : ${c.definitions[2]}.`)];
}

/** Données : n(A), n(B), n(C), les trois intersections deux à deux, l'intersection des trois. */
export function blocDonneesC(e: ExerciceFamilleC): string[] {
  return [
    `N=${e.total}`,
    `n(A)=${effectifEnsembleC(e, 0)}`,
    `n(B)=${effectifEnsembleC(e, 1)}`,
    `n(C)=${effectifEnsembleC(e, 2)}`,
    `n(A\\cap B)=${effectifInterC(e, 0, 1)}`,
    `n(A\\cap C)=${effectifInterC(e, 0, 2)}`,
    `n(B\\cap C)=${effectifInterC(e, 1, 2)}`,
    `n(A\\cap B\\cap C)=${e.zones["111"]}`,
  ];
}

/** Probabilité de l'écran 3, en LaTeX (membre de gauche). */
export function latexDemandeC(e: ExerciceFamilleC): string {
  return e.demandeEcran3 === "union" ? "P(A\\cup B\\cup C)" : e.demandeEcran3 === "exactementUn" ? "P(\\text{exactement un})" : "P(\\text{au moins deux})";
}

export function phraseDemandeC(e: ExerciceFamilleC): Fragment[] {
  if (e.demandeEcran3 === "union") return [t("la probabilité "), l("P(A\\cup B\\cup C)"), t(" (au moins un des trois)")];
  if (e.demandeEcran3 === "exactementUn") return [t("la probabilité que l'individu choisi soit dans exactement un des trois ensembles")];
  return [t("la probabilité que l'individu choisi soit dans au moins deux des trois ensembles")];
}

/** Probabilité conditionnelle de l'écran 4, en LaTeX. */
export function latexConditionnelleC(e: ExerciceFamilleC): string {
  const c = e.conditionnelle;
  return c.type === "XsachantNonY" ? `P(${NOMS_C[c.x]}|\\overline{${NOMS_C[c.y]}})` : `P(${NOMS_C[c.x]}|\\text{au moins deux})`;
}

export function phraseConditionnelleC(e: ExerciceFamilleC): Fragment[] {
  const c = e.conditionnelle;
  if (c.type === "XsachantNonY") return [t("la probabilité conditionnelle "), l(latexConditionnelleC(e)), t(` (parmi ceux qui ne sont pas dans ${NOMS_C[c.y]}, la proportion de ceux qui sont dans ${NOMS_C[c.x]})`)];
  return [t("la probabilité conditionnelle "), l(latexConditionnelleC(e)), t(` (parmi ceux qui sont dans au moins deux des trois ensembles, la proportion de ceux qui sont dans ${NOMS_C[c.x]})`)];
}

export type PhaseC = "cEcran1" | "cEcran2" | "cEcran3" | "cEcran4";

export function consigneEcranC(e: ExerciceFamilleC, phase: PhaseC): Fragment[] {
  if (phase === "cEcran1") return [t("Complète le diagramme de Venn en partant du centre : l'effectif de la zone "), l("A\\cap B\\cap C"), t(", puis celui de chaque zone « deux ensembles seulement ».")];
  if (phase === "cEcran2") return [t("Continue vers l'extérieur : l'effectif de chaque zone « un seul ensemble », puis celui de la zone extérieure (aucun des trois).")];
  if (phase === "cEcran3") return [t("Calcule "), ...phraseDemandeC(e), t("."), t(ANNONCE_PRECISION)];
  return [t("Calcule "), ...phraseConditionnelleC(e), t("."), t(ANNONCE_PRECISION)];
}

export function champsC(e: ExerciceFamilleC, phase: PhaseC): { label: string; placeholder: string }[] {
  if (phase === "cEcran1" || phase === "cEcran2") {
    const zones = phase === "cEcran1" ? ZONES_ECRAN1_C : ZONES_ECRAN2_C;
    return zones.map((z, i) => ({ label: `${zoneTexte(z).replace(/^./, (c) => c.toUpperCase())} :`, placeholder: i % 2 ? "ex : 17" : "effectif" }));
  }
  if (phase === "cEcran3") return [{ label: `${e.demandeEcran3 === "union" ? "P(A ∪ B ∪ C)" : e.demandeEcran3 === "exactementUn" ? "P(exactement un)" : "P(au moins deux)"} =`, placeholder: "ex : 2/97" }];
  const c = e.conditionnelle;
  return [{ label: c.type === "XsachantNonY" ? `P(${NOMS_C[c.x]} | ${NOMS_C[c.y]}̄) =` : `P(${NOMS_C[c.x]} | au moins deux) =`, placeholder: "ex : 0,021" }];
}

export function aideNiveau1C(_e: ExerciceFamilleC, phase: PhaseC): { texte: string; latex: string | null } {
  if (phase === "cEcran1") return { texte: "Méthode « du centre vers l'extérieur » : la zone centrale est donnée ; une intersection de deux ensembles contient sa zone « deux seulement » et le centre.", latex: "n(A\\cap B)=n(A\\cap B\\cap\\overline{C})+n(A\\cap B\\cap C)" };
  if (phase === "cEcran2") return { texte: "Un ensemble est fait de quatre zones : la sienne seule, ses deux zones « deux seulement » et le centre. L'extérieur, c'est le total moins les sept zones des disques.", latex: "n(A)=n(A\\text{ seul})+n(A\\cap B\\text{ seul})+n(A\\cap C\\text{ seul})+n(A\\cap B\\cap C)" };
  if (phase === "cEcran3") return { texte: "Additionne les effectifs des zones qui réalisent l'événement, puis divise par l'effectif total (équiprobabilité).", latex: "P(E)=\\dfrac{n(E)}{N}" };
  return { texte: "Une probabilité conditionnelle se calcule dans la condition : effectif des zones de la condition qui réalisent l'événement, sur l'effectif de la condition.", latex: "P(X|Y)=\\dfrac{n(X\\cap Y)}{n(Y)}" };
}

export function aideNiveau2C(e: ExerciceFamilleC, phase: PhaseC): { texte: string; latex: string | null } {
  if (phase === "cEcran1") return { texte: "Pour la zone « A et B seulement », retire le centre de l'intersection (calcul non fait) :", latex: `n(A\\cap B\\cap\\overline{C})=${effectifInterC(e, 0, 1)}-${e.zones["111"]}` };
  if (phase === "cEcran2") return { texte: "Pour la zone « A seulement », retire de n(A) les trois zones de A déjà connues (calcul non fait) :", latex: `n(A\\text{ seulement})=${effectifEnsembleC(e, 0)}-${e.zones["110"]}-${e.zones["101"]}-${e.zones["111"]}` };
  if (phase === "cEcran3") {
    const texte = e.demandeEcran3 === "union" ? "Zones concernées : les sept zones des disques, c'est-à-dire tout sauf l'extérieur." : e.demandeEcran3 === "exactementUn" ? "Zones concernées : les trois zones « un seul ensemble »." : "Zones concernées : les trois zones « deux seulement » et le centre.";
    return { texte, latex: `N=${e.total}` };
  }
  const c = e.conditionnelle;
  return c.type === "XsachantNonY"
    ? { texte: `La condition « pas dans ${NOMS_C[c.y]} » regroupe les quatre zones hors du disque ${NOMS_C[c.y]} ; son effectif :`, latex: `n(\\overline{${NOMS_C[c.y]}})=${e.total}-${effectifEnsembleC(e, c.y)}` }
    : { texte: "La condition « au moins deux » regroupe les trois zones « deux seulement » et le centre ; il reste à garder celles qui sont dans l'ensemble demandé.", latex: null };
}

export function reponseC(e: ExerciceFamilleC, phase: PhaseC): string[] {
  if (phase === "cEcran1" || phase === "cEcran2") return (phase === "cEcran1" ? ZONES_ECRAN1_C : ZONES_ECRAN2_C).map((z) => `n(${zoneL(z)})=${e.zones[z]}`);
  const [n, d] = phase === "cEcran3" ? fractionEcran3C(e) : fractionEcran4C(e);
  return [`${phase === "cEcran3" ? latexDemandeC(e) : latexConditionnelleC(e)}=${probaL(n, d)}`];
}

export const LIBELLE_PHASE_C: Record<PhaseC, string> = {
  cEcran1: "Étape 1 (centre et zones « deux seulement »)",
  cEcran2: "Étape 2 (zones « un seul » et extérieur)",
  cEcran3: "Étape 3 (probabilité)",
  cEcran4: "Étape 4 (probabilité conditionnelle)",
};

/** Figure de l'écran : les zones déjà trouvées (étapes closes) sont écrites, les autres « ? ». */
export function vennEcranHtml(e: ExerciceFamilleC, phase: PhaseC): string {
  const connues = new Set<ZoneVennTrois>(phase === "cEcran1" ? [] : phase === "cEcran2" ? ZONES_ECRAN1_C : [...ZONES_ECRAN1_C, ...ZONES_ECRAN2_C]);
  const valeurs: Partial<Record<ZoneVennTrois, string>> = {};
  for (const z of Object.keys(e.zones) as ZoneVennTrois[]) valeurs[z] = connues.has(z) ? String(e.zones[z]) : "?";
  return vennTroisHtml(valeurs, "Diagramme de Venn à trois ensembles");
}
