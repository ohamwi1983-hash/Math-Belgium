import type { ExerciceDenombrementA, ExerciceDenombrementB, ExerciceDenombrementC, ExerciceDenombrementD, ExerciceDenombrementFondamental, FormuleC } from "../core6e/denombrementFondamental.types";
import type { PhaseDenombrementFondamental } from "../moteur6e/typesDenombrementFondamental";
import { vaut } from "../moteur6e/saisieCombinatoire";
import { f, m, milliers, t } from "./fragmentsCombinatoire";
import type { AideCombi, ChampCombi, FormatCombinatoire, FragmentConsigne } from "./fragmentsCombinatoire";

/**
 * Textes de `6gen43` (6e ch. 7, § 1) — audit du chapitre, lots B et C : aucun exemple de champ qui
 * soit une réponse, aides à deux niveaux qui ne donnent jamais la valeur, libellés et options en
 * KaTeX (plus de « Combinaison(C_n^k) » collé en italique ni de « 1ᵉʳ » dans `\text{}`), données en
 * prose (rien n'est coupé à 390 px), messages ciblés sur les pièges du cours, explication après échec.
 * Même source pour l'écran et pour le papier (`exportEvaluation.ts`).
 */

type E = ExerciceDenombrementFondamental;
type P = PhaseDenombrementFondamental;

function ordinal(p: number): string {
  return p === 1 ? "1ᵉʳ" : `${p}ᵉ`;
}

function produitLatex(facteurs: number[]): string {
  return facteurs.map((x) => milliers(x)).join("\\times ");
}

function ensembleLatex(chiffres: number[]): string {
  return `\\{${chiffres.join("\\,;\\,")}\\}`;
}

function texteChiffres(e: ExerciceDenombrementA): FragmentConsigne[] {
  return e.chiffres.length === 10 ? [t("Chiffres utilisables : les dix chiffres de 0 à 9.")] : [t("Chiffres utilisables : "), m(ensembleLatex(e.chiffres)), t(" (et aucun autre).")];
}

// ============================================================================
// Famille A
// ============================================================================

/** Positions (numéros de case) remplies à chaque écran, dans l'ordre des champs. */
function positionsEcranA(e: ExerciceDenombrementA, i: number): number[] {
  const n = e.n;
  const suite = (a: number, b: number) => Array.from({ length: Math.max(0, b - a + 1) }, (_, k) => a + k);
  switch (e.sousType) {
    case "total":
    case "borneSuperieure":
      return i === 0 ? [1] : suite(2, n);
    case "positionFixee":
      if (e.variante === "dernier") return i === 0 ? [n, 1] : suite(2, n - 1);
      return suite((e.fixes ?? []).length + 1, n);
    case "contientUnChiffre":
    case "contientDeuxChiffres":
      return i === 0 ? [1] : i === 1 ? suite(2, n) : [];
    case "parite":
      return i === 1 ? suite(2, n - 1) : [];
  }
}

function contrainteA(e: ExerciceDenombrementA): FragmentConsigne[] {
  switch (e.sousType) {
    case "total":
      return [t("Combien de tels nombres peut-on former ?")];
    case "positionFixee":
      if (e.variante === "dernier") return [t(`Le dernier chiffre (le ${ordinal(e.n)}) doit être ${e.fixes![0].valeur}. Combien de tels nombres peut-on former ?`)];
      return [t(e.fixes!.length === 1 ? `Le nombre doit commencer par ${e.fixes![0].valeur}.` : `Le nombre doit commencer par ${e.fixes![0].valeur}, suivi de ${e.fixes![1].valeur}.`), t(" Combien de tels nombres peut-on former ?")];
    case "contientUnChiffre":
      return [t(`Sans autre contrainte, on peut en former ${milliersT(e.totalSansContrainte)}. Combien de ces nombres contiennent le chiffre ${e.chiffre} ?`)];
    case "contientDeuxChiffres":
      return [
        t(`Sans autre contrainte, on peut en former ${milliersT(e.totalSansContrainte)} ; ${milliersT(e.sansChiffre1!)} ne contiennent pas le chiffre ${e.chiffre} et ${milliersT(e.sansChiffre2!)} ne contiennent pas le chiffre ${e.chiffre2}. Combien contiennent à la fois ${e.chiffre} et ${e.chiffre2} ?`),
      ];
    case "borneSuperieure":
      return [t(`Le premier chiffre doit être strictement inférieur à ${e.borne}. Combien de tels nombres peut-on former ?`)];
    case "parite":
      return [t(`Le nombre doit être ${e.labelEnsemble} : son dernier chiffre est dans `), m(ensembleLatex(e.ensembleDernier!)), t(". Combien de tels nombres peut-on former ?")];
  }
}

