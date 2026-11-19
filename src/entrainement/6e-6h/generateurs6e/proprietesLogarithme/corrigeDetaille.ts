import type { ExerciceProprieteLogarithme } from "../../core6e/proprietesLogarithme.types";
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import type { Caracteristique, EtatDecomposition, Fraction, Noeud } from "../../core6e/decompositionLogarithme";
import { arbreVersLatexLogA, calculerEtatsArgument, etatVersLatex, etatVersLatexAvecLogPendant, resteVersLatexLogA } from "../../core6e/decompositionLogarithme";
import { caracteristiqueDeLEtape, nombreEtapesAlgebriques } from "../../moteur6e/typesProprietesLogarithme";
import { FORMULE_PROPRIETE, formatReponseAttenduePhaseLatex, membreGaucheCorrigeLatex, nomProprieteDeLEtape, phaseTransformationDeLEtape } from "../../ui6e/formatProprietesLogarithme";
import { COURS_PROPRIETES, finaliserCorrige } from "../../ui6e/corrigeLogarithmes1";
import { sansRepetition } from "../../ui6e/corrigeIntegrales1";

/**
 * Corrigé détaillé « comme au tableau » de `6gen13` (propriétés du logarithme) — règle
 * `.claude/rules/feuilles-evaluations.md`. SOURCE UNIQUE : importé par l'adaptateur papier
 * (`exportEvaluation.ts`) ET par l'appli (`App6gen13.tsx`, corrigé d'une étape échouée). Une étape
 * (lettre a, b, c…) = une étape algébrique (écran de choix + écran de transformation à l'écran).
 * Chaque étape : la propriété appliquée au logarithme qui reste, écrite sur l'expression entière,
 * puis (coefficient à distribuer / à regrouper), puis les logarithmes connus remplacés par m, n, q,
 * puis la partie encore à décomposer notée r — la dernière ligne est la réponse de l'écran
 * (`formatReponseAttenduePhaseLatex`), le membre de gauche celui du corrigé historique
 * (`membreGaucheCorrigeLatex`).
 */

const LETTRE_VALEUR: Record<string, string> = { M: "m", N: "n", P: "q" };

interface Partie {
  coef: Fraction;
  nom: string;
}

function fracL(f: Fraction): string {
  return f.den === 1 ? `${f.num}` : `\\dfrac{${f.num}}{${f.den}}`;
}

function mul(f: Fraction, num: number, den = 1): Fraction {
  const n = f.num * num;
  const d = f.den * den;
  const g = pgcd(Math.abs(n), Math.abs(d)) || 1;
  const s = d < 0 ? -1 : 1;
  return { num: (s * n) / g, den: (s * d) / g };
}

function pgcd(a: number, b: number): number {
  return b === 0 ? a : pgcd(b, a % b);
}

/** Même rendu que `etatVersLatex` (coefficients ±1 implicites, « \cdot » devant le nom). */
function rendre(parties: Partie[]): string {
  return parties
    .map((p, i) => {
      const neg = p.coef.num < 0;
      const abs: Fraction = { num: Math.abs(p.coef.num), den: p.coef.den };
      const corps = abs.num === 1 && abs.den === 1 ? p.nom : `${fracL(abs)}\\cdot ${p.nom}`;
      return i === 0 ? (neg ? `-${corps}` : corps) : ` ${neg ? "-" : "+"} ${corps}`;
    })
    .join("");
}

const logDe = (n: Noeud) => arbreVersLatexLogA(n);
const estUn = (f: Fraction) => f.num === 1 && f.den === 1;

function termesConnus(etat: EtatDecomposition): Partie[] {
  return etat.termes.map((t) => ({ coef: t.coefficient, nom: t.nom }));
}

/** « log_a(N) = n » (et « log_a(M) = m ») en fragments. */
function justifConnus(noms: string[]): FragmentConsigne[] {
  const f: FragmentConsigne[] = [];
  noms.forEach((v, i) => {
    if (i > 0) f.push(texte(" et "));
    f.push(latex(`\\log_a(${v})=${LETTRE_VALEUR[v]}`));
  });
  return f;
}

/** Lignes de l'étape algébrique `etape` (caractéristique d'argument). `seulReste` : la chaîne ne
 * porte que sur le logarithme qui reste (c·log_a(R)), sans les termes déjà extraits — utilisé quand la
 * chaîne complète serait trop longue pour sa ligne (voir `calculsArgument`). */
