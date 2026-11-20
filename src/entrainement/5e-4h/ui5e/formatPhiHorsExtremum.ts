import type { ExercicePhiHorsExtremum } from "../core5e/phiHorsExtremum";
import type { AideEcran, ChampEcran, Frag, OptionEcran } from "./ecransTrigo.types";
import { lx, tx } from "./ecransTrigo.types";
import { exactA, nbL, nbT, piL, q, qL, qSub, qVal } from "./nombresTrigo";

/**
 * Couche C — textes de `5gen54` « Choisir φ quand le départ n'est pas un extremum ». SOURCE UNIQUE
 * des consignes, champs, aides, réponses attendues et écritures du modèle : l'écran, le
 * récapitulatif, le corrigé détaillé et l'adaptateur papier en dérivent.
 */

type E = ExercicePhiHorsExtremum;
export type PhasePhi = "parametres" | "sinus" | "candidats" | "choix" | "maximum";
export const PHASES_PHI: PhasePhi[] = ["parametres", "sinus", "candidats", "choix", "maximum"];

// ============================================================================
// Écritures.
// ============================================================================

export const vL = (e: E, x: number) => nbL(x, e.contexte.decimales);
export const vT = (e: E, x: number) => nbT(x, e.contexte.decimales);
export const TL = (e: E) => nbL(qVal(e.T), 2);
export const TT = (e: E) => nbT(qVal(e.T), 2);

/** ω exact : « \dfrac{\pi}{4} », « 2\pi ». */
export const omegaL = (e: E) => piL(e.omegaPi);

/** ω devant t : « \dfrac{\pi}{4}t », « \pi t ». */
export function omegaTL(e: E): string {
  const o = omegaL(e);
  return /\\pi$/.test(o) ? `${o} t` : `${o}t`;
}

/** sin φ = m : exacte (fraction ou décimal court), sinon fraction ≈ décimal. */
export function mL(e: E): string {
  if (e.mode === "exact") return qL(e.m);
  if (e.m.d === 1 || exactA(qVal(e.m), 4)) return nbL(qVal(e.m), 4);
  return `${qL(e.m)}\\approx ${nbL(qVal(e.m), 4)}`;
}
/** m seul (sans « ≈ ») pour une substitution : fraction ou décimal exact. */
export function mValeurL(e: E): string {
  if (e.mode === "exact") return qL(e.m);
  if (exactA(qVal(e.m), 4)) return nbL(qVal(e.m), 4);
  return qL(e.m);
}

/** Écriture d'un angle candidat : exact (multiple de π) ou arrondi au centième (« \approx 0{,}36 »). */
export function angleL(exact: ReturnType<typeof q> | null, valeur: number, avecEgal = false): string {
  if (exact) return `${avecEgal ? "=" : ""}${piL(exact)}`;
  return `${avecEgal ? "\\approx " : ""}${nbL(valeur, 2, true)}`;
}

export function phi1L(e: E, egal = false): string {
  return angleL(e.phi1Pi, e.phi1, egal);
}
export function phi2L(e: E, egal = false): string {
  return angleL(e.phi2Pi, e.phi2, egal);
}
export function phiL(e: E, egal = false): string {
  return angleL(e.phiPi, e.phi, egal);
}

/** Instant du premier maximum : « \dfrac{4}{3}\approx 1{,}33 », « 9 », « \approx 1{,}54 ». */
export function tMaxL(e: E): string {
  if (e.tMaxQ) {
    if (e.tMaxQ.d === 1) return `${e.tMaxQ.n}`;
    if (exactA(e.tMax, 2)) return nbL(e.tMax, 2);
    return `${qL(e.tMaxQ)}\\approx ${nbL(e.tMax, 2)}`;
  }
  return `\\approx ${nbL(e.tMax, 2, true)}`;
}

