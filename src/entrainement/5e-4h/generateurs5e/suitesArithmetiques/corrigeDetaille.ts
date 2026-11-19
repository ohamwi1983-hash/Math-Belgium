import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type {
  ExerciceAlgebriqueRangN,
  ExerciceAlgebriqueSommeSn,
  ExerciceAlgebriqueTermeGeneral,
  ExerciceCoherenceSuiteArithmetique,
  ExercicePrincipalSuiteArithmetique,
  ExerciceSuiteArithmetique,
  TermeLineaire,
} from "../../core5e/suitesArithmetiques.types";
import type { PhaseSuiteArithmetique } from "../../moteur5e/typesSuiteArithmetique";
import { ordreComplet } from "../../moteur5e/typesSuiteArithmetique";
import { formatReponseAttenduePhaseLatex } from "../../ui5e/formatSuiteArithmetique";
import { COURS_ARITHMETIQUE, ent, fois, fr, fragmentsListe, justifRetirer, lignesPremierDegre, lin, mono, nomIndice, par, plus, signe, signeMono, somme, versQ, type Q } from "../../ui5e/corrigeSuites1";

/**
 * Corrigé détaillé « comme au tableau » de 5gen14 (suites arithmétiques) — règle
 * `.claude/rules/feuilles-evaluations.md`. Une étape par écran (`ordreComplet`, ou les étapes
 * papier `etapesPapierSuiteArithmetique` pour la famille « cohérence ») : « Ce qu'on utilise »
 * (formule du cours, § 1), « Calcul » (substitution puis une opération par ligne), « Résultat »
 * (réponse de l'écran, `formatReponseAttenduePhaseLatex`), « Vérification » (le terme donné
 * recalculé, la somme par l'autre écriture, u₁ retrouvé pour n = 1…), « Piège ».
 * SANS `docx` : importé par l'adaptateur ET par `App5gen14.tsx` (étape échouée).
 */

type E = ExerciceSuiteArithmetique;
type Base = ExercicePrincipalSuiteArithmetique | ExerciceCoherenceSuiteArithmetique;

const LETTRES = "abcdefghijklmnopqrstuvwxyz";
const t = texte;
const f = latex;

const u = (i: number | string) => `u_{${i}}`;
const S = (i: number | string) => `S_{${i}}`;
const n = (v: number) => fr(versQ(v));

/** Étapes réellement demandées sur papier : la séquence de l'écran, sauf pour la famille
 * « cohérence » (jugement, puis u₁ et la formule générale si les données sont cohérentes). */
export function etapesPapierSuiteArithmetique(exercice: E): PhaseSuiteArithmetique[] {
  if (exercice.famille === "coherence") return exercice.coherent ? ["coherenceJugement", "trouverU1", "formuleGenerale"] : ["coherenceJugement"];
  return ordreComplet(exercice);
}

function reponse(exercice: E, phase: PhaseSuiteArithmetique): FragmentConsigne[] {
  return fragmentsListe(formatReponseAttenduePhaseLatex(exercice, phase));
}

const FORMULE_TERME = "u_n=u_1+(n-1)r";
const FORMULE_SOMME = "S_n=\\dfrac{n}{2}(2u_1+(n-1)r)";

function utiliseTerme(sq: string, avant = "Terme général d'une suite arithmétique : "): EtapeCorrection {
  return utilise(sq, [t(avant), f(FORMULE_TERME), t(` ${COURS_ARITHMETIQUE}.`)]);
}

function utiliseSomme(sq: string): EtapeCorrection {
  return utilise(sq, [t("Somme des n premiers termes d'une suite arithmétique : "), f(FORMULE_SOMME), t(` ${COURS_ARITHMETIQUE}.`)]);
}

// ============================================================================
// Briques de calcul (valeurs entières de u₁ et r, sauf familles algébriques).
// ============================================================================

/** u_N = u₁ + (N − 1) × r, substitué puis calculé. */
function lignesTerme(u1: number, r: number, N: number, avecFormule = true): LigneCalcul[] {
  const produit = (N - 1) * r;
  return [
    ...(avecFormule ? [ligne(`${u(N)}=u_1+(${N}-1)r`, `terme général pour n = ${N}`)] : []),
    ligne(`${avecFormule ? "" : u(N)}=${n(u1)}+${N - 1}\\times ${par(r)}`, avecFormule ? "on remplace u₁ et r" : `terme général pour n = ${N}`),
    ligne(`=${somme(u1, produit)}`, "on multiplie"),
    ligne(`=${n(u1 + produit)}`),
  ];
}