function lignesArgument(exercice: ExerciceProprieteLogarithme, etape: number, seulReste = false): LigneCalcul[] {
  const etats = calculerEtatsArgument(exercice.arbre);
  const avant = etats[etape];
  const R = avant.reste as Exclude<Noeud, { kind: "var" }>;
  const c = avant.coefficientReste;
  const T = seulReste ? [] : termesConnus(avant);
  const gauche = seulReste ? rendre([{ coef: c, nom: logDe(R) }]) : membreGaucheCorrigeLatex(exercice, etape);
  const prefixe = T.length ? `${rendre(T)} + ` : "";
  const lignes: LigneCalcul[] = [];
  const nom = nomProprieteDeLEtape(exercice, etape).toLowerCase();
  let interieur: Noeud;
  let partiesLog: Partie[];
  let partiesLettres: Partie[];
  const connus: string[] = [];
  if (R.kind === "produit" || R.kind === "quotient") {
    const s = R.kind === "produit" ? 1 : -1;
    const V = R.droite as Extract<Noeud, { kind: "var" }>;
    interieur = R.gauche;
    const somme = `${logDe(R.gauche)} ${s > 0 ? "+" : "-"} ${logDe(V)}`;
    lignes.push(ligne(`${gauche}=${prefixe}${estUn(c) ? somme : `${fracL(c)}\\cdot(${somme})`}`, nom));
    partiesLog = [...T, { coef: mul(c, s), nom: logDe(V) }, { coef: c, nom: logDe(R.gauche) }];
    partiesLettres = [...T, { coef: mul(c, s), nom: LETTRE_VALEUR[V.nom] }];
    if (estUn(c)) connus.push(V.nom);
    else {
      // Valeur connue remplacée AVANT de distribuer : lignes plus courtes (la ligne distribuée
      // « −2·log_a(P) + 2·log_a(∛M·N) » passait à la ligne dans sa cellule à 680 px).
      lignes.push(ligne(`=${prefixe}${fracL(c)}\\cdot(${logDe(R.gauche)} ${s > 0 ? "+" : "-"} ${LETTRE_VALEUR[V.nom]})`, justifConnus([V.nom])));
      lignes.push(ligne(`=${rendre([...partiesLettres, { coef: c, nom: logDe(R.gauche) }])}`, [texte("on distribue "), latex(fracL(c))]));
    }
  } else if (R.kind === "puissance") {
    interieur = R.interieur;
    lignes.push(ligne(`${gauche}=${prefixe}${estUn(c) ? "" : `${fracL(c)}\\cdot `}${R.p}\\cdot ${logDe(R.interieur)}`, nom));
    const c2 = mul(c, R.p);
    partiesLog = [...T, { coef: c2, nom: logDe(R.interieur) }];
    if (!estUn(c)) lignes.push(ligne(`=${rendre(partiesLog)}`, [texte("on multiplie les coefficients : "), latex(`${fracL(c)}\\cdot ${R.p}=${fracL(c2)}`)]));
    partiesLettres = [...T];
  } else {
    interieur = R.interieur;
    lignes.push(ligne(`${gauche}=${prefixe}${estUn(c) ? "" : `${fracL(c)}\\cdot `}\\dfrac{${logDe(R.interieur)}}{${R.k}}`, nom));
    const c2 = mul(c, 1, R.k);
    partiesLog = [...T, { coef: c2, nom: logDe(R.interieur) }];
    lignes.push(
      ligne(
        `=${rendre(partiesLog)}`,
        estUn(c) ? [texte("diviser par "), latex(`${R.k}`), texte(", c'est multiplier par "), latex(`\\dfrac{1}{${R.k}}`)] : [texte("on regroupe les coefficients : "), latex(`\\dfrac{${fracL(c)}}{${R.k}}=${fracL(c2)}`)],
      ),
    );
    partiesLettres = [...T];
  }
  const cInt = partiesLog[partiesLog.length - 1].coef;
  if (interieur.kind === "var") {
    connus.push(interieur.nom);
    partiesLettres.push({ coef: cInt, nom: LETTRE_VALEUR[interieur.nom] });
    lignes.push(ligne(`=${rendre(partiesLettres)}`, justifConnus(connus)));
  } else {
    partiesLettres.push({ coef: cInt, nom: logDe(interieur) });
    if (connus.length) lignes.push(ligne(`=${rendre(partiesLettres)}`, justifConnus(connus)));
    lignes.push(ligne(`=${seulReste ? rendre([...partiesLettres.slice(0, -1), { coef: cInt, nom: "r" }]) : etatVersLatex(etats[etape + 1])}`, [texte("on note "), latex(`r=${logDe(interieur)}`)]));
  }
  // Logarithme d'une seule lettre : parenthèses simples (« \log_a(M) », plus court qu'un groupe
  // « \left…\right » : la ligne passait sinon à la ligne dans sa cellule).
  return sansRepetition(lignes.map((l) => ({ ...l, latex: court(l.latex) })));
}

