import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import type { ExerciceDenombrementA, ExerciceDenombrementB, ExerciceDenombrementC, ExerciceDenombrementD, ExerciceDenombrementE, ExerciceDenombrementFondamental, FormuleC } from "../../core6e/denombrementFondamental.types";
import { milliers } from "../../ui6e/fragmentsCombinatoire";
import { RAISON_C43 } from "../../ui6e/formatDenombrementFondamental";
import { COURS_FONDAMENTAL, calcul, finaliserCombinatoire, fx, ligne, lignesCombinaison, piege, produit, resultat, utiliseCours, verification } from "../../ui6e/corrigeCombinatoire";

/**
 * Corrigé détaillé « comme au tableau » de `6gen43` (6e ch. 7, § 1), une lettre par écran — MÊME source
 * pour l'écran révélé et pour le papier. Famille A : principe multiplicatif case par case (cases
 * contraintes d'abord), complément ou inclusion-exclusion (le total et les nombres « sans le chiffre »,
 * donnés à l'écran, sont recalculés ici : l'énoncé papier ne les donne plus) ; B : diagonales
 * n(n − 3)/2, directe ou par l'équation du second degré ; C : groupement reconnu par les trois questions,
 * puis calcul ; D : blocs ; E : permutations circulaires.
 */

type E = ExerciceDenombrementFondamental;

function decroissants(depart: number, combien: number): number[] {
  return Array.from({ length: combien }, (_, i) => depart - i);
}

function prod(l: number[]): number {
  return l.reduce((a, b) => a * b, 1);
}

/** Facteurs du nombre de nombres à n chiffres distincts formés avec `chiffres`, premier chiffre non nul. */
function facteursNombres(chiffres: number[], n: number): number[] {
  const m = chiffres.length;
  return [m - (chiffres.includes(0) ? 1 : 0), ...decroissants(m - 1, n - 1)];
}

function liste(chiffres: number[]): string {
  return `\\{${chiffres.join("\\,;")}\\}`;
}

const PRINCIPE = fx("Principe multiplicatif : on remplit les cases de la plus contrainte à la moins contrainte ; un chiffre placé ne peut plus servir");

/** « c_2 × … × c_n = 9 × 8 × 7 » (ou « c_2 = 9 » pour une seule case). */
function ligneCases(debut: number, facteurs: number[], justification: string): LigneCalcul {
  const g = facteurs.length === 1 ? `c_{${debut}}` : `c_{${debut}}\\times\\cdots\\times c_{${debut + facteurs.length - 1}}`;
  return ligne(facteurs.length === 1 ? `${g}=${facteurs[0]}` : `${g}=${produit(facteurs)}`, justification);
}

function lignesTotal(gauche: string, facteurs: number[], justification: string): LigneCalcul[] {
  return [ligne(`${gauche}=${produit(facteurs)}`, justification), ligne(`=${milliers(prod(facteurs))}`)];
}