/** S_N = N/2 (2u₁ + (N − 1)r), substituée puis calculée. */
function lignesSomme(u1: number, r: number, N: number): LigneCalcul[] {
  const interieur = 2 * u1 + (N - 1) * r;
  return [
    ligne(`${S(N)}=\\dfrac{${N}}{2}(2u_1+(${N}-1)r)`, `somme des ${N} premiers termes`),
    ligne(`=\\dfrac{${N}}{2}(2\\times ${par(u1)}+${N - 1}\\times ${par(r)})`, "on remplace u₁ et r"),
    ligne(`=\\dfrac{${N}}{2}(${somme(2 * u1, (N - 1) * r)})`, "on multiplie dans la parenthèse"),
    ligne(`=\\dfrac{${N}}{2}\\times ${par(interieur)}`, "on réduit la parenthèse"),
    ligne(`=\\dfrac{${N * interieur}}{2}`),
    ligne(`=${n((N * interieur) / 2)}`),
  ];
}

/** Vérification de la somme par l'autre écriture : N/2 (u₁ + u_N). */
function verificationSomme(sq: string, u1: number, r: number, N: number): EtapeCorrection {
  const uN = u1 + (N - 1) * r;
  return verification(
    sq,
    [t("Autre écriture de la somme : "), f(`${S("n")}=\\dfrac{n}{2}(u_1+u_n)`), t(", avec "), f(`${u(N)}=${n(uN)}`), t(" :")],
    [ligne(`\\dfrac{${N}}{2}(u_1+${u(N)})=\\dfrac{${N}}{2}(${somme(u1, uN)})`), ligne(`=\\dfrac{${N}}{2}\\times ${par(u1 + uN)}`), ligne(`=${n((N * (u1 + uN)) / 2)}`, "même résultat ✓")],
  );
}

/** a·v = b déjà écrit : on divise (v = r, inconnue entière). */
function lignesDiviserEntier(coef: number, b: number, v: string): LigneCalcul[] {
  if (coef === 1) return [];
  return [ligne(`${v}=\\dfrac{${b}}{${coef}}`, `on divise par ${coef}`), ligne(`=${n(b / coef)}`)];
}

/** u_haut = u_bas + (haut − bas) r, avec u_haut, u_bas connus : on isole r. */
function lignesRaison(bas: { indice: number | string; valeur: number }, haut: { indice: number; valeur: number }, r: number): LigneCalcul[] {
  const ecart = haut.indice - (bas.indice === 1 ? 1 : (bas.indice as number));
  const membre = `${mono(ecart, "r")}`;
  const nomBas = bas.indice === 1 ? "u_1" : u(bas.indice);
  const lignes: LigneCalcul[] = [
    ligne(`${u(haut.indice)}=${nomBas}+(${haut.indice}-${bas.indice})r`, bas.indice === 1 ? `terme général pour n = ${haut.indice}` : `de ${nomIndice("u", bas.indice)} à ${nomIndice("u", haut.indice)}, on ajoute ${ecart} fois r`),
    ligne(`${n(haut.valeur)}=${n(bas.valeur)}${signeMono(ecart, "r")}`, "on remplace les deux termes"),
  ];
  if (bas.valeur !== 0) {
    lignes.push(ligne(`${membre}=${n(haut.valeur)}-${par(bas.valeur)}`, justifRetirer(versQ(bas.valeur))));
    lignes.push(ligne(`=${n(haut.valeur - bas.valeur)}`));
  } else lignes.push(ligne(`${membre}=${n(haut.valeur)}`, "on échange les deux membres"));
  lignes.push(...lignesDiviserEntier(ecart, haut.valeur - bas.valeur, "r"));
  void r;
  return lignes;
}

/** Vérification d'une raison : le terme donné recalculé. */
function verificationRaison(sq: string, bas: { indice: number; valeur: number }, haut: { indice: number; valeur: number }, r: number): EtapeCorrection {
  const ecart = haut.indice - bas.indice;
  const nomBas = bas.indice === 1 ? "u_1" : u(bas.indice);
  return verification(
    sq,
    [t("On recalcule le terme donné avec la raison trouvée :")],
    [ligne(`${nomBas}+${ecart}r=${n(bas.valeur)}+${ecart}\\times ${par(r)}`), ligne(`=${somme(bas.valeur, ecart * r)}`), ligne(`=${n(haut.valeur)}`, [t("c'est bien "), f(u(haut.indice)), t(" ✓")])],
  );
}

// ============================================================================
// Étapes de la famille « principal » / « cohérence ».
// ============================================================================

function base(exercice: E): Base {
  if (exercice.famille !== "principal" && exercice.famille !== "coherence") throw new Error("famille sans u₁/r");
  return exercice;
}

