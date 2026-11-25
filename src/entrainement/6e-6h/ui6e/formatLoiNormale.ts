import type { EquationTable, ExerciceLoiNormale, ExerciceLoiNormaleA, ExerciceLoiNormaleB, ExerciceLoiNormaleC, ExerciceLoiNormaleD, FormePhi } from "../core6e/loiNormale.types";
import { arrondir, bornesZ, formeAttendue, POURCENTAGE_REGLE, valeurForme } from "../generateurs6e/loiNormale/calculs";
import { valeurTablePhi } from "../../../lib/tablePhi";
import { equationJusteDe, probabilitesAcceptees, zAcceptes } from "../moteur6e/verificationLoiNormale";
import type { PhaseLoiNormale } from "../moteur6e/typesLoiNormale";
import { vautEnviron } from "../moteur6e/saisieVariablesAleatoires";
import { decimalLatex, f, m, milliersTexte, t } from "./fragmentsCombinatoire";
import type { AideCombi, ChampCombi, FormatCombinatoire, FragmentConsigne } from "./fragmentsCombinatoire";

/**
 * Textes de `6gen51` (6e ch. 8, § 6) — audit, lot C : notation 𝒩(μ ; σ) (point-virgule, second
 * paramètre = écart-type), virgule décimale, consigne d'arrondi explicite (« à 10⁻⁴ », comme la table),
 * plus aucun exemple de champ (avant : « ex : 0.1587 », refusé par la règle utilisée), aides qui ne
 * posent plus le calcul (avant : « a = 38,82 + (−2,27) × 9,52 »), contextes réalistes (μ > 0).
 */

type E = ExerciceLoiNormale;
type P = PhaseLoiNormale;

export const NORMALE = (mu: string | number, sigma: string | number) => `\\mathcal{N}(${mu}\\,;\\,${sigma})`;

export function zL(z: number): string {
  return z.toFixed(2).replace(".", "{,}");
}
export function zTexte(z: number): string {
  return z.toFixed(2).replace(".", ",").replace("-", "−");
}
export function xL(x: number): string {
  return decimalLatex(x);
}
export function xTexte(x: number): string {
  return String(x).replace(".", ",").replace("-", "−");
}
function p4(x: number): string {
  return decimalLatex(arrondir(x, 4));
}

/** Événement du sens direct, en KaTeX. */
export function evenementDirect(e: ExerciceLoiNormaleA | ExerciceLoiNormaleB): string {
  if (e.famille === "A") {
    if (e.sousType === "inferieur") return `P(Z\\leq ${zL(e.z1)})`;
    if (e.sousType === "superieur") return `P(Z\\geq ${zL(e.z1)})`;
    return `P(${zL(e.z1)}\\leq Z\\leq ${zL(e.z2 as number)})`;
  }
  if (e.sousType === "inferieur") return `P(X\\leq ${xL(e.x1)})`;
  if (e.sousType === "superieur") return `P(X\\geq ${xL(e.x1)})`;
  return `P(${xL(e.x1)}\\leq X\\leq ${xL(e.x2 as number)})`;
}

export function latexForme(forme: FormePhi, z1: number, z2: number | null): string {
  const t1 = zL(Math.abs(z1));
  const t2 = z2 === null ? "" : zL(Math.abs(z2));
  switch (forme) {
    case "phi":
      return `\\Phi(${t1})`;
    case "unMoinsPhi":
      return `1-\\Phi(${t1})`;
    case "phiMoinsDemi":
      return `\\Phi(${t1})-0{,}5`;
    case "diff":
      return `\\Phi(${t2})-\\Phi(${t1})`;
    case "sommeMoinsUn":
      return `\\Phi(${t2})+\\Phi(${t1})-1`;
    case "diffInverse":
      return `\\Phi(${t1})-\\Phi(${t2})`;
  }
}

