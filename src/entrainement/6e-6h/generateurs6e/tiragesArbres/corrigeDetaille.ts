import type { ExerciceFamilleA, ExerciceFamilleB, ExerciceFamilleC, ExerciceFamilleD, ExerciceTiragesArbres } from "../../core6e/tiragesArbres.types";
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { phasesPourExercice } from "../../moteur6e/typesTiragesArbres";
import type { PhaseTiragesArbres } from "../../moteur6e/typesTiragesArbres";
import {
  branchesArbreD,
  branchesChemin,
  cheminsEcran3A,
  choixBienPlaces,
  compterArrangements,
  couleurD,
  equationsC,
  facesDe,
  facesEcran3,
  factorielle,
  formatReponseAttenduePhaseLatex,
  fractionsA,
  fx,
  nombrePaires,
  objetB,
  probCheminFraction,
  probFaceFraction,
  questionEcran3A,
  questionEcran3C,
  reduire,
  singulier,
  toutesMalPlacees,
} from "../../ui6e/formatTiragesArbres";
import { arbreTiragesSvg } from "../../ui6e/figuresTiragesArbres";
import type { EtiquetteBranche } from "../../ui6e/figuresTiragesArbres";
import {
  COURS_ARBRES,
  brute,
  calcul,
  finaliser,
  frac,
  latex,
  ligne,
  lignesComplement,
  lignesFraction,
  lignesProduit,
  lignesSommeFractions,
  listeEt,
  piege,
  resultat,
  suffixeDecimal,
  texte,
  utiliseCours,
  verification,
} from "../../ui6e/corrigeProbabilites";

/**
 * Corrigé détaillé « comme au tableau » de `6gen31` (Tirages et arbres) — partagé par l'adaptateur
 * papier et le générateur interactif (étape révélée). Une lettre par écran (`phasesPourExercice`) ;
 * probabilités d'un chemin par la règle du produit, chemins incompatibles additionnés, événement
 * contraire ; arbres complets en `figureHtml` (familles A et D). Jamais de C(n, k) : on compte des
 * chemins ou des arrangements.
 */

type Fragments = FragmentConsigne[];
const LETTRES = "abcdefghij";
const NBSP = " ";

export function lettreEcranTiragesArbres(e: ExerciceTiragesArbres, phase: PhaseTiragesArbres): string {
  return LETTRES[phasesPourExercice(e).indexOf(phase)];
}

/** Valeur décimale d'une réponse « P(…)=\dfrac{a}{b} » (rien pour p, q ou un entier). */
function avecDecimal(l: string): string {
  if (/^[pq]=/.test(l)) return l;
  const droite = l.slice(l.lastIndexOf("=") + 1);
  const fr = /^\\dfrac\{(\d+)\}\{(\d+)\}$/.exec(droite);
  return fr ? `${l}${suffixeDecimal(Number(fr[1]) / Number(fr[2]))}` : l;
}

function reponse(e: ExerciceTiragesArbres, phase: PhaseTiragesArbres, decimales = true): Fragments {
  return listeEt(formatReponseAttenduePhaseLatex(e, phase).map((l) => (decimales ? avecDecimal(l) : l)));
}

/** Membre de gauche d'une réponse de l'écran (« P(\text{…}) »). */
function gaucheReponse(e: ExerciceTiragesArbres, phase: PhaseTiragesArbres, i = 0): string {
  const l = formatReponseAttenduePhaseLatex(e, phase)[i];
  return l.slice(0, l.lastIndexOf("="));
}

/** Facteurs d'un chemin d'urne (fractions brutes : la composition de l'urne reste lisible). */
function facteurs(n1: number, n2: number, avecRemise: boolean, chemin: number[]): [number, number][] {
  return branchesChemin(n1, n2, avecRemise, chemin).map((f) => [f.num, f.den]);
}

export function arbreCompletUrne(n1: number, n2: number, avecRemise: boolean, profondeur: 2 | 3, initiales: [string, string]): string {
  return arbreTiragesSvg({
    profondeur,
    initiales,
    etiquette: (chemin): EtiquetteBranche => {
      let r1 = n1;
      let r2 = n2;
      for (const c of chemin.slice(0, -1)) {
        if (!avecRemise) {
          if (c === 0) r1--;
          else r2--;
        }
      }
      const c = chemin[chemin.length - 1];
      return { fraction: [c === 0 ? r1 : r2, r1 + r2] };
    },
    feuille: (chemin) => {
      const p = probCheminFraction(n1, n2, avecRemise, chemin);
      return [p.num, p.den];
    },
    libelle: `Arbre des ${profondeur} tirages ${avecRemise ? "avec" : "sans"} remise`,
  });
}

