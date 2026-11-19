import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, lignesDepuisChaine, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import { divise, donnees, frac, partieFixe, plus, unite, valeur } from "../../core5e/sommeInfinieSituation.types";
import type { ExerciceSommeInfinie } from "../../core5e/sommeInfinieSituation.types";
import { PHASES } from "../../moteur5e/typesSommeInfinieSituation";
import type { PhaseSommeInfinie } from "../../moteur5e/typesSommeInfinieSituation";
import { aideNiveau1, calculSommeLatex, fracLatex, nbLatex, nombrePeriodiqueLatex, reponseRecap } from "../../ui5e/formatSommeInfinieSituation";
import { COURS_CONVERGENCE, sansRepetition } from "../../ui5e/corrigeSuites2";

/**
 * Corrigé détaillé « comme au tableau » de `5gen48` (somme infinie en situation) — règle
 * `.claude/rules/feuilles-evaluations.md`. Quatre étapes = quatre écrans : a) u₁ (découpage du
 * nombre périodique, pourcentage de la hauteur, distance de la 1re étape, aire), b) q (quotient de
 * deux termes consécutifs), c) |q| < 1 puis S∞ = u₁/(1 − q) substituée et calculée ligne à ligne
 * (chaîne de l'écran `calculSommeLatex`), d) la réponse au problème (partie fixe + S∞, h + 2S∞,
 * d₀ + S∞, aire − S∞). Figures des rebonds et des figures emboîtées : dans l'énoncé.
 */

const t = texte;
const f = latex;
type E = ExerciceSommeInfinie;
const LETTRES = "abcd";

function nbTexte(x: number): string {
  return String(x).replace(".", "{,}");
}

/** Personnages de la poursuite (Zénon). */
function personnages(e: Extract<E, { variante: "zenon" }>): { poursuivant: string; poursuivi: string } {
  if (e.contexte === "achille") return { poursuivant: "Achille", poursuivi: "la tortue" };
  if (e.contexte === "chien") return { poursuivant: "le chien", poursuivi: "le maître" };
  return { poursuivant: "le cycliste", poursuivi: "le piéton" };
}

function uniteTexte(e: E): string {
  const u = unite(e);
  return u ? ` ${u}` : "";
}

// ============================================================================
// Étapes de calcul.
// ============================================================================

function lignesPremierTerme(e: E): LigneCalcul[] {
  const d = donnees(e);
  switch (e.variante) {
    case "periodique": {
      const fixe = partieFixe(e);
      const decomp = `${nombrePeriodiqueLatex(e)}=${valeur(fixe) === 0 ? "" : `${nbLatex(fixe)}+`}${nbLatex(d.u1)}+${nbLatex(d.u2)}+\\ldots`;
      const lignes = [ligne(decomp, `chaque bloc « ${e.periode} » écrit à sa place donne un terme`)];
      if (nbLatex(d.u1) !== fracLatex(d.u1)) lignes.push(ligne(`u_1=${nbLatex(d.u1)}`, "premier bloc"), ligne(`=${fracLatex(d.u1)}`, "écriture fractionnaire"));
      else lignes.push(ligne(`u_1=${nbLatex(d.u1)}`, "premier bloc"));
      return lignes;
    }
    case "rebonds":
      return sansRepetition([ligne(`u_1=\\dfrac{${e.pourcent}}{100}\\times ${nbTexte(e.hauteur)}`, `${e.pourcent} % de la hauteur de chute`), ligne(`=${nbLatex(d.u1)}`)]);
    case "zenon":
      return sansRepetition([ligne(`u_1=\\dfrac{${e.avance}}{${e.k}}`, `${personnages(e).poursuivi} va ${e.k} fois moins vite : ${e.k} fois moins de chemin`), ligne(`=${nbLatex(d.u1)}`)]);
    case "figures":
      if (e.sousCas === "triangle") return sansRepetition([ligne(`u_1=\\dfrac{${e.aire}}{4}`, "un des quatre triangles identiques"), ligne(`=${nbLatex(d.u1)}`)]);
      return sansRepetition([
        ligne(`u_1=${e.aire}-\\dfrac{3}{4}\\times ${e.aire}`, "1er hexagone moins le 2e"),
        ligne(`=${e.aire}-${nbLatex(frac(3 * e.aire, 4))}`, "on calcule l'aire du 2e hexagone"),
        ligne(`=${nbLatex(d.u1)}`),
      ]);
  }
}

