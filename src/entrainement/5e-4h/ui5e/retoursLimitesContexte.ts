/**
 * 5gen23 (limites et asymptotes en contexte) — lots B–D, règles communes : aides à deux niveaux au
 * format `AideTrig` (niveau 1 = la propriété ou la méthode, niveau 2 = posée pour CE contexte, jamais
 * la réponse ; les anciens niveaux 2 « exemple avec d'autres valeurs » sont remplacés), messages
 * ciblés sur les erreurs du cours, et lecture des saisies (illisible / approchée refusées).
 */
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { ExerciceLimitesContexte } from "../core5e/limitesContexte.types";
import type { PhaseLimitesContexte } from "../moteur5e/typesLimitesContexte";
import { egaleA, lireLimite, nombreIllisible } from "../moteur5e/saisieLimites";
import { saisieContexteRefusee } from "../moteur5e/saisieContexteLimites";
import { retirerMembreGauche } from "../moteur5e/verificationLimitesContexte";
import type { AideTrig } from "./aidesTrigonometrie";
import { concentrationLatex, formatTermesDonneesLatex, texteAideNiveau1, texteAideNiveau2 } from "./formatLimitesContexte";
import { MESSAGES_ILLISIBLE_LIMITES, fragmentsRiches } from "./retoursLimites";

const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

export function aidesContexteLimites(e: ExerciceLimitesContexte, phase: PhaseLimitesContexte): AideTrig[] {
  const n1: AideTrig = { texte: fragmentsRiches(texteAideNiveau1(e, phase)) };
  if (e.famille === "eauSalee" && phase === "construireC") {
    const [V, Q] = formatTermesDonneesLatex(e);
    return [n1, { texte: [t("Ici, le volume total et la quantité au même instant t sont donnés :")], formules: [`${V}\\qquad ${Q}`] }];
  }
  if (e.famille === "clubLoisirs" && phase === "asymptoteOblique") {
    return [n1, { texte: [t("Ici, la fraction du modèle tend vers 0 :")], formules: [`\\lim_{x\\to+\\infty}\\dfrac{${e.c}}{x+${e.d}}=0`] }];
  }
  if (e.famille === "clubLoisirs" && phase === "interpreterPente") {
    return [n1, { texte: [t("Ici, la pente a est celle de l'asymptote trouvée à l'étape précédente, et le facteur de conversion vaut :")], formules: [`1\\ \\text{unité}=${e.facteur}\\ \\text{${e.contexte.unitePluriel}}`] }];
  }
  if (e.famille === "population" && phase === "identification") {
    return [n1, { texte: [t("Ici, le quotient b est le coefficient de x du numérateur ; le reste a s'obtient en retirant "), l(`b(x+${e.p})`), t(" du numérateur :")], formules: [`a=\\left(${formatTermesDonneesLatex(e)[0].replace(/^f\(x\)=\\dfrac\{(.*)\}\{x[^}]*\}$/, "$1")}\\right)-b(x+${e.p})`] }];
  }
  const a2 = texteAideNiveau2(e, phase);
  return [n1, { texte: fragmentsRiches(a2.texte), ...(a2.latex ? { formules: [a2.latex] } : {}) }];
}

export { saisieContexteRefusee };

export function texteIllisibleContexte(phase: PhaseLimitesContexte, valeurs: string[]): string {
  if (phase === "construireC") return MESSAGES_ILLISIBLE_LIMITES.expression;
  if (phase === "asymptoteOblique") return MESSAGES_ILLISIBLE_LIMITES.droite;
  if (phase === "evaluer" || phase === "evaluerSeuil") return MESSAGES_ILLISIBLE_LIMITES.arrondi;
  return valeurs.some((s) => nombreIllisible(retirerMembreGauche(s))) ? MESSAGES_ILLISIBLE_LIMITES.limite : MESSAGES_ILLISIBLE_LIMITES.approchee;
}

const proche = (v: number | null, c: number, tol = 1e-9) => v !== null && Number.isFinite(v) && Math.abs(v - c) <= tol * Math.max(1, Math.abs(c));

