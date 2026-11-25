import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import type { ExerciceLoiPoisson, ExerciceLoiPoissonA, ExerciceLoiPoissonB } from "../../core6e/loiPoisson.types";
import { lambdaA } from "../../moteur6e/verificationLoiPoisson";
import { evenementB } from "../../ui6e/formatLoiPoisson";
import { calcul, finaliserCombinatoire, fx, ligne, piege, resultat, utiliseCours, verification } from "../../ui6e/corrigeCombinatoire";
import { BIN, COURS_POISSON, ar, dl } from "../../ui6e/corrigeVariablesAleatoires";
import { resultatB } from "./familles";
import { probabilitePoisson } from "./poisson";

/**
 * Corrigé détaillé « comme au tableau » de `6gen53` (6e ch. 8, § 8), une lettre par écran — même source
 * pour l'écran révélé et pour le papier :
 * - A approximable : a) les trois conditions du cours vérifiées (n ≥ 30, p ≤ 0,1, np ≤ 15) ; b) λ = np ;
 *   c) P(X = k) = e^(−λ) λᵏ / k! ;
 * - A non approximable : a) les conditions, celle qui échoue ; b) la condition qui n'est pas vérifiée ;
 * - B : a) λ ajusté à l'échelle de la question ; b) la probabilité (un terme, somme de termes, ou
 *   complément pour « au moins »), termes arrondis à 10⁻⁴, somme calculée sur les valeurs non arrondies.
 */

type E = ExerciceLoiPoisson;

const p4 = (x: number) => ar(x, 4);

function conditions(e: ExerciceLoiPoissonA): LigneCalcul[] {
  const lam = lambdaA(e);
  const p = dl(e.pCentiemes / 100);
  return [
    ligne(`n=${e.n}${e.n >= 30 ? "\\geq 30" : "<30"}`, e.n >= 30 ? "condition vérifiée" : "condition non vérifiée"),
    ligne(`p=${p}${e.pCentiemes <= 10 ? "\\leq 0{,}1" : ">0{,}1"}`, e.pCentiemes <= 10 ? "condition vérifiée" : "condition non vérifiée"),
    ligne(`n\\times p=${e.n}\\times ${p}=${dl(lam)}${lam <= 15 ? "\\leq 15" : ">15"}`, lam <= 15 ? "condition vérifiée" : "condition non vérifiée"),
  ];
}

function formule(lam: number, k: number): LigneCalcul[] {
  const L = dl(lam);
  return [ligne(`P(X=${k})=e^{-${L}}\\times\\dfrac{${L}^{${k}}}{${k}!}`, "formule de la loi de Poisson"), ligne(`\\approx ${p4(probabilitePoisson(lam, k))}`, "arrondi à 10⁻⁴")];
}

function corrigeA(e: ExerciceLoiPoissonA): EtapeCorrection[] {
  const lam = lambdaA(e);
  const out: EtapeCorrection[] = [
    utiliseCours("a", fx(`$X\\sim${BIN(e.n, dl(e.pCentiemes / 100))}$ ; on peut l'approcher par une loi de Poisson si $n\\geq 30$, $p\\leq 0{,}1$ et $n\\times p\\leq 15$, conventions du cours`), COURS_POISSON),
    calcul("a", conditions(e)),
  ];
  if (e.approximable) {
    out.push(
      resultat("a", fx("Les trois conditions sont vérifiées : on peut approcher la loi de $X$ par une loi de Poisson.")),
      utiliseCours("b", fx("L'approximation garde la même espérance : $\\lambda=n\\times p$"), COURS_POISSON),
      calcul("b", [ligne(`\\lambda=${e.n}\\times ${dl(e.pCentiemes / 100)}=${dl(lam)}`, "n × p")]),
      resultat("b", fx(`$\\lambda=${dl(lam)}$.`)),
      utiliseCours("c", fx("Loi de Poisson : $P(X=k)=e^{-\\lambda}\\,\\dfrac{\\lambda^{k}}{k!}$"), COURS_POISSON),
      calcul("c", formule(lam, e.k)),
      resultat("c", fx(`$P(X=${e.k})\\approx ${p4(probabilitePoisson(lam, e.k))}$.`)),
      piege("c", fx("Calculer avec $p$ au lieu de $\\lambda=n\\,p$, ou oublier le facteur $e^{-\\lambda}$.")),
    );
  } else {
    const quelle = e.condition === "n" ? "$n\\geq 30$" : e.condition === "p" ? "$p\\leq 0{,}1$" : "$n\\times p\\leq 15$";
    out.push(
      resultat("a", fx(`Une condition n'est pas vérifiée : l'approximation par une loi de Poisson n'est pas justifiée.`)),
      utiliseCours("b", fx("Les trois conditions doivent être vérifiées toutes à la fois"), COURS_POISSON),
      resultat("b", fx(`La condition ${quelle} n'est pas vérifiée.`)),
      piege("b", fx("S'arrêter aux deux premières conditions : $n\\times p\\leq 15$ se vérifie aussi.")),
    );
  }
  return out;
}