function etapeTrouverR(exercice: ExercicePrincipalSuiteArithmetique, sq: string): EtapeCorrection[] {
  const { u1, r } = exercice.base;
  const d = exercice.donnees;
  if (d.combo === "up_uq") {
    const [bas, haut] = d.up.indice < d.uq.indice ? [d.up, d.uq] : [d.uq, d.up];
    return [
      utilise(sq, [t("Entre deux termes d'une suite arithmétique, on ajoute r autant de fois que l'écart des rangs : "), f("u_q=u_p+(q-p)r"), t(` ${COURS_ARITHMETIQUE}.`)]),
      calcul(sq, lignesRaison(bas, haut, r)),
      resultat(sq, reponse(exercice, "trouverR")),
      verificationRaison(sq, bas, haut, r),
      piege(sq, [t("On divise l'écart des termes par l'écart des rangs "), f(`${haut.indice}-${bas.indice}`), t(", pas par l'un des rangs.")]),
    ];
  }
  const haut = d.combo === "u1_up" ? d.up : d.combo === "un_sn" ? d.un : null;
  if (!haut) return [];
  const bas = { indice: 1, valeur: u1 };
  return [
    utiliseTerme(sq, d.combo === "un_sn" ? "u₁ est connu (étape précédente) ; terme général d'une suite arithmétique : " : "Terme général d'une suite arithmétique : "),
    calcul(sq, lignesRaison(bas, haut, r)),
    resultat(sq, reponse(exercice, "trouverR")),
    verificationRaison(sq, bas, haut, r),
    piege(sq, [t("De u₁ à "), f(u(haut.indice)), t(` on ajoute r seulement ${haut.indice - 1} fois : on divise par `), f(`${haut.indice}-1`), t(", pas par "), f(`${haut.indice}`), t(".")]),
  ];
}

function etapeTrouverU1(exercice: Base, sq: string): EtapeCorrection[] {
  const { u1, r } = exercice.base;
  if (exercice.famille === "principal" && exercice.donnees.combo === "un_sn") {
    const { un, sn } = exercice.donnees;
    const N = un.indice;
    const deuxSsurN = (2 * sn) / N;
    return [
      utilise(sq, [t("Somme de n termes consécutifs, avec le premier et le dernier terme : "), f("S_n=\\dfrac{n}{2}(u_1+u_n)"), t(` ${COURS_ARITHMETIQUE}.`)]),
      calcul(sq, [
        ligne(`${S(N)}=\\dfrac{${N}}{2}(u_1+${u(N)})`, `somme des ${N} premiers termes`),
        ligne(`${n(sn)}=\\dfrac{${N}}{2}(u_1${signe(un.valeur)})`, `on remplace ${nomIndice("S", N)} et ${nomIndice("u", N)}`),
        ligne(`u_1${signe(un.valeur)}=\\dfrac{2\\times ${par(sn)}}{${N}}`, `on multiplie par 2 et on divise par ${N}`),
        ligne(`=${n(deuxSsurN)}`),
        ...(un.valeur === 0 ? [] : [ligne(`u_1=${somme(deuxSsurN, -un.valeur)}`, justifRetirer(versQ(un.valeur))), ligne(`=${n(u1)}`)]),
      ]),
      resultat(sq, reponse(exercice, "trouverU1")),
      piege(sq, [t("La formule avec le dernier terme s'écrit "), f("\\dfrac{n}{2}(u_1+u_n)"), t(" : u₁ et uₙ sont additionnés, puis multipliés par la moitié de n.")]),
    ];
  }
  const up = exercice.famille === "coherence" ? exercice.p : exercice.donnees.combo === "r_up" || exercice.donnees.combo === "up_uq" ? exercice.donnees.up : null;
  if (!up) return [];
  const P = up.indice;
  const produit = (P - 1) * r;
  return [
    utiliseTerme(sq, "r est connu ; terme général d'une suite arithmétique, écrit pour le terme donné : "),
    calcul(sq, [
      ligne(`${u(P)}=u_1+(${P}-1)r`, `terme général pour n = ${P}`),
      ...(P - 1 === 1
        ? [ligne(`${n(up.valeur)}=u_1${signe(r)}`, "on remplace le terme et r")]
        : [ligne(`${n(up.valeur)}=u_1+${P - 1}\\times ${par(r)}`, "on remplace le terme et r"), ligne(`${n(up.valeur)}=u_1${signe(produit)}`, "on multiplie")]),
      ...(produit === 0 ? [] : [ligne(`u_1=${somme(up.valeur, -produit)}`, justifRetirer(versQ(produit))), ligne(`=${n(u1)}`)]),
    ]),
    resultat(sq, reponse(exercice, "trouverU1")),
    verification(sq, [t("On recalcule le terme donné à partir de u₁ :")], [ligne(`u_1+${P - 1}r=${n(u1)}+${P - 1}\\times ${par(r)}`), ligne(`=${somme(u1, produit)}`), ligne(`=${n(up.valeur)}`, [t("c'est bien "), f(u(P)), t(" ✓")])]),
  ];
}

