import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceParametresSinusoide } from "../../core5e/parametresSinusoide.types";
import { ORDRE_PHASES_SINUSOIDE, type PhaseParametresSinusoide } from "../../moteur5e/typesParametresSinusoide";
import { formatAmplitudeAbsolueLatex, formatChampParametreLatex, formatFrequenceLatex, formatRationnelPiLatex } from "../../ui5e/formatParametresSinusoide";
import { COURS_PARAMETRES, finaliserCorrige, jf, lignesFinRP, par, rpBrut, rpLatex, rpReduit, sansDoublons, type RP } from "../../ui5e/corrigeTrigonometrie1";

/**
 * Corrigé détaillé « comme au tableau » de 5gen8 (paramètres d'une fonction sinusoïdale) — règle
 * `.claude/rules/feuilles-evaluations.md`. Sept étapes, une par ÉCRAN (`ORDRE_PHASES_SINUSOIDE` :
 * amplitude, pulsation ω, période T, fréquence, déphasage φ, décalage horizontal Φ, décalage
 * vertical b). Les lectures (A, ω, b ; φ en forme développée ; Φ en forme pré-factorisée) ont une
 * ligne par chose lue, avec sa relation ; les calculs (T = 2π/ω, f = 1/T, φ = −ωΦ, Φ = −φ/ω) une
 * opération par ligne, en valeurs EXACTES (rationnels, multiples de π). « Résultat » = la réponse de
 * l'écran (`formatChampParametreLatex`). Vérifications : ωT = 2π, −ωΦ = φ.
 * SANS `docx` : importé par l'adaptateur ET par `App5gen8.tsx` (étape échouée).
 */

const t = texte;
const f = latex;
type E = ExerciceParametresSinusoide;

export const LETTRE_SINUSOIDE: Record<PhaseParametresSinusoide, string> = { amplitude: "a", pulsation: "b", periode: "c", frequence: "d", dephasage: "e", phi: "f", decalage: "g" };

/** Écrans de pure lecture : A, ω, b, et φ (forme développée) ou Φ (forme pré-factorisée). */
export function lettresLectureSinusoide(e: E): string[] {
  return e.forme === "developpee" ? ["a", "b", "e", "g"] : ["a", "b", "f", "g"];
}

const rp = (v: { numerateur: number; denominateur: number; degrePi: -1 | 0 | 1 }): RP => rpReduit({ numerateur: v.numerateur, denominateur: v.denominateur, degrePi: v.degrePi });
const estNul = (v: RP) => v.numerateur === 0;
const estUn = (v: RP) => v.degrePi === 0 && v.numerateur === v.denominateur;

/** A signé, tel qu'il multiplie le sinus (le « 1 » écrit en clair). */
function amplitudeSigneeLatex(e: E): string {
  return `${e.A.signe < 0 ? "-" : ""}${formatAmplitudeAbsolueLatex(e.A)}`;
}

/** « x − Φ » lu dans la parenthèse de la forme pré-factorisée (« x + k » si Φ < 0, « x » si Φ = 0). */
function termeXLatex(phi: RP): string {
  if (estNul(phi)) return "x";
  return phi.numerateur > 0 ? `x-${rpLatex(phi)}` : `x+${rpLatex({ ...phi, numerateur: -phi.numerateur })}`;
}

function etapeResultat(e: E, phase: PhaseParametresSinusoide): EtapeCorrection {
  return resultat(LETTRE_SINUSOIDE[phase], [f(formatChampParametreLatex(e, phase))]);
}

// ============================================================================
// Étapes.
// ============================================================================