/** Modèle complet avec le φ retenu (ou un φ donné). */
export function modeleL(e: E, phiEcrit = phiL(e)): string {
  const nom = e.contexte.nomFonction;
  const p = phiEcrit === "0" ? "" : phiEcrit.startsWith("-") ? phiEcrit : `+${phiEcrit}`;
  // φ arrondi (mode « calcul ») : le modèle écrit est approché.
  const rel = e.phiPi || phiEcrit === "0" ? "=" : "\\approx ";
  return `${nom}(t)${rel}${vL(e, e.A)}\\sin\\left(${omegaTL(e)}${p}\\right)+${vL(e, e.b)}`;
}

/** Forme générale du modèle. */
export function formeL(e: E): string {
  return `${e.contexte.nomFonction}(t)=A\\sin(\\omega t+\\varphi)+b`;
}

function verbe(e: E): string {
  return e.sens === "monte" ? e.contexte.verbeMonte : e.contexte.verbeDescend;
}

/** Valeur de départ en texte, avec « (sous l'eau) » si négative. */
function y0T(e: E): string {
  return `${vT(e, e.y0)} ${e.contexte.unite}${e.y0 < 0 ? " (sous l'eau)" : ""}`;
}

/** La situation, sans la forme du modèle (papier et écran). */
export function situation(e: E): Frag[] {
  const c = e.contexte;
  const T = TT(e);
  switch (c.id) {
    case "grandeRoue":
      return [tx(`Une grande roue a un rayon de ${vT(e, e.r!)} m ; son centre est à ${vT(e, e.h!)} m du sol et elle fait un tour complet en ${T} minutes. À l'instant `), lx("t=0"), tx(`, une nacelle est à ${y0T(e)} du sol et elle ${verbe(e)}.`)];
    case "roueAubes":
      return [
        tx(`Une roue à aubes a un rayon de ${vT(e, e.r!)} m ; son axe est à ${vT(e, e.h!)} m au-dessus de la surface de l'eau et elle fait un tour en ${T} secondes. On suit l'extrémité d'une pale ; sa hauteur est comptée à partir de la surface de l'eau (négative sous l'eau). À l'instant `),
        lx("t=0"),
        tx(`, elle est à ${y0T(e)} et elle ${verbe(e)}.`),
      ];
    case "pedale":
      return [tx(`La manivelle d'un pédalier mesure ${vT(e, e.r!)} cm ; l'axe du pédalier est à ${vT(e, e.h!)} cm du sol et le cycliste fait un tour de pédale en ${T} s. À l'instant `), lx("t=0"), tx(`, la pédale est à ${y0T(e)} du sol et elle ${verbe(e)}.`)];
    case "maree":
      return [tx(`Dans un port, la hauteur d'eau varie entre ${vT(e, e.min)} m à basse mer et ${vT(e, e.max)} m à pleine mer ; on compte ${T} heures entre deux pleines mers. À l'instant `), lx("t=0"), tx(`, la hauteur d'eau est de ${y0T(e)} et la mer ${verbe(e)}.`)];
    case "ressort":
      return [tx(`Une masse suspendue à un ressort oscille verticalement : sa hauteur au-dessus du sol varie entre ${vT(e, e.min)} cm et ${vT(e, e.max)} cm, et une oscillation complète dure ${T} s. À l'instant `), lx("t=0"), tx(`, la masse est à ${y0T(e)} du sol et elle ${verbe(e)}.`)];
    default:
      return [tx(`Au fil de l'année, la température de l'eau d'un lac varie entre ${vT(e, e.min)} °C et ${vT(e, e.max)} °C, avec une période de ${T} mois. À l'instant `), lx("t=0"), tx(`, l'eau est à ${y0T(e)} et sa température ${verbe(e)}.`)];
  }
}

function nomGrandeur(e: E): string {
  switch (e.contexte.id) {
    case "grandeRoue":
      return "la hauteur de la nacelle (en m)";
    case "roueAubes":
      return "la hauteur de l'extrémité de la pale (en m)";
    case "pedale":
      return "la hauteur de la pédale (en cm)";
    case "maree":
      return "la hauteur d'eau (en m)";
    case "ressort":
      return "la hauteur de la masse (en cm)";
    default:
      return "la température de l'eau (en °C)";
  }
}