function milliersT(n: number): string {
  return milliers(n).replace(/\\,/g, " ");
}

function donneesA(e: ExerciceDenombrementA): FragmentConsigne[][] {
  return [texteChiffres(e), [t(`On forme des nombres de ${e.n} chiffres, tous différents, dont le premier chiffre n'est pas 0.`)], contrainteA(e)];
}

function consigneEcranA(e: ExerciceDenombrementA, i: number): FragmentConsigne[] {
  const fin = " Termine par le nombre total.";
  switch (e.sousType) {
    case "total":
      return i === 0 ? [t("Combien de choix as-tu pour le premier chiffre ?")] : [t("Combien de choix reste-t-il pour chacune des cases suivantes (un chiffre déjà placé ne peut plus servir) ?" + fin)];
    case "borneSuperieure":
      return i === 0 ? [t("Combien de choix as-tu pour le premier chiffre ?")] : [t("Combien de choix reste-t-il pour chacune des cases suivantes ?" + fin)];
    case "positionFixee":
      if (e.variante === "dernier") return i === 0 ? [t("Commence par les cases contraintes : combien de choix pour le dernier chiffre, puis pour le premier ?")] : [t("Combien de choix reste-t-il pour chacune des cases du milieu ?" + fin)];
      return [t("Les premières cases sont imposées (un seul choix chacune). Combien de choix reste-t-il pour chacune des cases libres ?" + fin)];
    case "contientUnChiffre":
      if (i === 0) return [t(`Compte d'abord les nombres qui ne contiennent pas le chiffre ${e.chiffre} : combien de choix pour leur premier chiffre ?`)];
      if (i === 1) return [t(`Combien de choix reste-t-il pour chacune des cases suivantes ? Termine par le nombre de nombres sans le chiffre ${e.chiffre}.`)];
      return [t(`Déduis-en le nombre de nombres qui contiennent le chiffre ${e.chiffre}.`)];
    case "contientDeuxChiffres":
      if (i === 0) return [t(`Compte d'abord les nombres qui ne contiennent ni ${e.chiffre} ni ${e.chiffre2} : combien de choix pour leur premier chiffre ?`)];
      if (i === 1) return [t(`Combien de choix reste-t-il pour chacune des cases suivantes ? Termine par le nombre de nombres sans ${e.chiffre} ni ${e.chiffre2}.`)];
      return [t(`Déduis-en, par inclusion-exclusion, le nombre de nombres qui contiennent à la fois ${e.chiffre} et ${e.chiffre2}.`)];
    case "parite":
      if (i === 0) return [t("Le nombre de choix du premier chiffre dépend du dernier. Combien de choix pour le premier chiffre si le dernier est 0 ? Et si le dernier est un autre chiffre admis ?")];
      if (i === 1) return [t("Le premier et le dernier chiffre étant placés, combien de choix reste-t-il pour chacune des cases du milieu (c'est le même nombre dans les deux cas) ?")];
      return [t("Additionne les deux cas : combien de nombres en tout ?")];
  }
}

function champsA(e: ExerciceDenombrementA, i: number): ChampCombi[] {
  const pos = positionsEcranA(e, i).map((p): ChampCombi => ({ type: "texte", label: p === e.n && e.variante === "dernier" ? "Dernier chiffre" : `${ordinal(p)} chiffre` }));
  const total: ChampCombi = { type: "texte", label: "Nombre total" };
  switch (e.sousType) {
    case "total":
    case "borneSuperieure":
      return i === 0 ? pos : [...pos, total];
    case "positionFixee":
      return e.variante === "dernier" && i === 0 ? pos : [...pos, total];
    case "contientUnChiffre":
      if (i === 2) return [{ type: "texte", label: `Nombres avec le ${e.chiffre}` }];
      return i === 0 ? pos : [...pos, { type: "texte", label: `Nombres sans le ${e.chiffre}` }];
    case "contientDeuxChiffres":
      if (i === 2) return [{ type: "texte", label: `Avec ${e.chiffre} et ${e.chiffre2}` }];
      return i === 0 ? pos : [...pos, { type: "texte", label: `Sans ${e.chiffre} ni ${e.chiffre2}` }];
    case "parite":
      if (i === 0) return [{ type: "texte", label: "Si le dernier est 0" }, { type: "texte", label: "Sinon" }];
      return i === 1 ? pos : [total];
  }
}

const AIDE_PRINCIPE: AideCombi = { texte: "Principe multiplicatif (cours, point 1) : on multiplie les nombres de choix de chaque case, en commençant par la case la plus contrainte ; un chiffre placé n'est plus disponible pour les cases suivantes." };