function corrigeA(e: ExerciceDenombrementA): EtapeCorrection[] {
  const v = e.valeursEcrans;
  const z = e.chiffres.includes(0);
  const m = e.chiffres.length;
  const out: EtapeCorrection[] = [];
  const pieg0 = fx("Le 0 n'est interdit qu'en première position : il peut occuper toutes les autres cases.");
  switch (e.sousType) {
    case "total":
    case "borneSuperieure": {
      const admis = e.sousType === "borneSuperieure" ? e.chiffres.filter((c) => c !== 0 && c < e.borne!) : e.chiffres.filter((c) => c !== 0);
      const reste = v[1].slice(0, -1);
      out.push(
        utiliseCours("a", PRINCIPE, COURS_FONDAMENTAL),
        calcul("a", [ligne(`m=${m}`, "chiffres utilisables"), ligne(`c_1=${v[0][0]}`, e.sousType === "borneSuperieure" ? fx(`premier chiffre non nul et strictement inférieur à ${e.borne} : $${liste(admis)}$`) : z ? "tous les chiffres sauf 0" : "0 n'est pas utilisable : aucun chiffre interdit en tête")]),
        resultat("a", fx(`$${v[0][0]}$ choix pour le premier chiffre.`)),
        utiliseCours("b", PRINCIPE, COURS_FONDAMENTAL),
        calcul("b", [ligneCases(2, reste, "un chiffre de moins à chaque case"), ...lignesTotal("N", [v[0][0], ...reste], "principe multiplicatif")]),
        resultat("b", fx(`$N=${milliers(e.resultat)}$ nombres.`)),
        piege("b", z ? pieg0 : fx("Compter une case de trop ou de moins : il y a exactement une case par chiffre du nombre.")),
      );
      break;
    }
    case "positionFixee": {
      if (e.variante === "dernier") {
        const x = e.fixes![0].valeur;
        const milieu = v[1].slice(0, -1);
        out.push(
          utiliseCours("a", PRINCIPE, COURS_FONDAMENTAL),
          calcul("a", [ligne(`c_{${e.n}}=1`, `dernier chiffre imposé : ${x}`), ligne(`c_1=${v[0][1]}`, `ni ${x}${z && x !== 0 ? " ni 0" : ""}, parmi les ${m} chiffres`)]),
          resultat("a", fx(`$1$ choix pour le dernier chiffre, $${v[0][1]}$ pour le premier.`)),
          utiliseCours("b", PRINCIPE, COURS_FONDAMENTAL),
          calcul("b", [ligneCases(2, milieu, "deux chiffres déjà placés"), ...lignesTotal("N", [v[0][1], ...milieu], "principe multiplicatif (dernier chiffre : 1 choix)")]),
          resultat("b", fx(`$N=${milliers(e.resultat)}$ nombres.`)),
          piege("b", fx(`Commencer par le premier chiffre : le nombre de choix pour le dernier dépendrait alors de ce qui a été placé.`)),
        );
      } else {
        const k = e.fixes!.length;
        const libres = v[0].slice(0, -1);
        out.push(
          utiliseCours("a", PRINCIPE, COURS_FONDAMENTAL),
          calcul("a", [ligne(k === 1 ? "c_1=1" : "c_1=c_2=1", `${k === 1 ? "premier chiffre imposé" : "deux premiers chiffres imposés"}`), ligneCases(k + 1, libres, `il reste ${m - k} chiffres pour la case ${k + 1}, puis un de moins`), ...lignesTotal("N", libres, "principe multiplicatif")]),
          resultat("a", fx(`$N=${milliers(e.resultat)}$ nombres.`)),
          piege("a", fx("Laisser un choix aux cases imposées : elles n'ont qu'un seul choix, et leurs chiffres ne servent plus ailleurs.")),
        );
      }
      break;
    }
    case "contientUnChiffre": {
      const d = e.chiffre!;
      const sans = v[1][v[1].length - 1];
      const reste = v[1].slice(0, -1);
      const T = facteursNombres(e.chiffres, e.n);
      out.push(
        utiliseCours("a", fx(`Complément : on compte les nombres qui ne contiennent pas le chiffre ${d}, puis on les retire de tous les nombres`), COURS_FONDAMENTAL),
        calcul("a", [ligne(`c_1=${v[0][0]}`, `les ${m - 1} chiffres sauf ${d}${z && d !== 0 ? ", et sauf 0 en tête" : ""}`)]),
        resultat("a", fx(`$${v[0][0]}$ choix pour le premier chiffre d'un nombre sans ${d}.`)),
        utiliseCours("b", PRINCIPE, COURS_FONDAMENTAL),
        calcul("b", lignesTotal(`N_{\\text{sans } ${d}}`, [v[0][0], ...reste], "principe multiplicatif")),
        resultat("b", fx(`$${milliers(sans)}$ nombres ne contiennent pas ${d}.`)),
        utiliseCours("c", fx("Tous les nombres (même principe, sans contrainte), moins ceux qui ne contiennent pas le chiffre"), COURS_FONDAMENTAL),
        calcul("c", [...lignesTotal("T", T, "tous les nombres"), ligne(`N=T-N_{\\text{sans } ${d}}`, "complément"), ligne(`=${milliers(e.totalSansContrainte)}-${milliers(sans)}`), ligne(`=${milliers(e.resultat)}`)]),
        resultat("c", fx(`$N=${milliers(e.resultat)}$ nombres contiennent le chiffre ${d}.`)),
        piege("c", fx(`Compter « le chiffre ${d} à une place donnée » : ${d} peut être à n'importe quelle place, d'où le passage par le complément.`)),
      );
      break;
    }
    case "contientDeuxChiffres": {
      const [d1, d2] = [e.chiffre!, e.chiffre2!];
      const n0 = v[1][v[1].length - 1];
      const reste = v[1].slice(0, -1);
      const T = facteursNombres(e.chiffres, e.n);
      const s1 = facteursNombres(e.chiffres.filter((c) => c !== d1), e.n);
      const s2 = facteursNombres(e.chiffres.filter((c) => c !== d2), e.n);
      out.push(
        utiliseCours("a", fx(`Inclusion-exclusion : on part de tous les nombres, on retire ceux sans ${d1} et ceux sans ${d2}, puis on rajoute ceux qui n'ont ni l'un ni l'autre (retirés deux fois)`), COURS_FONDAMENTAL),
        calcul("a", [ligne(`c_1=${v[0][0]}`, `les ${m - 2} chiffres autres que ${d1} et ${d2}${z && d1 !== 0 && d2 !== 0 ? ", sauf 0 en tête" : ""}`)]),
        resultat("a", fx(`$${v[0][0]}$ choix pour le premier chiffre d'un nombre sans ${d1} ni ${d2}.`)),
        utiliseCours("b", PRINCIPE, COURS_FONDAMENTAL),
        calcul("b", lignesTotal("N_0", [v[0][0], ...reste], `nombres sans ${d1} ni ${d2}`)),
        resultat("b", fx(`$N_0=${milliers(n0)}$`)),
        utiliseCours("c", fx("Même principe pour tous les nombres, ceux sans le premier chiffre et ceux sans le second, puis inclusion-exclusion"), COURS_FONDAMENTAL),
        calcul("c", [
          ...lignesTotal("T", T, "tous les nombres"),
          ...lignesTotal(`N_{\\text{sans } ${d1}}`, s1, `sans ${d1}`),
          ...lignesTotal(`N_{\\text{sans } ${d2}}`, s2, `sans ${d2}`),
          ligne(`N=${milliers(e.totalSansContrainte)}-${milliers(e.sansChiffre1!)}-${milliers(e.sansChiffre2!)}+${milliers(n0)}`, "inclusion-exclusion"),
          ligne(`=${milliers(e.resultat)}`),
        ]),
        resultat("c", fx(`$N=${milliers(e.resultat)}$ nombres contiennent ${d1} et ${d2}.`)),
        piege("c", fx(`Oublier de rajouter $N_0$ : les nombres sans ${d1} ni ${d2} ont été retirés deux fois.`)),
      );
      break;
    }
    case "parite": {
      const M = v[1];
      const k = e.ensembleDernier!.length - 1;
      const m0 = prod(M);
      const n0 = (m - 1) * m0;
      const n1 = k * (m - 2) * m0;
      out.push(
        utiliseCours("a", fx("Principe additif : le choix du premier chiffre dépend du dernier (0 ou non) ; on sépare les deux cas, qui ne se recouvrent pas"), COURS_FONDAMENTAL),
        calcul("a", [ligne(`c_1=${m - 1}`, "si le dernier chiffre est 0 : tous les autres chiffres"), ligne(`c_1'=${m - 2}`, "sinon : ni 0 ni le dernier chiffre")]),
        resultat("a", fx(`$${m - 1}$ ou $${m - 2}$ choix pour le premier chiffre.`)),
        utiliseCours("b", PRINCIPE, COURS_FONDAMENTAL),
        calcul("b", M.length === 1 ? [ligne(`c_2=${M[0]}`, "deux chiffres déjà placés")] : [ligneCases(2, M, "deux chiffres déjà placés"), ligne(`=${milliers(m0)}`)]),
        resultat("b", fx(`$${milliers(m0)}$ façons de remplir les cases du milieu, dans les deux cas.`)),
        utiliseCours("c", fx("On additionne les deux cas"), COURS_FONDAMENTAL),
        calcul("c", [
          ligne(`N_0=1\\times ${m - 1}\\times ${milliers(m0)}`, "dernier chiffre 0"),
          ligne(`=${milliers(n0)}`),
          ligne(`N_1=${k}\\times ${m - 2}\\times ${milliers(m0)}`, `dernier chiffre parmi les ${k} autres admis`),
          ligne(`=${milliers(n1)}`),
          ligne(`N=N_0+N_1`),
          ligne(`=${milliers(e.resultat)}`),
        ]),
        resultat("c", fx(`$N=${milliers(e.resultat)}$ nombres.`)),
        piege("c", fx("Traiter tous les derniers chiffres de la même façon : quand le dernier est 0, il ne retire pas de choix au premier.")),
      );
      break;
    }
  }
  return out;
}