/** Calcul de la probabilité avec les valeurs de table, en KaTeX. */
function calculTable(forme: FormePhi, z1: number, z2: number | null): string {
  const v1 = p4(valeurTablePhi(Math.abs(z1)));
  const v2 = z2 === null ? "" : p4(valeurTablePhi(Math.abs(z2)));
  switch (forme) {
    case "phi":
      return v1;
    case "unMoinsPhi":
      return `1-${v1}`;
    case "phiMoinsDemi":
      return `${v1}-0{,}5`;
    case "diff":
      return `${v2}-${v1}`;
    case "sommeMoinsUn":
      return `${v2}+${v1}-1`;
    case "diffInverse":
      return `${v1}-${v2}`;
  }
}

function lettre(e: ExerciceLoiNormaleC | ExerciceLoiNormaleD): string {
  return e.famille === "C" ? "t" : "z";
}

export function equationLatex(q: EquationTable, l: string): string {
  return `\\Phi(${q.oppose ? `-${l}` : l})=${p4(q.valeur)}`;
}

/** Donnée du sens inverse, en KaTeX. */
export function donneeInverse(e: ExerciceLoiNormaleC | ExerciceLoiNormaleD): string {
  const v = e.famille === "C" ? "Z" : "X";
  const b = e.famille === "C" ? "t" : "a";
  const p = p4(e.p);
  switch (e.sousType) {
    case "inferieur":
      return `P(${v}\\leq ${b})=${p}`;
    case "superieur":
      return `P(${v}\\geq ${b})=${p}`;
    case "centre":
      return e.famille === "C" ? `P(-t\\leq Z\\leq t)=${p}` : `P(${xL(e.mu)}-d\\leq X\\leq ${xL(e.mu)}+d)=${p}`;
    case "depuisZero":
      return e.famille === "C" ? `P(0\\leq Z\\leq t)=${p}` : `P(${xL(e.mu)}\\leq X\\leq a)=${p}`;
  }
}

const RELATIONS = "Relations du cours : $P(Z\\geq t)=1-\\Phi(t)$, $\\Phi(-t)=1-\\Phi(t)$, $P(-t\\leq Z\\leq t)=2\\Phi(t)-1$ et $P(0\\leq Z\\leq t)=\\Phi(t)-0{,}5$.";

function populationTexte(n: number): string {
  return milliersTexte(n);
}

function lignesContexte(e: E & { famille: "B" | "D" | "E" }): FragmentConsigne[] {
  return [t(`On note `), m("X"), t(` ${e.contexte.sujet}. On admet que `), m(`X\\sim${NORMALE(xL(e.mu), xL(e.sigma))}`), t(" : moyenne "), m(xL(e.mu)), t(", écart-type "), m(xL(e.sigma)), t(` (en ${e.contexte.unite}).`)];
}

