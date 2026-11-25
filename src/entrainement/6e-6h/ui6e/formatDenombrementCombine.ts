import type { ExerciceDenombrementCombine, SousTypeDenombCombB } from "../core6e/denombrementCombine.types";
import type { PhaseDenombrementCombine } from "../moteur6e/typesDenombrementCombine";
import { vaut } from "../moteur6e/saisieCombinatoire";
import { f, milliers, t } from "./fragmentsCombinatoire";
import type { FormatCombinatoire, FragmentConsigne } from "./fragmentsCombinatoire";

/**
 * Textes de `6gen44` (6e ch. 7, § 2) — audit, lots B et C : consignes, options et libellés en KaTeX
 * (plus de « C(n1,k1)×C(n2,k2) », « 10!/(3!*3!*4!) » ni « Cₙ₊₁² » en Unicode), aucun exemple de champ
 * qui soit une réponse, réponse attendue de l'écran « formule » = la FORMULE (avant : le nombre, affiché
 * aussi dans « Ce qu'on sait déjà »), aides à deux niveaux sans la réponse, messages ciblés.
 */

type E = ExerciceDenombrementCombine;
type P = PhaseDenombrementCombine;

const OPTIONS_B: Record<SousTypeDenombCombB, string> = {
  roleDistingue: "Un rôle à part, puis un groupe : $n\\times C_{n-1}^{k}$",
  poolsSepares: "Deux choix indépendants : $C_{n_1}^{k_1}\\times C_{n_2}^{k_2}$",
  memeContrainte: "L'un ou l'autre groupe : $C_{n_1}^{k}+C_{n_2}^{k}$",
  partitionComplementaire: "Un seul choix, le reste suit : $C_n^{k}$",
};

const OPTIONS_C = [
  { valeur: "A", label: "$A_n^p$" },
  { valeur: "B", label: "$B_n^p=n^p$" },
  { valeur: "C", label: "$C_n^p$" },
  { valeur: "Gamma", label: "$\\Gamma_n^p=C_{n+p-1}^{p}$" },
];

function formuleMultinomiale(n: number, tailles: number[]): string {
  return `\\dfrac{${n}!}{${tailles.map((x) => `${x}!`).join("\\times ")}}`;
}

function formuleB(e: E & { famille: "B" }): string {
  switch (e.sousType) {
    case "roleDistingue":
      return `${e.n}\\times C_{${e.n - 1}}^{${e.k}}`;
    case "poolsSepares":
      return `C_{${e.n1}}^{${e.k1}}\\times C_{${e.n2}}^{${e.k2}}`;
    case "memeContrainte":
      return `C_{${e.n1}}^{${e.k}}+C_{${e.n2}}^{${e.k}}`;
    case "partitionComplementaire":
      return `C_{${e.n}}^{${e.k}}`;
  }
}

function lettresMot(e: E & { famille: "E" }): string {
  return [...new Set(e.mot)].map((c) => `${e.mot.split(c).length - 1}`).join(", ");
}

function formuleE(e: E & { famille: "E" }): string {
  return formuleMultinomiale(e.n, e.repetitions.map((r) => r.fois));
}

function termesD(e: E & { famille: "D" }): [string, string] {
  return e.typeContrainte === "exclusion" ? [`C_{${e.n}}^{${e.k}}`, `C_{${e.n - 2}}^{${e.k - 2}}`] : [`C_{${e.n - 2}}^{${e.k - 2}}`, `C_{${e.n - 2}}^{${e.k}}`];
}

