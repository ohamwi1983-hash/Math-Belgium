import type { ExerciceFamilleA, ExerciceFamilleB, ExerciceFamilleC, ExerciceFamilleEMixte, ExerciceFamilleF, ExerciceFamilleGMelange, ExerciceProbabilitesProblemes } from "../../core6e/probabilitesProblemes.types";
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { phasesPourExercice } from "../../moteur6e/typesProbabilitesProblemes";
import type { PhaseProbabilitesProblemes } from "../../moteur6e/typesProbabilitesProblemes";
import { bayesEcran3C, branchesArbreC, probabiliteEffetC } from "../../moteur6e/verificationIndependanceBayes";
import {
  affirmationFEstVraie,
  configurationsExactementK,
  nombreCheminsKSucces,
  probabiliteConfiguration,
  probabiliteExactementKFamilleC,
  probabiliteObjet1,
  probabiliteTotaleMelange,
  probExactementKChemins,
  probToutesDifferentes,
  valeurAlternativeF,
  valeurConfigurationF,
  valeurEcran3EpreuvesRepetees,
} from "../../moteur6e/verificationProbabilitesProblemes";
import { descriptionMontage, evenementC, formatReponseAttenduePhaseLatex, formuleLatexF, nombreLatex } from "../../ui6e/formatProbabilitesProblemes";
import { arbreBayesSvg, arbreCheminsSvg, cheminsAKSucces } from "../../ui6e/figureProbabilitesProblemes";
import { COURS_INDEPENDANCE, COURS_PROBLEMES, calcul, dec, finaliser, frac, latex, ligne, lignesSommeFractions, listeEt, piege, resultat, texte, utiliseCours, verification } from "../../ui6e/corrigeProbabilites";

/**
 * Corrigé détaillé « comme au tableau » de `6gen33` (Probabilités : problèmes) — partagé par
 * l'adaptateur papier et le générateur interactif (étape révélée). Une lettre par écran
 * (`phasesPourExercice`). Le nombre de chemins se compte dans l'arbre (jamais C(n, k)) ; valeurs
 * calculées avec les données de l'instance, non arrondies jusqu'au résultat (≈ au dernier pas).
 */

type Ex = ExerciceProbabilitesProblemes;
type Fragments = FragmentConsigne[];
const LETTRES = "abcdefgh";
const COURS = COURS_PROBLEMES;

export function lettreEcranProbabilitesProblemes(e: Ex, phase: PhaseProbabilitesProblemes): string {
  return LETTRES[phasesPourExercice(e).indexOf(phase)];
}

function reponse(e: Ex, phase: PhaseProbabilitesProblemes): Fragments {
  if (e.famille === "F" && phase === "fEcran3" && e.demandeEcran3 === "verifierAffirmation") {
    const v = valeurAlternativeF(e);
    return [texte(affirmationFEstVraie(e) ? "L'affirmation est vraie : " : "L'affirmation est fausse : "), latex(`\\text{fiabilité}${valeurRes(v, 4)}`)];
  }
  return listeEt(formatReponseAttenduePhaseLatex(e, phase));
}

/** « =v » si v est un décimal court (≤ 6 décimales), sinon « ≈ v » arrondi à `d` décimales. */
function valeurRes(v: number, d: number): string {
  const court = Math.abs(v * 1e6 - Math.round(v * 1e6)) < 1e-6;
  return court ? `=${nombreLatex(v)}` : `\\approx ${(Math.round(v * 10 ** d + 1e-9) / 10 ** d).toFixed(d).replace(/0+$/, "").replace(/\.$/, "").replace(".", "{,}")}`;
}

const n6 = (v: number) => nombreLatex(v);

// ============================================================================
// Famille A — anniversaires
// ============================================================================