const court = (t: string) => t.replace(/\\log_a\\!\\left\(([MNP])\\right\)/g, "\\log_a($1)");

/** Longueur « visible » approximative d'une formule (commandes et accolades retirées). */
function longueurVisible(t: string): number {
  let u = t.replace(/\\left|\\right|\\!|\s/g, "").replace(/\\log_a/g, "log").replace(/\\cdot/g, "·");
  // une fraction occupe la largeur de son plus long terme
  for (let i = 0; i < 4; i++) u = u.replace(/\\dfrac\{([^{}]*)\}\{([^{}]*)\}/g, (_m, a: string, b: string) => (a.length >= b.length ? a : b));
  return u.replace(/\\sqrt\[(\d)\]/g, "√").replace(/\\[a-zA-Z]+/g, "x").replace(/[{}]/g, "").length;
}

/** Au-delà, la chaîne complète passait à la ligne dans sa cellule (membre de gauche long). */
const LONGUEUR_MAX = 28;

/** Blocs « Calcul » de l'étape : la chaîne complète, ou — si elle serait trop longue — la propriété
 * appliquée au seul logarithme qui reste, puis l'expression complète où on la remplace. */
function calculsArgument(exercice: ExerciceProprieteLogarithme, etape: number, sq: string): EtapeCorrection[] {
  const complet = lignesArgument(exercice, etape);
  const etats = calculerEtatsArgument(exercice.arbre);
  const avant = etats[etape];
  const gauche = court(membreGaucheCorrigeLatex(exercice, etape));
  const tropLong = complet.some((l) => longueurVisible(l.latex.startsWith("=") ? `${gauche}${l.latex}` : l.latex) > LONGUEUR_MAX);
  if (!tropLong || avant.termes.length === 0) return [calcul(sq, complet)];
  const reste = lignesArgument(exercice, etape, true);
  const logA = arbreVersLatexLogA(exercice.arbre);
  const fin = reste[reste.length - 1].latex.replace(/^=/, "");
  const T = rendre(termesConnus(avant));
  return [
    calcul(sq, reste, [texte("Sur le logarithme qui reste :")]),
    calcul(sq, [ligne(`${logA}=${gauche}`, "étape précédente"), ligne(`=${T} ${fin.startsWith("-") ? "" : "+ "}${fin}`, "on remplace"), ...(etatVersLatex(etats[etape + 1]).replace(/\s/g, "") === `${T}${fin.startsWith("-") ? "" : "+"}${fin}`.replace(/\s/g, "") ? [] : [ligne(`=${etatVersLatex(etats[etape + 1])}`, "on ordonne les termes")])], [texte("Dans l'expression complète :")]),
  ];
}