export const FORMAT_6GEN51: FormatCombinatoire<E, P> = {
  consigneGenerale(e) {
    switch (e.famille) {
      case "A":
        return [m("Z"), t(" suit la loi normale centrée réduite "), m(NORMALE(0, 1)), t(". La table donne "), m("\\Phi(t)=P(Z\\leq t)"), t(" pour "), m("t\\geq 0"), t(" ; donne les probabilités arrondies à "), m("10^{-4}"), t(".")];
      case "B":
        return [t("Standardise, puis utilise la table de "), m("\\Phi"), t(" (entrées positives). Probabilités arrondies à "), m("10^{-4}"), t(".")];
      case "C":
        return [m(`Z\\sim${NORMALE(0, 1)}`), t(". On connaît une probabilité ; on cherche la borne "), m("t"), t(" par une lecture inverse de la table.")];
      case "D":
        return [t("On connaît une proportion ; on cherche la valeur correspondante par une lecture inverse de la table.")];
      case "E":
        return [t("Règle empirique du cours : environ 68,3 % des valeurs sont à moins d'un écart-type de la moyenne, 95,4 % à moins de deux, 99,7 % à moins de trois. Utilise ces pourcentages.")];
    }
  },
  donnees(e): FragmentConsigne[][] {
    switch (e.famille) {
      case "A":
        return [[t("On cherche "), m(evenementDirect(e)), t(".")]];
      case "B": {
        const lignes = [lignesContexte(e), [t("On cherche la probabilité "), m(evenementDirect(e)), t(".")]];
        if (e.population !== null) lignes.push([t(`On étudie un groupe de ${populationTexte(e.population)} ${e.contexte.individus}.`)]);
        return lignes;
      }
      case "C":
        return [[t("On sait que "), m(donneeInverse(e)), t(".")]];
      case "D": {
        const quoi =
          e.sousType === "inferieur"
            ? `On cherche la valeur $a$ sous laquelle se trouvent ${pourcent(e.p)} des ${e.contexte.individus} :`
            : e.sousType === "superieur"
              ? `On cherche la valeur $a$ dépassée par ${pourcent(e.p)} des ${e.contexte.individus} :`
              : e.sousType === "centre"
                ? `On cherche l'intervalle centré sur la moyenne qui contient ${pourcent(e.p)} des ${e.contexte.individus}, et $a$, sa borne supérieure :`
                : `On cherche la valeur $a$ telle que ${pourcent(e.p)} des ${e.contexte.individus} soient entre la moyenne et $a$ :`;
        return [lignesContexte(e), [...f(quoi + " "), m(donneeInverse(e)), t(e.sousType === "centre" ? " et " : "."), ...(e.sousType === "centre" ? [m(`a=${xL(e.mu)}+d`), t(".")] : [])]];
      }
      case "E": {
        const bas = xL(arrondir(e.mu - e.k * e.sigma, 2));
        const haut = xL(arrondir(e.mu + e.k * e.sigma, 2));
        const quoi = !e.unCote
          ? [t("On s'intéresse à l'événement « "), m(`X<${bas}`), t(" ou "), m(`X>${haut}`), t(" ».")]
          : e.coteDemande === "superieur"
            ? [t("On s'intéresse à l'événement « "), m(`X>${haut}`), t(" ».")]
            : [t("On s'intéresse à l'événement « "), m(`X<${bas}`), t(" ».")];
        const lignes = [lignesContexte(e), quoi];
        if (e.population !== null) lignes.push([t(`On étudie un groupe de ${populationTexte(e.population)} ${e.contexte.individus}.`)]);
        return lignes;
      }
    }
  },
  consigneEcran(e, p) {
    switch (p) {
      case "aForme":
      case "bForme":
        return [t("Comment s'écrit cette probabilité avec des valeurs de la table (entrées positives) ?")];
      case "aProba":
      case "bProba":
        return [t("Calcule cette probabilité avec la table, arrondie à "), m("10^{-4}"), t(".")];
      case "bZ":
        return e.famille === "B" && e.x2 !== null
          ? [t("Standardise chaque borne : "), m("z=\\dfrac{x-\\mu}{\\sigma}"), t(" (au centième).")]
          : [t("Standardise la borne : "), m("z=\\dfrac{x-\\mu}{\\sigma}"), t(" (au centième).")];
      case "bEffectif":
        return e.famille === "B" ? [t(`Combien ${de(e.contexte.individus)} du groupe peut-on s'attendre à trouver ? (arrondi à l'unité)`)] : [];
      case "cEquation":
      case "dEquation":
        return e.famille === "D" ? [t("En posant "), m("z=\\dfrac{a-\\mu}{\\sigma}"), t(", à quelle égalité de la table cela revient-il ?")] : [t("À quelle égalité de la table cela revient-il ?")];
      case "cT":
        return [t("Lis "), m("t"), t(" dans la table (au centième).")];
      case "dZ":
        return [t("Lis "), m("z"), t(" dans la table (au centième).")];
      case "dA":
        return [t("Déduis-en "), m("a"), t(" (au dixième).")];
      case "eK":
        return e.famille === "E" ? [t(`À combien d'écarts-types de la moyenne se trouve${e.unCote ? " la borne" : "nt les bornes"} ?`)] : [];
      case "eProportion":
        return e.famille === "E" ? [t(`Quelle proportion des ${e.contexte.individus} est concernée ?`)] : [];
      case "eEffectif":
        return e.famille === "E" ? [t(`Combien ${de(e.contexte.individus)} du groupe environ ? (arrondi à l'unité)`)] : [];
    }
  },
  champs(e, p): ChampCombi[] {
    switch (p) {
      case "aForme":
      case "bForme": {
        if (e.famille !== "A" && e.famille !== "B") return [];
        const { z1, z2 } = bornesZ(e);
        return [{ type: "choix", label: "", options: e.options.map((o) => ({ valeur: o, label: `$${latexForme(o, z1, z2)}$` })) }];
      }
      case "aProba":
      case "bProba":
        return e.famille === "A" || e.famille === "B" ? [{ type: "texte", label: `$${evenementDirect(e)}$` }] : [];
      case "bZ":
        return e.famille === "B" && e.x2 !== null
          ? [
              { type: "texte", label: "$z_1$" },
              { type: "texte", label: "$z_2$" },
            ]
          : [{ type: "texte", label: "$z$" }];
      case "bEffectif":
      case "eEffectif":
        return [{ type: "texte", label: "Effectif" }];
      case "cEquation":
      case "dEquation":
        return e.famille === "C" || e.famille === "D" ? [{ type: "choix", label: "", options: e.equations.map((q) => ({ valeur: q.id, label: `$${equationLatex(q, lettre(e))}$` })) }] : [];
      case "cT":
        return [{ type: "texte", label: "$t$" }];
      case "dZ":
        return [{ type: "texte", label: "$z$" }];
      case "dA":
        return [{ type: "texte", label: "$a$" }];
      case "eK":
        return [{ type: "texte", label: "Nombre d'écarts-types" }];
      case "eProportion":
        return [{ type: "texte", label: "Proportion" }];
    }
  },
  aides(e, p): AideCombi[] {
    switch (p) {
      case "aForme":
      case "bForme":
        return [
          { texte: "La courbe est symétrique par rapport à 0 et l'aire totale vaut 1 :", latex: "P(Z\\geq t)=1-\\Phi(t)\\qquad \\Phi(-t)=1-\\Phi(t)" },
          { texte: "Regarde la partie hachurée : est-elle à gauche ou à droite de la borne ? La borne est-elle positive ou négative ?" },
        ];
      case "aProba":
      case "bProba":
        return [
          { texte: "Lis $\\Phi(t)$ dans la table : ligne du dixième, colonne du centième (par exemple $\\Phi(1{,}23)$ : ligne $1{,}2$, colonne $0{,}03$)." },
          { texte: "Remplace chaque $\\Phi$ de l'écriture choisie à l'écran précédent par la valeur lue, puis calcule." },
        ];
      case "bZ":
        return e.famille === "B" ? [{ texte: "On centre puis on réduit :", latex: "z=\\dfrac{x-\\mu}{\\sigma}" }, { texte: `Ici $\\mu=${xL(e.mu)}$ et $\\sigma=${xL(e.sigma)}$ ; une valeur sous la moyenne donne un $z$ négatif.` }] : [];
      case "bEffectif":
      case "eEffectif":
        return [{ texte: "Effectif attendu = taille du groupe × proportion." }, { texte: "Utilise la proportion de l'écran précédent, puis arrondis à l'unité." }];
      case "cEquation":
      case "dEquation":
        return [{ texte: RELATIONS }, { texte: "La table ne lit que des valeurs positives : une probabilité « à gauche » plus petite que 0,5 correspond à une borne négative (on passe par $\\Phi(-t)$)." }];
      case "cT":
      case "dZ":
        return [
          { texte: "Cherche dans la table la case égale (ou la plus proche) de la valeur ; la borne vaut ligne + colonne." },
          { texte: `Si l'égalité porte sur $\\Phi(-${p === "cT" ? "t" : "z"})$, la table donne $-${p === "cT" ? "t" : "z"}$ : change ensuite le signe.` },
        ];
      case "dA":
        return e.famille === "D" ? [{ texte: "On revient à la variable de départ :", latex: "a=\\mu+z\\,\\sigma" }, { texte: `Ici $\\mu=${xL(e.mu)}$ et $\\sigma=${xL(e.sigma)}$ ; utilise $z$ de l'écran précédent.` }] : [];
      case "eK":
        return e.famille === "E" ? [{ texte: "Nombre d'écarts-types = écart à la moyenne divisé par $\\sigma$." }, { texte: `Ici $\\mu=${xL(e.mu)}$ et $\\sigma=${xL(e.sigma)}$.` }] : [];
      case "eProportion":
        return [
          { texte: "Hors de l'intervalle de $k$ écarts-types : 100 % moins le pourcentage de la règle." },
          { texte: "La courbe est symétrique : d'un seul côté, c'est la moitié de ce qui est hors de l'intervalle." },
        ];
    }
  },
  reponseAttendue(e, p) {
    switch (e.famille) {
      case "A":
      case "B": {
        const { z1, z2 } = bornesZ(e);
        if (p === "bZ") return z2 === null ? [`z=${zL(z1)}`] : [`z_1=${zL(z1)}`, `z_2=${zL(z2)}`];
        if (p === "aForme" || p === "bForme") return [`${evenementDirect(e)}=${latexForme(formeAttendue(e.sousType, z1, z2), z1, z2)}`];
        const pt = probabilitesAcceptees(e)[0];
        if (p === "aProba" || p === "bProba") return [`${evenementDirect(e)}\\approx ${p4(pt)}`];
        return [`\\approx ${Math.round((e.famille === "B" ? (e.population ?? 0) : 0) * pt)}`];
      }
      case "C":
      case "D": {
        const q = equationJusteDe(e);
        if (p === "cEquation" || p === "dEquation") return [equationLatex(q, lettre(e))];
        const z = zAcceptes(e).exactes;
        if (p === "cT" || p === "dZ") return [`${lettre(e)}\\approx ${z.map(zL).join("\\ \\text{ou}\\ ")}`];
        return [`a\\approx ${aArrondis(e as ExerciceLoiNormaleD).map(xL).join("\\ \\text{ou}\\ ")}`];
      }
      case "E": {
        if (p === "eK") return [`k=${e.k}`];
        const prop = probabilitesAcceptees(e)[0];
        if (p === "eProportion") return [`${decimalLatex(prop)}`];
        return [`\\approx ${Math.round((e.population ?? 0) * prop)}`];
      }
    }
  },
  explication(e, p) {
    switch (e.famille) {
      case "A":
      case "B": {
        const { z1, z2 } = bornesZ(e);
        const forme = formeAttendue(e.sousType, z1, z2);
        if (p === "bZ") {
          const ligne = (x: number, z: number) => `\\dfrac{${xL(x)}-${xL(e.famille === "B" ? e.mu : 0)}}{${xL(e.famille === "B" ? e.sigma : 1)}}=${zL(z)}`;
          return e.famille === "B" ? [f(z2 === null ? `$z=${ligne(e.x1, z1)}$` : `$z_1=${ligne(e.x1, z1)}$ ; $z_2=${ligne(e.x2 as number, z2)}$`)] : [];
        }
        if (p === "aForme" || p === "bForme") {
          const raison =
            forme === "phi"
              ? z1 >= 0
                ? "aire à gauche d'une borne positive : lecture directe."
                : "aire à droite d'une borne négative : par symétrie, c'est l'aire à gauche de son opposé."
              : forme === "unMoinsPhi"
                ? z1 >= 0
                  ? "aire à droite d'une borne positive : complément à 1."
                  : "aire à gauche d'une borne négative : par symétrie, c'est l'aire à droite de son opposé, donc un complément."
                : forme === "diff"
                  ? "deux bornes positives : aire à gauche de la plus grande moins aire à gauche de la plus petite."
                  : forme === "sommeMoinsUn"
                    ? "une borne négative et une positive : $\\Phi(t_2)-(1-\\Phi(t_1))$."
                    : "deux bornes négatives : par symétrie, c'est l'intervalle entre leurs opposés.";
          return [f(`$${evenementDirect(e)}=${latexForme(forme, z1, z2)}$ : ${raison}`)];
        }
        const pt = probabilitesAcceptees(e)[0];
        if (p === "aProba" || p === "bProba") {
          const calc = calculTable(forme, z1, z2);
          const exacte = p4(probabilitesAcceptees(e)[1]);
          return [f(`$${latexForme(forme, z1, z2)}=${calc === p4(pt) ? "" : `${calc}=`}${p4(pt)}$${exacte === p4(pt) ? "." : ` (la calculatrice donne $${exacte}$, accepté aussi).`}`)];
        }
        const pop = e.famille === "B" ? (e.population ?? 0) : 0;
        return [f(`$${pop}\\times ${p4(pt)}\\approx ${decimalLatex(arrondir(pop * pt, 1))}$, soit environ $${Math.round(pop * pt)}$.`)];
      }
      case "C":
      case "D": {
        const q = equationJusteDe(e);
        const l = lettre(e);
        if (p === "cEquation" || p === "dEquation") {
          const raison =
            q.id === "phiP"
              ? "probabilité à gauche, au moins 0,5 : lecture directe."
              : q.id === "phiOpposeUnMoinsP"
                ? `probabilité à gauche plus petite que 0,5 : la borne est négative et $\\Phi(-${l})=1-p$.`
                : q.id === "phiUnMoinsP"
                  ? `probabilité à droite : $\\Phi(${l})=1-p$, borne positive puisque $p\\leq 0{,}5$.`
                  : q.id === "phiOpposeP"
                    ? `probabilité à droite plus grande que 0,5 : la borne est négative et $\\Phi(-${l})=p$.`
                    : q.id === "phiCentre"
                      ? `$2\\Phi(${l})-1=p$, donc $\\Phi(${l})=\\dfrac{1+p}{2}$.`
                      : `$\\Phi(${l})-0{,}5=p$, donc $\\Phi(${l})=0{,}5+p$.`;
          return [f(`$${donneeInverse(e)}$ : ${raison} Ici $${equationLatex(q, l)}$.`)];
        }
        const zs = zAcceptes(e).exactes;
        const lu = zs.map((z) => zL(Math.abs(z))).join("\\ \\text{ou}\\ ");
        if (p === "cT" || p === "dZ") return [f(`La case $${p4(q.valeur)}$ se lit pour $${lu}$${q.oppose ? ` : c'est $-${l}$, donc $${l}\\approx ${zs.map(zL).join("\\ \\text{ou}\\ ")}$` : ""}.`)];
        const d = e as ExerciceLoiNormaleD;
        return [f(`$a=\\mu+z\\,\\sigma=${xL(d.mu)}+(${zL(zs[0])})\\times ${xL(d.sigma)}=${xL(arrondir(d.mu + zs[0] * d.sigma, 2))}$.`)];
      }
      case "E": {
        const prop = probabilitesAcceptees(e)[0];
        if (p === "eK") return [f(`$\\dfrac{${xL(arrondir(e.k * e.sigma, 2))}}{${xL(e.sigma)}}=${e.k}$ : la borne est à $${e.k}$ écart${e.k > 1 ? "s" : ""}-type${e.k > 1 ? "s" : ""} de la moyenne.`)];
        if (p === "eProportion") {
          const hors = decimalLatex(arrondir(1 - POURCENTAGE_REGLE[e.k], 3));
          return [f(e.unCote ? `Hors de l'intervalle : $1-${decimalLatex(POURCENTAGE_REGLE[e.k])}=${hors}$ ; d'un seul côté (symétrie) : $${hors}\\div 2=${decimalLatex(prop)}$.` : `Hors de l'intervalle : $1-${decimalLatex(POURCENTAGE_REGLE[e.k])}=${hors}$.`)];
        }
        const pop = e.population ?? 0;
        return [f(`$${pop}\\times ${decimalLatex(prop)}\\approx ${decimalLatex(arrondir(pop * prop, 1))}$, soit environ $${Math.round(pop * prop)}$.`)];
      }
    }
  },
  libellePhase(_e, p) {
    const l: Record<P, string> = {
      aForme: "Écriture avec Φ",
      aProba: "Probabilité",
      bZ: "Standardisation",
      bForme: "Écriture avec Φ",
      bProba: "Probabilité",
      bEffectif: "Effectif",
      cEquation: "Égalité de table",
      cT: "Valeur de t",
      dEquation: "Égalité de table",
      dZ: "Valeur de z",
      dA: "Valeur de a",
      eK: "Écarts-types",
      eProportion: "Proportion",
      eEffectif: "Effectif",
    };
    return l[p];
  },
  messageCible(e, p, valeurs) {
    const v = valeurs[0] ?? "";
    if ((e.famille === "A" || e.famille === "B") && (p === "aProba" || p === "bProba")) {
      const { z1, z2 } = bornesZ(e);
      const juste = formeAttendue(e.sousType, z1, z2);
      for (const autre of ["phi", "unMoinsPhi", "diff", "sommeMoinsUn", "diffInverse"] as FormePhi[]) {
        if (autre === juste || (z2 === null) !== (autre === "phi" || autre === "unMoinsPhi")) continue;
        if (vautEnviron(v, valeurForme(autre, z1, z2), 1e-4)) return f(`Ce calcul correspond à $${latexForme(autre, z1, z2)}$ : reprends l'écriture de l'écran précédent.`);
      }
      return null;
    }
    if (e.famille === "B" && p === "bZ") {
      const z = bornesZ(e).z1;
      if (vautEnviron(v, -z)) return [t("Le signe est inversé : z est négatif quand x est sous la moyenne.")];
      return null;
    }
    if ((e.famille === "C" || e.famille === "D") && (p === "cT" || p === "dZ")) {
      const zs = zAcceptes(e).exactes;
      if (zs.some((z) => vautEnviron(v, -z))) return [t("Le signe est inversé : relis l'égalité choisie, Φ(t) ou Φ(−t).")];
      return null;
    }
    if (e.famille === "E" && p === "eProportion") {
      const autre = probabilitesAcceptees({ ...e, unCote: !e.unCote })[0];
      if (vautEnviron(v, autre, 1e-4)) return [t(e.unCote ? "C'est la proportion des deux côtés : on n'en veut qu'un, divise par 2." : "C'est un seul côté : on veut les deux côtés de l'intervalle.")];
      if (vautEnviron(v, POURCENTAGE_REGLE[e.k], 1e-4)) return [t("C'est la proportion dans l'intervalle ; on veut celle qui est en dehors.")];
    }
    return null;
  },
};

/** Valeurs de a (au dixième) issues des lectures de table acceptées. */
export function aArrondis(e: ExerciceLoiNormaleD): number[] {
  return [...new Set(zAcceptes(e).exactes.map((z) => arrondir(e.mu + z * e.sigma, 1)))];
}

/** « d'ampoules », « de pommes ». */
function de(mot: string): string {
  return /^[aeiouéèêh]/i.test(mot) ? `d'${mot}` : `de ${mot}`;
}

function pourcent(p: number): string {
  return `${String(arrondir(p * 100, 2)).replace(".", ",")} %`;
}