function etapesA(e: ExerciceFamilleA): EtapeCorrection[] {
  const n = e.n;
  const [a, b, c] = ["a", "b", "c"];
  const facteurs: LigneCalcul[] = [ligne("f_1=\\dfrac{365-1}{365}", "la 2e personne évite 1 jour"), ligne("=\\dfrac{364}{365}")];
  for (let k = 2; k <= n - 1; k++) facteurs.push(ligne(`f_{${k}}=\\dfrac{${365 - k}}{365}`, `la personne n° ${k + 1} évite ${k} jours`));
  const nums = Array.from({ length: n - 1 }, (_, i) => String(365 - (i + 1)));
  const produit = nums.map((x) => `\\dfrac{${x}}{365}`).join("\\cdot ");
  const pt = probToutesDifferentes(n);
  return [
    utiliseCours(a, [texte("On numérote les personnes : quand les k premières ont des anniversaires tous différents, la personne numéro k + 1 doit éviter k jours sur 365 (jours équiprobables), avec la probabilité "), latex("\\dfrac{365-k}{365}")], COURS),
    calcul(a, facteurs),
    resultat(a, reponse(e, "aEcran1")),
    piege(a, [texte("Diviser par un nombre de jours qui diminue : chaque personne a toujours 365 jours possibles, seul le nombre de jours à éviter augmente.")]),
    utiliseCours(b, [texte("Règle du produit le long du chemin de l'arbre (une personne après l'autre) : on multiplie les facteurs")], COURS),
    calcul(b, [ligne(`P(\\text{toutes différentes})=f_1\\cdot f_2\\cdots f_{${n - 1}}`, "règle du produit"), ligne(`=${produit}`), ligne(`\\approx ${n6(Math.round(pt * 1e6) / 1e6)}`, "calculatrice")]),
    resultat(b, reponse(e, "aEcran2")),
    piege(b, [texte("Arrondir chaque facteur avant de multiplier : l'erreur s'accumule ; on garde le produit exact.")]),
    utiliseCours(c, [texte("« Au moins deux le même jour » est le contraire de « tous différents » : "), latex("P(\\overline{E})=1-P(E)")], COURS),
    calcul(c, [ligne("P(\\text{au moins 2 identiques})=1-P(\\text{toutes différentes})", "événement contraire"), ligne(`=1-${produit}`), ligne(valeurRes(1 - pt, 4), "arrondi à 0,0001")]),
    resultat(c, reponse(e, "aEcran3")),
    piege(c, [texte("Chercher « au moins deux le même jour » directement : il y a beaucoup trop de cas ; on passe par l'événement contraire « tous différents ».")]),
  ];
}

// ============================================================================
// Famille B — épreuves répétées
// ============================================================================

function terme(n: number, p: number, i: number): { ecrit: string; valeur: number } {
  return { ecrit: `${nombreCheminsKSucces(n, i)}\\cdot ${n6(p)}^{${i}}\\cdot ${n6(1 - p)}^{${n - i}}`, valeur: probExactementKChemins(n, p, i) };
}

