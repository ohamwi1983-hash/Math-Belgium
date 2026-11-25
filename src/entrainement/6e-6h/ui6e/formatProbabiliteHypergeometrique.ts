import type { ExerciceProbabiliteHypergeometrique } from "../core6e/probabiliteHypergeometrique.types";
import type { PhaseProbabiliteHypergeometrique } from "../moteur6e/typesProbabiliteHypergeometrique";
import { rationnel, vaut } from "../moteur6e/saisieCombinatoire";
import { arrondiLatex, decimalesAffichage, f, fractionLatex, milliers, t } from "./fragmentsCombinatoire";
import type { ChampCombi, FormatCombinatoire, FragmentConsigne } from "./fragmentsCombinatoire";

/**
 * Textes de `6gen47` (6e ch. 7, § 5) — audit, lots B et C : contexte en prose avec ses nombres (plus
 * coupé à 390 px), couleurs nommées (plus « couleur 1 / couleur 2 »), « × » comme dans le cours,
 * indices en KaTeX, réponse attendue de l'écran « formule » = la formule avec les nombres, aide de
 * niveau 2 qui ne donne plus la réponse, messages ciblés (avec remise, Cₙᴺ au mauvais endroit).
 */

type E = ExerciceProbabiliteHypergeometrique;
type P = PhaseProbabiliteHypergeometrique;

export const ANNONCE_PRECISION = "Donne la valeur exacte (une fraction) ou un arrondi au millième.";

function frac(n: number, d: number): string {
  return fractionLatex(rationnel(n, d));
}

function valeur(n: number, d: number): string {
  const x = n / d;
  const r = rationnel(n, d);
  return `${fractionLatex(r)}\\approx ${arrondiLatex(x, decimalesAffichage(x))}`;
}

function formuleA(e: E & { famille: "A" }): string {
  return `\\dfrac{C_{${e.K}}^{${e.k}}\\times C_{${e.N - e.K}}^{${e.n - e.k}}}{C_{${e.N}}^{${e.n}}}`;
}

