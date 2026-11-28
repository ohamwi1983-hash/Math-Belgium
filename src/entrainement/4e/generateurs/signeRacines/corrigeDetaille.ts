import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceSigneRacines, PhaseSigneRacines } from "../../core/signeRacines.types";
import { autreRacine, delta, phases, produit, racineEvidente, somme } from "../../moteur/modeleSigneRacines";
import { reponsePhase } from "../../ui/formatSigneRacines";
import { q, qp, sansDoublons } from "../../ui/corrigeChapitre3";

/**
 * Corrigé détaillé « comme au tableau » de gen114 — règle `.claude/rules/feuilles-evaluations.md`.
 * Une lettre par écran, dans l'ordre de `phases` (la séquence dépend de P et de Δ) : P, Δ, S ou
 * racine évidente, autre racine, puis le verdict justifié. Partagé par l'adaptateur et l'appli.
 */

type E = ExerciceSigneRacines;
const lat = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });
const COURS = "(cours, point 1)";

function lignesPhase(e: E, phase: PhaseSigneRacines): LigneCalcul[] {
  const { a, b, c } = e;
  switch (phase) {
    case "P":
      return sansDoublons([ligne(`P=\\dfrac{c}{a}=\\dfrac{${c}}{${a}}`), ligne(`=${q(produit(e))}`), ligne(produit(e) < 0 ? `${q(produit(e))}<0` : `${q(produit(e))}>0`, produit(e) < 0 ? "a et c de signes opposés" : "a et c de même signe")]);
    case "delta": {
      const d = delta(e);
      return [ligne(`\\Delta=${qp(b)}^2-4\\cdot ${qp(a)}\\cdot ${qp(c)}`), ligne(`=${b * b}${-4 * a * c < 0 ? "-" : "+"}${Math.abs(4 * a * c)}`), ligne(`=${d}`), ligne(d > 0 ? `${d}>0` : `${d}<0`, d > 0 ? "deux racines" : "aucune racine")];
    }
    case "S":
      return sansDoublons([ligne(`S=-\\dfrac{b}{a}=-\\dfrac{${b}}{${a}}`), ligne(`=${q(somme(e))}`), ligne(somme(e) > 0 ? `${q(somme(e))}>0` : `${q(somme(e))}<0`, "signe commun des deux racines")]);
    case "x1": {
      const r = racineEvidente(e);
      return r === 1
        ? [ligne(`a+b+c=${a}${b < 0 ? "" : "+"}${b}${c < 0 ? "" : "+"}${c}`), ligne("=0", "1 est racine évidente"), ligne("x_1=1")]
        : [ligne(`a+b+c=${a + b + c}\\neq 0`), ligne(`a-b+c=${a}${-b < 0 ? "" : "+"}${-b}${c < 0 ? "" : "+"}${c}`), ligne("=0", "−1 est racine évidente"), ligne("x_1=-1")];
    }
    case "x2": {
      const r = racineEvidente(e);
      return sansDoublons([ligne("x_1\\cdot x_2=P", "produit des racines"), ligne(`${r}\\cdot x_2=${q(produit(e))}`), ligne(`x_2=${r === 1 ? q(produit(e)) : `\\dfrac{${q(produit(e))}}{-1}`}`, r === 1 ? undefined : "on divise par −1"), ligne(`=${q(autreRacine(e))}`)]);
    }
    case "verdict": {
      if (e.variante === "racineEvidente") return [ligne(`x_1=${racineEvidente(e)}`), ligne(`x_2=${q(autreRacine(e))}`), ligne(`x_1\\cdot x_2=${q(produit(e))}${produit(e) < 0 ? "<0" : ">0"}`, produit(e) < 0 ? "signes contraires" : "même signe")];
      if (e.verdict === "opposes") return [ligne(`P=${q(produit(e))}<0`, "deux racines de signes opposés (Δ est forcément positif)")];
      if (e.verdict === "aucune") return [ligne(`P=${q(produit(e))}>0`), ligne(`\\Delta=${delta(e)}<0`, "aucune racine réelle")];
      return [ligne(`P=${q(produit(e))}>0`, "même signe"), ligne(`\\Delta=${delta(e)}>0`, "deux racines"), ligne(`S=${q(somme(e))}${somme(e) > 0 ? ">0" : "<0"}`, somme(e) > 0 ? "toutes deux positives" : "toutes deux négatives")];
    }
  }
}

function utilisePhase(e: E, phase: PhaseSigneRacines): FragmentConsigne[] {
  switch (phase) {
    case "P":
      return [texte(`Produit des racines (relations de Viète) ${COURS} : `), lat("P=x_1\\cdot x_2=\\dfrac{c}{a}"), texte(".")];
    case "delta":
      return [texte("Quand P > 0, les racines, si elles existent, ont le même signe ; le signe de "), lat("\\Delta=b^2-4ac"), texte(" dit si elles existent.")];
    case "S":
      return [texte(`Somme des racines ${COURS} : `), lat("S=x_1+x_2=-\\dfrac{b}{a}"), texte(" ; deux nombres de même signe ont une somme de ce signe.")];
    case "x1":
      return [texte(`Racine évidente ${COURS} : si a + b + c = 0, 1 est racine ; si a − b + c = 0, −1 est racine.`)];
    case "x2":
      return [texte("Le produit des racines donne l'autre : "), lat("x_2=\\dfrac{P}{x_1}"), texte(".")];
    case "verdict":
      return e.variante === "signes" ? [texte(`Le signe des racines, sans les calculer ${COURS} : P < 0 → signes opposés ; P > 0 et Δ > 0 → le signe de S ; P > 0 et Δ < 0 → aucune racine.`)] : [texte("On lit le signe des deux racines trouvées.")];
  }
}

export function correctionDetailleeSigneRacines(e: E): EtapeCorrection[] {
  const etapes: EtapeCorrection[] = [];
  phases(e).forEach((phase, i) => {
    const lettre = String.fromCharCode(97 + i);
    etapes.push(utilise(lettre, utilisePhase(e, phase)), calcul(lettre, lignesPhase(e, phase)), resultat(lettre, reponsePhase(e, phase)));
    if (phase === "verdict" && e.variante === "signes" && e.verdict === "opposes") etapes.push(piege(lettre, [texte("Inutile de calculer Δ : quand P < 0, a et c sont de signes opposés et Δ = b² − 4ac est forcément positif.")]));
    if (phase === "S") etapes.push(piege(lettre, [texte("La somme vaut −b/a : attention au signe moins.")]));
    if (phase === "x2") etapes.push(verification(lettre, [texte("Somme des racines : "), lat(`${racineEvidente(e)}+${qp(autreRacine(e))}=${q(racineEvidente(e) + autreRacine(e))}=-\\dfrac{${e.b}}{${e.a}}`), texte(".")]));
  });
  return etapes;
}