function corrigeB(e: ExerciceDenombrementB): EtapeCorrection[] {
  const formule = fx("Chaque sommet est relié par une diagonale aux $n-3$ sommets qui ne sont ni lui ni ses deux voisins, et chaque diagonale a deux extrémités : $D(n)=\\dfrac{n(n-3)}{2}$");
  if (e.sousType === "direct")
    return [
      utiliseCours("a", formule, COURS_FONDAMENTAL),
      calcul("a", [ligne(`D(${e.n})=\\dfrac{${e.n}\\times(${e.n}-3)}{2}`, "on remplace n"), ligne(`=\\dfrac{${e.n}\\times ${e.n - 3}}{2}`), ligne(`=${milliers(e.diagonales)}`)]),
      resultat("a", fx(`Le polygone a $${milliers(e.diagonales)}$ diagonales.`)),
      piege("a", fx("Oublier de diviser par 2 : chaque diagonale serait comptée une fois depuis chacune de ses extrémités.")),
    ];
  const c = e.constanteEquation;
  const r = 2 * e.n - 3;
  return [
    utiliseCours("a", formule, COURS_FONDAMENTAL),
    calcul("a", [ligne(`\\dfrac{n(n-3)}{2}=${milliers(e.diagonales)}`, "on pose l'équation"), ligne(`n(n-3)=${milliers(c)}`, "on multiplie par 2"), ligne(`n^2-3n-${milliers(c)}=0`, "on développe")]),
    resultat("a", fx(`$n^2-3n-${milliers(c)}=0$`)),
    utiliseCours("b", fx("Équation du second degré : $\\Delta=b^2-4ac$, $n=\\dfrac{-b\\pm\\sqrt{\\Delta}}{2a}$ ; un nombre de côtés est un naturel au moins égal à 3"), COURS_FONDAMENTAL),
    calcul("b", [ligne(`\\Delta=9+4\\times ${milliers(c)}`), ligne(`=${milliers(9 + 4 * c)}`), ligne(`=${r}^2`), ligne(`n=\\dfrac{3+${r}}{2}`, fx(`l'autre solution, $\\dfrac{3-${r}}{2}=${3 - e.n}$, est négative`)), ligne(`=${e.n}`)]),
    resultat("b", fx(`Le polygone a $${e.n}$ côtés.`)),
    verification("b", fx(`$D(${e.n})=\\dfrac{${e.n}\\times ${e.n - 3}}{2}=${milliers(e.diagonales)}$.`)),
    piege("b", fx("Garder la solution négative : un nombre de côtés est positif.")),
  ];
}