function termes(lam: number, a: number, b: number): LigneCalcul[] {
  const r: LigneCalcul[] = [];
  for (let i = a; i <= b; i++) r.push(ligne(`P(X=${i})\\approx ${p4(probabilitePoisson(lam, i))}`, i === a ? "chaque terme par la formule (ou la calculatrice)" : undefined));
  return r;
}

function somme(a: number, b: number): string {
  if (b - a <= 2) return Array.from({ length: b - a + 1 }, (_, i) => `P(X=${a + i})`).join("+");
  return `P(X=${a})+P(X=${a + 1})+\\ldots+P(X=${b})`;
}

function corrigeB(e: ExerciceLoiPoissonB): EtapeCorrection[] {
  const lam = e.lambda;
  const L = dl(lam);
  const ev = evenementB(e);
  const res = resultatB(e);
  const sansAjustement = /\\dfrac\{([^}]*)\}\{\1\}/.test(e.calculLambda);
  const out: EtapeCorrection[] = [
    utiliseCours("a", fx("$\\lambda$ est le nombre moyen d'événements sur la durée (ou l'effectif) de la question : on adapte le taux donné à cette échelle"), COURS_POISSON),
    calcul("a", [ligne(`\\lambda=${e.calculLambda}`, "taux × (échelle de la question ÷ échelle du taux)"), ligne(`=${L}`)]),
    resultat("a", fx(`$X$ suit une loi de Poisson de paramètre $\\lambda=${L}$.`)),
    ...(e.typeQuestion === "auMoins"
      ? []
      : [
          piege(
            "a",
            sansAjustement
        ? fx("Ici l'échelle de la question est celle du taux : $\\lambda$ est le taux lui-même. Ailleurs, il faut l'adapter.")
        : fx("Recopier le taux donné comme $\\lambda$ : il est donné pour une autre durée (ou un autre effectif) que celle de la question."),
          ),
        ]),
  ];
  let lignes: LigneCalcul[];
  let intro: string;
  switch (e.typeQuestion) {
    case "exactement":
      intro = "Un seul terme : $P(X=k)=e^{-\\lambda}\\,\\dfrac{\\lambda^{k}}{k!}$";
      lignes = formule(lam, e.k);
      break;
    case "auPlus":
      intro = `« Au plus ${e.k} » : on additionne les probabilités de $X=0$ à $X=${e.k}$ (événements incompatibles)`;
      lignes = [ligne(`${ev}=${somme(0, e.k)}`, "événements incompatibles"), ...termes(lam, 0, e.k), ligne(`${ev}\\approx ${p4(res)}`, "somme des valeurs non arrondies")];
      break;
    case "auMoins":
      intro = `« Au moins ${e.k} » contient une infinité de valeurs : on passe par l'événement contraire « $X\\leq ${e.k - 1}$ »`;
      lignes = [
        ligne(`${ev}=1-P(X\\leq ${e.k - 1})`, "événement contraire"),
        ligne(`=1-\\big(${somme(0, e.k - 1)}\\big)`),
        ...termes(lam, 0, e.k - 1),
        ligne(`P(X\\leq ${e.k - 1})\\approx ${p4(1 - res)}`, "somme des valeurs non arrondies"),
        ligne(`${ev}\\approx 1-${p4(1 - res)}=${p4(res)}`, "complément"),
      ];
      break;
    case "entreAetB":
      intro = `On additionne les probabilités de $X=${e.k}$ à $X=${e.kHaut}$, bornes comprises`;
      lignes = [ligne(`${ev}=${somme(e.k, e.kHaut as number)}`, "événements incompatibles"), ...termes(lam, e.k, e.kHaut as number), ligne(`${ev}\\approx ${p4(res)}`, "somme des valeurs non arrondies")];
      break;
  }
  out.push(
    utiliseCours("b", fx(intro), COURS_POISSON),
    calcul("b", lignes),
    resultat("b", fx(`$${ev}\\approx ${p4(res)}$.`)),
  );
  if (e.typeQuestion !== "exactement") out.push(verification("b", fx("La calculatrice (probabilités cumulées de la loi de Poisson) donne la même valeur.")));
  if (e.typeQuestion === "auMoins") out.push(piege("b", fx(`Le contraire de « $X\\geq ${e.k}$ » est « $X\\leq ${e.k - 1}$ », pas « $X\\leq ${e.k}$ ».`)));
  return out;
}

export function correctionDetailleeLoiPoisson(e: E): EtapeCorrection[] {
  return finaliserCombinatoire(e.famille === "A" ? corrigeA(e) : corrigeB(e));
}