function etapesAmplitude(e: E): EtapeCorrection[] {
  const sq = "a";
  const signe = amplitudeSigneeLatex(e);
  const abs = formatAmplitudeAbsolueLatex(e.A);
  const unitaire = abs === "1";
  const lignes: LigneCalcul[] = [ligne(`A=${signe}`, unitaire ? (e.A.signe < 0 ? "« −sin » : coefficient −1 devant le sinus" : "« sin » sans coefficient : 1 devant le sinus") : "coefficient placé devant le sinus")];
  if (e.A.signe < 0) lignes.push(ligne(`|A|=\\left|${signe}\\right|`, "valeur absolue"), ligne(`=${abs}`, "on retire le signe"));
  else lignes.push(ligne(`|A|=${abs}`, "A est positif"));
  const etapes: EtapeCorrection[] = [
    utilise(sq, [t("Dans "), f("f(x)=A\\sin(\\omega x+\\varphi)+b"), t(", l'amplitude est la valeur absolue du coefficient A placé devant le sinus : "), f("\\text{amplitude}=|A|"), t(` ${COURS_PARAMETRES}.`)]),
    calcul(sq, lignes),
    etapeResultat(e, "amplitude"),
  ];
  if (e.A.signe < 0) etapes.push(piege(sq, [t("Le coefficient devant le sinus est négatif, mais l'amplitude est toujours positive : c'est sa valeur absolue.")]));
  return etapes;
}

function etapesPulsation(e: E): EtapeCorrection[] {
  const sq = "b";
  const omega = rp(e.B);
  const avecParenthese = e.forme === "prefactorisee" && !estNul(rp(e.phi));
  const justif = estUn(omega)
    ? avecParenthese
      ? "aucun facteur écrit devant la parenthèse"
      : "aucun coefficient écrit devant x"
    : avecParenthese
      ? "facteur placé devant la parenthèse"
      : "coefficient de x dans l'argument";
  return [
    utilise(
      sq,
      avecParenthese
        ? [t("Dans l'argument écrit "), f("\\omega(x-\\Phi)"), t(", la pulsation ω est le facteur placé devant la parenthèse "), t(`${COURS_PARAMETRES}.`)]
        : [t("Dans l'argument écrit "), f("\\omega x+\\varphi"), t(", la pulsation ω est le coefficient de x "), t(`${COURS_PARAMETRES}.`)],
    ),
    calcul(sq, [ligne(`\\omega=${rpLatex(omega)}`, justif)]),
    etapeResultat(e, "pulsation"),
  ];
}

/** T = 2π/ω : substitution (ω en `\frac` dans la fraction), produit par l'inverse, simplification. */
function lignesPeriode(omega: RP): LigneCalcul[] {
  const { numerateur: p, denominateur: q, degrePi } = omega;
  if (estUn(omega)) return [ligne("T=\\dfrac{2\\pi}{\\omega}", "formule de la période"), ligne("=2\\pi", "ω = 1")];
  const lignes: LigneCalcul[] = [ligne("T=\\dfrac{2\\pi}{\\omega}", "formule de la période"), ligne(`=\\dfrac{2\\pi}{${rpLatex(omega, true)}}`, "on remplace ω")];
  if (degrePi === 0) {
    if (q !== 1) lignes.push(ligne(`=2\\pi\\times ${rpBrut(q, p, 0)}`, "diviser par une fraction, c'est multiplier par son inverse"));
    lignes.push(...lignesFinRP(2 * q, p, 1, q !== 1 ? "on multiplie" : undefined));
  } else {
    lignes.push(ligne(`=2\\pi\\times ${rpBrut(q, p, -1)}`, "diviser par une fraction, c'est multiplier par son inverse"));
    lignes.push(...lignesFinRP(2 * q, p, 0, "on simplifie par π"));
  }
  return sansDoublons(lignes);
}

function etapesPeriode(e: E): EtapeCorrection[] {
  const sq = "c";
  const omega = rp(e.B);
  const T = formatRationnelPiLatex(e.T);
  return [
    utilise(sq, [t("Période d'une sinusoïde : "), f("T=\\dfrac{2\\pi}{\\omega}"), t(` ${COURS_PARAMETRES}.`)]),
    calcul(sq, lignesPeriode(omega)),
    etapeResultat(e, "periode"),
    verification(sq, [t("Sur une période, l'argument augmente d'un tour complet :")], [ligne(`\\omega T=${par(rpLatex(omega))}\\times ${T}`), ligne("=2\\pi", "un tour ✓")]),
  ];
}