function etapeFormule(exercice: Base, sq: string): EtapeCorrection[] {
  const { u1, r } = exercice.base;
  const distribue = u1 === 0 ? `${mono(r, "n")}${signe(-r)}` : `${n(u1)}${signeMono(r, "n")}${signe(-r)}`;
  const reduit = lin(r, u1 - r, "n");
  const lignes: LigneCalcul[] = [ligne(`u_n=${n(u1)}+(n-1)\\times ${par(r)}`, "on remplace u₁ et r"), ligne(`=${distribue}`, "on distribue")];
  if (reduit !== distribue) lignes.push(ligne(`=${reduit}`, "on réduit"));
  return [
    utiliseTerme(sq),
    calcul(sq, lignes),
    resultat(sq, reponse(exercice, "formuleGenerale")),
    verification(sq, [t("Pour n = 1, on doit retrouver u₁ :")], [ligne(`u_1=${r === 1 ? "" : r === -1 ? "-" : `${r}\\times `}1${signe(u1 - r)}`), ligne(`=${n(u1)}`, "✓")]),
    piege(sq, [t("Le terme de rang n est "), f("u_1+(n-1)r"), t(", pas "), f("u_1+nr"), t(" : de u₁ à uₙ, on ajoute r seulement (n − 1) fois.")]),
  ];
}

function etapeTermesProches(exercice: Base, sq: string): EtapeCorrection[] {
  const { u1, r } = exercice.base;
  const indices = exercice.indicesTermesProches as number[];
  const [a] = indices;
  const valeurs = indices.map((k) => u1 + (k - 1) * r);
  const lignes: LigneCalcul[] = [...lignesTerme(u1, r, a, false)];
  for (let i = 1; i < indices.length; i++) {
    lignes.push(ligne(`${u(indices[i])}=${n(valeurs[i - 1])}${signe(r)}`, "on ajoute r au terme précédent"));
    lignes.push(ligne(`=${n(valeurs[i])}`));
  }
  const dernier = indices[indices.length - 1];
  return [
    utilise(sq, [t("Terme général pour le premier terme demandé, "), f(FORMULE_TERME), t(", puis on ajoute r pour passer au suivant : "), f("u_{n+1}=u_n+r"), t(` ${COURS_ARITHMETIQUE}.`)]),
    calcul(sq, lignes),
    resultat(sq, reponse(exercice, "termesProches")),
    verification(sq, [t("Le dernier terme, avec la formule :")], [ligne(`${u(dernier)}=${n(u1)}+${dernier - 1}\\times ${par(r)}`), ligne(`=${n(valeurs[valeurs.length - 1])}`, "✓")]),
  ];
}

function etapeTermeEloigne(exercice: Base, sq: string): EtapeCorrection[] {
  const { u1, r } = exercice.base;
  const N = exercice.indiceTermeEloigne as number;
  return [
    utiliseTerme(sq, "Terme général d'une suite arithmétique (inutile de calculer les termes un à un) : "),
    calcul(sq, lignesTerme(u1, r, N)),
    resultat(sq, reponse(exercice, "termeEloigne")),
    piege(sq, [t(`On multiplie r par ${N - 1}, pas par ${N}.`)]),
  ];
}

function etapeSomme(exercice: Base, sq: string): EtapeCorrection[] {
  const { u1, r } = exercice.base;
  const N = exercice.indiceSn as number;
  return [
    utiliseSomme(sq),
    calcul(sq, lignesSomme(u1, r, N)),
    resultat(sq, reponse(exercice, "sommeSn")),
    verificationSomme(sq, u1, r, N),
    piege(sq, [t(`${nomIndice("S", N)} compte ${N} termes : n = ${N} devant la parenthèse, et (n − 1)r = ${N - 1}r à l'intérieur, pas ${N}r.`)]),
  ];
}