const SENS_N: Record<FormuleC, string> = {
  permutation: "lettres à ranger",
  arrangement: "candidats",
  arrangementRepetition: "symboles possibles à chaque place",
  combinaison: "cartes parmi lesquelles on choisit",
};

const PIEGE_C: Record<FormuleC, string> = {
  permutation: "Diviser par un ordre : ici, deux mots qui ont les mêmes lettres dans un autre ordre sont différents.",
  arrangement: "Prendre une combinaison : les places (ou les postes) sont différentes, l'ordre compte.",
  arrangementRepetition: "Prendre un arrangement simple : un même symbole peut revenir, chaque place garde le même nombre de choix.",
  combinaison: "Prendre un arrangement : l'ordre des cartes dans une main ne compte pas.",
};

function corrigeC(e: ExerciceDenombrementC): EtapeCorrection[] {
  let formule: string;
  let lignesB: LigneCalcul[];
  switch (e.formule) {
    case "permutation":
      formule = `P_{${e.n}}=${e.n}!`;
      lignesB = [ligne(`N=${e.n}!`), ligne(`=${decroissants(e.n, e.n).join("\\times ")}`), ligne(`=${milliers(e.resultat)}`)];
      break;
    case "arrangement":
      formule = `A_{${e.n}}^{${e.p}}`;
      lignesB = [ligne(`N=A_{${e.n}}^{${e.p}}`), ligne(`=${decroissants(e.n, e.p).join("\\times ")}`, `${e.p} facteurs décroissants`), ligne(`=${milliers(e.resultat)}`)];
      break;
    case "arrangementRepetition":
      formule = `B_{${e.n}}^{${e.p}}=${e.n}^{${e.p}}`;
      lignesB = [ligne(`N=${e.n}^{${e.p}}`, `${e.p} places, ${e.n} choix chacune`), ligne(`=${milliers(e.resultat)}`)];
      break;
    case "combinaison":
      formule = `C_{${e.n}}^{${e.p}}`;
      lignesB = lignesCombinaison(e.n, e.p).map((l, i) => (i === 0 ? { ...l, latex: `N=${l.latex}` } : l));
      break;
  }
  const lignesA: LigneCalcul[] = [ligne(`n=${e.n}`, SENS_N[e.formule])];
  if (e.formule !== "permutation") lignesA.push(ligne(`p=${e.p}`, "éléments choisis"));
  return [
    utiliseCours("a", fx("Les trois questions : l'ordre compte-t-il ? la répétition est-elle permise ? tous les éléments sont-ils utilisés ?"), COURS_FONDAMENTAL),
    calcul("a", lignesA),
    resultat("a", fx(`${RAISON_C43[e.formule]} Formule : $${formule}$.`)),
    utiliseCours("b", fx("Formules du cours : $P_n=n!$, $A_n^p=\\dfrac{n!}{(n-p)!}$, $B_n^p=n^p$, $C_n^p=\\dfrac{n!}{p!\\,(n-p)!}$"), COURS_FONDAMENTAL),
    calcul("b", lignesB),
    resultat("b", fx(`$N=${milliers(e.resultat)}$`)),
    piege("b", fx(PIEGE_C[e.formule])),
  ];
}