/** Piège de l'exercice et l'étape où il se joue (même priorité que le corrigé historique). */
function piegeEtEtape(exercice: ExerciceProprieteLogarithme): { etape: number; fragments: FragmentConsigne[] } {
  const total = nombreEtapesAlgebriques(exercice);
  const etats = calculerEtatsArgument(exercice.arbre);
  const caract = (e: number) => caracteristiqueDeLEtape(exercice, e);
  const trouver = (c: Caracteristique) => Array.from({ length: total }, (_, e) => e).find((e) => caract(e) === c);
  const distribution = Array.from({ length: etats.length - 1 }, (_, e) => e).find((e) => (etats[e].reste?.kind === "produit" || etats[e].reste?.kind === "quotient") && !estUn(etats[e].coefficientReste));
  if (distribution !== undefined) {
    return { etape: distribution, fragments: [texte("Le coefficient déjà sorti multiplie tout ce qui reste : quand on décompose ensuite le produit ou le quotient, il s'applique aux deux termes, pas seulement au premier.")] };
  }
  const cb = trouver("changementBase");
  if (cb !== undefined) return { etape: cb, fragments: [texte("On multiplie toute l'expression obtenue en base a par "), latex(`c=\\log_${exercice.b}(a)`), texte(" — pas par "), latex(`\\log_a(${exercice.b})`), texte(", et pas seulement le premier terme.")] };
  const ra = trouver("racine");
  if (ra !== undefined) return { etape: ra, fragments: [texte("La racine k-ième est une puissance d'exposant "), latex("\\dfrac{1}{k}"), texte(" : on divise le logarithme par k, on ne le multiplie pas.")] };
  const qu = trouver("quotient");
  if (qu !== undefined) return { etape: qu, fragments: [texte("Le logarithme d'un quotient est une différence : "), latex("\\log_a\\!\\left(\\dfrac{X}{Y}\\right)\\neq\\dfrac{\\log_a(X)}{\\log_a(Y)}"), texte(".")] };
  return { etape: trouver("produit") ?? 0, fragments: [texte("Le logarithme d'un produit est une somme : "), latex("\\log_a(X\\cdot Y)\\neq\\log_a(X)\\cdot\\log_a(Y)"), texte(".")] };
}

const OPERATION: Record<Exclude<Caracteristique, "changementBase">, string> = { produit: "un produit", quotient: "un quotient", puissance: "une puissance", racine: "une racine" };

export function correctionDetailleeProprietesLogarithme(exercice: ExerciceProprieteLogarithme): EtapeCorrection[] {
  const etats = calculerEtatsArgument(exercice.arbre);
  const total = nombreEtapesAlgebriques(exercice);
  const logA = arbreVersLatexLogA(exercice.arbre);
  const logB = logA.replace("\\log_a", `\\log_${exercice.b}`);
  const lePiege = piegeEtEtape(exercice);
  const etapes: EtapeCorrection[] = [];
  for (let etape = 0; etape < total; etape++) {
    const sq = String.fromCharCode(97 + etape);
    const caract = caracteristiqueDeLEtape(exercice, etape);
    const reponse = formatReponseAttenduePhaseLatex(exercice, phaseTransformationDeLEtape(exercice, etape))[0];
    if (caract === "changementBase") {
      const V = etatVersLatexAvecLogPendant(etats[etats.length - 1]);
      const Vp = etats[etats.length - 1].termes.length > 1 ? `\\left(${V}\\right)` : V;
      etapes.push(utilise(sq, [texte(`Changement de base ${COURS_PROPRIETES}, appliqué à l'expression entière : `), latex(FORMULE_PROPRIETE.changementBase), texte(".")]));
      etapes.push(
        calcul(sq, [
          ligne(`${logB}=${logA}\\cdot\\log_${exercice.b}(a)`, "changement de base"),
          ligne(`=${Vp}\\cdot\\log_${exercice.b}(a)`, [texte("expression de "), latex(logA), texte(" obtenue à l'étape précédente")]),
          ligne(`=${reponse}`, [latex(`\\log_${exercice.b}(a)=c`)]),
        ]),
      );
      etapes.push(resultat(sq, [latex(`${logB}=${reponse}`)]));
    } else {
      const reste = resteVersLatexLogA(etats[etape]) ?? logA;
      etapes.push(
        utilise(sq, [
          texte("L'opération la plus extérieure de "),
          latex(reste),
          texte(` est ${OPERATION[caract]} : ${nomProprieteDeLEtape(exercice, etape).toLowerCase()} ${COURS_PROPRIETES}, `),
          latex(FORMULE_PROPRIETE[caract]),
          texte("."),
        ]),
      );
      etapes.push(...calculsArgument(exercice, etape, sq));
      const apres = etats[etape + 1];
      const r = apres.reste ? [texte(", où "), latex(`r=${arbreVersLatexLogA(apres.reste)}`)] : [];
      etapes.push(resultat(sq, [latex(`${logA}=${reponse}`), ...r]));
    }
    if (lePiege.etape === etape) etapes.push(piege(sq, lePiege.fragments));
  }
  return finaliserCorrige(etapes);
}