// ============================================================================
// Famille A — k tirages
// ============================================================================

function etapesA(e: ExerciceFamilleA): EtapeCorrection[] {
  const { p1, p2, p3 } = fractionsA(e);
  const i1 = e.labelCouleur1.charAt(0).toUpperCase();
  const i2 = e.labelCouleur2.charAt(0).toUpperCase();
  const tous = (c: number) => new Array<number>(e.k).fill(c);
  const [La, Lb, Lc] = (["aEcran1", "aEcran2", "aEcran3"] as const).map((p) => lettreEcranTiragesArbres(e, p));
  const urne = e.avecRemise ? "avec remise, l'urne est la même à chaque tirage" : "sans remise, il reste une boule de moins à chaque tirage, et une de moins de la couleur tirée";
  const etapes: EtapeCorrection[] = [
    { ...utiliseCours(La, [texte(`Arbre des ${e.k} tirages (${urne}). « Toutes ${e.labelCouleur1} » est un seul chemin : sa probabilité est le produit des probabilités de ses branches (règle du produit)`)], COURS_ARBRES), figureHtml: arbreCompletUrne(e.n1, e.n2, e.avecRemise, e.k === 3 ? 3 : 2, [i1, i2]) },
    calcul(La, [...lignesProduit(gaucheReponse(e, "aEcran1", 0), facteurs(e.n1, e.n2, e.avecRemise, tous(0))), ...lignesProduit(gaucheReponse(e, "aEcran1", 1), facteurs(e.n1, e.n2, e.avecRemise, tous(1)))]),
    resultat(La, reponse(e, "aEcran1")),
    piege(La, [texte(e.avecRemise ? "Additionner les probabilités des branches au lieu de les multiplier le long du chemin." : "Garder la même urne d'un tirage à l'autre : sans remise, le numérateur et le dénominateur diminuent de 1 à chaque tirage.")]),
    utiliseCours(Lb, [texte(`« Même couleur » = « toutes ${e.labelCouleur1} » ou « toutes ${e.labelCouleur2} » : deux événements incompatibles, dont on additionne les probabilités`)], COURS_ARBRES),
    calcul(Lb, lignesSommeFractions(gaucheReponse(e, "aEcran2"), [[p1.num, p1.den], [p2.num, p2.den]])),
    resultat(Lb, reponse(e, "aEcran2")),
    piege(Lb, [texte("Multiplier les deux probabilités : on multiplie le long d'un chemin, on additionne des chemins différents.")]),
  ];
  if (e.questionEcran3 === "auMoinsUne") {
    etapes.push(
      utiliseCours(Lc, [texte(`Le contraire de « au moins une boule ${singulier(e.labelCouleur1)} » est « aucune boule ${singulier(e.labelCouleur1)} », c'est-à-dire « toutes ${e.labelCouleur2} » : `), latex("P(E)=1-P(\\overline{E})")], COURS_ARBRES),
      calcul(Lc, lignesComplement(gaucheReponse(e, "aEcran3"), `P(${e.k}\\ \\text{${e.labelCouleur2}})`, p2.num, p2.den)),
    );
  } else {
    const chemins = cheminsEcran3A(e);
    const noms = chemins.map((c) => c.map((x) => (x === 0 ? i1 : i2)).join("")).join(", ");
    const f = facteurs(e.n1, e.n2, e.avecRemise, chemins[0]);
    const num = f.reduce((x, y) => x * y[0], 1);
    const den = f.reduce((x, y) => x * y[1], 1);
    etapes.push(
      utiliseCours(Lc, [texte(`Les chemins avec ${questionEcran3A(e)} sont ${noms} : ${chemins.length} chemins incompatibles, qui ont tous la même probabilité (mêmes facteurs, dans un autre ordre) ; on additionne, c'est-à-dire qu'on multiplie par ${chemins.length}`)], COURS_ARBRES),
      calcul(Lc, [
        ligne(`${gaucheReponse(e, "aEcran3")}=${chemins.length}\\times ${f.map(([a, b]) => brute(a, b)).join("\\times ")}`, `${chemins.length} chemins de même probabilité`),
        ligne(`=${chemins.length}\\times ${brute(num, den)}`, "règle du produit"),
        ...lignesFraction("", chemins.length * num, den),
      ]),
    );
  }
  etapes.push(
    resultat(Lc, reponse(e, "aEcran3")),
    verification(Lc, [texte("La somme des probabilités de tous les chemins de l'arbre vaut 1 (feuilles de l'arbre).")]),
    piege(Lc, [texte(e.questionEcran3 === "auMoinsUne" ? "Calculer 1 − P(toutes de la couleur cherchée) : le contraire de « au moins une » est « aucune »." : "Ne compter qu'un seul chemin : l'ordre des couleurs varie d'un chemin à l'autre.")]),
  );
  void p3;
  return etapes;
}