function aidesA(e: ExerciceDenombrementA, i: number): AideCombi[] {
  const nb = e.chiffres.length;
  const zero = e.chiffres.includes(0);
  switch (e.sousType) {
    case "contientUnChiffre":
    case "contientDeuxChiffres":
      if (i === 2)
        return e.sousType === "contientUnChiffre"
          ? [{ texte: "Complément (cours) : compter ceux qui ne vérifient pas la condition, puis retirer du total." }, { texte: `Les nombres « avec ${e.chiffre} » et « sans ${e.chiffre} » se partagent les ${milliersT(e.totalSansContrainte)} nombres.` }]
          : [{ texte: "Inclusion-exclusion : le nombre de « ni l'un ni l'autre » a été retiré deux fois, il faut le rajouter une fois :", latex: "n(A\\cap B)=T-n(\\overline{A})-n(\\overline{B})+n(\\overline{A}\\cap\\overline{B})" }, { texte: `Ici $T$, les nombres sans ${e.chiffre} et sans ${e.chiffre2} sont donnés ; les nombres sans aucun des deux viennent de l'écran précédent.` }];
      return [AIDE_PRINCIPE, { texte: i === 0 ? `Retire de la liste les chiffres interdits : celui qu'on veut éviter${zero ? ", et 0 en première position" : ""}. Compte ceux qui restent.` : "Le premier chiffre est placé : il reste un chiffre de moins pour la case suivante, puis encore un de moins…" }];
    case "parite":
      if (i === 0) return [{ texte: "Quand le dernier chiffre peut être 0, on sépare deux cas : 0 n'est pas interdit en première position de la même façon dans les deux." }, { texte: `Si le dernier est 0, le premier peut être n'importe quel autre chiffre ; sinon, il ne peut être ni 0 ni le dernier chiffre (${nb} chiffres utilisables).` }];
      if (i === 1) return [AIDE_PRINCIPE, { texte: "Deux chiffres sont déjà placés (le premier et le dernier) : il en reste deux de moins pour la deuxième case." }];
      return [{ texte: "Principe additif : les deux cas (dernier chiffre 0, ou non) ne se recouvrent pas, on additionne leurs nombres." }, { texte: `Dans le cas « dernier chiffre non nul », il y a ${e.ensembleDernier!.length - 1} choix pour ce dernier chiffre.` }];
    default:
      if (e.sousType === "borneSuperieure" && i === 0) return [AIDE_PRINCIPE, { texte: `Compte les chiffres utilisables qui ne sont pas 0 et sont strictement inférieurs à ${e.borne}.` }];
      if (i === 0 && e.sousType === "total") return [AIDE_PRINCIPE, { texte: zero ? "0 est-il parmi les chiffres utilisables ? Il est interdit en première position." : "0 n'est pas parmi les chiffres utilisables : aucun chiffre n'est interdit en première position pour cette raison." }];
      if (i === 0 && e.variante === "dernier") return [AIDE_PRINCIPE, { texte: `Le dernier chiffre est imposé (un seul choix). Le premier ne peut être ni ce chiffre-là${zero ? ", ni 0" : ""}.` }];
      return [AIDE_PRINCIPE, { texte: `On part de ${nb} chiffres utilisables ; chaque case déjà remplie en retire un pour les cases suivantes.` }];
  }
}