export const FORMAT_6GEN44: FormatCombinatoire<E, P> = {
  consigneGenerale(e) {
    switch (e.famille) {
      case "A":
        return [t("Répartis les personnes dans les groupes de tailles imposées : écris la formule, puis calcule.")];
      case "B":
        return [t("Reconnais comment la sélection se construit (et, ou, un rôle à part, un seul choix), puis calcule.")];
      case "C":
        return e.sousType === "repetition" ? [t("Choix sans ordre, avec répétition possible : écris la formule, puis calcule.")] : [t("Décide quel groupement compte les résultats, puis calcule.")];
      case "D":
        return [t("Deux personnes précises sont soumises à une contrainte : reconnais-la, calcule les deux termes, puis combine-les.")];
      case "E":
        return [t("Anagrammes : écris la formule du nombre de mots, calcule-le, puis déduis le nombre d'anagrammes.")];
    }
  },
  donnees(e) {
    switch (e.famille) {
      case "A": {
        const liste = e.noms.map((nom, i) => `${e.tailles[i]} dans l'équipe ${nom}`).join(", ");
        return [[t(`On répartit ${e.n} ${e.objets} en ${e.k} équipes : ${liste}.`)], [t("De combien de façons peut-on former ces équipes ?")]];
      }
      case "B":
        return [f(e.contexte), [t("De combien de façons peut-on faire ce choix ?")]];
      case "C":
        return [f(e.contexte), [t(e.sousType === "repetition" ? "Combien de choix différents y a-t-il ?" : "Combien de résultats différents y a-t-il ?")]];
      case "D":
        return [[t(e.contexte)], [t("Combien de choix sont possibles ?")]];
      case "E":
        return [[t(`On considère le mot ${e.mot} (${e.n} lettres). Une anagramme est un mot formé des mêmes lettres, dans un autre ordre (il n'a pas besoin d'avoir un sens).`)]];
    }
  },
  consigneEcran(e, p) {
    switch (e.famille) {
      case "A":
        return p === "aEcran1" ? [t("Écris la formule du nombre de répartitions, sans la calculer.")] : [t("Calcule ce nombre.")];
      case "B":
        return p === "bEcran1" ? [t("Quelle formule correspond à cette sélection ?")] : [t("Calcule le nombre de choix.")];
      case "C":
        if (e.sousType === "repetition") return p === "cEcran1" ? [t("Écris la formule du nombre de choix, sans la calculer.")] : [t("Calcule ce nombre.")];
        return p === "cEcran1" ? [t("Quel groupement compte ces résultats ?")] : [t("Calcule le nombre de résultats.")];
      case "D":
        if (p === "dEcran1") return [t("Comment traite-t-on cette contrainte ?")];
        if (p === "dEcran2") return [t("Calcule les deux termes de cette formule.")];
        return [t("Combine les deux termes : combien de choix sont possibles ?")];
      case "E":
        if (p === "eEcran1") return [t("Écris la formule du nombre de mots que l'on peut former avec toutes ces lettres, sans la calculer.")];
        if (p === "eEcran2") return [t("Calcule ce nombre de mots.")];
        return [t("Combien d'anagrammes de ce mot y a-t-il ?")];
    }
  },
  champs(e, p) {
    switch (e.famille) {
      case "A":
        return p === "aEcran1" ? [{ type: "texte", label: "Formule", apercu: true, nature: "formule" }] : [{ type: "texte", label: "Nombre de répartitions" }];
      case "B":
        return p === "bEcran1" ? [{ type: "choix", label: "", options: (Object.keys(OPTIONS_B) as SousTypeDenombCombB[]).map((v) => ({ valeur: v, label: OPTIONS_B[v] })) }] : [{ type: "texte", label: "Nombre de choix" }];
      case "C":
        if (e.sousType === "comparaison") return p === "cEcran1" ? [{ type: "choix", label: "", options: OPTIONS_C }] : [{ type: "texte", label: "Nombre de résultats" }];
        return p === "cEcran1" ? [{ type: "texte", label: "Formule", apercu: true, nature: "formule" }] : [{ type: "texte", label: "Nombre de choix" }];
      case "D": {
        if (p === "dEcran1")
          return [
            {
              type: "choix",
              label: "",
              options: [
                { valeur: "exclusion", label: "Tous les choix, moins ceux qui contiennent les deux : $C_n^{k}-C_{n-2}^{k-2}$" },
                { valeur: "indissociable", label: "Les deux, plus aucun des deux : $C_{n-2}^{k-2}+C_{n-2}^{k}$" },
              ],
            },
          ];
        if (p === "dEcran2") {
          const [a, b] = termesD(e);
          return [
            { type: "texte", label: `$${a}$` },
            { type: "texte", label: `$${b}$` },
          ];
        }
        return [{ type: "texte", label: "Nombre de choix" }];
      }
      case "E":
        if (p === "eEcran1") return [{ type: "texte", label: "Formule", apercu: true, nature: "formule" }];
        return [{ type: "texte", label: p === "eEcran2" ? "Nombre de mots" : "Nombre d'anagrammes" }];
    }
  },
  aides(e, p) {
    switch (e.famille) {
      case "A":
        if (p === "aEcran1") return [{ texte: "Répartir $n$ personnes en groupes nommés de tailles $n_1, n_2, \\ldots$ (sans ordre dans un groupe) :", latex: "\\dfrac{n!}{n_1!\\times n_2!\\times\\cdots}" }, { texte: `Ici $n=${e.n}$ et les tailles sont ${e.tailles.join(", ")}. Utilise « ! » et des parenthèses autour du dénominateur.` }];
        return [{ texte: "Calcule chaque factorielle (ou utilise la touche $x!$ de la calculatrice), puis divise." }, { texte: "Tu peux aussi choisir les groupes l'un après l'autre : $C_n^{n_1}\\times C_{n-n_1}^{n_2}\\times\\cdots$" }];
      case "B":
        if (p === "bEcran1") return [{ texte: "« Et » (deux choix faits ensemble) se traduit par une multiplication, « ou » (l'un, ou bien l'autre) par une addition ; choisir une partie fixe aussi le reste." }, { texte: e.sousType === "roleDistingue" ? "Une personne a-t-elle un rôle différent des autres ?" : e.sousType === "poolsSepares" ? "Les deux choix se font-ils tous les deux, dans deux ensembles différents ?" : e.sousType === "memeContrainte" ? "Faut-il choisir dans un groupe ou bien dans l'autre, jamais dans les deux ?" : "Une fois le premier groupe choisi, reste-t-il un choix à faire pour l'autre ?" }];
        return [{ texte: "Calcule chaque combinaison avec $C_n^k=\\dfrac{n!}{k!\\,(n-k)!}$ (touche nCr)." }, { texte: `Formule de la situation : $${formuleB(e)}$.` }];
      case "C":
        if (e.sousType === "repetition")
          return p === "cEcran1"
            ? [{ texte: "Choisir $p$ éléments parmi $n$, sans ordre, avec répétition possible (cours, § 1) :", latex: "\\Gamma_n^p=C_{n+p-1}^{p}" }, { texte: `Ici $n=${e.n}$ (nombre de sortes) et $p=${e.p}$ (nombre d'éléments choisis). Au clavier, une combinaison s'écrit avec la lettre C suivie des deux nombres entre parenthèses.` }]
            : [{ texte: "Calcule la combinaison avec la touche nCr, ou $\\dfrac{m!}{p!\\,(m-p)!}$." }, { texte: `Il s'agit de $C_{${e.n + e.p - 1}}^{${e.p}}$.` }];
        if (p === "cEcran1") return [{ texte: "Si l'on peut distinguer les objets, un résultat est une liste ordonnée (avec répétition) ; sinon, c'est un choix sans ordre, avec répétition." }, { texte: "Deux résultats qui ne diffèrent que par le dé qui donne chaque face sont-ils différents ici ?" }];
        return [{ texte: "$B_n^p=n^p$ ; $\\Gamma_n^p=C_{n+p-1}^{p}$." }, { texte: `Ici $n=${e.n}$ faces et $p=${e.p}$ dés.` }];
      case "D":
        if (p === "dEcran1") return [{ texte: "« Jamais ensemble » : on compte tout, puis on retire les choix où les deux sont présents. « Ensemble ou pas du tout » : on additionne les deux cas permis." }, { texte: "Relis la contrainte : interdit-elle un cas, ou n'en permet-elle que deux ?" }];
        if (p === "dEcran2") return [{ texte: "$C_n^k=\\dfrac{n!}{k!\\,(n-k)!}$ (touche nCr)." }, { texte: "Les deux personnes placées (ou écartées), il reste $n-2$ personnes." }];
        return [{ texte: e.typeContrainte === "exclusion" ? "Retire du total les choix qui contiennent les deux personnes." : "Additionne les choix « avec les deux » et « sans aucun des deux »." }, { texte: "Utilise les deux termes de l'écran précédent." }];
      case "E":
        if (p === "eEcran1") return [{ texte: "Mots formés de $n$ lettres dont certaines se répètent $n_1, n_2, \\ldots$ fois (permutation avec répétition) :", latex: "\\dfrac{n!}{n_1!\\times n_2!\\times\\cdots}" }, { texte: `Compte chaque lettre du mot ${e.mot} : ${lettresMot(e)} (une lettre seule donne $1!=1$).` }];
        if (p === "eEcran2") return [{ texte: "Calcule les factorielles, puis divise." }, { texte: `Il y a ${e.n} lettres en tout.` }];
        return [{ texte: "Une anagramme est un autre mot que le mot de départ." }, { texte: "Parmi tous les mots comptés, un seul est le mot lui-même." }];
    }
  },
  reponseAttendue(e, p) {
    switch (e.famille) {
      case "A":
        return p === "aEcran1" ? [formuleMultinomiale(e.n, e.tailles)] : [milliers(e.resultat)];
      case "B":
        return p === "bEcran1" ? [formuleB(e)] : [milliers(e.resultat)];
      case "C":
        if (p === "cEcran1") return e.sousType === "comparaison" && e.discernables ? [`B_{${e.n}}^{${e.p}}=${e.n}^{${e.p}}`] : [`\\Gamma_{${e.n}}^{${e.p}}=C_{${e.n + e.p - 1}}^{${e.p}}`];
        return [milliers(e.resultat)];
      case "D":
        if (p === "dEcran1") return [e.typeContrainte === "exclusion" ? `C_{${e.n}}^{${e.k}}-C_{${e.n - 2}}^{${e.k - 2}}` : `C_{${e.n - 2}}^{${e.k - 2}}+C_{${e.n - 2}}^{${e.k}}`];
        if (p === "dEcran2") {
          const [a, b] = termesD(e);
          return [`${a}=${milliers(e.terme1)}`, `${b}=${milliers(e.terme2)}`];
        }
        return [milliers(e.resultatFinal)];
      case "E":
        if (p === "eEcran1") return [formuleE(e)];
        return [milliers(p === "eEcran2" ? e.nombreMots : e.nombreMots - 1)];
    }
  },
  explication(e, p) {
    switch (e.famille) {
      case "A":
        return p === "aEcran1"
          ? [f(`Groupes nommés de tailles ${e.tailles.join(", ")} parmi ${e.n} : $${formuleMultinomiale(e.n, e.tailles)}$.`)]
          : [f(`$${formuleMultinomiale(e.n, e.tailles)}=${milliers(e.resultat)}$.`)];
      case "B": {
        const raisons: Record<SousTypeDenombCombB, string> = {
          roleDistingue: "On choisit d'abord la personne qui a le rôle à part (n façons), puis le groupe parmi les autres : multiplication.",
          poolsSepares: "On fait les deux choix, dans deux ensembles différents : multiplication.",
          memeContrainte: "On choisit dans un groupe ou bien dans l'autre, jamais dans les deux : addition.",
          partitionComplementaire: "Choisir le premier groupe fixe le second : une seule combinaison.",
        };
        return p === "bEcran1" ? [[t(raisons[e.sousType])], f(`Ici : $${formuleB(e)}$.`)] : [f(`$${formuleB(e)}=${milliers(e.resultat)}$.`)];
      }
      case "C":
        if (p === "cEcran1" && e.sousType === "comparaison")
          return [[t(e.discernables ? "Les dés se distinguent : un résultat est une liste ordonnée où une face peut revenir, soit un arrangement avec répétition." : "Les dés sont indiscernables : seul compte combien de fois chaque face sort, soit une combinaison avec répétition.")]];
        if (p === "cEcran1") return [f(`Sans ordre, avec répétition : $\\Gamma_{${e.n}}^{${e.p}}=C_{${e.n + e.p - 1}}^{${e.p}}$.`)];
        return [f(e.sousType === "comparaison" && e.discernables ? `$${e.n}^{${e.p}}=${milliers(e.resultat)}$.` : `$C_{${e.n + e.p - 1}}^{${e.p}}=${milliers(e.resultat)}$.`)];
      case "D": {
        const [a, b] = termesD(e);
        if (p === "dEcran1") return [[t(e.typeContrainte === "exclusion" ? "Les deux personnes ne doivent pas être ensemble : on retire du total les choix qui les contiennent toutes les deux." : "Les deux personnes sont ensemble ou absentes : on additionne les deux cas permis.")]];
        if (p === "dEcran2") return [f(`$${a}=${milliers(e.terme1)}$ et $${b}=${milliers(e.terme2)}$.`)];
        return [f(e.typeContrainte === "exclusion" ? `$${milliers(e.terme1)}-${milliers(e.terme2)}=${milliers(e.resultatFinal)}$.` : `$${milliers(e.terme1)}+${milliers(e.terme2)}=${milliers(e.resultatFinal)}$.`)];
      }
      case "E":
        if (p === "eEcran1") return [f(`${e.n} lettres, dont ${e.repetitions.map((r) => `${r.lettre} ${r.fois} fois`).join(", ")} : $${formuleE(e)}$.`)];
        if (p === "eEcran2") return [f(`$${formuleE(e)}=${milliers(e.nombreMots)}$.`)];
        return [f(`On retire le mot lui-même : $${milliers(e.nombreMots)}-1=${milliers(e.nombreMots - 1)}$.`)];
    }
  },
  libellePhase(e, p) {
    switch (e.famille) {
      case "A":
        return p === "aEcran1" ? "Formule" : "Calcul";
      case "B":
        return p === "bEcran1" ? "Structure" : "Calcul";
      case "C":
        return p === "cEcran1" ? (e.sousType === "comparaison" ? "Groupement" : "Formule") : "Calcul";
      case "D":
        return p === "dEcran1" ? "Contrainte" : p === "dEcran2" ? "Deux termes" : "Résultat";
      case "E":
        return p === "eEcran1" ? "Formule" : p === "eEcran2" ? "Nombre de mots" : "Anagrammes";
    }
  },
  messageCible(e, p, valeurs): FragmentConsigne[] | null {
    const v = valeurs[valeurs.length - 1] ?? "";
    switch (e.famille) {
      case "B":
        if (p !== "bEcran2") return null;
        if (e.sousType === "poolsSepares" && vaut(v, coef(e.n1, e.k1) + coef(e.n2, e.k2))) return [t("Les deux choix se font ensemble : on multiplie, on n'additionne pas.")];
        if (e.sousType === "memeContrainte" && vaut(v, coef(e.n1, e.k) * coef(e.n2, e.k))) return [t("L'équipe vient d'un club ou bien de l'autre : on additionne.")];
        if (e.sousType === "roleDistingue" && vaut(v, coef(e.n, e.k + 1))) return [t("Le capitaine a un rôle à part : il se choisit d'abord, séparément.")];
        return null;
      case "D":
        if (p === "dEcran3" && e.typeContrainte === "exclusion" && vaut(v, e.terme1 + e.terme2)) return [t("Les choix qui contiennent les deux personnes sont interdits : on les retire.")];
        if (p === "dEcran3" && e.typeContrainte === "indissociable" && vaut(v, e.terme2 - e.terme1)) return [t("Les deux cas permis s'ajoutent.")];
        return null;
      case "E":
        if (p === "eEcran3" && vaut(v, e.nombreMots)) return [t("Le mot de départ n'est pas une anagramme de lui-même.")];
        if (p === "eEcran2" && vaut(v, fact(e.n))) return [t("Échanger deux lettres identiques ne donne pas un nouveau mot : divise par les factorielles des répétitions.")];
        return null;
      case "C":
        if (p === "cEcran2" && e.sousType === "comparaison" && !e.discernables && vaut(v, e.n ** e.p)) return [t("Les dés sont indiscernables : deux résultats qui ne diffèrent que par l'ordre sont les mêmes.")];
        return null;
      default:
        return null;
    }
  },
};

function fact(n: number): number {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}
function coef(n: number, k: number): number {
  let r = 1;
  for (let i = 0; i < k; i++) r = (r * (n - i)) / (i + 1);
  return Math.round(r);
}