function corrigeD(e: ExerciceDenombrementD): EtapeCorrection[] {
  const grouper = e.sousType === "grouper";
  const k = e.lettresConsecutives?.length ?? 0;
  const lignesA = grouper ? [ligne(`u=${e.nombreUnites}`, "un bloc par matière")] : [ligne(`u=${e.mot!.length}-${k}+1`, `le bloc ${e.lettresConsecutives} compte pour une unité`), ligne(`=${e.nombreUnites}`)];
  const internes = grouper ? e.groupes!.map((g) => g.taille) : [k];
  const lignesC: LigneCalcul[] = grouper
    ? [ligne(`N=${e.nombreUnites}!\\times ${internes.map((x) => `${x}!`).join("\\times ")}`, "unités, puis l'ordre dans chaque bloc"), ligne(`=${produit([e.arrangementsBlocs, ...e.internesParGroupe])}`), ligne(`=${milliers(e.resultatFinal)}`)]
    : e.sousType === "consecutivesOrdreLibre"
      ? [ligne(`N=${e.nombreUnites}!\\times ${k}!`, "unités, puis l'ordre dans le bloc"), ligne(`=${milliers(e.arrangementsBlocs)}\\times ${e.internesParGroupe[0]}`), ligne(`=${milliers(e.resultatFinal)}`)]
      : [ligne(`N=${e.nombreUnites}!\\times 1`, "ordre imposé dans le bloc"), ligne(`=${milliers(e.resultatFinal)}`)];
  return [
    utiliseCours("a", fx("Des éléments qui restent ensemble forment un bloc, rangé comme une seule unité"), COURS_FONDAMENTAL),
    calcul("a", lignesA),
    resultat("a", fx(`$${e.nombreUnites}$ unités à ranger.`)),
    utiliseCours("b", fx("Ranger $u$ unités distinctes : $P_u=u!$"), COURS_FONDAMENTAL),
    calcul("b", [ligne(`P_{${e.nombreUnites}}=${e.nombreUnites}!`), ligne(`=${milliers(e.arrangementsBlocs)}`)]),
    resultat("b", fx(`$${milliers(e.arrangementsBlocs)}$ rangements des unités.`)),
    utiliseCours("c", fx("Principe multiplicatif : on multiplie par l'ordre à l'intérieur de chaque bloc ($k!$ s'il est libre, 1 s'il est imposé)"), COURS_FONDAMENTAL),
    calcul("c", lignesC),
    resultat("c", fx(`$N=${milliers(e.resultatFinal)}$`)),
    piege("c", fx(e.sousType === "consecutivesOrdreFixe" ? "Multiplier par l'ordre des lettres du bloc : il est imposé, un seul ordre." : "Oublier l'ordre à l'intérieur des blocs.")),
  ];
}