function explicationA(e: ExerciceDenombrementA, i: number): FragmentConsigne[][] {
  const v = e.valeursEcrans[i];
  const z = e.chiffres.includes(0);
  const nb = e.chiffres.length;
  switch (e.sousType) {
    case "total":
    case "borneSuperieure":
      if (i === 0)
        return [
          e.sousType === "total"
            ? f(`Premier chiffre : les ${nb} chiffres utilisables${z ? " sauf 0" : ""}, soit $${v[0]}$ choix.`)
            : f(`Premier chiffre : les chiffres utilisables non nuls et strictement inférieurs à ${e.borne}, soit $${v[0]}$ choix.`),
        ];
      return [f(`Chaque case suivante a un chiffre de moins à disposition : $${produitLatex(v.slice(0, -1))}$.`), f(`Total : $${produitLatex([e.valeursEcrans[0][0], ...v.slice(0, -1)])}=${milliers(e.resultat)}$.`)];
    case "positionFixee":
      if (e.variante === "dernier" && i === 0)
        return [f(`Dernier chiffre imposé : 1 choix. Premier chiffre : ni ${e.fixes![0].valeur}${z && e.fixes![0].valeur !== 0 ? " ni 0" : ""}, soit $${v[1]}$ choix.`)];
      return [f(`Cases libres : $${produitLatex(v.slice(0, -1))}$.`), f(`Total : $${milliers(e.resultat)}$.`)];
    case "contientUnChiffre":
      if (i === 0) return [f(`Sans le chiffre ${e.chiffre}, il reste ${nb - 1} chiffres${z && e.chiffre !== 0 ? ", dont 0 interdit en tête" : ""} : $${v[0]}$ choix pour le premier.`)];
      if (i === 1) return [f(`Nombres sans ${e.chiffre} : $${produitLatex([e.valeursEcrans[0][0], ...v.slice(0, -1)])}=${milliers(v[v.length - 1])}$.`)];
      return [f(`Complément : $${milliers(e.totalSansContrainte)}-${milliers(e.valeursEcrans[1][e.valeursEcrans[1].length - 1])}=${milliers(e.resultat)}$.`)];
    case "contientDeuxChiffres":
      if (i === 0) return [f(`Sans ${e.chiffre} ni ${e.chiffre2}, il reste ${nb - 2} chiffres : $${v[0]}$ choix pour le premier (0 interdit en tête s'il en fait partie).`)];
      if (i === 1) return [f(`Nombres sans ${e.chiffre} ni ${e.chiffre2} : $${produitLatex([e.valeursEcrans[0][0], ...v.slice(0, -1)])}=${milliers(v[v.length - 1])}$.`)];
      return [f(`Inclusion-exclusion : $${milliers(e.totalSansContrainte)}-${milliers(e.sansChiffre1!)}-${milliers(e.sansChiffre2!)}+${milliers(e.valeursEcrans[1][e.valeursEcrans[1].length - 1])}=${milliers(e.resultat)}$.`)];
    case "parite": {
      const M = e.valeursEcrans[1].reduce((a, b) => a * b, 1);
      if (i === 0) return [f(`Dernier chiffre 0 : le premier est un des ${nb - 1} autres chiffres ($${v[0]}$ choix). Dernier chiffre non nul : le premier n'est ni 0 ni ce chiffre ($${v[1]}$ choix).`)];
      if (i === 1) return [f(`Cases du milieu : $${produitLatex(v)}$${v.length > 1 ? `$=${milliers(M)}$` : ""}.`)];
      const k = e.ensembleDernier!.length - 1;
      return [f(`Cas « 0 à la fin » : $1\\times ${nb - 1}\\times ${milliers(M)}$ ; cas « autre chiffre à la fin » : $${k}\\times ${nb - 2}\\times ${milliers(M)}$.`), f(`Total : $${milliers(e.resultat)}$.`)];
    }
  }
}

function libelleA(e: ExerciceDenombrementA, i: number): string {
  const last = i === e.valeursEcrans.length - 1;
  if (e.sousType === "contientUnChiffre" || e.sousType === "contientDeuxChiffres") return ["Premier chiffre (cas contraire)", "Cas contraire", e.sousType === "contientUnChiffre" ? "Complément" : "Inclusion-exclusion"][i];
  if (e.sousType === "parite") return ["Premier chiffre, deux cas", "Cases du milieu", "Total"][i];
  if (e.sousType === "positionFixee" && e.variante === "premiers") return "Cases libres et total";
  return i === 0 ? "Cases contraintes" : last ? "Cases restantes et total" : "Cases restantes";
}

// ============================================================================
// Famille B
// ============================================================================

function donneesB(e: ExerciceDenombrementB): FragmentConsigne[][] {
  return e.sousType === "direct" ? [[t(`Un polygone convexe a ${e.n} côtés.`)]] : [[t(`Un polygone convexe possède ${milliersT(e.diagonales)} diagonales.`)]];
}

// ============================================================================
// Famille C
// ============================================================================

export const LIBELLE_FORMULE_C: Record<FormuleC, string> = {
  permutation: "Permutation simple : $P_n=n!$",
  arrangement: "Arrangement simple : $A_n^p$",
  arrangementRepetition: "Arrangement avec répétition : $B_n^p=n^p$",
  combinaison: "Combinaison simple : $C_n^p$",
};

function formuleInstanceC(e: ExerciceDenombrementC): string {
  switch (e.formule) {
    case "permutation":
      return `P_{${e.n}}=${e.n}!`;
    case "arrangement":
      return `A_{${e.n}}^{${e.p}}`;
    case "arrangementRepetition":
      return `B_{${e.n}}^{${e.p}}=${e.n}^{${e.p}}`;
    case "combinaison":
      return `C_{${e.n}}^{${e.p}}`;
  }
}

function calculC(e: ExerciceDenombrementC): string {
  switch (e.formule) {
    case "permutation":
      return `${e.n}!=${milliers(e.resultat)}`;
    case "arrangement":
      return `A_{${e.n}}^{${e.p}}=${produitLatex(Array.from({ length: e.p }, (_, i) => e.n - i))}=${milliers(e.resultat)}`;
    case "arrangementRepetition":
      return `${e.n}^{${e.p}}=${milliers(e.resultat)}`;
    case "combinaison":
      return `C_{${e.n}}^{${e.p}}=\\dfrac{${e.n}!}{${e.p}!\\,${e.n - e.p}!}=${milliers(e.resultat)}`;
  }
}