function etapeCoherence(exercice: ExerciceCoherenceSuiteArithmetique, sq: string): EtapeCorrection[] {
  const { p, q, r } = exercice;
  const ecart = q.valeur - p.valeur;
  const attendu = (q.indice - p.indice) * r;
  return [
    utilise(sq, [t("Entre deux termes d'une suite arithmétique, l'écart des termes vaut l'écart des rangs multiplié par r : "), f("u_q-u_p=(q-p)\\times r"), t(` ${COURS_ARITHMETIQUE}.`)]),
    calcul(sq, [
      ligne(`${u(q.indice)}-${u(p.indice)}=${n(q.valeur)}-${par(p.valeur)}`, "écart des deux termes donnés"),
      ligne(`=${n(ecart)}`),
      ligne(`(${q.indice}-${p.indice})\\times r=${q.indice - p.indice}\\times ${par(r)}`, "écart des rangs multiplié par r"),
      ligne(`=${n(attendu)}`),
      ligne(`${n(ecart)}${exercice.coherent ? "=" : "\\neq "}${n(attendu)}`, exercice.coherent ? "les deux écarts sont égaux" : "les deux écarts diffèrent"),
    ]),
    resultat(sq, [t(exercice.coherent ? "Les trois données sont cohérentes : " : "Les trois données sont incohérentes : "), f(`${u(q.indice)}-${u(p.indice)}${exercice.coherent ? "=" : "\\neq "}(${q.indice}-${p.indice})\\times r`), t(exercice.coherent ? "." : " (aucune suite arithmétique ne les vérifie toutes).")]),
    piege(sq, [t("On compare l'écart des deux termes à "), f("(q-p)\\times r"), t(" — l'écart des rangs multiplié par r —, pas à r seul.")]),
  ];
}

// ============================================================================
// Familles algébriques (inconnue x) et rang n.
// ============================================================================

function valeurLin(t0: TermeLineaire, x: Q): Q {
  return plus(fois(ent(t0.a), x), versQ(t0.b));
}

function linT(t0: TermeLineaire): string {
  return lin(t0.a, versQ(t0.b));
}

/** a·x + b avec x remplacé : trois lignes (substitution, produit, somme). */
function lignesSubstitution(nom: string, t0: TermeLineaire, x: Q): LigneCalcul[] {
  const ax = fois(ent(t0.a), x);
  const b = versQ(t0.b);
  const lignes = [ligne(`${nom}=${t0.a}\\times ${par(x)}${signe(b)}`, "on remplace x")];
  if (b.num !== 0) lignes.push(ligne(`=${fr(ax)}${signe(b)}`, "on multiplie"));
  lignes.push(ligne(`=${fr(plus(ax, b))}`));
  return lignes;
}

function etapeCalculerSn(exercice: ExerciceAlgebriqueSommeSn, sq: string): EtapeCorrection[] {
  if (exercice.sousCas !== "D") return [];
  return [utiliseSomme(sq), calcul(sq, lignesSomme(exercice.u1, exercice.r, exercice.n)), resultat(sq, reponse(exercice, "calculerSn")), verificationSomme(sq, exercice.u1, exercice.r, exercice.n)];
}

/** Équation de l'écran « poser » écrite avec des parenthèses simples (somme Sₙ). */
function equationSomme(e: ExerciceAlgebriqueSommeSn): string {
  const N = e.n;
  const M = N - 1;
  switch (e.sousCas) {
    case "A":
      return `\\dfrac{${N}}{2}(2(${linT(e.u1)})+${M}\\times ${par(e.r)})=${e.k}`;
    case "B":
      return `\\dfrac{${N}}{2}(2\\times ${par(e.u1)}+${M}(${linT(e.r)}))=${e.k}`;
    case "C":
      return `\\dfrac{${N}}{2}(2(${linT(e.u1)})+${M}(${linT(e.r)}))=${e.k}`;
    case "D":
      return `${linT(e.sn)}=${e.k}`;
  }
}

