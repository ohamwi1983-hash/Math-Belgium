import type { DecompositionSommeDes, ExerciceDenombrementCombinatoirePur, SousTypeDenombCombPurA } from "../core6e/denombrementCombinatoirePur.types";
import type { PhaseDenombrementCombinatoirePur } from "../moteur6e/typesDenombrementCombinatoirePur";
import { vaut } from "../moteur6e/saisieCombinatoire";
import { f, milliers, t } from "./fragmentsCombinatoire";
import type { ChampCombi, FormatCombinatoire, FragmentConsigne } from "./fragmentsCombinatoire";

/**
 * Textes de `6gen46` (6e ch. 7, § 4) — audit, lots B et C : énoncés en contexte (« trois dés à six
 * faces », plus « n dés à f faces »), décompositions écrites {1 ; 2 ; 6} comme dans le cours (avant :
 * (1,2,6), virgule ambiguë), réponse D sans notation contradictoire (« S₁ = 25, S₂ = 27 S₂ = 10 »),
 * aucun exemple de champ qui soit une réponse, aides à deux niveaux, message ciblé sur l'inversion base /
 * exposant (piège du cours).
 */

type E = ExerciceDenombrementCombinatoirePur;
type P = PhaseDenombrementCombinatoirePur;

const MAINS: Record<SousTypeDenombCombPurA, string> = {
  carre: "un carré : quatre cartes de même hauteur et une cinquième carte",
  brelan: "un brelan : trois cartes de même hauteur et deux autres cartes de hauteurs différentes entre elles et de celle du brelan",
  paire: "une seule paire : deux cartes de même hauteur et trois autres cartes de hauteurs toutes différentes entre elles et de celle de la paire",
  deuxPaires: "deux paires : deux cartes d'une hauteur, deux cartes d'une autre hauteur et une cinquième carte d'une troisième hauteur",
};

function triplet(d: DecompositionSommeDes): string {
  return `\\{${d.valeurs.join("\\,;\\,")}\\}`;
}

function formulesA(e: E & { famille: "A" }): [string, string] {
  const h = e.hauteurs;
  const c = e.couleurs;
  switch (e.sousType) {
    case "carre":
      return [`${h}\\times C_{4}^{4}`, `${h - 1}\\times ${c}`];
    case "brelan":
      return [`${h}\\times C_{${c}}^{3}`, `C_{${h - 1}}^{2}\\times ${c}^2`];
    case "paire":
      return [`${h}\\times C_{${c}}^{2}`, `C_{${h - 1}}^{3}\\times ${c}^3`];
    case "deuxPaires":
      return [`C_{${h}}^{2}\\times (C_{${c}}^{2})^2`, `${h - 2}\\times ${c}`];
  }
}