function etapesB(e: ExerciceFamilleB): EtapeCorrection[] {
  const [a, b, c] = ["a", "b", "c"];
  const N = nombreCheminsKSucces(e.n, e.k);
  const chemins = cheminsAKSucces(e.n, e.k);
  const p = n6(e.p);
  const q = n6(1 - e.p);
  const vk = probExactementKChemins(e.n, e.p, e.k);
  const lignesC: LigneCalcul[] = [];
  if (e.demandeEcran3 === "auMoinsK" && e.k === 1) {
    lignesC.push(
      ligne("P(\\text{au moins 1 succès})=1-P(\\text{aucun succès})", "événement contraire"),
      ligne(`=1-${q}^{${e.n}}`, "un seul chemin : que des échecs"),
      ligne(`=1-${n6((1 - e.p) ** e.n)}`),
      ligne(valeurRes(valeurEcran3EpreuvesRepetees(e), 4)),
    );
  } else if (e.demandeEcran3 === "auMoinsK") {
    const valeurs: number[] = [];
    for (let i = e.k; i <= e.n; i++) {
      const t = terme(e.n, e.p, i);
      valeurs.push(t.valeur);
      lignesC.push(ligne(`P(${i}\\ \\text{succès})=${t.ecrit}`, `${nombreCheminsKSucces(e.n, i)} chemin${nombreCheminsKSucces(e.n, i) > 1 ? "s" : ""} à ${i} succès`), ligne(`=${n6(t.valeur)}`));
    }
    lignesC.push(ligne(`P(\\text{au moins }${e.k}\\text{ succès})=${valeurs.map(n6).join("+")}`, "cas incompatibles"), ligne(valeurRes(valeurEcran3EpreuvesRepetees(e), 4)));
  } else {
    lignesC.push(
      ligne("P(E)=1-P(\\text{que des S})-P(\\text{que des É})", "événement contraire"),
      ligne(`=1-${p}^{${e.n}}-${q}^{${e.n}}`, "deux chemins"),
      ligne(`=1-${n6(e.p ** e.n)}-${n6((1 - e.p) ** e.n)}`),
      ligne(valeurRes(valeurEcran3EpreuvesRepetees(e), 4)),
    );
  }
  return [
    { ...utiliseCours(a, [texte(`Arbre des ${e.n} épreuves : chaque chemin est une suite de ${e.n} résultats, succès (S) ou échec (É) ; on énumère avec méthode ceux qui comportent exactement ${e.k} succès`)], COURS), figureHtml: arbreCheminsSvg(e.n, e.k, p.replace("{,}", ","), q.replace("{,}", ",")) },
    calcul(a, [ligne(`\\text{nombre de chemins}=${N}`, "on les compte")], [texte(`Chemins à ${e.k} succès, les S placés d'abord le plus à gauche puis déplacés un à un : ${chemins.join(", ")}.`)]),
    resultat(a, reponse(e, "bEcran1")),
    piege(a, [texte("Oublier un chemin ou en compter un deux fois : les déplacer un à un, avec méthode.")]),
    utiliseCours(b, [texte(`Règle du produit : chaque chemin passe par ${e.k} branche${e.k > 1 ? "s" : ""} de probabilité p et ${e.n - e.k} de probabilité 1 − p, donc tous ont la même probabilité ; on additionne ces chemins incompatibles, c'est-à-dire qu'on multiplie par leur nombre`)], COURS),
    calcul(b, [ligne(`P(\\text{exactement }${e.k}\\text{ succès})=${N}\\cdot p^{${e.k}}\\cdot(1-p)^{${e.n - e.k}}`, `${N} chemins de même probabilité`), ligne(`=${N}\\cdot ${p}^{${e.k}}\\cdot ${q}^{${e.n - e.k}}`, "on remplace"), ligne(`=${N}\\cdot ${n6(e.p ** e.k)}\\cdot ${n6((1 - e.p) ** (e.n - e.k))}`), ligne(valeurRes(vk, 4))]),
    resultat(b, reponse(e, "bEcran2")),
    piege(b, [texte("Oublier de multiplier par le nombre de chemins : un seul chemin ne donne pas « exactement k succès ».")]),
    utiliseCours(c, e.demandeEcran3 === "auMoinsK" ? (e.k === 1 ? [texte("Le contraire de « au moins un succès » est « aucun succès » (un seul chemin) : "), latex("P(\\overline{E})=1-P(E)")] : [texte(`« Au moins ${e.k} » = exactement ${e.k}, …, exactement ${e.n} : des cas incompatibles, dont on additionne les probabilités (chemins comptés comme à l'étape 1)`)]) : [texte("Le contraire de « au moins un succès et au moins un échec » est « que des succès ou que des échecs » : deux chemins")], COURS),
    calcul(c, lignesC, e.demandeEcran3 === "auMoinsK" ? [] : [texte("On note E l'événement « au moins un succès et au moins un échec ».")]),
    resultat(c, reponse(e, "bEcran3")),
    piege(c, [texte(e.demandeEcran3 === "auMoinsK" ? `Confondre « au moins ${e.k} » et « exactement ${e.k} », ou oublier le cas « ${e.n} succès ».` : "Ne retirer que « que des succès » et oublier « que des échecs ».")]),
  ];
}

// ============================================================================
// Famille C — indépendants à probabilités différentes
// ============================================================================