const RAISON_C: Record<FormuleC, string> = {
  permutation: "L'ordre des lettres compte, aucune lettre ne revient et toutes sont utilisées : permutation simple.",
  arrangement: "L'ordre compte (les places ou les postes sont différents), personne ne revient deux fois et on n'en choisit qu'une partie : arrangement simple.",
  arrangementRepetition: "L'ordre compte et un même symbole peut revenir : arrangement avec répétition.",
  combinaison: "L'ordre des cartes dans une main ne compte pas et une carte ne peut pas revenir : combinaison simple.",
};

// ============================================================================
// Famille D
// ============================================================================

function donneesD(e: ExerciceDenombrementD): FragmentConsigne[][] {
  if (e.sousType === "grouper") {
    const liste = e.groupes!.map((g) => `${g.taille} livres de ${g.nom}`).join(", ");
    return [[t(`On range sur une étagère ${liste} (tous différents).`)], [t("Les livres d'une même matière doivent rester côte à côte. Combien de rangements possibles ?")]];
  }
  const lettres = e.lettresConsecutives!.split("").join(", ");
  const ordre = e.sousType === "consecutivesOrdreFixe" ? `dans cet ordre (${e.lettresConsecutives})` : "dans un ordre quelconque";
  return [[t(`On écrit des « mots » en utilisant une fois chacune des ${e.mot!.length} lettres du mot ${e.mot}.`)], [t(`Les lettres ${lettres} doivent être côte à côte, ${ordre}. Combien de mots peut-on écrire ?`)]];
}

// ============================================================================
// Famille E
// ============================================================================

const OPTIONS_E = [
  { valeur: "table", label: "Rotations seulement : $(n-1)!$" },
  { valeur: "collier", label: "Rotations et retournement : $\\dfrac{(n-1)!}{2}$" },
];

// ============================================================================
// Dispatch
// ============================================================================

function indexA(p: P): number {
  return Number(p.slice(1)) - 1;
}