export const FORMAT_6GEN46: FormatCombinatoire<E, P> = {
  consigneGenerale(e) {
    switch (e.famille) {
      case "A":
        return [t("Dénombre les mains en deux étapes : la combinaison demandée, puis les cartes qui la complètent.")];
      case "B":
        return [t("Compte d'abord comme si les groupes portaient un nom, puis corrige pour des groupes sans nom.")];
      case "C":
        return [t("Chaque élément se règle indépendamment des autres : dénombre les possibilités.")];
      case "D":
        return [t("On lance trois dés à six faces (on note les résultats dans l'ordre : premier dé, deuxième, troisième). Compare deux sommes en comptant les triplets ordonnés qui les donnent.")];
    }
  },
  donnees(e): FragmentConsigne[][] {
    switch (e.famille) {
      case "A":
        return [[t(`Un jeu compte ${e.hauteurs * e.couleurs} cartes : ${e.hauteurs} hauteurs et ${e.couleurs} couleurs (une carte de chaque hauteur dans chaque couleur). On tire une main de 5 cartes.`)], [t(`Combien de mains contiennent ${MAINS[e.sousType]} ?`)]];
      case "B":
        return [[t(e.contexte)], [t("De combien de façons peut-on former ces groupes ?")]];
      case "C":
        return [[t(e.contexte)]];
      case "D":
        return [[t(`Sommes comparées : ${e.s1} et ${e.s2}.`)]];
    }
  },
  consigneEcran(e, p) {
    switch (e.famille) {
      case "A":
        if (p === "aEcran1") return [t(e.sousType === "deuxPaires" ? "De combien de façons peut-on choisir les deux hauteurs des paires, puis les deux couleurs de chaque paire ?" : "De combien de façons peut-on choisir la hauteur de la combinaison, puis ses couleurs ?")];
        if (p === "aEcran2") return [t("De combien de façons peut-on choisir les cartes qui complètent la main ? Les hauteurs déjà utilisées ne sont plus permises.")];
        return [t("Combien de mains y a-t-il en tout ?")];
      case "B":
        return p === "bEcran1" ? [t("Si les groupes portaient un nom (groupe 1, groupe 2…), combien de répartitions y aurait-il ?")] : [t("Les groupes n'ont pas de nom : combien de répartitions différentes y a-t-il ?")];
      case "C":
        return [t("Combien de possibilités différentes y a-t-il en tout ?")];
      case "D":
        if (p === "dEcran1") return [t("Pour chaque somme, écris toutes les façons de l'obtenir avec trois nombres de 1 à 6, sans tenir compte de l'ordre (une décomposition par ligne).")];
        if (p === "dEcran2") return [t("Pour chaque décomposition, combien de triplets ordonnés donne-t-elle ?")];
        if (p === "dEcran3") return [t("Combien de triplets ordonnés donnent chaque somme ?")];
        return [t("Quelle somme sort le plus souvent ?")];
    }
  },
  champs(e, p): ChampCombi[] {
    switch (e.famille) {
      case "A":
        return [{ type: "texte", label: p === "aEcran1" ? "Combinaison" : p === "aEcran2" ? "Cartes restantes" : "Nombre de mains" }];
      case "B":
        return [{ type: "texte", label: p === "bEcran1" ? "Groupes nommés" : "Groupes sans nom" }];
      case "C":
        return [{ type: "texte", label: "Nombre de possibilités" }];
      case "D":
        if (p === "dEcran1")
          return [
            { type: "liste", label: `Somme ${e.s1}`, placeholder: "a ; b ; c" },
            { type: "liste", label: `Somme ${e.s2}`, placeholder: "a ; b ; c" },
          ];
        if (p === "dEcran2") return [...e.decompositionsS1, ...e.decompositionsS2].map((d) => ({ type: "texte", label: `$${triplet(d)}$` }));
        if (p === "dEcran3")
          return [
            { type: "texte", label: `Somme ${e.s1}` },
            { type: "texte", label: `Somme ${e.s2}` },
          ];
        return [
          {
            type: "choix",
            label: "",
            options: [
              { valeur: "s1", label: `La somme ${e.s1}` },
              { valeur: "s2", label: `La somme ${e.s2}` },
              { valeur: "egal", label: "Elles sont aussi fréquentes l'une que l'autre" },
            ],
          },
        ];
    }
  },
  aides(e, p) {
    switch (e.famille) {
      case "A":
        if (p === "aEcran1") return [{ texte: "Choisis d'abord la ou les hauteurs ($C_h^k$ façons de choisir $k$ hauteurs), puis les couleurs des cartes de cette hauteur ($C_c^j$)." }, { texte: "Relis le nombre de hauteurs et de couleurs du jeu : combien de couleurs une hauteur choisie offre-t-elle ?" }];
        if (p === "aEcran2") return [{ texte: "Les cartes qui complètent la main sont de hauteurs différentes entre elles et de celles déjà prises : choisis leurs hauteurs, puis une couleur pour chacune." }, { texte: `Il reste ${e.hauteurs - (e.sousType === "deuxPaires" ? 2 : 1)} hauteurs ; chaque carte a ${e.couleurs} couleurs possibles.` }];
        return [{ texte: "Principe multiplicatif : on multiplie les nombres de façons des deux étapes." }, { texte: "Utilise les résultats des deux écrans précédents." }];
      case "B":
        if (p === "bEcran1") return [{ texte: "Répartir $n$ personnes en groupes nommés de tailles $n_1, n_2,\\ldots$ :", latex: "\\dfrac{n!}{n_1!\\times n_2!\\times\\cdots}" }, { texte: `Ici ${e.m} groupes de ${e.t} parmi ${e.n}.` }];
        return [{ texte: "Sans nom, deux répartitions qui ne diffèrent que par l'ordre des groupes sont les mêmes : chaque répartition a été comptée autant de fois qu'il y a d'ordres des groupes." }, { texte: `Il y a ${e.m} groupes : combien d'ordres différents peuvent-ils prendre ?` }];
      case "C":
        return [{ texte: "Arrangement avec répétition : $k$ éléments, chacun avec $n$ possibilités indépendantes, donnent $B_n^k=n^k$ possibilités." }, { texte: "La base est le nombre de positions de chaque élément, l'exposant le nombre d'éléments." }];
      case "D":
        if (p === "dEcran1") return [{ texte: "Écris les décompositions dans l'ordre croissant (plus petit nombre d'abord) pour ne pas en oublier ni en compter deux fois." }, { texte: "Commence par le plus petit premier nombre possible, puis augmente le deuxième…" }];
        if (p === "dEcran2") return [{ texte: "Trois nombres différents donnent $3!=6$ ordres ; deux égaux et un différent en donnent 3 ; trois égaux, 1." }, { texte: "Regarde combien de nombres différents contient chaque décomposition." }];
        if (p === "dEcran3") return [{ texte: "Additionne les nombres d'ordres des décompositions d'une même somme." }, { texte: "Utilise l'écran précédent, somme par somme." }];
        return [{ texte: "Les 216 triplets ordonnés sont équiprobables : la somme la plus fréquente est celle qui a le plus de triplets." }, { texte: "Compare les deux totaux de l'écran précédent." }];
    }
  },
  reponseAttendue(e, p) {
    switch (e.famille) {
      case "A": {
        const [a, b] = formulesA(e);
        if (p === "aEcran1") return [`${a}=${milliers(e.etape1)}`];
        if (p === "aEcran2") return [`${b}=${milliers(e.etape2)}`];
        return [`${milliers(e.etape1)}\\times ${milliers(e.etape2)}=${milliers(e.resultatFinal)}`];
      }
      case "B":
        return p === "bEcran1" ? [`\\dfrac{${e.n}!}{(${e.t}!)^{${e.m}}}=${milliers(e.nommes)}`] : [`\\dfrac{${milliers(e.nommes)}}{${e.m}!}=${milliers(e.resultat)}`];
      case "C":
        return [`${e.n}^{${e.k}}=${milliers(e.resultat)}`];
      case "D":
        if (p === "dEcran1") return [`${e.s1}:\\ ${e.decompositionsS1.map(triplet).join("\\,")}`, `${e.s2}:\\ ${e.decompositionsS2.map(triplet).join("\\,")}`];
        if (p === "dEcran2") return [[...e.decompositionsS1, ...e.decompositionsS2].map((d) => `${triplet(d)}\\to ${d.arrangements}`).join("\\;;\\;")];
        if (p === "dEcran3") return [`\\text{somme } ${e.s1}:\\ ${e.totalS1}`, `\\text{somme } ${e.s2}:\\ ${e.totalS2}`];
        return [e.comparaison === "egal" ? "\\text{aussi fréquentes}" : `\\text{la somme } ${e.comparaison === "s1" ? e.s1 : e.s2}`];
    }
  },
  explication(e, p) {
    switch (e.famille) {
      case "A": {
        const [a, b] = formulesA(e);
        if (p === "aEcran1") return [f(`$${a}=${milliers(e.etape1)}$ (hauteur${e.sousType === "deuxPaires" ? "s" : ""}, puis couleurs).`)];
        if (p === "aEcran2") return [f(`$${b}=${milliers(e.etape2)}$ (hauteurs restantes, puis une couleur par carte).`)];
        return [f(`$${milliers(e.etape1)}\\times ${milliers(e.etape2)}=${milliers(e.resultatFinal)}$ mains.`)];
      }
      case "B":
        return p === "bEcran1"
          ? [f(`Groupes nommés : $\\dfrac{${e.n}!}{(${e.t}!)^{${e.m}}}=${milliers(e.nommes)}$.`)]
          : [f(`Chaque répartition sans nom a été comptée $${e.m}!=${[1, 1, 2, 6, 24, 120][e.m]}$ fois (une par ordre des groupes) : $${milliers(e.nommes)}\\div ${[1, 1, 2, 6, 24, 120][e.m]}=${milliers(e.resultat)}$.`)];
      case "C":
        return [f(`Chacun des ${e.k} éléments a ${e.n} positions : $${e.n}^{${e.k}}=${milliers(e.resultat)}$ (et non $${e.k}^{${e.n}}$).`)];
      case "D":
        if (p === "dEcran1") return [f(`Somme ${e.s1} : $${e.decompositionsS1.map(triplet).join("\\,")}$.`), f(`Somme ${e.s2} : $${e.decompositionsS2.map(triplet).join("\\,")}$.`)];
        if (p === "dEcran2") return [[t("Trois nombres différents : 6 ordres ; deux égaux : 3 ; trois égaux : 1.")]];
        if (p === "dEcran3") return [f(`Somme ${e.s1} : $${e.decompositionsS1.map((d) => d.arrangements).join("+")}=${e.totalS1}$ ; somme ${e.s2} : $${e.decompositionsS2.map((d) => d.arrangements).join("+")}=${e.totalS2}$.`)];
        return [f(`$${e.totalS1}$ triplets contre $${e.totalS2}$ sur 216 : ${e.comparaison === "egal" ? "les deux sommes sont aussi fréquentes" : `la somme ${e.comparaison === "s1" ? e.s1 : e.s2} sort plus souvent`}${e.decompositionsS1.length === e.decompositionsS2.length ? " — et pourtant, les deux sommes ont autant de décompositions" : ""}.`)];
    }
  },
  libellePhase(e, p) {
    switch (e.famille) {
      case "A":
        return p === "aEcran1" ? "Combinaison" : p === "aEcran2" ? "Cartes restantes" : "Total";
      case "B":
        return p === "bEcran1" ? "Groupes nommés" : "Groupes sans nom";
      case "C":
        return "Nombre de possibilités";
      case "D":
        return p === "dEcran1" ? "Décompositions" : p === "dEcran2" ? "Ordres" : p === "dEcran3" ? "Totaux" : "Comparaison";
    }
  },
  messageCible(e, p, valeurs) {
    const v = valeurs[valeurs.length - 1] ?? "";
    switch (e.famille) {
      case "B":
        if (p === "bEcran2" && vaut(v, e.nommes)) return [t("Les groupes n'ont pas de nom : divise par le nombre d'ordres des groupes.")];
        return null;
      case "C":
        if (vaut(v, e.k ** e.n)) return f("Base et exposant sont inversés : chaque élément a $n$ positions, il y a $k$ éléments, donc $n^k$.");
        if (vaut(v, e.n * e.k)) return [t("Les choix se combinent : on multiplie les possibilités de chaque élément, on ne les additionne pas.")];
        return null;
      case "D":
        if (p === "dEcran3" && (vaut(valeurs[0] ?? "", e.decompositionsS1.length) || vaut(valeurs[1] ?? "", e.decompositionsS2.length))) return [t("Tu as compté les décompositions ; il faut compter les triplets ordonnés.")];
        return null;
      default:
        return null;
    }
  },
};

// ============================================================================
// Papier (lot E) : situation en prose avec sa question + consigne globale
// ============================================================================

export const CONSIGNE_PAPIER_46 = "Réponds en justifiant ta démarche.";

export function situationPapier46(e: E): FragmentConsigne[] {
  switch (e.famille) {
    case "A":
    case "B": {
      const r: FragmentConsigne[] = [];
      FORMAT_6GEN46.donnees(e).forEach((l, i) => {
        if (i > 0) r.push(t(" "));
        r.push(...l);
      });
      return r;
    }
    case "C":
      return [t(`${e.contexte} Combien de possibilités différentes y a-t-il en tout ?`)];
    case "D":
      return [t(`On lance trois dés à six faces et on note les résultats dans l'ordre (premier dé, deuxième, troisième). Laquelle des sommes ${e.s1} et ${e.s2} sort le plus souvent ? Elles peuvent aussi être aussi fréquentes l'une que l'autre.`)];
  }
}

export { triplet as tripletLatex46 };