function etapesC(e: ExerciceFamilleC): EtapeCorrection[] {
  const [a, b, c] = ["a", "b", "c"];
  const configs = configurationsExactementK(e.k);
  const conf = (cf: number[]) => `\\{${cf.map((i) => i + 1).join("\\,;\\,")}\\}`;
  const lignesB: LigneCalcul[] = configs.flatMap((cf) => {
    const formule = [0, 1, 2].map((i) => (cf.includes(i) ? `p_{${i + 1}}` : `(1-p_{${i + 1}})`)).join("\\cdot ");
    const valeurs = [0, 1, 2].map((i) => n6(cf.includes(i) ? e.p[i] : 1 - e.p[i])).join("\\cdot ");
    return [ligne(`P(${conf(cf)})=${formule}`, "indépendance : produit"), ligne(`=${valeurs}`, "complément à 1 pour les autres"), ligne(`=${n6(probabiliteConfiguration(e.p, cf))}`)];
  });
  const total = probabiliteExactementKFamilleC(e);
  return [
    utiliseCours(a, [texte(`L'événement « ${evenementC(e)} » se réalise de plusieurs façons : on énumère les configurations (numéros des ${e.contexte.nomPluriel} concernés), qui sont incompatibles`)], COURS),
    calcul(a, [ligne(`E=${configs.map(conf).join("\\cup ")}`, `${configs.length} configurations`)]),
    resultat(a, reponse(e, "cEcran1")),
    piege(a, [texte("Oublier une configuration : avec 3 éléments et exactement " + e.k + " concerné" + (e.k > 1 ? "s" : "") + ", il y en a 3.")]),
    utiliseCours(b, [texte("Éléments indépendants : la probabilité d'une configuration est le produit, élément par élément, de "), latex("p_i"), texte(" (élément concerné) ou de "), latex("1-p_i"), texte(" (élément non concerné)")], COURS_INDEPENDANCE),
    calcul(b, lignesB),
    resultat(b, reponse(e, "cEcran2")),
    piege(b, [texte("Oublier le facteur "), latex("1-p_i"), texte(" des éléments non concernés.")]),
    utiliseCours(c, [texte("Les configurations sont incompatibles : on additionne leurs probabilités")], COURS),
    calcul(c, [ligne(`P(E)=${configs.map((cf) => `P(${conf(cf)})`).join("+")}`, "configurations incompatibles"), ligne(`=${configs.map((cf) => n6(probabiliteConfiguration(e.p, cf))).join("+")}`), ligne(valeurRes(total, 4))]),
    resultat(c, reponse(e, "cEcran3")),
    piege(c, [texte("Appliquer la règle des épreuves répétées avec une probabilité moyenne : les trois probabilités sont différentes, chaque configuration a sa propre probabilité.")]),
  ];
}

// ============================================================================
// Famille E — Bayes, données mélangées
// ============================================================================