function corrigeE(e: ExerciceDenombrementE): EtapeCorrection[] {
  const table = e.sousType === "table";
  return [
    utiliseCours("a", fx("Disposition en cercle : les $n$ rotations d'une disposition donnent la même ; si l'on peut aussi retourner l'objet, on divise encore par 2"), COURS_FONDAMENTAL),
    calcul("a", table ? [ligne(`N=\\dfrac{${e.n}!}{${e.n}}`, `les ${e.n} rotations sont identiques`), ligne(`=(${e.n}-1)!`)] : [ligne(`N=\\dfrac{${e.n}!}{${e.n}\\times 2}`, "rotations et retournement identiques"), ligne(`=\\dfrac{(${e.n}-1)!}{2}`)]),
    resultat("a", fx(table ? `Seules les rotations : $(${e.n}-1)!$.` : `Rotations et retournement : $\\dfrac{(${e.n}-1)!}{2}$.`)),
    utiliseCours("b", fx("Factorielle : produit des entiers de 1 à $n-1$"), COURS_FONDAMENTAL),
    calcul("b", table ? [ligne(`N=${e.n - 1}!`), ligne(`=${milliers(e.resultat)}`)] : [ligne(`N=\\dfrac{${e.n - 1}!}{2}`), ligne(`=\\dfrac{${milliers(2 * e.resultat)}}{2}`), ligne(`=${milliers(e.resultat)}`)]),
    resultat("b", fx(`$N=${milliers(e.resultat)}$ dispositions.`)),
    piege("b", fx(table ? "Diviser par 2 : une table ronde ne se retourne pas, le miroir échangerait les voisins de gauche et de droite." : `Calculer $(${e.n}-1)!$ seulement : le bracelet se retourne, deux dispositions symétriques sont identiques.`)),
  ];
}

export function correctionDetailleeDenombrementFondamental(e: E): EtapeCorrection[] {
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