function lignesRaison(e: E): LigneCalcul[] {
  const d = donnees(e);
  switch (e.variante) {
    case "periodique":
      return sansRepetition([ligne(`q=\\dfrac{u_2}{u_1}`, "quotient de deux termes consécutifs"), ligne(`=\\dfrac{${nbLatex(d.u2, true)}}{${nbLatex(d.u1, true)}}`), ligne(`=${fracLatex(d.q)}`, `le bloc se décale de ${e.periode.length} rang${e.periode.length > 1 ? "s" : ""}`)]);
    case "rebonds":
      return sansRepetition([ligne("q=\\dfrac{u_2}{u_1}", "chaque hauteur est le même pourcentage de la précédente"), ligne(`=\\dfrac{${e.pourcent}}{100}`), ligne(`=${fracLatex(d.q)}`, "on simplifie")]);
    case "zenon":
      return [ligne("q=\\dfrac{u_2}{u_1}", `à chaque étape, ${personnages(e).poursuivi} parcourt ${e.k} fois moins qu'à la précédente`), ligne(`=${fracLatex(d.q)}`)];
    case "figures":
      if (e.sousCas === "triangle") return [ligne("q=\\dfrac{u_2}{u_1}", "chaque triangle colorié est 4 fois plus petit que le précédent"), ligne(`=${fracLatex(d.q)}`)];
      return [ligne("q=\\dfrac{3}{4}\\times\\dfrac{3}{4}", "d'une couronne coloriée à la suivante, on passe deux fois à l'hexagone suivant"), ligne("=\\dfrac{9}{16}")];
  }
}

function lignesSomme(e: E): LigneCalcul[] {
  const justif = [
    "formule de la somme infinie",
    [t("on remplace "), f("u_1"), t(" et "), f("q")],
    "on calcule le dénominateur",
    "diviser par une fraction, c'est multiplier par son inverse",
    e.variante === "periodique" ? "on multiplie" : "on calcule",
    "on simplifie",
  ] as (string | FragmentConsigne[])[];
  return sansRepetition(lignesDepuisChaine(calculSommeLatex(e), justif));
}

function lignesReponse(e: E): LigneCalcul[] {
  const d = donnees(e);
  switch (e.variante) {
    case "periodique": {
      const fixe = partieFixe(e);
      if (valeur(fixe) === 0) return [ligne(`x=S_\\infty`, "le nombre est exactement la somme infinie"), ligne(`=${fracLatex(d.reponse)}`)];
      const den = (fixe.den * d.sInfini.den) / pgcd(fixe.den, d.sInfini.den);
      const a = (fixe.num * den) / fixe.den;
      const b = (d.sInfini.num * den) / d.sInfini.den;
      return sansRepetition([
        ligne(`x=${nbLatex(fixe)}+S_\\infty`, "partie qui ne se répète pas, plus la somme infinie"),
        ligne(`=${fracLatex(fixe)}+${fracLatex(d.sInfini)}`, "on écrit la partie fixe en fraction"),
        ligne(`=\\dfrac{${a}}{${den}}+\\dfrac{${b}}{${den}}`, "même dénominateur"),
        ligne(`=\\dfrac{${a + b}}{${den}}`, "on additionne les numérateurs"),
        ligne(`=${fracLatex(d.reponse)}`, "on simplifie"),
      ]);
    }
    case "rebonds":
      return sansRepetition([
        ligne(`D=h+2\\times S_\\infty`, "une chute, puis chaque remontée et la descente qui la suit"),
        ligne(`=${nbTexte(e.hauteur)}+2\\times ${nbLatex(d.sInfini)}`),
        ligne(`=${nbTexte(e.hauteur)}+${nbLatex(plus(d.sInfini, d.sInfini))}`, "on multiplie"),
        ligne(`=${nbLatex(d.reponse)}`),
      ]);
    case "zenon":
      return sansRepetition([ligne(`D=d_0+S_\\infty`, `l'avance de départ, plus tout le chemin de ${personnages(e).poursuivi}`), ligne(`=${e.avance}+${nbLatex(d.sInfini)}`), ligne(`=${nbLatex(d.reponse)}`)]);
    case "figures":
      return sansRepetition([ligne(`${e.aire}-S_\\infty=${e.aire}-${nbLatex(d.sInfini)}`, "aire de départ moins l'aire coloriée totale"), ligne(`=${nbLatex(d.reponse)}`)]);
  }
}

function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

// ============================================================================
// Piège, conclusion.
// ============================================================================