// ============================================================================
// Famille B — arrangements
// ============================================================================

function etapesB(e: ExerciceFamilleB): EtapeCorrection[] {
  const { nom, noms } = objetB(e);
  const n = e.n;
  const N = factorielle(n);
  const [La, Lb, Lc, Ld] = (["bEcran1", "bEcran2", "bEcran3", "bEcran4"] as const).map((p) => lettreEcranTiragesArbres(e, p));
  const etapes: EtapeCorrection[] = [];
  const factorielleLignes = [ligne(`${n}!=${Array.from({ length: n }, (_, i) => n - i).join("\\times ")}`, "nombre d'arrangements"), ligne(`=${N}`)];
  if (e.demandeEcran1 === "une") {
    etapes.push(
      utiliseCours(La, [texte(`La ${nom} n°${NBSP}${e.positionsEcran1[0]} peut arriver à chacune des ${n} places avec la même probabilité ; une seule est la bonne (équiprobabilité)`)], COURS_ARBRES),
      calcul(La, lignesFraction(gaucheReponse(e, "bEcran1"), 1, n, "une bonne place sur " + n)),
    );
  } else {
    etapes.push(
      utiliseCours(La, [texte(`Arbre à deux niveaux : la ${nom} n°${NBSP}${e.positionsEcran1[0]} a une bonne place sur ${n}, puis la ${nom} n°${NBSP}${e.positionsEcran1[1]} une bonne place sur les ${n - 1} restantes ; règle du produit`)], COURS_ARBRES),
      calcul(La, lignesProduit(gaucheReponse(e, "bEcran1"), [[1, n], [1, n - 1]])),
    );
  }
  etapes.push(
    resultat(La, reponse(e, "bEcran1")),
    piege(La, [texte(e.demandeEcran1 === "une" ? `Répondre 1 sur ${n}! : on ne s'intéresse qu'à une seule ${nom}.` : `Multiplier 1/${n} par 1/${n} : une place est déjà prise, il en reste ${n - 1}.`.replace(/1\/(\d)/g, "1 sur $1"))]),
    utiliseCours(Lb, [texte(`Sur l'arbre des placements, les ${n}! chemins (arrangements) sont équiprobables et un seul place tout correctement`)], COURS_ARBRES),
    calcul(Lb, [...factorielleLignes, ...lignesFraction(gaucheReponse(e, "bEcran2"), 1, N, "un seul arrangement favorable")]),
    resultat(Lb, reponse(e, "bEcran2")),
    piege(Lb, [texte(`Diviser par ${n} ou par ${n * n} : le nombre d'arrangements est ${n}! = ${N}.`)]),
  );
  const choix = choixBienPlaces(e);
  const r = n - e.k;
  const mal = toutesMalPlacees(r);
  const favorables = compterArrangements(n, (b) => b === e.k);
  const facons = r === 2 ? "1 façon (on les échange)" : "2 façons (chacune décalée d'un cran, dans un sens ou dans l'autre)";
  etapes.push(
    utiliseCours(Lc, [texte(`On compte les arrangements favorables : ${choix.justification}, puis les ${r} autres ${noms} toutes mal placées, soit ${facons} ; on divise par les ${n}! arrangements équiprobables`)], COURS_ARBRES),
    calcul(Lc, [
      ligne(`${choix.nombre}\\times ${mal}=${favorables}`, "arrangements favorables"),
      ...factorielleLignes,
      ...lignesFraction(gaucheReponse(e, "bEcran3"), favorables, N, "favorables sur possibles"),
    ]),
    resultat(Lc, reponse(e, "bEcran3")),
    piege(Lc, [texte(`Oublier que les ${r} autres ${noms} doivent toutes être mal placées : on compterait aussi des arrangements avec plus de ${e.k} ${e.k > 1 ? noms : nom} bien placée${e.k > 1 ? "s" : ""}.`)]),
  );
  if (e.demandeEcran4 === "auMoinsTrois") {
    const trois = nombrePaires(n);
    const S = compterArrangements(n, (b) => b >= 3);
    etapes.push(
      utiliseCours(Ld, [texte("« Au moins trois » = exactement trois, exactement quatre (impossible : la cinquième serait à sa place) ou toutes : des cas incompatibles, dont on additionne les nombres d'arrangements")], COURS_ARBRES),
      calcul(Ld, [
        ligne(`${trois}\\times 1+0+1=${S}`, `exactement trois : ${trois} paires mal placées, échangées ; toutes : 1`),
        ...lignesFraction(gaucheReponse(e, "bEcran4"), S, N, "favorables sur possibles"),
      ]),
    );
  } else {
    // Mêmes termes que l'aide de l'écran : exactement une (n choix × les autres toutes mal placées),
    // exactement deux (n = 4 : 6 paires, les deux autres échangées), toutes (1).
    const termes = [`${n}\\times ${toutesMalPlacees(n - 1)}`, ...(n === 4 ? [`${nombrePaires(4)}\\times 1`] : []), "1"];
    const S = compterArrangements(n, (b) => b >= 1);
    etapes.push(
      utiliseCours(Ld, [texte(`Événement contraire : « au moins une ${nom} bien placée » = exactement une, exactement deux… ou toutes (exactement ${n - 1} est impossible), et `), latex("P(\\overline{E})=1-P(E)")], COURS_ARBRES),
      calcul(Ld, [
        ligne(`${termes.join("+")}=${S}`, n === 4 ? "exactement une, exactement deux, toutes" : "exactement une, toutes"),
        ligne(`${gaucheReponse(e, "bEcran4")}=1-${brute(S, N)}`, "événement contraire"),
        ...lignesFraction("", N - S, N, [texte("car "), latex(`1=${brute(N, N)}`)]),
      ]),
    );
  }
  etapes.push(
    resultat(Ld, reponse(e, "bEcran4")),
    piege(Ld, [texte(e.demandeEcran4 === "auMoinsTrois" ? "Compter « exactement quatre » : si quatre sont bien placées, la cinquième l'est aussi." : "Calculer 1 − P(toutes bien placées) : le contraire de « aucune » est « au moins une ».")]),
  );
  return etapes;
}