function etapesFrequence(e: E): EtapeCorrection[] {
  const sq = "d";
  return [
    utilise(sq, [t("La fréquence est l'inverse de la période : "), f("f_{req}=\\dfrac{1}{T}"), t(` ${COURS_PARAMETRES}.`)]),
    calcul(sq, sansDoublons([ligne("f_{req}=\\dfrac{1}{T}", "inverse de la période"), ligne(`=\\dfrac{1}{${formatRationnelPiLatex(e.T)}}`, "on remplace T"), ligne(`=${formatFrequenceLatex(e)}`)])),
    etapeResultat(e, "frequence"),
  ];
}

/** Ligne(s) de lecture de Φ dans la parenthèse de la forme pré-factorisée. */
function lignesLectureParenthese(phi: RP): LigneCalcul[] {
  const terme = termeXLatex(phi);
  const lignes: LigneCalcul[] = [ligne(`x-\\Phi=${terme}`, "on lit la parenthèse de l'argument")];
  if (estNul(phi)) lignes.push(ligne("\\Phi=0", "rien n'est soustrait à x"));
  else if (phi.numerateur < 0) lignes.push(ligne(`\\Phi=${rpLatex(phi)}`, jf("on identifie : ", { l: `${terme}=x-${par(rpLatex(phi))}` })));
  else lignes.push(ligne(`\\Phi=${rpLatex(phi)}`, "on identifie"));
  return lignes;
}

function etapesDephasage(e: E): EtapeCorrection[] {
  const sq = "e";
  const C = rp(e.C);
  if (e.forme === "developpee") {
    return [
      utilise(sq, [t("Dans l'argument écrit "), f("\\omega x+\\varphi"), t(", le déphasage φ est la constante ajoutée "), t(`${COURS_PARAMETRES}.`)]),
      calcul(sq, [ligne(`\\varphi=${rpLatex(C)}`, estNul(C) ? "aucune constante dans l'argument" : "constante ajoutée dans l'argument")]),
      etapeResultat(e, "dephasage"),
    ];
  }
  const omega = rp(e.B);
  const phi = rp(e.phi);
  const lignes: LigneCalcul[] = [...lignesLectureParenthese(phi), ligne("\\varphi=-\\omega\\Phi", jf("on développe ", { l: "\\omega(x-\\Phi)=\\omega x-\\omega\\Phi" }))];
  if (estNul(phi)) lignes.push(ligne(`=-${par(rpLatex(omega))}\\times 0`, "on remplace ω et Φ"), ligne("=0"));
  else {
    lignes.push(ligne(`=-${par(rpLatex(omega))}\\times ${par(rpLatex(phi))}`, "on remplace ω et Φ"));
    lignes.push(...lignesFinRP(-omega.numerateur * phi.numerateur, omega.denominateur * phi.denominateur, 1, "on multiplie"));
  }
  return [
    utilise(sq, [t("On développe l'argument : "), f("\\omega(x-\\Phi)=\\omega x-\\omega\\Phi"), t(", donc "), f("\\varphi=-\\omega\\Phi"), t(` ${COURS_PARAMETRES}.`)]),
    calcul(sq, sansDoublons(lignes)),
    etapeResultat(e, "dephasage"),
  ];
}