/** La ligne « Piège », sur l'étape où l'erreur classique se commet. */
function piegeEtape(e: E): { phase: PhaseSommeInfinie; fragments: FragmentConsigne[] } {
  switch (e.variante) {
    case "periodique":
      if (valeur(partieFixe(e)) !== 0) return { phase: "reponse", fragments: [t("Le nombre vaut la partie qui ne se répète pas PLUS "), f("S_\\infty"), t(" : l'oublier est l'erreur la plus fréquente ; la fraction finale doit encore être simplifiée.")] };
      return { phase: "raison", fragments: [t(`Le bloc qui se répète compte ${e.periode.length} chiffres : d'un terme au suivant, il se décale de ${e.periode.length} rangs, donc `), f(`q=${fracLatex(donnees(e).q)}`), t(", et non "), f("\\dfrac{1}{10}"), t(".")] };
    case "rebonds":
      return { phase: "reponse", fragments: [t("Compter une seule fois les montées et les descentes donne "), f("h+S_\\infty"), t(" : chaque remontée est suivie d'une descente de même longueur ; seule la première chute n'est comptée qu'une fois.")] };
    case "zenon": {
      const p = personnages(e);
      return { phase: "premierTerme", fragments: [t(`La suite (uₙ) suit ${p.poursuivi} : à la 1re étape, ${p.poursuivi} parcourt `), f(`\\dfrac{${e.avance}}{${e.k}}`), t(` m ; les ${e.avance} m sont la distance parcourue par ${p.poursuivant}.`)] };
    }
    case "figures":
      if (e.sousCas === "triangle") return { phase: "raison", fragments: [t("Joindre les milieux divise les côtés par 2 mais l'aire par 4 : "), f("q=\\dfrac{1}{4}"), t(", pas "), f("\\dfrac{1}{2}"), t(".")] };
      return { phase: "raison", fragments: [t("Une couronne sur deux est coloriée : d'une couronne coloriée à la suivante, l'aire est multipliée DEUX fois par "), f("\\dfrac{3}{4}"), t(", donc "), f("q=\\dfrac{9}{16}"), t(".")] };
  }
}

function conclusion(e: E): FragmentConsigne[] {
  const d = donnees(e);
  switch (e.variante) {
    case "periodique":
      return [f(`x=${fracLatex(d.reponse)}`), t(" : un nombre décimal illimité périodique s'écrit toujours comme une fraction.")];
    case "rebonds":
      return [t("Distance totale : "), f(`D=${nbLatex(d.reponse)}`), t(`${uniteTexte(e)} — une infinité de rebonds, mais une distance finie.`)];
    case "zenon": {
      const p = personnages(e);
      return [t(`${p.poursuivant.charAt(0).toUpperCase()}${p.poursuivant.slice(1)} rattrape ${p.poursuivi} à `), f(`D=${nbLatex(d.reponse)}`), t(" m de son point de départ : une infinité d'étapes, mais une distance finie (le paradoxe de Zénon est levé).")];
    }
    case "figures":
      return [t("Aire non coloriée : "), f(nbLatex(d.reponse)), t(" cm², soit "), f(fracLatex(divise(d.reponse, frac(e.aire)))), t(` de l'aire ${e.sousCas === "triangle" ? "du grand triangle" : "du premier hexagone"}.`)];
  }
}

function utiliseEtape(e: E, phase: PhaseSommeInfinie, sq: string): EtapeCorrection {
  const aide = aideNiveau1(e, phase);
  if (phase === "sommeInfinie") return utilise(sq, [t("La somme infinie des termes d'une suite géométrique existe seulement si "), f("|q|<1"), t(" ; elle vaut alors "), f("S_\\infty=\\dfrac{u_1}{1-q}"), t(` ${COURS_CONVERGENCE}.`)]);
  return utilise(sq, [t(aide.texte), ...(aide.latex ? [t(" "), f(aide.latex)] : []), t(` ${COURS_CONVERGENCE}.`)]);
}

function etape(e: E, phase: PhaseSommeInfinie, sq: string): EtapeCorrection[] {
  const d = donnees(e);
  switch (phase) {
    case "premierTerme":
      return [utiliseEtape(e, phase, sq), calcul(sq, lignesPremierTerme(e)), resultat(sq, [f(reponseRecap(e, phase)), t(`${uniteTexte(e)}`)])];
    case "raison":
      return [utiliseEtape(e, phase, sq), calcul(sq, lignesRaison(e)), resultat(sq, [f(reponseRecap(e, phase))])];
    case "sommeInfinie":
      return [
        utiliseEtape(e, phase, sq),
        calcul(sq, [ligne(`|q|=${fracLatex(d.q)}<1`, "la somme infinie existe")], [], "Condition"),
        calcul(sq, lignesSomme(e)),
        resultat(sq, [f(reponseRecap(e, phase)), t(`${uniteTexte(e)}`)]),
      ];
    case "reponse": {
      const etapes: EtapeCorrection[] = [utiliseEtape(e, phase, sq), calcul(sq, lignesReponse(e)), resultat(sq, conclusion(e))];
      if (e.variante === "periodique") {
        const dec = d.reponse;
        // Décimales tronquées (jamais arrondies) : on doit lire les chiffres de l'énoncé.
        const approx = (Math.floor(valeur(dec) * 1e6 + 1e-9) / 1e6).toFixed(6).replace(".", "{,}");
        etapes.push(verification(sq, [t("En divisant le numérateur par le dénominateur, on retrouve l'écriture de l'énoncé : "), f(`${fracLatex(dec)}=${approx}\\ldots`), t(".")]));
      }
      return etapes;
    }
  }
}

export function correctionDetailleeSommeInfinie(e: E): EtapeCorrection[] {
  const p = piegeEtape(e);
  return PHASES.flatMap((phase, i): EtapeCorrection[] => {
    const sq = LETTRES[i];
    return [...etape(e, phase, sq), ...(p.phase === phase ? [piege(sq, p.fragments)] : [])];
  });
}