function etapePoser(exercice: ExerciceAlgebriqueTermeGeneral | ExerciceAlgebriqueSommeSn, sq: string): EtapeCorrection[] {
  if (exercice.famille === "algebriqueTermeGeneral") {
    const { p, n: N, r, up, un } = exercice;
    const c = (N - p) * r;
    return [
      utilise(sq, [t("Entre deux termes d'une suite arithmétique, on ajoute r autant de fois que l'écart des rangs : "), f("u_n=u_p+(n-p)\\times r"), t(` ${COURS_ARITHMETIQUE}.`)]),
      calcul(sq, [
        ligne(`${u(N)}=${u(p)}+(${N}-${p})\\times r`, `relation entre ${nomIndice("u", N)} et ${nomIndice("u", p)}`),
        ligne(`${linT(un)}=${linT(up)}+${par(N - p)}\\times ${par(r)}`, "on remplace les deux termes et r"),
        ligne(`${linT(un)}=${linT(up)}${signe(c)}`, "on multiplie"),
      ]),
      resultat(sq, reponse(exercice, "poserEquationAlgebrique")),
      piege(sq, [t("Entre "), f(u(p)), t(" et "), f(u(N)), t(" on ajoute r autant de fois que l'écart des rangs (éventuellement négatif) : "), f(`${u(N)}=${u(p)}+(${N}-${p})\\times r`), t(".")]),
    ];
  }
  const e = exercice;
  const N = e.n;
  if (e.sousCas === "D") {
    return [
      utilise(sq, [t("La somme "), f(S(N)), t(" a deux écritures : sa valeur calculée à l'étape 1 et l'expression en x donnée. Elles sont égales.")]),
      calcul(sq, [ligne(`${S(N)}=${e.k}`, "valeur calculée à l'étape 1"), ligne(`${S(N)}=${linT(e.sn)}`, "expression donnée"), ligne(`${linT(e.sn)}=${e.k}`, "on égale les deux écritures")]),
      resultat(sq, reponse(exercice, "poserEquationAlgebrique")),
      piege(sq, [t("On égale l'expression en x à la valeur de Sₙ calculée avec u₁ et r — pas à u₁ ni à r.")]),
    ];
  }
  const remplace = e.sousCas === "A" ? "on remplace u₁ par son expression, r et n" : e.sousCas === "B" ? "on remplace u₁, r par son expression et n" : "on remplace u₁ et r par leurs expressions, et n";
  return [
    utilise(sq, [t("Somme des n premiers termes, égalée à la valeur donnée : "), f(FORMULE_SOMME), t(` ${COURS_ARITHMETIQUE}.`)]),
    calcul(sq, [ligne(`${S(N)}=\\dfrac{${N}}{2}(2u_1+(${N}-1)r)`, `somme des ${N} premiers termes`), ligne(`${e.k}=${equationSomme(e).replace(/=-?\d+$/, "")}`, remplace)]),
    resultat(sq, reponse(exercice, "poserEquationAlgebrique")),
    piege(
      sq,
      e.sousCas === "A"
        ? [t("Dans "), f("2u_1"), t(", le facteur 2 multiplie toute l'expression de u₁(x) : parenthèses indispensables.")]
        : [t("Les parenthèses autour de r(x) sont indispensables : (n − 1) multiplie aussi son terme constant.")],
    ),
  ];
}

/** Lignes de résolution de l'équation (forme de l'étape « poser »). */
function lignesResolution(exercice: ExerciceAlgebriqueTermeGeneral | ExerciceAlgebriqueSommeSn): LigneCalcul[] {
  if (exercice.famille === "algebriqueTermeGeneral") {
    const { p, n: N, r, up, un } = exercice;
    const c = (N - p) * r;
    const droite = versQ(up.b + c);
    const lignes = [ligne(`${linT(un)}=${linT(up)}${signe(c)}`, "équation de l'étape 1")];
    if (up.b !== 0 && c !== 0) lignes.push(ligne(`${linT(un)}=${lin(up.a, droite)}`, "on réduit le membre de droite"));
    return [...lignes, ...lignesPremierDegre(ent(un.a), versQ(un.b), ent(up.a), droite)];
  }
  const e = exercice;
  if (e.sousCas === "D") return [ligne(`${linT(e.sn)}=${e.k}`, "équation de l'étape 2"), ...lignesPremierDegre(ent(e.sn.a), versQ(e.sn.b), ent(0), ent(e.k))];
  const N = e.n;
  const M = N - 1;
  const k = ent(e.k);
  const devant = `\\dfrac{${N}}{2}`;
  const lignes: LigneCalcul[] = [ligne(equationSomme(e), "équation de l'étape 1")];
  let a: Q;
  let b: Q;
  if (e.sousCas === "A") {
    const a2 = 2 * e.u1.a;
    const b2 = 2 * e.u1.b;
    const mr = M * e.r;
    lignes.push(ligne(`${devant}(${lin(a2, b2)}+${M}\\times ${par(e.r)})=${e.k}`, "on distribue le 2"));
    lignes.push(ligne(`${devant}(${lin(a2, b2)}${signe(mr)})=${e.k}`, "on multiplie"));
    a = ent(a2);
    b = ent(b2 + mr);
  } else if (e.sousCas === "B") {
    const deuxU1 = 2 * e.u1;
    const am = M * e.r.a;
    const bm = M * e.r.b;
    lignes.push(ligne(`${devant}(${deuxU1}+${M}(${linT(e.r)}))=${e.k}`, "on calcule 2 × u₁"));
    lignes.push(ligne(`${devant}(${deuxU1}${signeMono(am)}${signe(bm)})=${e.k}`, `on distribue le ${M}`));
    a = ent(am);
    b = ent(deuxU1 + bm);
  } else {
    const a2 = 2 * e.u1.a;
    const b2 = 2 * e.u1.b;
    const am = M * e.r.a;
    const bm = M * e.r.b;
    lignes.push(ligne(`${devant}(${lin(a2, b2)}+${M}(${linT(e.r)}))=${e.k}`, "on distribue le 2"));
    lignes.push(ligne(`${devant}(${lin(a2, b2)}${signeMono(am)}${signe(bm)})=${e.k}`, `on distribue le ${M}`));
    a = ent(a2 + am);
    b = ent(b2 + bm);
  }
  const reduit = `${devant}(${lin(a, b)})=${e.k}`;
  if (reduit !== lignes[lignes.length - 1].latex) lignes.push(ligne(reduit, "on réduit la parenthèse"));
  const droite = fois(k, versQ(2 / N));
  lignes.push(ligne(`${lin(a, b)}=\\dfrac{2\\times ${par(e.k)}}{${N}}`, `on multiplie par 2 et on divise par ${N}`));
  lignes.push(ligne(`=${fr(droite)}`));
  lignes.push(...lignesPremierDegre(a, b, ent(0), droite));
  return lignes;
}