function etapesPhi(e: E): EtapeCorrection[] {
  const sq = "f";
  const omega = rp(e.B);
  const C = rp(e.C);
  const phi = rp(e.phi);
  if (e.forme === "prefactorisee") {
    return [
      utilise(sq, [t("Dans l'argument écrit "), f("\\omega(x-\\Phi)"), t(", le décalage horizontal Φ est le nombre soustrait à x "), t(`${COURS_PARAMETRES}.`)]),
      calcul(sq, lignesLectureParenthese(phi)),
      etapeResultat(e, "phi"),
      piege(sq, [t("Le signe se lit dans l'écriture "), f("x-\\Phi"), t(" : une parenthèse « x + k » correspond à "), f("\\Phi=-k"), t(".")]),
    ];
  }
  const lignes: LigneCalcul[] = [ligne("\\Phi=-\\dfrac{\\varphi}{\\omega}", "formule du décalage horizontal")];
  if (estNul(C)) lignes.push(ligne("=0", "φ = 0 : aucun décalage"));
  else {
    const inv: RP = rpReduit({ numerateur: omega.denominateur, denominateur: omega.numerateur, degrePi: (omega.degrePi === 0 ? 0 : -1) as -1 | 0 | 1 });
    lignes.push(ligne(`=-${par(rpLatex(C))}\\times ${rpLatex(inv)}`, "diviser par ω, c'est multiplier par son inverse"));
    const N = -C.numerateur * inv.numerateur;
    const D = C.denominateur * inv.denominateur;
    if (inv.degrePi === -1) {
      const a = Math.abs(N);
      lignes.push(ligne(`=${N < 0 ? "-" : ""}\\dfrac{${a === 1 ? "" : a}\\pi}{${D === 1 ? "" : D}\\pi}`, "on multiplie"));
      lignes.push(...lignesFinRP(N, D, 0, "on simplifie par π"));
    } else lignes.push(...lignesFinRP(N, D, 1, "on multiplie"));
  }
  const etapes: EtapeCorrection[] = [
    utilise(sq, [t("On met ω en évidence : "), f("\\omega x+\\varphi=\\omega\\left(x+\\dfrac{\\varphi}{\\omega}\\right)"), t(", donc "), f("\\Phi=-\\dfrac{\\varphi}{\\omega}"), t(` ${COURS_PARAMETRES}.`)]),
    calcul(sq, sansDoublons(lignes)),
    etapeResultat(e, "phi"),
  ];
  if (!estNul(C)) etapes.push(verification(sq, [t("On retrouve φ en développant "), f("\\omega(x-\\Phi)"), t(" :")], [ligne(`-\\omega\\Phi=-${par(rpLatex(omega))}\\times ${par(rpLatex(phi))}`), ligne(`=${rpLatex(C)}`, "c'est bien φ ✓")]));
  etapes.push(piege(sq, [t("Ne pas confondre le déphasage φ (constante de l'argument) et le décalage horizontal Φ : pour passer de l'un à l'autre, on divise par ω et on change le signe.")]));
  return etapes;
}

function etapesDecalage(e: E): EtapeCorrection[] {
  const sq = "g";
  const etapes: EtapeCorrection[] = [
    utilise(sq, [t("Le décalage vertical b est le terme constant ajouté après le sinus, avec son signe "), t(`${COURS_PARAMETRES}.`)]),
    calcul(sq, [ligne(`b=${e.b}`, e.b === 0 ? "aucun terme constant après le sinus" : "terme constant ajouté après le sinus")]),
    etapeResultat(e, "decalage"),
  ];
  if (e.b < 0) etapes.push(piege(sq, [t(`b se lit avec son signe : b = ${String(e.b).replace("-", "−")}, pas ${-e.b}.`)]));
  return etapes;
}

const ETAPES: Record<PhaseParametresSinusoide, (e: E) => EtapeCorrection[]> = {
  amplitude: etapesAmplitude,
  pulsation: etapesPulsation,
  periode: etapesPeriode,
  frequence: etapesFrequence,
  dephasage: etapesDephasage,
  phi: etapesPhi,
  decalage: etapesDecalage,
};

export function correctionDetailleeParametresSinusoide(e: E): EtapeCorrection[] {
  return finaliserCorrige(ORDRE_PHASES_SINUSOIDE.flatMap((phase) => ETAPES[phase](e)));
}