/** Forme imposée du modèle (fin de l'énoncé). */
export function formeImposee(e: E): Frag[] {
  return [
    tx(` On modélise ${nomGrandeur(e)} par `),
    lx(formeL(e)),
    tx(", avec "),
    lx("A>0"),
    tx(", "),
    lx("\\omega>0"),
    tx(" et "),
    lx("\\varphi\\in\\,]-\\pi\\,;\\pi]"),
    tx(` (t en ${e.contexte.tempsLong}).`),
  ];
}

export function consigneGenerale(e: E): Frag[] {
  return [...situation(e), ...formeImposee(e)];
}

// ============================================================================
// Écrans.
// ============================================================================

export function libelle(_e: E, phase: PhasePhi): string {
  switch (phase) {
    case "parametres":
      return "A, b et ω";
    case "sinus":
      return "sin φ";
    case "candidats":
      return "Candidats pour φ";
    case "choix":
      return "Modèle";
    case "maximum":
      return "Premier maximum";
  }
}

const PRECISION_CENTIEME = " (valeur exacte ou arrondie au centième)";

export function consigne(e: E, phase: PhasePhi): Frag[] {
  switch (phase) {
    case "parametres":
      return [tx("Calcule l'amplitude "), lx("A"), tx(", le décalage vertical "), lx("b"), tx(" et la pulsation "), lx("\\omega"), tx(".")];
    case "sinus":
      return [tx("Écris la condition initiale "), lx(`${e.contexte.nomFonction}(0)=${vL(e, e.y0)}`), tx(" et isole le sinus. Que vaut "), lx("\\sin\\varphi"), tx(" ?")];
    case "candidats":
      return [
        tx("Donne les deux valeurs de "),
        lx("\\varphi"),
        tx(" dans "),
        lx("]-\\pi\\,;\\pi]"),
        tx(" dont le sinus vaut "),
        lx(mValeurL(e)),
        tx(e.mode === "exact" ? ", en radians (dans n'importe quel ordre)." : ", en radians, arrondies au centième (dans n'importe quel ordre)."),
      ];
    case "choix":
      return [tx(`À l'instant `), lx("t=0"), tx(`, ${e.contexte.sujet} ${verbe(e)}. Quel candidat faut-il garder ?`)];
    case "maximum":
      return [tx("Vérifie ton modèle : à quel instant "), lx("t>0"), tx(` ${e.contexte.phraseMax} pour la première fois ?${PRECISION_CENTIEME}`)];
  }
}

export function champs(e: E, phase: PhasePhi): ChampEcran[] {
  const u = e.contexte.unite;
  switch (phase) {
    case "parametres":
      return [
        { label: "A", labelLatex: "A =", unite: u, placeholder: "ex. : 15" },
        { label: "b", labelLatex: "b =", unite: u, placeholder: "ex. : 17" },
        { label: "ω", labelLatex: "\\omega =", placeholder: "ex. : π/4 ou 0,79" },
      ];
    case "sinus":
      return [{ label: "sin φ", labelLatex: "\\sin\\varphi =", placeholder: e.mode === "exact" ? "ex. : 1/2" : "ex. : 0,35" }];
    case "candidats":
      return [
        { label: "φ₁", labelLatex: "\\varphi_1 =", placeholder: e.mode === "exact" ? "ex. : π/6" : "ex. : 0,36" },
        { label: "φ₂", labelLatex: "\\varphi_2 =", placeholder: e.mode === "exact" ? "ex. : 5π/6" : "ex. : 2,78" },
      ];
    case "maximum":
      return [{ label: "t", labelLatex: "t =", unite: e.contexte.tempsLong, placeholder: "ex. : 4/3 ou 1,33" }];
    default:
      return [];
  }
}