/** « la probabilité de n'obtenir… », « la probabilité d'obtenir… », « la probabilité que Léa… ». */
export function laProbabiliteDe(evenement: string): string {
  if (/^qu(e |')/.test(evenement)) return `la probabilité ${evenement}`;
  return /^[aeéèêioôu]/i.test(evenement) ? `la probabilité d'${evenement}` : `la probabilité de ${evenement}`;
}

function couleur(c: "c1" | "c2"): string {
  return c === "c1" ? "rouge" : "bleue";
}

function produitSequence(e: E & { famille: "B" }): string {
  let r1 = e.n1;
  let r2 = e.n2;
  let tot = e.N;
  const facteurs: string[] = [];
  for (const c of e.sequence) {
    facteurs.push(`\\dfrac{${c === "c1" ? r1 : r2}}{${tot}}`);
    if (c === "c1") r1--;
    else r2--;
    tot--;
  }
  return facteurs.join("\\times ");
}

function formuleC(cat: { N: number; K: number; n: number; k: number }): string {
  return `\\dfrac{C_{${cat.K}}^{${cat.k}}\\times C_{${cat.N - cat.K}}^{${cat.n - cat.k}}}{C_{${cat.N}}^{${cat.n}}}`;
}

export const FORMAT_6GEN47: FormatCombinatoire<E, P> = {
  consigneGenerale(e) {
    switch (e.famille) {
      case "A":
        return [...f("Tirage sans remise : $P(X=k)=\\dfrac{C_K^k\\times C_{N-K}^{n-k}}{C_N^n}$. "), t(ANNONCE_PRECISION)];
      case "B":
        return [t("Tirages successifs sans remise : compare la probabilité d'une séquence précise (dans un ordre donné) et celle d'une composition (dans un ordre quelconque). "), t(ANNONCE_PRECISION)];
      case "C":
        return [t("Deux tirages sans remise, faits dans deux urnes différentes : ils sont indépendants. "), t(ANNONCE_PRECISION)];
    }
  },
  donnees(e): FragmentConsigne[][] {
    switch (e.famille) {
      case "A":
        return [[t(e.contexte.phrase)], [t(`On cherche ${laProbabiliteDe(e.contexte.evenement)}.`)]];
      case "B":
        return [[t(`Une urne contient ${e.n1} boules rouges et ${e.n2} boules bleues. On tire trois boules l'une après l'autre, sans remise.`)], [t(`Séquence étudiée : ${e.sequence.map(couleur).join(", puis ")}.`)]];
      case "C":
        return [
          [t(`Au jeu du Mini-Loto, on tire ${e.principal.n} numéros parmi ${e.principal.N}, puis, dans une autre urne, ${e.bonus.n} ${e.bonus.n > 1 ? "numéros bonus" : "numéro bonus"} parmi ${e.bonus.N}.`)],
          [t(`Un joueur a coché ${e.principal.K} numéros principaux et ${e.bonus.K} numéros bonus.`)],
          [t(`On cherche la probabilité qu'exactement ${e.principal.k} de ses numéros principaux sortent et ${e.bonus.k === 0 ? "qu'aucun de ses numéros bonus ne sorte" : `qu'exactement ${e.bonus.k} de ses numéros bonus ${e.bonus.k > 1 ? "sortent" : "sorte"}`}.`)],
        ];
    }
  },
  consigneEcran(e, p) {
    switch (e.famille) {
      case "A":
        return p === "aEcran1" ? [t("Écris la probabilité cherchée avec des combinaisons, sans les calculer.")] : [t("Calcule cette probabilité.")];
      case "B":
        if (p === "bEcran1") return [t("Quelle est la probabilité d'obtenir exactement cette séquence, dans cet ordre ?")];
        if (p === "bEcran2") return [t(`De combien d'ordres différents peut-on obtenir ${e.a} ${e.a > 1 ? "rouges" : "rouge"} et ${e.b} ${e.b > 1 ? "bleues" : "bleue"} en trois tirages ?`)];
        return [t(`Quelle est la probabilité d'obtenir ${e.a} ${e.a > 1 ? "boules rouges" : "boule rouge"} et ${e.b} ${e.b > 1 ? "boules bleues" : "boule bleue"}, dans un ordre quelconque ?`)];
      case "C":
        if (p === "cEcran1") return [t(`Probabilité qu'exactement ${e.principal.k} numéros principaux cochés sortent.`)];
        if (p === "cEcran2") return [t(e.bonus.k === 0 ? "Probabilité qu'aucun numéro bonus coché ne sorte." : `Probabilité qu'exactement ${e.bonus.k} ${e.bonus.k > 1 ? "numéros bonus cochés sortent" : "numéro bonus coché sorte"}.`)];
        return [t("Probabilité des deux événements à la fois.")];
    }
  },
  champs(e, p): ChampCombi[] {
    switch (e.famille) {
      case "A":
        return p === "aEcran1" ? [{ type: "texte", label: "Probabilité (formule)", apercu: true, nature: "formule" }] : [{ type: "texte", label: "Probabilité" }];
      case "B":
        if (p === "bEcran2") return [{ type: "texte", label: "Nombre d'ordres" }];
        return [{ type: "texte", label: p === "bEcran1" ? "Probabilité de la séquence" : "Probabilité de la composition", apercu: true }];
      case "C":
        return [{ type: "texte", label: p === "cEcran1" ? "$P_1$ (numéros principaux)" : p === "cEcran2" ? "$P_2$ (numéros bonus)" : "$P$", apercu: true }];
    }
  },
  aides(e, p) {
    switch (e.famille) {
      case "A":
        if (p === "aEcran1") return [{ texte: "Nombre de tirages favorables : choisir $k$ succès parmi les $K$, et les $n-k$ autres parmi les $N-K$ ; nombre total : choisir $n$ parmi $N$." }, { texte: `Ici $N=${e.N}$ (${e.contexte.labelPopulation}), $K=${e.K}$ (${e.contexte.labelSucces}), $n=${e.n}$ (${e.contexte.labelTirage}) et $k=${e.k}$.` }];
        return [{ texte: "Calcule chaque combinaison (touche nCr), puis simplifie la fraction." }, { texte: "Une probabilité est comprise entre 0 et 1 : vérifie l'ordre de grandeur." }];
      case "B":
        if (p === "bEcran1") return [{ texte: "Règle du produit : on multiplie les probabilités des tirages successifs ; sans remise, l'urne perd une boule à chaque tirage." }, { texte: `Premier tirage : ${e.N} boules ; deuxième : ${e.N - 1} ; troisième : ${e.N - 2}.` }];
        if (p === "bEcran2") return [{ texte: "Placer les boules rouges parmi les trois tirages : $C_3^a$ façons." }, { texte: `Ici $a=${e.a}$.` }];
        return [{ texte: "Chaque ordre a la même probabilité que la séquence étudiée (mêmes facteurs, dans un autre ordre)." }, { texte: "Multiplie la probabilité de la séquence par le nombre d'ordres ; tu peux vérifier avec $\\dfrac{C_{n_1}^{a}\\times C_{n_2}^{b}}{C_N^3}$." }];
      case "C":
        if (p === "cEcran3") return [{ texte: "Deux événements indépendants : $P(A\\cap B)=P(A)\\times P(B)$." }, { texte: "Multiplie les deux probabilités des écrans précédents." }];
        {
          const cat = p === "cEcran1" ? e.principal : e.bonus;
          return [{ texte: "Formule hypergéométrique :", latex: "\\dfrac{C_K^k\\times C_{N-K}^{n-k}}{C_N^n}" }, { texte: `Ici $N=${cat.N}$, $K=${cat.K}$, $n=${cat.n}$, $k=${cat.k}$.` }];
        }
    }
  },
  reponseAttendue(e, p) {
    switch (e.famille) {
      case "A":
        return p === "aEcran1" ? [formuleA(e)] : [valeur(e.numerateurFacteur1 * e.numerateurFacteur2, e.denominateur)];
      case "B":
        if (p === "bEcran1") return [`${produitSequence(e)}=${valeur(e.numerateurSequence, e.denominateurSequence)}`];
        if (p === "bEcran2") return [`C_3^{${e.a}}=${e.nombreArrangements}`];
        return [valeur(e.numerateurComposition, e.denominateurComposition)];
      case "C":
        if (p === "cEcran1") return [valeur(e.principal.numerateur, e.principal.denominateur)];
        if (p === "cEcran2") return [valeur(e.bonus.numerateur, e.bonus.denominateur)];
        return [valeur(e.numerateurCombine, e.denominateurCombine)];
    }
  },
  explication(e, p) {
    switch (e.famille) {
      case "A":
        return p === "aEcran1"
          ? [f(`Favorables : $C_{${e.K}}^{${e.k}}\\times C_{${e.N - e.K}}^{${e.n - e.k}}$ ; possibles : $C_{${e.N}}^{${e.n}}$.`)]
          : [f(`$\\dfrac{${milliers(e.numerateurFacteur1)}\\times ${milliers(e.numerateurFacteur2)}}{${milliers(e.denominateur)}}=${valeur(e.numerateurFacteur1 * e.numerateurFacteur2, e.denominateur)}$.`)];
      case "B":
        if (p === "bEcran1") return [f(`$${produitSequence(e)}=${frac(e.numerateurSequence, e.denominateurSequence)}$ : le dénominateur diminue d'une unité à chaque tirage.`)];
        if (p === "bEcran2") return [f(`On choisit les places des ${e.a === 1 ? "boule rouge" : "boules rouges"} parmi les trois tirages : $C_3^{${e.a}}=${e.nombreArrangements}$.`)];
        return [f(`$${e.nombreArrangements}\\times ${frac(e.numerateurSequence, e.denominateurSequence)}=${frac(e.numerateurComposition, e.denominateurComposition)}$, soit aussi $\\dfrac{C_{${e.n1}}^{${e.a}}\\times C_{${e.n2}}^{${e.b}}}{C_{${e.N}}^{3}}$.`)];
      case "C":
        if (p === "cEcran1") return [f(`$${formuleC(e.principal)}=${frac(e.principal.numerateur, e.principal.denominateur)}$.`)];
        if (p === "cEcran2") return [f(`$${formuleC(e.bonus)}=${frac(e.bonus.numerateur, e.bonus.denominateur)}$.`)];
        return [f(`$${frac(e.principal.numerateur, e.principal.denominateur)}\\times ${frac(e.bonus.numerateur, e.bonus.denominateur)}=${valeur(e.numerateurCombine, e.denominateurCombine)}$.`)];
    }
  },
  libellePhase(e, p) {
    switch (e.famille) {
      case "A":
        return p === "aEcran1" ? "Formule" : "Probabilité";
      case "B":
        return p === "bEcran1" ? "Séquence" : p === "bEcran2" ? "Nombre d'ordres" : "Composition";
      case "C":
        return p === "cEcran1" ? "Numéros principaux" : p === "cEcran2" ? "Numéros bonus" : "Produit";
    }
  },
  messageCible(e, p, valeurs) {
    const v = valeurs[valeurs.length - 1] ?? "";
    switch (e.famille) {
      case "A":
        if (vaut(v, rationnel(e.numerateurFacteur1, e.denominateur))) return f("Il manque le choix des $n-k$ autres éléments parmi les $N-K$.");
        return null;
      case "B": {
        if (p === "bEcran1") {
          const avecRemise = rationnel(BigInt(e.n1) ** BigInt(e.a) * BigInt(e.n2) ** BigInt(e.b), BigInt(e.N) ** 3n);
          if (vaut(v, avecRemise)) return [t("C'est la probabilité avec remise : sans remise, l'urne perd une boule à chaque tirage.")];
        }
        if (p === "bEcran3" && vaut(v, rationnel(e.numerateurSequence, e.denominateurSequence))) return [t("C'est la probabilité d'un seul ordre : la composition peut être obtenue dans plusieurs ordres.")];
        return null;
      }
      case "C":
        if (p === "cEcran3" && vaut(v, rationnel(e.principal.numerateur * e.bonus.denominateur + e.bonus.numerateur * e.principal.denominateur, e.principal.denominateur * e.bonus.denominateur))) return [t("Les deux événements doivent se produire ensemble : on multiplie, on n'additionne pas.")];
        return null;
    }
  },
};

// ============================================================================
// Papier (lot E) : situation en prose + consigne globale, MÊMES phrases que l'écran
// ============================================================================

/** Situation imprimée (avec sa question pour A et C ; B a deux vraies questions). */
export function situationPapier47(e: E): FragmentConsigne[] {
  switch (e.famille) {
    case "A":
      return [t(`${e.contexte.phrase} Calcule ${laProbabiliteDe(e.contexte.evenement)}.`)];
    case "B":
      return [t(`Une urne contient ${e.n1} boules rouges et ${e.n2} boules bleues. On tire trois boules l'une après l'autre, sans remise. ${ANNONCE_PRECISION}`)];
    case "C": {
      const [l1, l2, l3] = FORMAT_6GEN47.donnees(e);
      const question = l3.map((x) => x.valeur).join("").replace(/^On cherche/, "Calcule");
      return [...l1, t(" "), ...l2, t(" "), t(question)];
    }
  }
}

export function sequenceTexte(e: E & { famille: "B" }): string {
  return e.sequence.map((c, i) => (i === 0 ? `une boule ${couleur(c)}` : `une ${couleur(c)}`)).join(", puis ");
}

export function compositionTexte(e: E & { famille: "B" }): string {
  return `${e.a} ${e.a > 1 ? "boules rouges" : "boule rouge"} et ${e.b} ${e.b > 1 ? "boules bleues" : "boule bleue"}`;
}

export function questionsPapier47(e: E): { consigne: FragmentConsigne[]; etapes: string[] }[] {
  if (e.famille === "B")
    return [
      { consigne: [t(`Calcule la probabilité d'obtenir, dans cet ordre, ${sequenceTexte(e)}.`)], etapes: ["a"] },
      { consigne: [t(`Calcule la probabilité d'obtenir ${compositionTexte(e)}, dans un ordre quelconque.`)], etapes: ["b", "c"] },
    ];
  return [{ consigne: [t(ANNONCE_PRECISION)], etapes: e.famille === "A" ? ["a", "b"] : ["a", "b", "c"] }];
}