export function cibleContexteLimites(e: ExerciceLimitesContexte, phase: PhaseLimitesContexte, valeurs: string[]): FragmentConsigne[] | null {
  const v = valeurs.map((s) => lireLimite(retirerMembreGauche(s)));
  if (e.famille === "prixRevient" && phase === "asymptoteHorizontale") {
    if (v[0] !== null && !Number.isFinite(v[0])) return [t("Le terme "), l(`\\dfrac{${e.a}}{x}`), t(" tend vers 0 quand x devient très grand : la limite est finie.")];
    if (proche(v[0], e.a)) return [t("C'est le coût fixe ; réparti sur un très grand nombre de "), t(e.contexte.unitePluriel), t(", il devient négligeable.")];
    if (proche(v[0], 0)) return [t("Seul le terme "), l(`\\dfrac{${e.a}}{x}`), t(" tend vers 0 : le coût par unité reste.")];
    return [t("Fais tendre x vers "), l("+\\infty"), t(" dans chaque terme de "), l("C_u(x)"), t(".")];
  }
  if (e.famille === "eauSalee") {
    if (phase === "construireC") {
      const s = retirerMembreGauche(valeurs[0]);
      if (egaleA(s, () => e.c)) return [t("On divise par le volume TOTAL "), l("V(t)"), t(", pas par le seul volume ajouté.")];
      if (egaleA(s, (x) => (e.v0 + e.r * x) / (e.c * e.r * x))) return [t("Fraction inversée : quantité divisée par volume.")];
      return [l("C(t)=\\dfrac{Q(t)}{V(t)}"), t(" : remplace Q(t) et V(t) par leurs expressions.")];
    }
    if (phase === "limiteC") {
      if (v[0] !== null && !Number.isFinite(v[0])) return [t("Numérateur et dénominateur sont du premier degré : la limite est un nombre réel.")];
      if (proche(v[0], e.c * e.r)) return [t("Divise aussi le dénominateur par t : il tend vers "), l(`${e.r}`), t(".")];
      if (proche(v[0], 0)) return [t("Après division par t, seul "), l(`\\frac{${e.v0}}{t}`), t(" tend vers 0.")];
      return [t("Divise numérateur et dénominateur par t, puis "), l("\\frac{k}{t}\\to 0"), t(" : "), l(`C(t)=${concentrationLatex(e)}`), t(".")];
    }
  }
  if (e.famille === "clubLoisirs") {
    if (phase === "evaluer") {
      const f0 = e.b - e.c / e.d;
      const fX = e.a * e.xEval + e.b - e.c / (e.xEval + e.d);
      if (proche(v[0], f0, 0.02) || proche(v[1], fX, 0.02)) return [t("C'est la valeur dans l'échelle du modèle : multiplie-la par le facteur "), l(`${e.facteur}`), t(".")];
      return [t("Remplace x dans f(x), calcule, puis multiplie par le facteur de conversion et arrondis à l'unité.")];
    }
    if (phase === "inequation") {
      if (proche(v[0], e.moisAttendu - 1)) return [t("À ce mois-là, le seuil n'est pas encore atteint : prends le PREMIER entier qui dépasse la solution de l'équation.")];
      if (v[0] !== null && v[0] < 0) return [t("Une durée est positive : rejette la solution négative de l'équation.")];
      return [t("Multiplie par "), l(`x+${e.d}`), t(", résous l'équation du second degré, garde la solution positive, puis le premier entier qui la dépasse.")];
    }
    if (phase === "asymptoteOblique") {
      const s = retirerMembreGauche(valeurs[0]);
      if (egaleA(s, (x) => e.a * x + e.b - e.c / (x + e.d))) return [t("L'asymptote est une droite : la fraction, qui tend vers 0, n'en fait pas partie.")];
      if (egaleA(s, (x) => e.a * x)) return [t("Il manque l'ordonnée à l'origine.")];
      return [t("Garde la partie affine de f(x) : "), l("y=ax+b"), t(".")];
    }
    if (phase === "interpreterPente") {
      if (proche(v[0], e.a)) return [t("C'est la pente dans l'échelle du modèle : multiplie-la par le facteur "), l(`${e.facteur}`), t(".")];
      if (proche(v[0], e.b * e.facteur)) return [t("C'est l'ordonnée à l'origine convertie : l'augmentation par mois est donnée par la PENTE a.")];
      return [t("Multiplie la pente a de l'asymptote par le facteur de conversion.")];
    }
  }
  if (e.famille === "population") {
    if (phase === "identification") {
      if (proche(v[0], e.b) && proche(v[1], e.a)) return [t("a et b échangés : b est le quotient (la limite), a le reste de la division.")];
      if (proche(v[1], e.a + e.b * e.p)) return [t("C'est le terme constant du numérateur : le quotient b est le coefficient de x.")];
      return [t("Divise le numérateur par "), l(`x+${e.p}`), t(" : b est le quotient, a le reste.")];
    }
    if (phase === "evaluerSeuil") {
      const x = e.anneeEval - e.anneeRef;
      if (proche(v[0], e.b, 0.011)) return [t("C'est la limite b : il faut calculer f(x) en l'année demandée.")];
      if (proche(v[0], e.a / (e.anneeEval + e.p) + e.b, 0.011)) return [t("x est le nombre d'années écoulées : "), l(`x=${e.anneeEval}-${e.anneeRef}=${x}`), t(".")];
      return [t("Évalue "), l(`f(${x})`), t(" et arrondis au centième.")];
    }
  }
  return null;
}

/** Message sous la réponse révélée d'un choix fermé (interprétation, sens de l'AV, comparaison au
 * seuil) : la propriété qui tranche, appliquée au contexte. */
export function cibleChoixContexte(e: ExerciceLimitesContexte, phase: PhaseLimitesContexte): FragmentConsigne[] | null {
  if (e.famille === "prixRevient" && phase === "interpreter") return [t("Pour x > 0, "), l(`\dfrac{${e.a}}{x}>0`), t(" : le coût unitaire reste au-dessus de "), l(`${e.b}`), t(" et diminue vers cette valeur quand x augmente.")];
  if (e.famille === "prixRevient" && phase === "vaSens") return [t(`Le nombre minimal accepté est ${e.seuil} : x = 0 n'appartient pas au domaine réel, l'asymptote verticale n'a pas de sens concret.`)];
  if (e.famille === "eauSalee" && phase === "interpreter") return [t("Pour t très grand, le volume initial devient négligeable devant le volume ajouté : le mélange prend la concentration du liquide ajouté.")];
  if (e.famille === "population" && phase === "interpreter") return [l(`f(0)-${e.b}=\dfrac{${e.a}}{${e.p}}`), t(e.a > 0 ? " > 0 : on part au-dessus de la limite, la grandeur diminue." : " < 0 : on part en dessous de la limite, la grandeur augmente.")];
  if (e.famille === "population" && phase === "evaluerSeuil") return [t("Compare la valeur f(x) calculée au seuil, pas la limite b.")];
  return null;
}