export function optionsChoix(e: E): OptionEcran[] {
  const libelles: Record<"phi1" | "phi2" | "deux", Frag[]> = {
    phi1: [lx(`\\varphi=${phi1L(e)}`)],
    phi2: [lx(`\\varphi=${phi2L(e)}`)],
    deux: [tx("Les deux conviennent : ils donnent la même fonction.")],
  };
  return e.ordreOptions.map((id) => ({ id, fragments: libelles[id] }));
}

export function idChoixAttendu(e: E): "phi1" | "phi2" {
  return e.sens === "monte" ? "phi1" : "phi2";
}

// ============================================================================
// Aides (jamais la réponse finale).
// ============================================================================

/** Parenthèses autour d'une expression composée ou négative soustraite / ajoutée. */
const par = (s: string) => (/[+-]/.test(s) ? `(${s})` : s);

function maxMinL(e: E): { max: string; min: string } {
  if (e.variante === "roue") return { max: `${vL(e, e.h!)}+${vL(e, e.r!)}`, min: `${vL(e, e.h!)}-${vL(e, e.r!)}` };
  return { max: vL(e, e.max), min: vL(e, e.min) };
}

export function aide1(e: E, phase: PhasePhi): AideEcran {
  switch (phase) {
    case "parametres":
      return { texte: [tx("L'amplitude et le décalage vertical viennent des valeurs extrêmes, la pulsation de la période (cours, § 8) :")], latex: "A=\\dfrac{\\max-\\min}{2}\\qquad b=\\dfrac{\\max+\\min}{2}\\qquad \\omega=\\dfrac{2\\pi}{T}" };
    case "sinus":
      return { texte: [tx("Remplace "), lx("t"), tx(" par 0 dans le modèle, puis isole le sinus (retranche "), lx("b"), tx(", divise par "), lx("A"), tx(") :")], latex: `${e.contexte.nomFonction}(0)=A\\sin\\varphi+b` };
    case "candidats":
      return { texte: [tx("Hors d'un extremum, deux angles de "), lx("]-\\pi\\,;\\pi]"), tx(" ont le même sinus, symétriques par rapport à l'axe vertical du cercle (cours, § 8) :")], latex: "\\varphi_1=\\arcsin m\\qquad \\varphi_2=\\pi-\\arcsin m" };
    case "choix":
      return { texte: [tx("Au départ, l'argument vaut "), lx("u=\\varphi"), tx(". Sur le cercle, le point monte quand il est à droite de l'axe vertical, c'est-à-dire quand son cosinus est positif :")], latex: "\\text{la grandeur monte}\\iff\\cos\\varphi>0" };
    case "maximum":
      return { texte: [tx("Le maximum est atteint quand le sinus vaut 1 :")], latex: "\\omega t+\\varphi=\\dfrac{\\pi}{2}+2k\\pi\\qquad(k\\in\\mathbb{Z})" };
  }
}

