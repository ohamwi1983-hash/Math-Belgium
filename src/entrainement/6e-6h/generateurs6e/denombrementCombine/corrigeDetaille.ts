import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import type { ExerciceDenombCombA, ExerciceDenombCombB, ExerciceDenombCombC, ExerciceDenombCombD, ExerciceDenombCombE, ExerciceDenombrementCombine, SousTypeDenombCombB } from "../../core6e/denombrementCombine.types";
import { combinaisonBig, factorielleBig } from "../../moteur6e/saisieCombinatoire";
import { milliers } from "../../ui6e/fragmentsCombinatoire";
import { formuleB44, formuleMultinomiale44, termesD44 } from "../../ui6e/formatDenombrementCombine";
import { CC, COURS_COMBINE, COURS_FONDAMENTAL, calcul, finaliserCombinatoire, fx, ligne, lignesCombinaison, piege, produit, resultat, utiliseCours, verification } from "../../ui6e/corrigeCombinatoire";

/**
 * Corrigé détaillé « comme au tableau » de `6gen44` (6e ch. 7, § 2), une lettre par écran — MÊME
 * source pour l'écran révélé (`AppCombinatoire.corrigeDetaille`) et pour le papier :
 * A) formule multinomiale, puis calcul par les choix successifs des groupes ; B) structure (et / ou /
 * rôle à part / un seul choix), puis calcul ; C) Γ (ou discernables / indiscernables), puis calcul ;
 * D) contrainte, deux termes, combinaison des termes ; E) formule, nombre de mots, anagrammes (− 1).
 */

type E = ExerciceDenombrementCombine;

function corrigeA(e: ExerciceDenombCombA): EtapeCorrection[] {
  const formule = formuleMultinomiale44(e.n, e.tailles);
  const cs: { n: number; k: number }[] = [];
  let reste = e.n;
  e.tailles.slice(0, -1).forEach((t) => {
    cs.push({ n: reste, k: t });
    reste -= t;
  });
  const valeurs = cs.map((c) => combinaisonBig(c.n, c.k));
  const dernier = e.noms[e.noms.length - 1];
  const lignesB: LigneCalcul[] = [ligne(`N=${cs.map((c) => CC(c.n, c.k)).join("\\times ")}`, `les équipes l'une après l'autre ; l'équipe ${dernier} est formée des ${e.tailles[e.tailles.length - 1]} restants`)];
  if (cs.length > 1) lignesB.push(ligne(`=${produit(valeurs)}`, fx(cs.map((c, i) => `$${CC(c.n, c.k)}=${milliers(valeurs[i])}$`).join(" ; "))));
  else lignesB.push(...lignesCombinaison(cs[0].n, cs[0].k, false));
  if (cs.length > 1) lignesB.push(ligne(`=${milliers(e.resultat)}`));
  const out: EtapeCorrection[] = [
    utiliseCours("a", fx("Répartition de $n$ personnes en groupes nommés de tailles imposées, sans ordre dans un groupe : $\\dfrac{n!}{n_1!\\times n_2!\\times\\cdots}$"), COURS_COMBINE),
    calcul("a", [ligne(`${e.tailles.join("+")}=${e.n}`, `${e.objets} : ${e.noms.map((nom, i) => `${nom} ${e.tailles[i]}`).join(", ")}`), ligne(`N=${formule}`, "formule multinomiale")]),
    resultat("a", fx(`$N=${formule}$`)),
    utiliseCours("b", fx("Même nombre en choisissant les équipes l'une après l'autre parmi les personnes restantes, par le principe multiplicatif"), COURS_FONDAMENTAL),
    calcul("b", lignesB),
    resultat("b", fx(`$N=${milliers(e.resultat)}$ répartitions.`)),
  ];
  if (e.n <= 10) {
    const num = factorielleBig(e.n);
    const den = e.tailles.reduce((a, t) => a * factorielleBig(t), 1n);
    out.push(verification("b", fx(`Par les factorielles : $${formule}=\\dfrac{${milliers(num)}}{${milliers(den)}}=${milliers(e.resultat)}$.`)));
  }
  out.push(piege("b", fx(`Calculer $${e.n}!$ sans diviser : $${e.n}!$ compte aussi l'ordre des personnes à l'intérieur de chaque équipe.`)));
  return out;
}