function etapesE(e: ExerciceFamilleEMixte): EtapeCorrection[] {
  const [a, b, c] = ["a", "b", "c"];
  const { p, q1, q2 } = e.base;
  const [b1, b2, b3, b4] = branchesArbreC(e.base);
  const pE = probabiliteEffetC(e.base);
  const effet = e.base.demandeEcran3 === "cause1SachantEffet";
  const bayes = bayesEcran3C(e.base);
  return [
    utiliseCours(a, [latex("P(c_1)"), texte(" porte sur tous les cas, alors que "), latex("P(E\\mid c_1)"), texte(" et "), latex("P(E\\mid c_2)"), texte(" ne portent que sur une partie des cas (« si on se limite aux cas où… ») : la condition est le groupe auquel on se limite")], COURS_INDEPENDANCE),
    calcul(a, [ligne(`P(c_1)=${n6(p)}`, "proportion parmi tous les cas"), ligne(`P(E\\mid c_1)=${n6(q1)}`, "on se limite aux cas où c₁ est vrai"), ligne(`P(E\\mid c_2)=${n6(q2)}`, "on se limite aux cas où c₂ est vrai")]),
    resultat(a, reponse(e, "eMixteEcran1")),
    piege(a, [texte("Prendre une proportion « parmi les cas où c₁ » pour "), latex("P(c_1)"), texte(" : elle ne porte que sur une partie des cas.")]),
    { ...utiliseCours(b, [texte("Arbre (cause, puis effet) : un chemin a pour probabilité le produit de ses branches, et "), latex("P(E)=P(c_1\\cap E)+P(c_2\\cap E)"), texte(" (probabilités totales)")], COURS_INDEPENDANCE), figureHtml: arbreBayesSvg(e.base) },
    calcul(b, [
      ligne(`P(c_1\\cap E)=${n6(p)}\\cdot ${n6(q1)}`, "règle du produit"),
      ligne(`=${dec(b1)}`),
      ligne(`P(c_1\\cap\\overline{E})=${n6(p)}\\cdot ${n6(1 - q1)}`, "branche complémentaire"),
      ligne(`=${dec(b2)}`),
      ligne(`P(c_2\\cap E)=${n6(1 - p)}\\cdot ${n6(q2)}`, "règle du produit"),
      ligne(`=${dec(b3)}`),
      ligne(`P(c_2\\cap\\overline{E})=${n6(1 - p)}\\cdot ${n6(1 - q2)}`, "branches complémentaires"),
      ligne(`=${dec(b4)}`),
      ligne(`P(E)=${dec(b1)}+${dec(b3)}`, "probabilités totales"),
      ligne(`=${dec(pE)}`),
    ]),
    resultat(b, reponse(e, "eMixteEcran2")),
    piege(b, [texte("Oublier l'un des deux chemins qui mènent à "), latex("E"), texte(" dans le calcul de "), latex("P(E)"), texte(".")]),
    utiliseCours(c, [texte("Probabilité conditionnelle (formule de Bayes) : "), latex(effet ? "P(c_1\\mid E)=\\dfrac{P(c_1\\cap E)}{P(E)}" : "P(c_1\\mid\\overline{E})=\\dfrac{P(c_1\\cap\\overline{E})}{P(\\overline{E})}")], COURS_INDEPENDANCE),
    calcul(
      c,
      effet
        ? [ligne("P(c_1\\mid E)=\\dfrac{P(c_1\\cap E)}{P(E)}", "formule de Bayes"), ligne(`=\\dfrac{${dec(b1)}}{${dec(pE)}}`, "étape 2"), ligne(valeurRes(bayes, 4))]
        : [ligne("P(\\overline{E})=1-P(E)", "événement contraire"), ligne(`=${dec(1 - pE)}`), ligne("P(c_1\\mid\\overline{E})=\\dfrac{P(c_1\\cap\\overline{E})}{P(\\overline{E})}", "formule de Bayes"), ligne(`=\\dfrac{${dec(b2)}}{${dec(1 - pE)}}`, "étape 2"), ligne(valeurRes(bayes, 4))],
    ),
    resultat(c, reponse(e, "eMixteEcran3")),
    piege(c, [texte("Confondre "), latex("P(c_1\\mid E)"), texte(" avec "), latex("P(E\\mid c_1)"), texte(", qui est une donnée de l'énoncé.")]),
  ];
}

// ============================================================================
// Famille F — fiabilité
// ============================================================================

/** Formule générique d'un montage (indices des composants). */
function formuleGenerique(configuration: ExerciceFamilleF["configuration"], position: 0 | 1 | 2 | undefined): string {
  if (configuration === "serie") return "p_1\\cdot p_2\\cdot p_3";
  if (configuration === "parallele") return "1-(1-p_1)(1-p_2)(1-p_3)";
  const solo = position ?? 0;
  const [x, y] = [0, 1, 2].filter((i) => i !== solo);
  return `p_{${solo + 1}}\\cdot\\left(1-(1-p_{${x + 1}})(1-p_{${y + 1}})\\right)`;
}