function etapeResoudre(exercice: ExerciceAlgebriqueTermeGeneral | ExerciceAlgebriqueSommeSn, sq: string): EtapeCorrection[] {
  return [
    utilise(sq, [t("Équation du premier degré : on développe, on regroupe les termes en x d'un côté et les nombres de l'autre, puis on divise par le coefficient de x.")]),
    calcul(sq, lignesResolution(exercice)),
    resultat(sq, reponse(exercice, "resoudreXAlgebrique")),
  ];
}

function etapeCalculerTermes(exercice: ExerciceAlgebriqueTermeGeneral | ExerciceAlgebriqueSommeSn, sq: string): EtapeCorrection[] {
  const x = versQ(exercice.xReel);
  const blocs: { nom: string; t0: TermeLineaire }[] =
    exercice.famille === "algebriqueTermeGeneral"
      ? [
          { nom: u(exercice.p), t0: exercice.up },
          { nom: u(exercice.n), t0: exercice.un },
        ]
      : exercice.sousCas === "A"
        ? [{ nom: "u_1", t0: exercice.u1 }]
        : exercice.sousCas === "B"
          ? [{ nom: "r", t0: exercice.r }]
          : exercice.sousCas === "C"
            ? [
                { nom: "u_1", t0: exercice.u1 },
                { nom: "r", t0: exercice.r },
              ]
            : [];
  const lignes = blocs.flatMap((b) => lignesSubstitution(b.nom, b.t0, x));
  let verif: EtapeCorrection | null = null;
  if (exercice.famille === "algebriqueTermeGeneral") {
    const { p, n: N, r } = exercice;
    const vp = valeurLin(exercice.up, x);
    const vn = valeurLin(exercice.un, x);
    verif = verification(sq, [t("Les deux valeurs vérifient la relation entre les termes :")], [ligne(`${u(p)}+${par(N - p)}\\times ${par(r)}=${fr(vp)}${signe((N - p) * r)}`), ligne(`=${fr(vn)}`, [t("c'est bien "), f(u(N)), t(" ✓")])]);
  } else if (exercice.sousCas !== "D") {
    const N = exercice.n;
    const u1 = exercice.sousCas === "B" ? ent(exercice.u1) : valeurLin(exercice.u1 as TermeLineaire, x);
    const r = exercice.sousCas === "A" ? ent(exercice.r) : valeurLin(exercice.r as TermeLineaire, x);
    const interieur = plus(fois(ent(2), u1), fois(ent(N - 1), r));
    verif = verification(sq, [t("On recalcule la somme avec ces valeurs :")], [
      ligne(`\\dfrac{${N}}{2}(2\\times ${par(u1)}+${N - 1}\\times ${par(r)})=\\dfrac{${N}}{2}\\times ${par(interieur)}`),
      ligne(`=${fr(fois(versQ(N / 2), interieur))}`, [t("c'est bien "), f(S(N)), t(" ✓")]),
    ]);
  }
  return [
    utilise(sq, [t("On remplace x par sa valeur, "), f(`x=${fr(x)}`), t(", dans chaque expression.")]),
    calcul(sq, lignes),
    resultat(sq, reponse(exercice, "calculerTermesAlgebrique")),
    ...(verif ? [verif] : []),
  ];
}