const RAISON_B: Record<SousTypeDenombCombB, string> = {
  roleDistingue: "une personne a un rôle à part : on la choisit d'abord, puis les autres (et → produit)",
  poolsSepares: "deux choix faits ensemble, dans deux ensembles différents (et → produit)",
  memeContrainte: "on choisit dans un groupe ou bien dans l'autre, jamais dans les deux (ou → somme)",
  partitionComplementaire: "choisir le premier groupe fixe le second : un seul choix",
};

const PIEGE_B: Record<SousTypeDenombCombB, string> = {
  roleDistingue: "Choisir tous les membres d'un coup : le membre au rôle à part se choisit séparément.",
  poolsSepares: "Additionner les deux choix : ils se font ensemble, on multiplie.",
  memeContrainte: "Multiplier : le choix se fait dans un groupe ou bien dans l'autre, on additionne.",
  partitionComplementaire: "Multiplier par le choix du second groupe : il est fixé par le premier.",
};

function corrigeB(e: ExerciceDenombCombB): EtapeCorrection[] {
  const formule = formuleB44(e);
  let lignesB: LigneCalcul[];
  switch (e.sousType) {
    case "roleDistingue": {
      const c = combinaisonBig(e.n - 1, e.k);
      lignesB = [...lignesCombinaison(e.n - 1, e.k), ligne(`N=${e.n}\\times ${milliers(c)}`, "rôle à part, puis le groupe"), ligne(`=${milliers(e.resultat)}`)];
      break;
    }
    case "poolsSepares": {
      const c1 = combinaisonBig(e.n1, e.k1);
      const c2 = combinaisonBig(e.n2, e.k2);
      lignesB = [...lignesCombinaison(e.n1, e.k1), ...lignesCombinaison(e.n2, e.k2), ligne(`N=${milliers(c1)}\\times ${milliers(c2)}`, "et : produit"), ligne(`=${milliers(e.resultat)}`)];
      break;
    }
    case "memeContrainte": {
      const c1 = combinaisonBig(e.n1, e.k);
      const c2 = combinaisonBig(e.n2, e.k);
      lignesB = [...lignesCombinaison(e.n1, e.k), ...lignesCombinaison(e.n2, e.k), ligne(`N=${milliers(c1)}+${milliers(c2)}`, "ou : somme"), ligne(`=${milliers(e.resultat)}`)];
      break;
    }
    case "partitionComplementaire":
      lignesB = lignesCombinaison(e.n, e.k).map((l, i) => (i === 0 ? { ...l, latex: `N=${l.latex}` } : l));
      break;
  }
  return [
    utiliseCours("a", fx("« Et » (deux choix faits ensemble) se traduit par un produit, « ou » (l'un, ou bien l'autre) par une somme ; un rôle à part se choisit d'abord ; choisir une partie peut fixer le reste"), COURS_COMBINE),
    calcul("a", [ligne(`N=${formule}`, RAISON_B[e.sousType])]),
    resultat("a", fx(`$N=${formule}$`)),
    utiliseCours("b", fx("On calcule chaque combinaison $C_n^k=\\dfrac{n!}{k!\\,(n-k)!}$, puis on les combine"), COURS_FONDAMENTAL),
    calcul("b", lignesB),
    resultat("b", fx(`$N=${milliers(e.resultat)}$ choix.`)),
    piege("b", fx(PIEGE_B[e.sousType])),
  ];
}