/** Calcul effectué d'un montage, depuis la formule remplie. */
function lignesEffectuer(e: ExerciceFamilleF, configuration: ExerciceFamilleF["configuration"], position: 0 | 1 | 2 | undefined): LigneCalcul[] {
  const v = valeurConfigurationF(e.p, configuration, position);
  const lignes: LigneCalcul[] = [ligne(`\\text{fiabilité}=${formuleLatexF(e, configuration, position)}`, "formule remplie")];
  if (configuration === "serie") return [...lignes, ligne(valeurRes(v, 6))];
  if (configuration === "parallele") {
    const pr = (1 - e.p[0]) * (1 - e.p[1]) * (1 - e.p[2]);
    return [...lignes, ligne(`=1-${n6(1 - e.p[0])}\\cdot ${n6(1 - e.p[1])}\\cdot ${n6(1 - e.p[2])}`, "probabilités de panne"), ligne(`=1-${n6(pr)}`), ligne(valeurRes(v, 6))];
  }
  const solo = position ?? 0;
  const [x, y] = [0, 1, 2].filter((i) => i !== solo);
  const groupe = 1 - (1 - e.p[x]) * (1 - e.p[y]);
  return [...lignes, ligne(`=${n6(e.p[solo])}\\cdot(1-${n6(1 - e.p[x])}\\cdot ${n6(1 - e.p[y])})`, "probabilités de panne du groupe"), ligne(`=${n6(e.p[solo])}\\cdot ${n6(groupe)}`, "fiabilité du groupe en parallèle"), ligne(valeurRes(v, 6))];
}

function etapesF(e: ExerciceFamilleF): EtapeCorrection[] {
  const [a, b, c] = ["a", "b", "c"];
  const verifier = e.demandeEcran3 === "verifierAffirmation";
  const alt = valeurAlternativeF(e);
  const arrondi = Math.round(alt * 10000 + 1e-7) / 10000;
  const lignesC = lignesEffectuer(e, e.configurationAlternative, e.positionMixteAlternative);
  lignesC[0] = ligne(`=${formuleLatexF(e, e.configurationAlternative, e.positionMixteAlternative)}`, "on remplace");
  if (verifier) {
    const aff = n6(e.affirmationValeur ?? 0);
    lignesC.push(ligne(`${n6(arrondi)}${affirmationFEstVraie(e) ? "=" : "\\neq "}${aff}`, "arrondi à 4 décimales comparé à la valeur affirmée"));
  }
  return [
    utiliseCours(a, [texte("Composants indépendants. En série, tous doivent fonctionner : on multiplie les fiabilités. En parallèle, le système ne tombe en panne que si tous tombent en panne : "), latex("1-(1-p_1)(1-p_2)(1-p_3)")], COURS),
    calcul(a, [ligne(`\\text{fiabilité}=${formuleGenerique(e.configuration, e.positionMixte)}`, descriptionMontage(e, e.configuration, e.positionMixte).split(" (")[0]), ligne(`=${formuleLatexF(e, e.configuration, e.positionMixte)}`, "on remplace")]),
    resultat(a, [latex(`\\text{fiabilité}=${formuleLatexF(e, e.configuration, e.positionMixte)}`)]),
    piege(a, [texte("Confondre série (produit des fiabilités) et parallèle (1 moins le produit des probabilités de panne).")]),
    utiliseCours(b, [texte("On effectue le calcul posé, en gardant les valeurs exactes jusqu'au résultat")], COURS),
    calcul(b, lignesEffectuer(e, e.configuration, e.positionMixte)),
    resultat(b, reponse(e, "fEcran2")),
    piege(b, [texte("Arrondir les probabilités de panne avant de multiplier.")]),
    utiliseCours(c, [texte(`Nouveau montage (${descriptionMontage(e, e.configurationAlternative, e.positionMixteAlternative).split(" (")[0]}) : même méthode${verifier ? ", puis on compare le résultat, arrondi à 4 décimales, à la valeur affirmée" : ""}`)], COURS),
    calcul(c, [ligne(`\\text{fiabilité}=${formuleGenerique(e.configurationAlternative, e.positionMixteAlternative)}`, "nouveau montage"), ...lignesC]),
    resultat(c, reponse(e, "fEcran3")),
    piege(c, [texte(verifier ? "Juger l'affirmation sans recalculer : la valeur proposée peut venir d'une confusion entre série et parallèle." : "Reprendre la formule du premier montage : les composants sont agencés autrement.")]),
  ];
}

// ============================================================================
// Famille G — mélange de deux urnes
// ============================================================================