// ============================================================================
// Famille C — dé truqué
// ============================================================================

function etapesC(e: ExerciceFamilleC): EtapeCorrection[] {
  const n = facesDe(e);
  const eqs = equationsC(e);
  const [La, Lb, Lc] = (["cEcran1", "cEcran2", "cEcran3"] as const).map((p) => lettreEcranTiragesArbres(e, p));
  const etapes: EtapeCorrection[] = [];
  const somme = `P(1)+P(2)+\\cdots+P(${n})=1`;
  if (e.sousType === "special") {
    const reste = reduire({ num: e.p0.den - e.p0.num, den: e.p0.den });
    etapes.push(
      utiliseCours(La, [texte(`La somme des probabilités des ${n} faces vaut 1 : la face ${e.faceSpeciale} (probabilité connue) et ${n - 1} faces de probabilité `), latex("p")], COURS_ARBRES),
      calcul(La, [ligne(somme, "somme des probabilités des faces"), ligne(eqs[0], `face ${e.faceSpeciale}, puis ${n - 1} fois p`)]),
      resultat(La, [latex(eqs[0])]),
      piege(La, [texte(`Écrire ${n}p au lieu de ${n - 1}p : la face ${e.faceSpeciale} n'a pas la probabilité p.`)]),
      utiliseCours(Lb, [texte("Équation du premier degré : on soustrait la probabilité connue, puis on divise par le nombre de faces de probabilité "), latex("p")], COURS_ARBRES),
      calcul(Lb, [
        ligne(eqs[0], "équation de l'étape 1"),
        ligne(`${n - 1}p=1-${fx(e.p0)}`, `on soustrait ${"la probabilité connue"}`),
        ligne(`${n - 1}p=${fx(reste)}`),
        ligne(`p=${fx(reste)}\\div ${n - 1}`, `on divise par ${n - 1}`),
        ligne(`p=${fx(e.p)}`),
      ]),
      resultat(Lb, reponse(e, "cEcran2")),
      verification(Lb, [texte("Somme des probabilités : "), latex(`${fx(e.p0)}+${n - 1}\\times ${fx(e.p)}=1`), texte(".")]),
      piege(Lb, [texte(`Oublier de diviser par ${n - 1} après avoir soustrait la probabilité connue.`)]),
    );
  } else {
    const h = n / 2;
    const fortPair = (e.plusProbable ?? "pair") === "pair";
    const fort = fortPair ? "paire" : "impaire";
    const faible = fortPair ? "impaire" : "paire";
    const inconnue = fortPair ? "q" : "p";
    const autre = fortPair ? "p" : "q";
    const valInc = fortPair ? e.q : e.p;
    const valAutre = fortPair ? e.p : e.q;
    etapes.push(
      utiliseCours(La, [texte(`La relation de l'énoncé (une face ${fort} est ${e.r} fois plus probable qu'une face ${faible}) et la somme des probabilités des ${n} faces, égale à 1 : ${h} faces paires (probabilité `), latex("p"), texte(`) et ${h} faces impaires (probabilité `), latex("q"), texte(")")], COURS_ARBRES),
      calcul(La, [ligne(eqs[0], "relation de l'énoncé"), ligne(somme, "somme des probabilités des faces"), ligne(eqs[1], `${h} faces paires, ${h} faces impaires`)]),
      resultat(La, listeEt(eqs)),
      piege(La, [texte(`Inverser la relation (écrire ${fortPair ? `q = ${e.r}p` : `p = ${e.r}q`}) : c'est la face ${fort} qui est la plus probable.`)]),
      utiliseCours(Lb, [texte("Substitution : on remplace, dans l'équation de la somme, l'inconnue donnée par la relation ; il reste une équation du premier degré")], COURS_ARBRES),
      calcul(Lb, [
        ligne(eqs[1], "équation de la somme"),
        ligne(fortPair ? `${h}\\times ${e.r}q+${h}q=1` : `${h}p+${h}\\times ${e.r}p=1`, [texte("on remplace "), latex(autre), texte(` par ${e.r}`), latex(inconnue)]),
        ligne(`${h * e.r + h}${inconnue}=1`, "on regroupe"),
        ligne(`${inconnue}=${fx(valInc)}`, `on divise par ${h * e.r + h}`),
        ligne(`${autre}=${e.r}\\times ${fx(valInc)}`, "relation de l'énoncé"),
        ligne(`${autre}=${fx(valAutre)}`),
      ]),
      resultat(Lb, reponse(e, "cEcran2")),
      verification(Lb, [texte("Somme des probabilités : "), latex(`${h}\\times ${fx(e.p)}+${h}\\times ${fx(e.q)}=1`), texte(".")]),
      piege(Lb, [texte("S'arrêter à une seule inconnue : l'autre se déduit de la relation.")]),
    );
  }
  const termes = facesEcran3(e).map((face) => probFaceFraction(e, face));
  etapes.push(
    utiliseCours(Lc, [texte("Des faces différentes donnent des événements incompatibles : on additionne les probabilités des faces concernées")], COURS_ARBRES),
    calcul(Lc, lignesSommeFractions(questionEcran3C(e).latex, termes.map((f) => [f.num, f.den]), `faces ${facesEcran3(e).join(", ")}`)),
    resultat(Lc, reponse(e, "cEcran3")),
    piege(Lc, [texte("Compter les faces comme équiprobables (nombre de faces favorables divisé par le nombre de faces) : le dé est truqué.")]),
  );
  return etapes;
}