function corrigeC(e: ExerciceDenombCombC): EtapeCorrection[] {
  const N = e.n + e.p - 1;
  if (e.sousType === "comparaison" && e.discernables) {
    return [
      utiliseCours("a", fx("Objets que l'on distingue : un résultat est une liste ordonnée où une face peut revenir, un arrangement avec répétition $B_n^p=n^p$"), COURS_FONDAMENTAL),
      calcul("a", [ligne(`n=${e.n}`, "faces"), ligne(`p=${e.p}`, "dés de couleurs différentes : on note la face de chacun"), ligne(`N=B_{${e.n}}^{${e.p}}=${e.n}^{${e.p}}`, "arrangement avec répétition")]),
      resultat("a", fx(`$N=${e.n}^{${e.p}}$`)),
      utiliseCours("b", fx("Puissance : $p$ facteurs égaux à $n$"), COURS_FONDAMENTAL),
      calcul("b", [ligne(`N=${e.n}^{${e.p}}=${Array(e.p).fill(e.n).join("\\times ")}`), ligne(`=${milliers(e.resultat)}`)]),
      resultat("b", fx(`$N=${milliers(e.resultat)}$ résultats.`)),
      piege("b", fx(`Compter des collections ($\\Gamma_{${e.n}}^{${e.p}}$) : les dés se distinguent, obtenir 1 avec le rouge et 2 avec le bleu n'est pas obtenir 2 avec le rouge et 1 avec le bleu.`)),
    ];
  }
  const indiscernables = e.sousType === "comparaison";
  return [
    utiliseCours(
      "a",
      fx(indiscernables ? "Objets indiscernables : seul compte combien de fois chaque face sort, une combinaison avec répétition $\\Gamma_n^p=C_{n+p-1}^{p}$" : "Choix sans ordre, avec répétition possible : combinaison avec répétition $\\Gamma_n^p=C_{n+p-1}^{p}$"),
      COURS_FONDAMENTAL,
    ),
    calcul("a", [ligne(`n=${e.n}`, indiscernables ? "faces" : "sortes possibles"), ligne(`p=${e.p}`, indiscernables ? "dés identiques" : "éléments choisis"), ligne(`N=\\Gamma_{${e.n}}^{${e.p}}=${CC(`${e.n}+${e.p}-1`, e.p)}`, "combinaison avec répétition"), ligne(`=${CC(N, e.p)}`)]),
    resultat("a", fx(`$N=\\Gamma_{${e.n}}^{${e.p}}=${CC(N, e.p)}$`)),
    utiliseCours("b", fx("$C_n^k=\\dfrac{n!}{k!\\,(n-k)!}$ : produit de $k$ facteurs décroissants sur $k!$"), COURS_FONDAMENTAL),
    calcul("b", lignesCombinaison(N, e.p).map((l, i) => (i === 0 ? { ...l, latex: `N=${l.latex}` } : l))),
    resultat("b", fx(`$N=${milliers(e.resultat)}$ ${indiscernables ? "résultats" : "choix"}.`)),
    piege("b", fx(indiscernables ? `Compter $${e.n}^{${e.p}}$ : les dés sont indiscernables, deux résultats qui ne diffèrent que par l'ordre sont le même.` : `Prendre $${CC(e.n, e.p)}$ (sans répétition) ou $${e.n}^{${e.p}}$ (ordre compté) : un même élément peut revenir et l'ordre ne compte pas.`)),
  ];
}