function etapesG(e: ExerciceFamilleGMelange): EtapeCorrection[] {
  const [a, b, c, d] = ["a", "b", "c", "d"];
  const { p0, p, faceSpeciale, autreFace } = e.base;
  const A = frac(p0.num, p0.den);
  const reste = { num: p0.den - p0.num, den: p0.den };
  const f1 = probabiliteObjet1(e);
  const w = e.poidsObjet1;
  const ev = `\\text{face }${faceSpeciale}\\text{ ou }${autreFace}`;
  const t1 = w * f1;
  const t2 = (1 - w) * e.probabiliteAutreObjet;
  const court = (v: number) => Math.abs(v * 1e6 - Math.round(v * 1e6)) < 1e-6;
  return [
    utiliseCours(a, [texte("La somme des probabilités des 6 faces d'un dé vaut 1 : une face vaut a, chacune des 5 autres vaut p")], COURS),
    calcul(a, [ligne("P(1)+P(2)+\\cdots+P(6)=1", "somme des probabilités des faces"), ligne("a+5p=1", `face ${faceSpeciale}, puis 5 fois p`)]),
    resultat(a, reponse(e, "gMelangeEcran1")),
    piege(a, [texte("Écrire 6p : la face " + faceSpeciale + " n'a pas la probabilité p.")]),
    utiliseCours(b, [texte("Équation du premier degré : on remplace a par sa valeur, puis on isole p")], COURS),
    calcul(b, [ligne(`5p+${A}=1`, "on remplace a"), ligne(`5p=1-${A}`, "on soustrait a"), ligne(`5p=${frac(reste.num, reste.den)}`), ligne(`p=${frac(reste.num, reste.den)}\\div 5`, "on divise par 5"), ligne(`p=${frac(p.num, p.den)}`)]),
    resultat(b, reponse(e, "gMelangeEcran2")),
    verification(b, [latex(`${A}+5\\times ${frac(p.num, p.den)}=1`), texte(".")]),
    piege(b, [texte("Oublier de diviser par 5 après avoir soustrait a.")]),
    utiliseCours(c, [texte("Deux faces différentes : événements incompatibles, on additionne leurs probabilités")], COURS),
    calcul(c, lignesSommeFractions(`P(${ev}\\mid\\text{urne 1})`, [[p0.num, p0.den], [p.num, p.den]], `face ${faceSpeciale} (a), face ${autreFace} (p)`)),
    resultat(c, reponse(e, "gMelangeEcran3")),
    piege(c, [texte("Compter les deux faces comme équiprobables (deux faces sur six) : le dé est truqué.")]),
    utiliseCours(d, [texte("Formule des probabilités totales (arbre : choix de l'urne, puis le dé) : "), latex("P(F)=P(U_1)\\cdot P(F\\mid U_1)+P(U_2)\\cdot P(F\\mid U_2)")], COURS),
    calcul(d, [
      ligne(`P(${ev})=P(U_1)\\cdot P(F\\mid U_1)+P(U_2)\\cdot P(F\\mid U_2)`, "probabilités totales"),
      ligne(`=${n6(w)}\\cdot ${fracDe(p0, p)}+${n6(1 - w)}\\cdot ${n6(e.probabiliteAutreObjet)}`, "on remplace"),
      ligne(`${court(t1) && court(t2) ? "=" : "\\approx "}${court(t1) ? n6(t1) : n6(Math.round(t1 * 1e6) / 1e6)}+${n6(t2)}`),
      ligne(valeurRes(probabiliteTotaleMelange(e), 4)),
    ]),
    resultat(d, reponse(e, "gMelangeEcran4")),
    piege(d, [texte("Additionner les deux probabilités sans les pondérer par la probabilité de choisir chaque urne.")]),
  ];
}

/** P(F | urne 1) = a + p en fraction (réduite). */
function fracDe(p0: { num: number; den: number }, p: { num: number; den: number }): string {
  return frac(p0.num * p.den + p.num * p0.den, p0.den * p.den);
}

export function correctionDetailleeProbabilitesProblemes(e: Ex): EtapeCorrection[] {
  switch (e.famille) {
    case "A":
      return finaliser(etapesA(e));
    case "B":
      return finaliser(etapesB(e));
    case "C":
      return finaliser(etapesC(e));
    case "E":
      return finaliser(etapesE(e));
    case "F":
      return finaliser(etapesF(e));
    case "G":
      return finaliser(etapesG(e));
  }
}