// ============================================================================
// Famille D — arbre pondéré à deux niveaux
// ============================================================================

function etapesD(e: ExerciceFamilleD): EtapeCorrection[] {
  const b = branchesArbreD(e);
  const cible = singulier(couleurD(e, e.couleurCible));
  const autre = e.couleurCible === 0 ? 1 : 0;
  const [La, Lb, Lc, Ld] = (["dEcran1", "dEcran2", "dEcran3", "dEcran4"] as const).map((p) => lettreEcranTiragesArbres(e, p));
  const deuxieme = e.avecRemise ? "comme la boule est remise, l'urne est la même qu'au départ" : "il reste une boule de moins, et une de moins de la couleur déjà tirée";
  const f = (chemin: number[]) => facteurs(e.n1, e.n2, e.avecRemise, chemin);
  const pf = (chemin: number[]) => probCheminFraction(e.n1, e.n2, e.avecRemise, chemin);
  const justifBranche = ["1er tirage", "1er tirage", `2e tirage, après ${e.initiale1}`, `2e tirage, après ${e.initiale1}`, `2e tirage, après ${e.initiale2}`, `2e tirage, après ${e.initiale2}`];
  const lignesBranches: LigneCalcul[] = b.flatMap((fr, i) => {
    const r = frac(fr.num, fr.den);
    return r === brute(fr.num, fr.den) ? [ligne(`p_${i + 1}=${r}`, justifBranche[i])] : [ligne(`p_${i + 1}=${brute(fr.num, fr.den)}`, justifBranche[i]), ligne(`=${r}`)];
  });
  const p01 = pf([0, 1]);
  const p10 = pf([1, 0]);
  const pAA = pf([autre, autre]);
  return [
    utiliseCours(La, [texte(`Premier tirage : nombre de boules de chaque couleur divisé par le nombre total. Deuxième tirage : ${deuxieme}. Les branches issues d'un même nœud ont une somme égale à 1`)], COURS_ARBRES),
    calcul(La, lignesBranches),
    { ...resultat(La, listeEt(b.map((fr, i) => `p_${i + 1}=${fx(fr)}`))), figureHtml: arbreCompletUrne(e.n1, e.n2, e.avecRemise, 2, [e.initiale1, e.initiale2]) },
    verification(La, [texte("Sur chaque nœud, les deux branches ont pour somme 1 : "), latex(`${fx(b[0])}+${fx(b[1])}=1`), texte(".")]),
    piege(La, [texte(e.avecRemise ? "Modifier l'urne au deuxième tirage alors que la boule a été remise." : "Garder les proportions du premier tirage au deuxième : sans remise, l'urne a changé.")]),
    utiliseCours(Lb, [texte("Règle du produit : la probabilité d'un chemin est le produit des probabilités de ses branches")], COURS_ARBRES),
    calcul(Lb, lignesProduit(gaucheReponse(e, "dEcran2"), f(e.chemin))),
    resultat(Lb, reponse(e, "dEcran2")),
    piege(Lb, [texte("Additionner les deux branches du chemin au lieu de les multiplier.")]),
    utiliseCours(Lc, [texte(`« Exactement une boule ${cible} » : deux chemins incompatibles (${cible} puis ${singulier(couleurD(e, autre))}, ou l'inverse), dont on additionne les probabilités, chacune obtenue par la règle du produit`)], COURS_ARBRES),
    calcul(Lc, [
      ...lignesProduit(`P(${e.initiale1}${e.initiale2})`, f([0, 1])).slice(0, 2),
      ...lignesProduit(`P(${e.initiale2}${e.initiale1})`, f([1, 0])).slice(0, 2),
      ...lignesSommeFractions(gaucheReponse(e, "dEcran3"), [[p01.num, p01.den], [p10.num, p10.den]], "deux chemins incompatibles"),
    ]),
    resultat(Lc, reponse(e, "dEcran3")),
    piege(Lc, [texte("Ne compter qu'un des deux chemins : la boule cherchée peut sortir au premier ou au deuxième tirage.")]),
    utiliseCours(Ld, [texte(`Le contraire de « au moins une boule ${cible} » est « aucune boule ${cible} » : un seul chemin, et `), latex("P(E)=1-P(\\overline{E})")], COURS_ARBRES),
    calcul(Ld, [...lignesProduit(`P(${autre === 0 ? e.initiale1 + e.initiale1 : e.initiale2 + e.initiale2})`, f([autre, autre])), ...lignesComplement(gaucheReponse(e, "dEcran4"), `P(${autre === 0 ? e.initiale1 + e.initiale1 : e.initiale2 + e.initiale2})`, pAA.num, pAA.den)]),
    resultat(Ld, reponse(e, "dEcran4")),
    piege(Ld, [texte(`Calculer 1 − P(deux boules ${couleurD(e, e.couleurCible)}) : le contraire de « au moins une » est « aucune ».`)]),
  ];
}

export function correctionDetailleeTiragesArbres(e: ExerciceTiragesArbres): EtapeCorrection[] {
  switch (e.famille) {
    case "A":
      return finaliser(etapesA(e));
    case "B":
      return finaliser(etapesB(e));
    case "C":
      return finaliser(etapesC(e));
    case "D":
      return finaliser(etapesD(e));
  }
}