export const FORMAT_6GEN43: FormatCombinatoire<E, P> = {
  consigneGenerale(e) {
    switch (e.famille) {
      case "A":
        return [t("Compte case par case (principe multiplicatif), en commençant par la case la plus contrainte.")];
      case "B":
        return f("Un polygone convexe à $n$ côtés possède $D(n)=\\dfrac{n(n-3)}{2}$ diagonales.");
      case "C":
        return [t("Reconnais le groupement à l'aide des trois questions du cours (l'ordre compte-t-il ? la répétition est-elle permise ? tous les éléments sont-ils utilisés ?), puis calcule.")];
      case "D":
        return [t("Des éléments qui doivent rester ensemble forment un bloc, que l'on range comme une seule unité.")];
      case "E":
        return [t("Disposition en cercle : deux dispositions qui se déduisent l'une de l'autre par une rotation (et parfois par un retournement) sont identiques.")];
    }
  },
  donnees(e) {
    switch (e.famille) {
      case "A":
        return donneesA(e);
      case "B":
        return donneesB(e);
      case "C":
        return [f(e.contexte), [t(e.question)]];
      case "D":
        return donneesD(e);
      case "E":
        return [[t(e.contexte)], [t("Combien de dispositions différentes y a-t-il ?")]];
    }
  },
  consigneEcran(e, p) {
    switch (e.famille) {
      case "A":
        return consigneEcranA(e, indexA(p));
      case "B":
        if (e.sousType === "direct") return [t("Combien de diagonales ce polygone possède-t-il ?")];
        return p === "b1" ? f("Écris l'équation $\\dfrac{n(n-3)}{2}=D$ sous la forme $n^2-3n-c=0$ : que vaut $c$ ?") : [t("Résous cette équation : combien de côtés le polygone a-t-il ?")];
      case "C":
        return p === "c1" ? [t("Quel groupement modélise cette situation ?")] : [t("Calcule le nombre demandé.")];
      case "D":
        if (p === "d1") return [t("En comptant chaque bloc comme une seule unité, combien d'unités faut-il ranger ?")];
        if (p === "d2") return [t("De combien de façons peut-on ranger ces unités les unes par rapport aux autres ?")];
        return [t("Tiens compte de l'ordre à l'intérieur de chaque bloc : combien de rangements y a-t-il en tout ?")];
      case "E":
        return p === "e1" ? [t("Quelle formule compte ces dispositions ?")] : [t("Calcule le nombre de dispositions.")];
    }
  },
  champs(e, p) {
    switch (e.famille) {
      case "A":
        return champsA(e, indexA(p));
      case "B":
        if (e.sousType === "direct") return [{ type: "texte", label: "Nombre de diagonales" }];
        return p === "b1" ? [{ type: "texte", label: "$c$" }] : [{ type: "texte", label: "Nombre de côtés $n$" }];
      case "C":
        return p === "c1" ? [{ type: "choix", label: "", options: (Object.keys(LIBELLE_FORMULE_C) as FormuleC[]).map((v) => ({ valeur: v, label: LIBELLE_FORMULE_C[v] })) }] : [{ type: "texte", label: "Nombre" }];
      case "D":
        return [{ type: "texte", label: p === "d1" ? "Nombre d'unités" : p === "d2" ? "Rangements des unités" : "Nombre total" }];
      case "E":
        return p === "e1" ? [{ type: "choix", label: "", options: OPTIONS_E }] : [{ type: "texte", label: "Nombre de dispositions" }];
    }
  },
  aides(e, p) {
    switch (e.famille) {
      case "A":
        return aidesA(e, indexA(p));
      case "B":
        if (p === "b1" && e.sousType === "direct") return [{ texte: "Chaque sommet est relié par une diagonale à tous les autres sommets sauf lui-même et ses deux voisins ; chaque diagonale a deux extrémités." }, { texte: `Remplace $n$ par ${e.n} dans la formule, puis calcule.` }];
        if (p === "b1") return [{ texte: "Multiplie les deux membres par 2, puis développe $n(n-3)$." }, { texte: `On obtient $n^2-3n=2\\times ${milliers(e.diagonales)}$ ; fais tout passer dans le premier membre.` }];
        return [{ texte: "Équation du second degré : $\\Delta=b^2-4ac$, puis $n=\\dfrac{-b\\pm\\sqrt{\\Delta}}{2a}$." }, { texte: "Un nombre de côtés est un entier positif : une seule des deux solutions convient." }];
      case "C":
        if (p === "c1") return [{ texte: "Les trois questions : si je permute les éléments choisis, le résultat change-t-il ? Un même élément peut-il revenir ? Utilise-t-on tous les éléments ?" }, { texte: e.formule === "combinaison" ? "Deux mains qui contiennent les mêmes cartes dans un autre ordre sont-elles différentes ?" : e.formule === "arrangementRepetition" ? "Un même symbole peut-il apparaître à deux places ?" : e.formule === "arrangement" ? "Échanger deux personnes de place donne-t-il un autre résultat ? Les utilise-t-on toutes ?" : "Utilise-t-on toutes les lettres disponibles, chacune une fois ?" }];
        return [{ texte: "Formules du cours : $P_n=n!$, $A_n^p=\\dfrac{n!}{(n-p)!}$, $B_n^p=n^p$, $C_n^p=\\dfrac{n!}{p!\\,(n-p)!}$." }, { texte: `Repère $n$ (nombre d'éléments disponibles${e.sousType === "cartesContraintes" ? ", une fois les cartes imposées ou retirées mises à part" : e.sousType === "motsPositionFixee" ? ", une fois les lettres imposées placées" : ""}) et $p$ (nombre d'éléments choisis).` }];
      case "D":
        if (p === "d1") return [{ texte: "Un bloc compte pour une seule unité ; chaque élément hors bloc compte aussi pour une unité." }, { texte: e.sousType === "grouper" ? "Combien de matières y a-t-il ?" : `Le mot a ${e.mot!.length} lettres, dont ${e.lettresConsecutives!.length} forment le bloc.` }];
        if (p === "d2") return [{ texte: "Ranger $u$ unités distinctes : $P_u=u!$ façons." }, { texte: "Utilise le nombre d'unités de l'écran précédent." }];
        return [{ texte: "Multiplie par le nombre d'ordres possibles à l'intérieur de chaque bloc : $k!$ si l'ordre est libre, 1 s'il est imposé." }, { texte: e.sousType === "grouper" ? "Chaque matière forme son propre bloc : un facteur $k!$ par matière." : e.sousType === "consecutivesOrdreFixe" ? "Ici, l'ordre des lettres du bloc est imposé." : "Ici, les lettres du bloc peuvent être dans n'importe quel ordre." }];
      case "E":
        if (p === "e1") return [{ texte: "$n$ objets en cercle : $(n-1)!$ dispositions si seules les rotations les rendent identiques ; on divise encore par 2 si l'on peut aussi retourner l'objet." }, { texte: "Peut-on retourner la situation décrite sans changer qui est à gauche et qui est à droite de qui ?" }];
        return [{ texte: "Calcule $(n-1)!$, puis divise par 2 si le retournement est permis." }, { texte: `Ici $n=${e.n}$.` }];
    }
  },
  reponseAttendue(e, p) {
    switch (e.famille) {
      case "A":
        return [e.valeursEcrans[indexA(p)].map((v) => milliers(v)).join("\\;;\\;")];
      case "B":
        if (e.sousType === "direct") return [`D(${e.n})=${milliers(e.diagonales)}`];
        return p === "b1" ? [`c=${milliers(e.constanteEquation)}`] : [`n=${e.n}`];
      case "C":
        return p === "c1" ? [`\\text{${LIBELLE_FORMULE_C[e.formule].split(" :")[0]}}\\ ${formuleInstanceC(e)}`] : [milliers(e.resultat)];
      case "D":
        return [milliers(p === "d1" ? e.nombreUnites : p === "d2" ? e.arrangementsBlocs : e.resultatFinal)];
      case "E":
        return p === "e1" ? [e.sousType === "table" ? `(${e.n}-1)!` : `\\dfrac{(${e.n}-1)!}{2}`] : [milliers(e.resultat)];
    }
  },
  explication(e, p) {
    switch (e.famille) {
      case "A":
        return explicationA(e, indexA(p));
      case "B":
        if (e.sousType === "direct") return [f(`$D(${e.n})=\\dfrac{${e.n}\\times ${e.n - 3}}{2}=${milliers(e.diagonales)}$.`)];
        return p === "b1"
          ? [f(`$n(n-3)=${milliers(e.constanteEquation)}$, donc $n^2-3n-${milliers(e.constanteEquation)}=0$.`)]
          : [f(`$\\Delta=9+4\\times ${milliers(e.constanteEquation)}=${milliers(9 + 4 * e.constanteEquation)}=${2 * e.n - 3}^2$, d'où $n=\\dfrac{3+${2 * e.n - 3}}{2}=${e.n}$ (l'autre solution est négative).`)];
      case "C":
        return p === "c1" ? [[t(RAISON_C[e.formule])], f(`Ici : $${formuleInstanceC(e)}$.`)] : [f(`$${calculC(e)}$.`)];
      case "D": {
        if (p === "d1") return [[t(e.sousType === "grouper" ? `Un bloc par matière : ${e.nombreUnites} unités.` : `Le bloc de ${e.lettresConsecutives!.length} lettres compte pour une unité, plus les ${e.mot!.length - e.lettresConsecutives!.length} autres lettres : ${e.nombreUnites} unités.`)]];
        if (p === "d2") return [f(`$${e.nombreUnites}!=${milliers(e.arrangementsBlocs)}$.`)];
        const internes = e.internesParGroupe.filter((x) => x > 1);
        return [f(internes.length === 0 ? `L'ordre dans le bloc est imposé : $${milliers(e.resultatFinal)}$.` : `$${milliers(e.arrangementsBlocs)}\\times ${internes.map((x) => milliers(x)).join("\\times ")}=${milliers(e.resultatFinal)}$ (ordres à l'intérieur des blocs).`)];
      }
      case "E":
        return p === "e1"
          ? [[t(e.sousType === "table" ? "Une table ronde ne se retourne pas : le miroir échangerait les voisins de gauche et de droite. Seules les rotations comptent." : "Un bracelet (un anneau, un collier) se retourne : deux dispositions symétriques sont identiques, on divise encore par 2.")]]
          : [f(e.sousType === "table" ? `$(${e.n}-1)!=${e.n - 1}!=${milliers(e.resultat)}$.` : `$\\dfrac{(${e.n}-1)!}{2}=\\dfrac{${milliers(2 * e.resultat)}}{2}=${milliers(e.resultat)}$.`)];
    }
  },
  libellePhase(e, p) {
    switch (e.famille) {
      case "A":
        return libelleA(e, indexA(p));
      case "B":
        return e.sousType === "direct" ? "Nombre de diagonales" : p === "b1" ? "Équation" : "Nombre de côtés";
      case "C":
        return p === "c1" ? "Groupement" : "Calcul";
      case "D":
        return p === "d1" ? "Unités" : p === "d2" ? "Rangement des unités" : "Total";
      case "E":
        return p === "e1" ? "Formule" : "Calcul";
    }
  },
  messageCible(e, p, valeurs) {
    const v = valeurs[valeurs.length - 1] ?? "";
    switch (e.famille) {
      case "A": {
        const i = indexA(p);
        if (i === 0 && e.chiffres.includes(0) && (e.sousType === "total" || e.sousType === "borneSuperieure") && vaut(valeurs[0] ?? "", e.valeursEcrans[0][0] + 1)) return [t("As-tu exclu 0 de la première position ?")];
        return null;
      }
      case "B":
        if (e.sousType === "direct" && vaut(v, e.n * (e.n - 3))) return [t("N'oublie pas de diviser par 2 : chaque diagonale est comptée une fois par extrémité.")];
        if (e.sousType === "direct" && vaut(v, (e.n * (e.n - 1)) / 2)) return [t("Ce nombre compte aussi les côtés du polygone, qui ne sont pas des diagonales.")];
        if (p === "b2" && vaut(v, 3 - e.n)) return [t("Un nombre de côtés est positif : garde l'autre solution.")];
        return null;
      case "C":
        if (p !== "c2") return null;
        if (e.formule === "combinaison" && vaut(v, e.resultat * fact(e.p))) return [t("L'ordre des cartes dans une main ne compte pas : divise par le nombre d'ordres des cartes choisies.")];
        if (e.formule === "arrangement" && vaut(v, e.resultat / fact(e.p))) return [t("Ici l'ordre compte : changer deux personnes de place donne un autre résultat.")];
        if (e.formule === "arrangementRepetition" && e.n >= e.p && vaut(v, arr(e.n, e.p))) return [t("Un même symbole peut revenir : chaque position a toujours le même nombre de choix.")];
        if (e.sousType === "motsPositionFixee" && vaut(v, fact(e.n + (e.contexte.includes(" et finissent") ? 2 : 1)))) return [t("Les lettres imposées ne se choisissent plus : on ne range que les autres.")];
        return null;
      case "D":
        if (p === "d3" && e.sousType !== "consecutivesOrdreFixe" && vaut(v, e.arrangementsBlocs)) return [t("N'oublie pas l'ordre à l'intérieur de chaque bloc.")];
        if (p === "d3" && e.sousType === "consecutivesOrdreFixe" && vaut(v, e.arrangementsBlocs * fact(e.lettresConsecutives!.length))) return [t("L'ordre des lettres du bloc est imposé : un seul ordre à l'intérieur.")];
        return null;
      case "E":
        if (p !== "e2") return null;
        if (vaut(v, fact(e.n))) return [t("Ce nombre compte comme différentes deux dispositions qui se déduisent par une rotation.")];
        if (e.sousType === "collier" && vaut(v, 2 * e.resultat)) return [t("Le bracelet peut être retourné : divise encore par 2.")];
        if (e.sousType === "table" && vaut(v, e.resultat / 2)) return [t("Une table ronde ne se retourne pas : ne divise pas par 2.")];
        return null;
    }
  },
};