function corrigeD(e: ExerciceDenombCombD): EtapeCorrection[] {
  const [a, b] = termesD44(e);
  const exclusion = e.typeContrainte === "exclusion";
  const formule = exclusion ? `${a}-${b}` : `${a}+${b}`;
  const [n1, k1, n2, k2] = exclusion ? [e.n, e.k, e.n - 2, e.k - 2] : [e.n - 2, e.k - 2, e.n - 2, e.k];
  return [
    utiliseCours("a", fx("« Jamais ensemble » : on compte tout, puis on retire les choix où les deux sont présents ; « ensemble ou pas du tout » : on additionne les deux cas permis"), COURS_COMBINE),
    calcul("a", [ligne(`N=${formule}`, exclusion ? "tous les choix, moins ceux qui contiennent les deux" : "les deux choisis (il reste k − 2 places), plus aucun des deux")]),
    resultat("a", fx(`$N=${formule}$`)),
    utiliseCours("b", fx("$C_n^k=\\dfrac{n!}{k!\\,(n-k)!}$ ; une fois les deux personnes placées ou écartées, il reste $n-2$ personnes"), COURS_FONDAMENTAL),
    calcul("b", [...lignesCombinaison(n1, k1), ...lignesCombinaison(n2, k2)]),
    resultat("b", fx(`$${a}=${milliers(e.terme1)}$ ; $${b}=${milliers(e.terme2)}$`)),
    utiliseCours("c", fx(exclusion ? "On retire du total les choix interdits" : "On additionne les deux cas permis"), COURS_COMBINE),
    calcul("c", [ligne(`N=${milliers(e.terme1)}${exclusion ? "-" : "+"}${milliers(e.terme2)}`), ligne(`=${milliers(e.resultatFinal)}`)]),
    resultat("c", fx(`$N=${milliers(e.resultatFinal)}$ choix.`)),
    piege("c", fx(exclusion ? "Additionner les choix interdits au lieu de les retirer." : `Retirer $${a}$ du total : ici les deux personnes peuvent venir, à condition de venir ensemble.`)),
  ];
}

function corrigeE(e: ExerciceDenombCombE): EtapeCorrection[] {
  const lettres = [...new Set(e.mot)].map((c) => ({ c, f: e.mot.split(c).length - 1 })).sort((x, y) => y.f - x.f);
  const formule = formuleMultinomiale44(e.n, e.repetitions.map((r) => r.fois));
  const num = factorielleBig(e.n);
  const den = e.repetitions.reduce((a, r) => a * factorielleBig(r.fois), 1n);
  return [
    utiliseCours("a", fx("Mots formés avec toutes les lettres, certaines répétées : permutation avec répétition $\\dfrac{n!}{n_1!\\times n_2!\\times\\cdots}$"), COURS_COMBINE),
    calcul("a", [ligne(`${e.n}=${lettres.map((x) => x.f).join("+")}`, lettres.map((x) => `${x.c} : ${x.f}`).join(", ")), ligne(`N=${formule}`, "on divise par les ordres des lettres identiques")]),
    resultat("a", fx(`$N=${formule}$`)),
    utiliseCours("b", fx("On calcule les factorielles, puis on divise"), COURS_COMBINE),
    calcul("b", [ligne(`N=\\dfrac{${milliers(num)}}{${e.repetitions.map((r) => milliers(factorielleBig(r.fois))).join("\\times ")}}`, fx(`$${e.n}!=${milliers(num)}$`)), ...(e.repetitions.length > 1 ? [ligne(`=\\dfrac{${milliers(num)}}{${milliers(den)}}`)] : []), ligne(`=${milliers(e.nombreMots)}`)]),
    resultat("b", fx(`$N=${milliers(e.nombreMots)}$ mots.`)),
    utiliseCours("c", fx("Une anagramme est un mot différent du mot de départ"), COURS_COMBINE),
    calcul("c", [ligne(`${milliers(e.nombreMots)}-1=${milliers(e.nombreMots - 1)}`, "on retire le mot lui-même")]),
    resultat("c", fx(`Le mot ${e.mot} a $${milliers(e.nombreMots - 1)}$ anagrammes.`)),
    piege("c", fx(`Garder le mot ${e.mot} lui-même : une anagramme est un autre mot.`)),
  ];
}

export function correctionDetailleeDenombrementCombine(e: E): EtapeCorrection[] {
  switch (e.famille) {
    case "A":
      return finaliserCombinatoire(corrigeA(e));
    case "B":
      return finaliserCombinatoire(corrigeB(e));
    case "C":
      return finaliserCombinatoire(corrigeC(e));
    case "D":
      return finaliserCombinatoire(corrigeD(e));
    case "E":
      return finaliserCombinatoire(corrigeE(e));
  }
}