function etapePoserRangN(exercice: ExerciceAlgebriqueRangN, sq: string): EtapeCorrection[] {
  const { u1, r, k } = exercice;
  return [
    utiliseTerme(sq, "Le terme de rang n vaut la valeur donnée ; terme général d'une suite arithmétique : "),
    calcul(sq, [ligne(`u_n=${k}`, "le terme cherché vaut la valeur donnée"), ligne(`u_1+(n-1)r=${k}`, "terme général"), ligne(`${n(u1)}+(n-1)\\times ${par(r)}=${k}`, "on remplace u₁ et r")]),
    resultat(sq, reponse(exercice, "poserEquationRangN")),
  ];
}

function etapeResoudreRangN(exercice: ExerciceAlgebriqueRangN, sq: string): EtapeCorrection[] {
  const { u1, r, k, n: N } = exercice;
  const lignes: LigneCalcul[] = [ligne(`${n(u1)}+(n-1)\\times ${par(r)}=${k}`, "équation de l'étape 1")];
  if (u1 !== 0) {
    lignes.push(ligne(`(n-1)\\times ${par(r)}=${k}-${par(u1)}`, justifRetirer(versQ(u1))));
    lignes.push(ligne(`=${k - u1}`));
  }
  lignes.push(ligne(`n-1=\\dfrac{${k - u1}}{${r}}`, [t("on divise par "), f(`${r}`)]));
  lignes.push(ligne(`=${N - 1}`));
  lignes.push(ligne(`n=${N - 1}+1`, "on ajoute 1"));
  lignes.push(ligne(`=${N}`));
  return [
    utilise(sq, [t("On isole (n − 1), puis n : un rang est un entier positif.")]),
    calcul(sq, lignes),
    resultat(sq, reponse(exercice, "resoudreRangN")),
    verification(sq, [t("On recalcule le terme de rang " + N + " :")], [ligne(`${u(N)}=${n(u1)}+${N - 1}\\times ${par(r)}`), ligne(`=${somme(u1, (N - 1) * r)}`), ligne(`=${k}`, "c'est la valeur donnée ✓")]),
    piege(sq, [t("On trouve d'abord n − 1 : ne pas oublier d'ajouter 1 pour obtenir le rang n.")]),
  ];
}

// ============================================================================
// Assemblage.
// ============================================================================

function etape(exercice: E, phase: PhaseSuiteArithmetique, sq: string): EtapeCorrection[] {
  switch (phase) {
    case "trouverR":
      return exercice.famille === "principal" ? etapeTrouverR(exercice, sq) : [];
    case "trouverU1":
      return etapeTrouverU1(base(exercice), sq);
    case "formuleGenerale":
      return etapeFormule(base(exercice), sq);
    case "termesProches":
      return etapeTermesProches(base(exercice), sq);
    case "termeEloigne":
      return etapeTermeEloigne(base(exercice), sq);
    case "sommeSn":
      return etapeSomme(base(exercice), sq);
    case "coherenceJugement":
      return exercice.famille === "coherence" ? etapeCoherence(exercice, sq) : [];
    case "calculerSn":
      return exercice.famille === "algebriqueSommeSn" ? etapeCalculerSn(exercice, sq) : [];
    case "poserEquationAlgebrique":
      return exercice.famille === "algebriqueTermeGeneral" || exercice.famille === "algebriqueSommeSn" ? etapePoser(exercice, sq) : [];
    case "resoudreXAlgebrique":
      return exercice.famille === "algebriqueTermeGeneral" || exercice.famille === "algebriqueSommeSn" ? etapeResoudre(exercice, sq) : [];
    case "calculerTermesAlgebrique":
      return exercice.famille === "algebriqueTermeGeneral" || exercice.famille === "algebriqueSommeSn" ? etapeCalculerTermes(exercice, sq) : [];
    case "poserEquationRangN":
      return exercice.famille === "algebriqueRangN" ? etapePoserRangN(exercice, sq) : [];
    case "resoudreRangN":
      return exercice.famille === "algebriqueRangN" ? etapeResoudreRangN(exercice, sq) : [];
  }
}

/** Corrigé détaillé : une étape par phase de `phases` (étapes papier par défaut ; l'appli passe
 * `ordreComplet(exercice)`, la séquence de ses écrans), lettre = rang dans `phases`. */
export function correctionDetailleeSuiteArithmetique(exercice: E, phases: PhaseSuiteArithmetique[] = etapesPapierSuiteArithmetique(exercice)): EtapeCorrection[] {
  return phases.flatMap((phase, i) => etape(exercice, phase, LETTRES[i]));
}