function fact(n: number): number {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}
function arr(n: number, k: number): number {
  let r = 1;
  for (let i = 0; i < k; i++) r *= n - i;
  return r;
}

/** Libellés courts des écrans (papier, récapitulatif). */
export function libellePhaseDenombrementFondamental(e: E, p: P): string {
  return FORMAT_6GEN43.libellePhase(e, p);
}

// ============================================================================
// Papier (lot E) : situation en prose avec sa question + consigne globale. Audit (§ 3.1) : les
// nombres intermédiaires de l'écran (total, nombres « sans le chiffre ») ne sont plus donnés sur papier.
// ============================================================================

export const CONSIGNE_PAPIER_43 = "Réponds en justifiant ta démarche.";

function joindre(lignes: FragmentConsigne[][]): FragmentConsigne[] {
  const r: FragmentConsigne[] = [];
  lignes.forEach((l, i) => {
    if (i > 0) r.push(t(" "));
    r.push(...l);
  });
  return r;
}

export function situationPapier43(e: E): FragmentConsigne[] {
  switch (e.famille) {
    case "A": {
      const question =
        e.sousType === "contientUnChiffre"
          ? [t(`Combien de ces nombres contiennent le chiffre ${e.chiffre} ?`)]
          : e.sousType === "contientDeuxChiffres"
            ? [t(`Combien de ces nombres contiennent à la fois les chiffres ${e.chiffre} et ${e.chiffre2} ?`)]
            : contrainteA(e);
      return joindre([texteChiffres(e), [t(`On forme des nombres de ${e.n} chiffres, tous différents, dont le premier chiffre n'est pas 0.`)], question]);
    }
    case "B":
      return e.sousType === "direct" ? [t(`Un polygone convexe a ${e.n} côtés. Combien de diagonales possède-t-il ?`)] : [t(`Un polygone convexe possède ${milliersT(e.diagonales)} diagonales. Combien de côtés a-t-il ?`)];
    case "C":
      return joindre([f(e.contexte), [t(e.question)]]);
    case "D":
      return joindre(donneesD(e));
    case "E":
      return [t(`${e.contexte} Combien de dispositions différentes y a-t-il ?`)];
  }
}

export { LIBELLE_FORMULE_C as LIBELLE_FORMULE_C43, RAISON_C as RAISON_C43 };