export function aide2(e: E, phase: PhasePhi): AideEcran | null {
  const nom = e.contexte.nomFonction;
  switch (phase) {
    case "parametres": {
      const { max, min } = maxMinL(e);
      return {
        texte: [tx(e.variante === "roue" ? "Ici, le point le plus haut est à « centre + rayon », le plus bas à « centre − rayon », et un tour dure " : "Ici, avec les valeurs extrêmes de l'énoncé et une période de "), lx(`T=${TL(e)}`), tx(" :")],
        latex: `A=\\dfrac{${max}-${par(min)}}{2}\\qquad b=\\dfrac{${max}+${par(min)}}{2}\\qquad \\omega=\\dfrac{2\\pi}{${qVal(e.T) === 1 ? "T" : TL(e)}}`,
      };
    }
    case "sinus":
      return { texte: [tx("Ici, avec les valeurs de "), lx("A"), tx(" et "), lx("b"), tx(" :")], latex: `${vL(e, e.A)}\\sin\\varphi+${vL(e, e.b)}=${vL(e, e.y0)}` };
    case "candidats":
      return {
        texte: [tx("Ici, "), lx(`m=${mValeurL(e)}`), tx(". Si "), lx("\\pi-\\arcsin m"), tx(" dépasse "), lx("\\pi"), tx(", retire "), lx("2\\pi"), tx(" pour revenir dans "), lx("]-\\pi\\,;\\pi]"), tx(" :")],
        latex: `\\varphi_1=\\arcsin\\left(${mValeurL(e)}\\right)\\qquad \\varphi_2=\\pi-\\arcsin\\left(${mValeurL(e)}\\right)`,
      };
    case "choix":
      return null;
    case "maximum":
      return {
        texte: [tx("Ici, avec le "), lx("\\varphi"), tx(" retenu ; isole "), lx("t"), tx(", puis prends le plus petit "), lx("t"), tx(" strictement positif :")],
        latex: `${omegaTL(e)}${phiL(e) === "0" ? "" : phiL(e).startsWith("-") ? phiL(e) : `+${phiL(e)}`}=\\dfrac{\\pi}{2}+2k\\pi`,
      };
  }
  void nom;
}

export function messageIllisible(_e: E, phase: PhasePhi): string {
  if (phase === "parametres") return "Nombre non reconnu : écris un nombre comme 15, 2,5 ou π/4 (« π » ou « pi »). Cette saisie ne compte pas comme une tentative.";
  if (phase === "candidats") return "Angle non reconnu : écris un angle en radians comme π/6, −5π/6 ou 0,36. Cette saisie ne compte pas comme une tentative.";
  return "Nombre non reconnu : écris un nombre comme 1/2, 0,35 ou 4/3. Cette saisie ne compte pas comme une tentative.";
}

// ============================================================================
// Réponses attendues et récapitulatif.
// ============================================================================

export function omegaReponseL(e: E): string {
  const o = omegaL(e);
  return exactA(e.omega, 2) ? `\\omega=${o}` : `\\omega=${o}\\approx ${nbL(e.omega, 2)}`;
}

export function reponse(e: E, phase: PhasePhi): Frag[] {
  switch (phase) {
    case "parametres":
      return [lx(`A=${vL(e, e.A)}`), tx(" ; "), lx(`b=${vL(e, e.b)}`), tx(" ; "), lx(omegaReponseL(e))];
    case "sinus":
      return [lx(`\\sin\\varphi=${mL(e)}`)];
    case "candidats":
      return [lx(`\\varphi_1${e.phi1Pi ? "=" : "\\approx "}${phi1L(e)}`), tx(" ; "), lx(`\\varphi_2${e.phi2Pi ? "=" : "\\approx "}${phi2L(e)}`)];
    case "choix":
      return [lx(`\\varphi${e.phiPi ? "=" : "\\approx "}${phiL(e)}`), tx(e.sens === "monte" ? " (son cosinus est positif : la grandeur monte), d'où " : " (son cosinus est négatif : la grandeur descend), d'où "), lx(modeleL(e))];
    case "maximum":
      return [lx(`t${e.tMaxQ ? "=" : ""}${tMaxL(e)}`), tx(` ${e.contexte.tempsCourt}`)];
  }
}

export function recap(e: E, phase: PhasePhi): Frag[] {
  if (phase === "choix") return [lx(modeleL(e))];
  return reponse(e, phase);
}

export function explicationChoix(e: E): string {
  const garde = e.sens === "monte" ? "φ₁" : "φ₂";
  return `Au départ, ${e.sens === "monte" ? "la grandeur monte : il faut cos φ > 0" : "la grandeur descend : il faut cos φ < 0"} ; c'est ${garde}. Les deux candidats ont le même sinus mais donnent deux fonctions différentes.`;
}

/** π/2 − φ (exact) pour le corrigé. */
export function demiPiMoinsPhi(e: E) {
  return e.phiPi ? qSub(q(1, 2), e.phiPi) : null;
}
