import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type {
  ExerciceCarresEmboites,
  ExerciceEchiquier,
  ExerciceFibonacci,
  ExercicePapyrusRhind,
  ExerciceSuiteClassique,
  ExerciceSuitesCombinees,
  ExerciceTrianglesZigzag,
  ExerciceVitesse,
} from "../../core5e/suitesClassiques.types";
import { construireSvgCarresMilieux, construireSvgPartageCarre, construireSvgZigzag } from "../../export5e/svgSuiteClassique";
import type { PhaseSuiteClassique } from "../../moteur5e/typesSuiteClassique";
import { ordreComplet } from "../../moteur5e/typesSuiteClassique";
import { formatTermesReponseAttendueLatex, formatTermesSuitesFinalesLatex, texteReponseAttendueQCM } from "../../ui5e/formatSuiteClassique";
import {
  COURS_ARITHMETIQUE,
  COURS_CONVERGENCE,
  COURS_GEOMETRIQUE,
  COURS_PROBLEMES,
  dec,
  decimalExact,
  divise,
  ent,
  fois,
  fr,
  fragmentsListe,
  frT,
  jf,
  lignesArrondi,
  lignesSommeGeometrique,
  memeDenominateur,
  nomIndice,
  moins,
  par,
  plus,
  q,
  versQ,
  type Q,
} from "../../ui5e/corrigeSuites1";

/**
 * Corrigé détaillé « comme au tableau » de 5gen17 (problèmes classiques sur les suites) — règle
 * `.claude/rules/feuilles-evaluations.md`. Une étape par écran (`ordreComplet`, 3 à 5 selon le
 * scénario) : la formule du cours (§ 1, 2, 3, 4), puis le calcul fait au tableau à partir des
 * nombres de l'instance (grains de l'échiquier en puissances de 2, système du papyrus résolu par
 * substitution, équation en r des suites combinées, vitesse en m/s puis km/h, termes de Fibonacci,
 * segments et aires du zigzag en k√3, carrés emboîtés). Les écrans à choix (système, équation,
 * formule de récurrence, 1/φ, limite de (1/p)ⁿ) ont aussi leur « Calcul » : la mise en équation ou
 * la vérification qui justifie le choix. « Résultat » = réponse de l'écran
 * (`formatTermesReponseAttendueLatex`, `texteReponseAttendueQCM`). Figures du zigzag et des carrés
 * sous le résultat. SANS `docx` : importé par l'adaptateur ET par `App5gen17.tsx`.
 */

type E = ExerciceSuiteClassique;
const LETTRES = "abcdefghijklmnopqrstuvwxyz";
const t = texte;
const f = latex;

/** Réponse attendue d'un écran (mêmes fonctions que le récapitulatif de l'appli). */
export function reponseLatexSuiteClassique(exercice: E, phase: PhaseSuiteClassique): string {
  if (phase === "suitesFinalesCombinees" && exercice.scenario === "suitesCombinees") {
    const { arithmetique, geometrique } = formatTermesSuitesFinalesLatex(exercice);
    return `${arithmetique.join(",\\ ")}\\quad;\\quad ${geometrique.join(",\\ ")}`;
  }
  const qcm = texteReponseAttendueQCM(exercice, phase);
  if (qcm !== null) return qcm;
  return (formatTermesReponseAttendueLatex(exercice, phase) ?? []).join(",\\quad ");
}

interface Etape {
  utilise: FragmentConsigne[];
  lignes: LigneCalcul[];
  verif?: { texte: FragmentConsigne[]; lignes: LigneCalcul[] };
  piege?: FragmentConsigne[];
  figure?: string;
  /** Résultat écrit à part (sinon la réponse de l'écran). */
  resultat?: FragmentConsigne[];
}

const sci = (v: number, d = 2): string => {
  const e = Math.floor(Math.log10(Math.abs(v)));
  let m = v / 10 ** e;
  let ex = e;
  if (Math.abs(Math.round(m * 10 ** d) / 10 ** d) >= 10) {
    m /= 10;
    ex += 1;
  }
  return `${dec(m, d)}\\times10^{${ex}}`;
};

const grandEntier = (n: bigint): string => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "\\,");

/** Décimal suivi de « = » ou « ≈ » selon qu'il est exact. */
const egalDec = (v: number, d = 2) => `${decimalExact(v, d) ? "=" : "\\approx "}${dec(v, d)}`;

// ============================================================================
// Échiquier.
// ============================================================================

function echiquier(e: ExerciceEchiquier, phase: PhaseSuiteClassique): Etape {
  const k = e.caseDemandee;
  if (phase === "u64") {
    return {
      utilise: [t("Les nombres de grains forment une suite géométrique de premier terme u₁ = 1 et de raison q = 2 : "), f("u_n=u_1\\times q^{n-1}"), t(` ${COURS_GEOMETRIQUE}.`)],
      lignes: [
        ligne(`u_{${k}}=u_1\\times q^{${k}-1}`, `terme général pour n = ${k}`),
        ligne(`=1\\times 2^{${k - 1}}`, "on remplace u₁ = 1 et q = 2"),
        ligne(`=2^{${k - 1}}`),
        ligne(`=${grandEntier(e.uCase)}`, "calculatrice"),
      ],
      piege: [t("Sur la case n, il y a "), f("2^{n-1}"), t(" grains, et non "), f("2^n"), t(" : la 1re case en porte "), f("2^0=1"), t(".")],
    };
  }
  if (phase === "sommeTotaleEchiquier") {
    return {
      utilise: [t("Somme des n premiers termes d'une suite géométrique : "), f("S_n=u_1\\times\\dfrac{1-q^n}{1-q}"), t(` ${COURS_GEOMETRIQUE}.`)],
      lignes: [
        ligne("S_{64}=u_1\\times\\dfrac{1-q^{64}}{1-q}", "somme des 64 cases"),
        ligne("=1\\times\\dfrac{1-2^{64}}{1-2}", "on remplace u₁ = 1 et q = 2"),
        ligne("=\\dfrac{1-2^{64}}{-1}", "1 − 2 = −1"),
        ligne("=2^{64}-1", "on divise par −1"),
        ligne(`=${grandEntier(e.sommeTotale)}`, "calculatrice"),
      ],
      piege: [t("La somme compte 64 termes : l'exposant est 64, et le résultat est "), f("2^{64}-1"), t(", pas "), f("2^{64}"), t(".")],
    };
  }
  const grammes = Number(e.sommeTotale) * e.poidsGrainGrammes;
  const tonnes = e.poidsTotalTonnes;
  const facteur = e.facteurComparaison;
  return {
    utilise: [t("Masse totale = nombre de grains × masse d'un grain ; puis "), f("1\\ \\text{t}=10^6\\ \\text{g}"), t(" ; enfin on divise par la production mondiale (environ "), f("8\\times10^{8}\\ \\text{t}"), t(").")],
    lignes: [
      ligne(`m=(2^{64}-1)\\times ${dec(e.poidsGrainGrammes)}`, "masse en grammes : grains × masse d'un grain"),
      ligne(`\\approx ${sci(grammes, 3)}\\ \\text{g}`),
      ligne(`M=\\dfrac{m}{10^{6}}`, "masse en tonnes : 1 t = 10⁶ g"),
      ligne(`\\approx\\dfrac{${sci(grammes, 3)}}{10^{6}}`),
      ligne(`\\approx ${sci(tonnes)}\\ \\text{t}`),
      ligne(`\\dfrac{M}{8\\times10^{8}}\\approx\\dfrac{${sci(tonnes, 3)}}{8\\times10^{8}}`, "on compare à la production mondiale"),
      ligne(`\\approx ${Math.round(facteur)}`, "arrondi à l'unité"),
    ],
    piege: [t("On convertit les grammes en tonnes en divisant par "), f("10^6"), t(", puis on divise par la production : on obtient un nombre de fois, sans unité.")],
  };
}

// ============================================================================
// Papyrus de Rhind.
// ============================================================================

function papyrus(e: ExercicePapyrusRhind, phase: PhaseSuiteClassique): Etape {
  const S = e.sommeTotale;
  const k = e.facteur;
  const a = versQ(e.a);
  const D = versQ(e.delta);
  if (phase === "poserSysteme") {
    return {
      utilise: [t("Les 5 parts forment une suite arithmétique : "), f("u_n=a+(n-1)\\Delta"), t(`. On traduit la somme des parts, puis la règle du partage ${COURS_ARITHMETIQUE}.`)],
      lignes: [
        ligne(`u_1+u_2=a+(a+\\Delta)`, "les 2 plus petites parts"),
        ligne(`=2a+\\Delta`, "on regroupe"),
        ligne(`u_3+u_4+u_5=(a+2\\Delta)+(a+3\\Delta)+(a+4\\Delta)`, "les 3 plus grandes parts"),
        ligne(`=3a+9\\Delta`, "on regroupe"),
        ligne(`5a+10\\Delta=${S}`, "somme des 5 parts : (2a + Δ) + (3a + 9Δ)"),
        ligne(`3a+9\\Delta=${k}(2a+\\Delta)`, `règle du partage : u₃ + u₄ + u₅ = ${k}(u₁ + u₂)`),
      ],
      piege: [t("Les 2 plus petites parts sont u₁ et u₂ : c'est la somme des 3 plus grandes qui vaut "), f(`${k}`), t(" fois celle des 2 plus petites, pas l'inverse.")],
    };
  }
  if (phase === "resoudreSysteme") {
    const s5 = S / 5;
    const c1 = 2 * k - 3;
    const c2 = 9 - k;
    const deuxC1 = 2 * c1;
    return {
      utilise: [t("Système de deux équations du premier degré : on simplifie la règle, on isole a dans la somme, puis on substitue.")],
      lignes: [
        ligne(`${k}(2a+\\Delta)=3a+9\\Delta`, "règle du partage (étape 1)"),
        ligne(`${2 * k}a+${k}\\Delta=3a+9\\Delta`, "on distribue"),
        ligne(`${c1}a=${c2}\\Delta`, "on regroupe les a à gauche, les Δ à droite"),
        ligne(`5a+10\\Delta=${S}`, "somme des parts (étape 1)"),
        ligne(`a+2\\Delta=${s5}`, "on divise par 5"),
        ligne(`a=${s5}-2\\Delta`, "on isole a"),
        ligne(`${c1}(${s5}-2\\Delta)=${c2}\\Delta`, "on remplace a dans la règle simplifiée"),
        ligne(`${c1 * s5}-${deuxC1}\\Delta=${c2}\\Delta`, "on distribue"),
        ligne(`${c1 * s5}=${c2 + deuxC1}\\Delta`, [t("on ajoute "), f(`${deuxC1}\\Delta`), t(" aux deux membres")]),
        ligne(`\\Delta=\\dfrac{${c1 * s5}}{${c2 + deuxC1}}`, `on divise par ${c2 + deuxC1}`),
        ...(`\\dfrac{${c1 * s5}}{${c2 + deuxC1}}` !== fr(D) ? [ligne(`=${fr(D)}`, "on simplifie")] : []),
        ...lignesArrondi(D),
        ligne(`a=${s5}-2\\times ${par(D)}`, "on remplace Δ"),
        ...(memeDenominateur(ent(s5), fois(ent(-2), D)) ? [ligne(`=${memeDenominateur(ent(s5), fois(ent(-2), D))}`, "même dénominateur")] : []),
        ligne(`=${fr(a)}`),
        ...lignesArrondi(a),
      ],
      verif: { texte: [t("On remplace dans la somme des parts :")], lignes: [ligne(`5a+10\\Delta=5\\times ${par(a)}+10\\times ${par(D)}`), ligne(`=${fr(fois(ent(5), a))}+${fr(fois(ent(10), D))}`), ligne(`=${S}`, "✓")] },
    };
  }
  const parts = e.termes.map(versQ);
  const lignes: LigneCalcul[] = [ligne(`u_1=a`, "la plus petite part"), ligne(`=${fr(parts[0])}`), ...lignesArrondi(parts[0])];
  for (let i = 1; i < 5; i++) {
    lignes.push(ligne(`u_${i + 1}=${fr(parts[i - 1])}+${fr(D)}`, "on ajoute Δ à la part précédente"));
    const md = memeDenominateur(parts[i - 1], D);
    if (md) lignes.push(ligne(`=${md}`, "même dénominateur"));
    lignes.push(ligne(`=${fr(parts[i])}`));
    lignes.push(...lignesArrondi(parts[i]));
  }
  const s2 = plus(parts[0], parts[1]);
  const s3 = plus(plus(parts[2], parts[3]), parts[4]);
  return {
    utilise: [t("Chaque part s'obtient en ajoutant Δ à la précédente, en partant de a : "), f("u_{n+1}=u_n+\\Delta"), t(` ${COURS_ARITHMETIQUE}.`)],
    lignes,
    verif: {
      texte: [t("La règle du partage est respectée :")],
      lignes: [ligne(`u_3+u_4+u_5=${fr(s3)}`), ligne(`${k}(u_1+u_2)=${k}\\times ${par(s2)}`), ligne(`=${fr(fois(ent(k), s2))}`, "même valeur ✓")],
    },
  };
}

// ============================================================================
// Suites combinées.
// ============================================================================

function combinees(e: ExerciceSuitesCombinees, phase: PhaseSuiteClassique): Etape {
  const P = e.produitXYZ;
  const x = e.x;
  const m = e.premierTerme;
  if (phase === "poserEquationCombinees") {
    return {
      utilise: [t("y, x, z est une suite géométrique : x est la moyenne géométrique de y et z, "), f("x^2=yz"), t(` ${COURS_GEOMETRIQUE}.`)],
      lignes: [ligne(`x\\cdot y\\cdot z=${P}`, "donnée"), ligne(`x\\cdot(yz)=${P}`, "on regroupe y et z"), ligne(`x\\cdot x^2=${P}`, "car yz = x²"), ligne(`x^3=${P}`)],
      piege: [t("Comme "), f("x^2=yz"), t(", le produit "), f("x\\cdot y\\cdot z"), t(" vaut "), f("x^3"), t(" — et non "), f("x^2"), t(".")],
    };
  }
  if (phase === "resoudreRCombinees") {
    const r = e.r;
    return {
      utilise: [t("m, y, z est une suite arithmétique de raison r : "), f(`y=${m}+r`), t(" et "), f(`z=${m}+2r`), t(" ; on remplace dans "), f("x^2=yz"), t(` ${COURS_ARITHMETIQUE}.`)],
      lignes: [
        ligne(`x=\\sqrt[3]{${P}}`, "on résout x³ = " + `${P}`.replace("-", "−")),
        ligne(`=${x}`),
        ligne(`x^2=yz`, "suite géométrique y, x, z"),
        ligne(`${par(x)}^2=(${m}+r)(${m}+2r)`, "on remplace x, y et z"),
        ligne(`${x * x}=${m * m}${3 * m < 0 ? "" : "+"}${3 * m}r+2r^2`, "on développe"),
        ligne(`0=${3 * m}r+2r^2`, `on retire ${x * x} des deux membres`),
        ligne(`0=r(2r${3 * m < 0 ? "" : "+"}${3 * m})`, "mise en évidence de r"),
        ligne(`r=0`, "rejeté : suite constante"),
        ligne(`2r${3 * m < 0 ? "" : "+"}${3 * m}=0`, "l'autre facteur s'annule"),
        ligne(`r=\\dfrac{${-3 * m}}{2}`, "on isole r"),
        ligne(`=${r}`),
      ],
      piege: [f("r=0"), t(" est aussi solution de l'équation, mais donne une suite constante : on la rejette.")],
    };
  }
  const [, y, z] = e.arithmetique;
  return {
    utilise: [t("Avec x et r trouvés, y et z s'obtiennent en ajoutant r puis 2r au premier terme : "), f(`y=${m}+r`), t(", "), f(`z=${m}+2r`), t(` ${COURS_ARITHMETIQUE}.`)],
    lignes: [ligne(`y=${m}+${par(e.r)}`, "on remplace r"), ligne(`=${y}`), ligne(`z=${m}+2\\times ${par(e.r)}`, "on remplace r"), ligne(`=${z}`)],
    verif: { texte: [t("y, x, z est bien géométrique et le produit vaut la donnée :")], lignes: [ligne(`yz=${par(y)}\\times ${par(z)}`), ligne(`=${y * z}`, "c'est x² ✓"), ligne(`xyz=${par(x)}\\times ${par(y * z)}`), ligne(`=${P}`, "✓")] },
  };
}

// ============================================================================
// Vitesse.
// ============================================================================

function vitesse(e: ExerciceVitesse, phase: PhaseSuiteClassique): Etape {
  const n = e.n;
  if (phase === "distance11") {
    return {
      utilise: [t("Les distances parcourues chaque seconde forment une suite arithmétique : "), f("u_n=u_1+(n-1)r"), t(` ${COURS_ARITHMETIQUE}.`)],
      lignes: [
        ligne(`u_{${n}}=u_1+(${n}-1)r`, `terme général pour n = ${n}`),
        ligne(`=${dec(e.u1)}+${n - 1}\\times ${dec(e.r)}`, "on remplace u₁ et r"),
        ligne(`=${dec(e.u1)}+${dec((n - 1) * e.r)}`, "on multiplie"),
        ligne(`=${dec(e.distanceN)}\\ \\text{m}`),
      ],
      piege: [f("u_n=u_1+(n-1)\\,r"), t(", et non "), f("u_1+n\\,r"), t(" : il y a n − 1 ajouts de r entre u₁ et uₙ.")],
    };
  }
  if (phase === "sommeTotale11") {
    const interieur = 2 * e.u1 + (n - 1) * e.r;
    return {
      utilise: [t("Distance totale = somme des n premiers termes d'une suite arithmétique : "), f("S_n=\\dfrac{n}{2}(2u_1+(n-1)r)"), t(` ${COURS_ARITHMETIQUE}.`)],
      lignes: [
        ligne(`S_{${n}}=\\dfrac{${n}}{2}(2u_1+(${n}-1)r)`, `somme des ${n} premiers termes`),
        ligne(`=\\dfrac{${n}}{2}(2\\times ${dec(e.u1)}+${n - 1}\\times ${dec(e.r)})`, "on remplace u₁ et r"),
        ligne(`=\\dfrac{${n}}{2}(${dec(2 * e.u1)}+${dec((n - 1) * e.r)})`, "on multiplie dans la parenthèse"),
        ligne(`=\\dfrac{${n}}{2}\\times ${dec(interieur)}`, "on réduit la parenthèse"),
        ligne(`=${dec(e.sommeTotaleN)}\\ \\text{m}`),
      ],
      verif: {
        texte: [t("Autre écriture : "), f("S_n=\\dfrac{n}{2}(u_1+u_n)"), t(", avec "), f(`u_{${n}}=${dec(e.distanceN)}`), t(" :")],
        lignes: [ligne(`\\dfrac{${n}}{2}(u_1+u_{${n}})=\\dfrac{${n}}{2}\\times(${dec(e.u1)}+${dec(e.distanceN)})`), ligne(`=${dec(e.sommeTotaleN)}`, "même résultat ✓")],
      },
    };
  }
  return {
    utilise: [t("Vitesse moyenne = distance ÷ durée (en mètres par seconde), puis "), f("1\\ \\text{m/s}=3{,}6\\ \\text{km/h}"), t(" : on multiplie par 3,6.")],
    lignes: [
      ligne(`\\dfrac{S_{${n}}}{${n}}=\\dfrac{${dec(e.sommeTotaleN)}}{${n}}`, `distance totale ÷ ${n} s`),
      ligne(`${egalDec(e.sommeTotaleN / n, 3)}\\ \\text{m/s}`),
      ligne(`\\dfrac{S_{${n}}}{${n}}\\times3{,}6=\\dfrac{${dec(e.sommeTotaleN)}}{${n}}\\times3{,}6`, jf("conversion en ", { l: "\\text{km/h}" })),
      ligne(`\\approx ${Math.round(e.vitesseMoyenneTotaleKmH)}\\ \\text{km/h}`, "arrondi à l'unité"),
      ligne(`u_{${n}}\\times3{,}6=${dec(e.distanceN)}\\times3{,}6`, jf(`la ${n}ᵉ seconde dure 1 s : `, { l: `${dec(e.distanceN)}\\ \\text{m/s}` })),
      ligne(`${egalDec(e.vitesseDerniereSecondeKmH, 3)}`),
      ...(decimalExact(e.vitesseDerniereSecondeKmH, 0) ? [] : [ligne(`\\approx ${Math.round(e.vitesseDerniereSecondeKmH)}\\ \\text{km/h}`, "arrondi à l'unité")]),
    ],
    piege: [t("Pour passer des mètres par seconde aux kilomètres par heure, on multiplie par 3,6 (on ne divise pas).")],
  };
}

// ============================================================================
// Fibonacci.
// ============================================================================

function fibonacci(e: ExerciceFibonacci, phase: PhaseSuiteClassique): Etape {
  const T = e.dixPremiersTermes;
  if (phase === "dixTermes") {
    const lignes: LigneCalcul[] = [ligne(`u_1=${T[0]}`, "donné"), ligne(`u_2=${T[1]}`, "donné")];
    for (let i = 2; i < 10; i++) {
      lignes.push(ligne(`u_{${i + 1}}=${T[i - 2]}+${T[i - 1]}`, `${nomIndice("u", i - 1)} + ${nomIndice("u", i)}`));
      lignes.push(ligne(`=${T[i]}`));
    }
    return {
      utilise: [t("Chaque terme est la somme des deux précédents : "), f("u_n=u_{n-2}+u_{n-1}"), t(` ${COURS_PROBLEMES}.`)],
      lignes,
    };
  }
  if (phase === "formuleRecurrence") {
    return {
      utilise: [t("On observe comment chaque terme se construit à partir des termes déjà calculés.")],
      lignes: [
        ligne(`${T[2]}=${T[0]}+${T[1]}`, "u₃ = u₁ + u₂"),
        ligne(`${T[3]}=${T[1]}+${T[2]}`, "u₄ = u₂ + u₃"),
        ligne(`${T[4]}=${T[2]}+${T[3]}`, "u₅ = u₃ + u₄"),
        ligne("u_n=u_{n-2}+u_{n-1}", "chaque terme est la somme des deux précédents"),
      ],
      verif: { texte: [t("Les autres choix ne marchent pas : par exemple, doubler u₃ donne "), f(`2u_3=${2 * T[2]}`), t(", alors que "), f(`u_4=${T[3]}`), t(".")], lignes: [] },
    };
  }
  if (phase === "calculV5") {
    const k = e.rangRapport;
    return {
      utilise: [t("On lit les deux termes parmi les dix termes déjà trouvés, puis on divise : "), f(`v_{${k}}=\\dfrac{u_{${k + 1}}}{u_{${k}}}`), t(".")],
      lignes: [ligne(`v_{${k}}=\\dfrac{u_{${k + 1}}}{u_{${k}}}`, "définition du rapport"), ligne(`=\\dfrac{${T[k]}}{${T[k - 1]}}`, "on remplace"), ligne(`${egalDec(e.vk)}`, "arrondi au centième")],
      piege: [t("C'est le terme suivant divisé par le terme précédent, pas l'inverse.")],
    };
  }
  if (phase === "resoudrePhi") {
    return {
      utilise: [t("Équation du second degré "), f("ax^2+bx+c=0"), t(" : "), f("\\Delta=b^2-4ac"), t(", puis "), f("x=\\dfrac{-b\\pm\\sqrt{\\Delta}}{2a}"), t(" ; φ est la racine positive.")],
      lignes: [
        ligne("x^2=x+1", "équation donnée"),
        ligne("x^2-x-1=0", "on ramène tout dans le membre de gauche"),
        ligne("\\Delta=(-1)^2-4\\times1\\times(-1)", "a = 1, b = −1, c = −1"),
        ligne("=5"),
        ligne("x_1=\\dfrac{1-\\sqrt5}{2}", "première racine"),
        ligne("\\approx -0{,}62", "négative : rejetée"),
        ligne("x_2=\\dfrac{1+\\sqrt5}{2}", "seconde racine"),
        ligne("\\approx 1{,}62", "positive : c'est φ"),
      ],
      piege: [t("L'équation a deux racines ; φ est la racine positive.")],
    };
  }
  return {
    utilise: [t("φ est solution de "), f("x^2=x+1"), t(", donc "), f("\\varphi^2=\\varphi+1"), t(" ; on divise les deux membres par φ (non nul).")],
    lignes: [
      ligne("\\varphi^2=\\varphi+1", "φ vérifie l'équation"),
      ligne("\\dfrac{\\varphi^2}{\\varphi}=\\dfrac{\\varphi+1}{\\varphi}", "on divise par φ"),
      ligne("\\varphi=1+\\dfrac{1}{\\varphi}", "on simplifie"),
      ligne("\\dfrac{1}{\\varphi}=\\varphi-1", "on isole 1/φ"),
    ],
    verif: { texte: [t("Avec les valeurs approchées :")], lignes: [ligne("\\varphi-1\\approx 0{,}62"), ligne("\\dfrac{1}{\\varphi}\\approx\\dfrac{1}{1{,}618}"), ligne("\\approx 0{,}62", "✓")] },
  };
}

// ============================================================================
// Triangles en zigzag.
// ============================================================================

/** k√3 écrit exactement (k rationnel). */
function r3(k: Q): string {
  if (k.num === k.den) return "\\sqrt3";
  return `${fr(k)}\\sqrt3`;
}

/** Même écriture en `\\frac` (à l'intérieur d'une fraction). */
function r3T(k: Q): string {
  if (k.num === k.den) return "\\sqrt3";
  return `${frT(k)}\\sqrt3`;
}

function zigzag(e: ExerciceTrianglesZigzag, phase: PhaseSuiteClassique): Etape {
  const c = e.cote;
  const l1 = q(c, 2);
  const longueurs = [1, 2, 3, 4].map((i) => q(c, 2 ** i));
  if (phase === "hauteursZigzag") {
    const lignes: LigneCalcul[] = [
      ligne(`\\ell_1=\\dfrac{c\\sqrt3}{2}`, "hauteur d'un triangle équilatéral de côté c"),
      ligne(`=\\dfrac{${c}\\sqrt3}{2}`, `c = ${c}`),
      ligne(`=${r3(l1)}`),
      ligne(`\\approx ${dec(c * Math.sqrt(3) / 2)}`, "arrondi au centième"),
    ];
    for (let i = 1; i < 4; i++) {
      lignes.push(ligne(`\\ell_${i + 1}=\\ell_${i}\\times\\dfrac{1}{2}`, "chaque segment mesure la moitié du précédent"));
      lignes.push(ligne(`=${r3(longueurs[i])}`));
      lignes.push(ligne(`\\approx ${dec((valeurQ(longueurs[i])) * Math.sqrt(3))}`));
    }
    return {
      utilise: [t("BH₁ est une hauteur du triangle équilatéral : "), f("\\ell_1=\\dfrac{c\\sqrt3}{2}"), t(". Dans chaque triangle rectangle Tₖ, l'angle en C vaut 60° : "), f("\\cos 60^\\circ=\\dfrac{1}{2}"), t(`, donc chaque segment mesure la moitié du précédent (suite géométrique de raison 1/2) ${COURS_GEOMETRIQUE}.`)],
      lignes,
      figure: construireSvgZigzag(e),
    };
  }
  if (phase === "longueurZigzag") {
    return {
      utilise: [t("Les longueurs forment une suite géométrique de raison "), f("q=\\dfrac{1}{2}"), t(" ; comme |q| < 1, la somme infinie existe : "), f("S_\\infty=\\dfrac{u_1}{1-q}"), t(` ${COURS_CONVERGENCE}.`)],
      lignes: [
        ligne("L_\\infty=\\dfrac{\\ell_1}{1-q}", "somme infinie des segments"),
        ligne(`=\\dfrac{${r3(l1)}}{1-\\frac{1}{2}}`, "on remplace ℓ₁ et q"),
        ligne(`=\\dfrac{${r3(l1)}}{\\frac{1}{2}}`, "on calcule le dénominateur"),
        ligne(`=${r3(l1)}\\times 2`, "diviser par 1/2, c'est multiplier par 2"),
        ligne(`=${r3(ent(c))}`),
        ligne(`\\approx ${dec(c * Math.sqrt(3))}\\ \\text{cm}`, "arrondi au centième"),
      ],
      piege: [t("La longueur totale est la somme de tous les segments : la formule de la somme infinie, pas un seul segment ni quelques-uns.")],
    };
  }
  const A = [1, 2, 3].map((i) => fois(q(c * c, 8), q(1, 4 ** (i - 1))));
  if (phase === "airesZigzag") {
    const lignes: LigneCalcul[] = [
      ligne(`A_1=\\dfrac{${c / 2}\\times ${r3(l1)}}{2}`, `aire = CH₁ × BH₁ ÷ 2, avec CH₁ = ${c} ÷ 2 = ${c / 2}`),
      ligne(`=\\dfrac{${fr(q(c * c, 4))}\\sqrt3}{2}`, "on multiplie"),
      ligne(`=${r3(A[0])}`),
      ligne(`\\approx ${dec(valeurQ(A[0]) * Math.sqrt(3))}`, "arrondi au centième"),
    ];
    for (let i = 1; i < 3; i++) {
      lignes.push(ligne(`A_${i + 1}=A_${i}\\times\\dfrac{1}{4}`, "longueurs divisées par 2, aires divisées par 4"));
      lignes.push(ligne(`=${r3(A[i])}`));
      lignes.push(ligne(`\\approx ${dec(valeurQ(A[i]) * Math.sqrt(3))}`));
    }
    return {
      utilise: [t("Aire d'un triangle rectangle : produit des côtés de l'angle droit divisé par 2. D'un triangle au suivant, les longueurs sont divisées par 2, donc les aires par "), f("2^2=4"), t(` : suite géométrique de raison 1/4 ${COURS_GEOMETRIQUE}.`)],
      lignes,
      piege: [t("Les longueurs sont divisées par 2 d'un triangle au suivant, mais les aires par "), f("2^2=4"), t(" : raison "), f("\\dfrac14"), t(", pas "), f("\\dfrac12"), t(".")],
    };
  }
  const u1 = moins(A[0], A[1]);
  return {
    utilise: [t("L'aire de Uₖ vaut "), f("A_k-A_{k+1}"), t(" ; ces aires forment une suite géométrique de raison 1/4, de premier terme "), f("A_1-A_2"), t(", et "), f("S_\\infty=\\dfrac{u_1}{1-q}"), t(` ${COURS_CONVERGENCE}.`)],
    lignes: [
      ligne("S_\\infty=\\dfrac{A_1-A_2}{1-\\frac{1}{4}}", "somme infinie des aires des Uₖ"),
      ligne(`=\\dfrac{${r3T(A[0])}-${r3T(A[1])}}{\\frac{3}{4}}`, "on remplace A₁ et A₂"),
      ligne(`=\\dfrac{${r3T(u1)}}{\\frac{3}{4}}`, "on calcule le numérateur"),
      ligne(`=${r3(u1)}\\times\\dfrac{4}{3}`, "diviser par 3/4, c'est multiplier par 4/3"),
      ligne(`=${r3(A[0])}`),
      ligne(`\\approx ${dec(valeurQ(A[0]) * Math.sqrt(3))}\\ \\text{cm}^2`, "arrondi au centième"),
    ],
    verif: { texte: [t("On retrouve "), f("A_1"), t(" : les petits triangles Uₖ recouvrent tout le triangle T₁.")], lignes: [] },
  };
}

function valeurQ(f0: Q): number {
  return f0.num / f0.den;
}

// ============================================================================
// Carrés emboîtés.
// ============================================================================

function carres(e: ExerciceCarresEmboites, phase: PhaseSuiteClassique): Etape {
  const p = e.partsA;
  const c = e.coloreesA;
  const u1 = q(c, p);
  const qA = q(1, p);
  if (phase === "sommePartielleA") {
    return {
      utilise: [t("Fraction coloriée : "), f(`u_1=\\dfrac{${c}}{${p}}`), t(", et chaque étape colorie "), f(`\\dfrac{1}{${p}}`), t(" de ce qui a été colorié à l'étape précédente : "), f(`q=\\dfrac{1}{${p}}`), t(" ; "), f("S_n=u_1\\times\\dfrac{1-q^n}{1-q}"), t(` ${COURS_GEOMETRIQUE}.`)],
      lignes: lignesSommeGeometrique(5, u1, qA, 3),
      piege: [f("S_5"), t(" est la somme de 5 termes : la formule utilise "), f("q^5"), t(".")],
      figure: construireSvgPartageCarre(e),
    };
  }
  if (phase === "limitePuissanceA") {
    const v10 = 1 / p ** 10;
    return {
      utilise: [t("On calcule quelques puissances de "), f(`\\dfrac{1}{${p}}`), t(" : comme "), f(`0<\\dfrac{1}{${p}}<1`), t(`, elles se rapprochent de 0 ${COURS_CONVERGENCE}.`)],
      lignes: [
        ligne(`\\left(\\dfrac{1}{${p}}\\right)^2=\\dfrac{1}{${p ** 2}}`, "on multiplie le dénominateur par lui-même"),
        ligne(`\\left(\\dfrac{1}{${p}}\\right)^3=\\dfrac{1}{${p ** 3}}`),
        ligne(`\\left(\\dfrac{1}{${p}}\\right)^{10}=\\dfrac{1}{${p ** 10}}`),
        ligne(`\\approx ${sci(v10)}`, "presque nul"),
        ligne(`\\lim_{n\\to+\\infty}\\left(\\dfrac{1}{${p}}\\right)^n=0`, "les puissances se rapprochent de 0"),
      ],
    };
  }
  if (phase === "sommeInfinieA") {
    const B = moins(ent(1), qA);
    const s = divise(u1, B);
    return {
      utilise: [t("Les fractions coloriées forment une suite géométrique de raison "), f(`q=\\dfrac{1}{${p}}`), t(", avec |q| < 1 : "), f("S_\\infty=\\dfrac{u_1}{1-q}"), t(` ${COURS_CONVERGENCE}.`)],
      lignes: [
        ligne("S_\\infty=\\dfrac{u_1}{1-q}", "somme infinie"),
        ligne(`=\\dfrac{${frT(u1)}}{1-\\frac{1}{${p}}}`, "on remplace u₁ et q"),
        ligne(`=\\dfrac{${frT(u1)}}{${frT(B)}}`, "on calcule le dénominateur"),
        ligne(`=${fr(u1)}\\times ${fr(divise(ent(1), B))}`, jf("diviser par ", { l: fr(B) }, ", c'est multiplier par ", { l: fr(divise(ent(1), B)) })),
        ligne(`=${fr(s)}`, "on simplifie"),
        ...lignesArrondi(s, 3),
      ],
      piege: [t("La formule demande le premier terme au numérateur : "), f("\\dfrac{u_1}{1-q}"), t(", pas "), f("\\dfrac{1}{1-q}"), t(".")],
    };
  }
  const a = e.coteB;
  const aires = e.airesB;
  if (phase === "airesB") {
    return {
      utilise: [t("Les 4 triangles des coins, repliés vers l'intérieur, recouvrent exactement le nouveau carré : son aire est la moitié de celle du carré précédent (suite géométrique de raison 1/2) " + COURS_GEOMETRIQUE + ".")],
      lignes: [
        ligne(`a_1=${a}^2`, "aire du premier carré : côté²"),
        ligne(`=${a * a}`),
        ligne(`a_2=${a * a}\\times\\dfrac{1}{2}`, "la moitié de l'aire précédente"),
        ligne(`=${dec(aires[1])}`),
        ligne(`a_3=${dec(aires[1])}\\times\\dfrac{1}{2}`, "la moitié de l'aire précédente"),
        ligne(`=${dec(aires[2])}\\ \\text{cm}^2`),
      ],
      piege: [t("Le nouveau carré a pour aire la moitié (et non le quart) de la précédente.")],
      figure: construireSvgCarresMilieux(e),
    };
  }
  return {
    utilise: [t("Les aires forment une suite géométrique de premier terme "), f("a^2"), t(" et de raison "), f("q=\\dfrac{1}{2}"), t(" ; |q| < 1, donc "), f("S_\\infty=\\dfrac{u_1}{1-q}"), t(` ${COURS_CONVERGENCE}.`)],
    lignes: [
      ligne("S_\\infty=\\dfrac{a_1}{1-q}", "somme infinie des aires"),
      ligne(`=\\dfrac{${a * a}}{1-\\frac{1}{2}}`, "on remplace a₁ et q"),
      ligne(`=\\dfrac{${a * a}}{\\frac{1}{2}}`, "on calcule le dénominateur"),
      ligne(`=${a * a}\\times 2`, "diviser par 1/2, c'est multiplier par 2"),
      ligne(`=${2 * a * a}\\ \\text{cm}^2`),
    ],
    piege: [t("La somme infinie existe parce que "), f("|q|=\\dfrac12<1"), t(" ; elle vaut le double de l'aire du premier carré.")],
  };
}

// ============================================================================
// Assemblage.
// ============================================================================

function contenu(exercice: E, phase: PhaseSuiteClassique): Etape {
  switch (exercice.scenario) {
    case "echiquier":
      return echiquier(exercice, phase);
    case "papyrusRhind":
      return papyrus(exercice, phase);
    case "suitesCombinees":
      return combinees(exercice, phase);
    case "vitesse":
      return vitesse(exercice, phase);
    case "fibonacci":
      return fibonacci(exercice, phase);
    case "trianglesZigzag":
      return zigzag(exercice, phase);
    case "carresEmboites":
      return carres(exercice, phase);
  }
}

export function correctionDetailleeSuiteClassique(exercice: E): EtapeCorrection[] {
  return ordreComplet(exercice).flatMap((phase, i): EtapeCorrection[] => {
    const sq = LETTRES[i];
    const c = contenu(exercice, phase);
    return [
      utilise(sq, c.utilise),
      calcul(sq, c.lignes),
      { ...resultat(sq, c.resultat ?? fragmentsListe(reponseLatexSuiteClassique(exercice, phase).split(",\\quad "))), ...(c.figure ? { figureHtml: c.figure } : {}) },
      ...(c.verif ? [verification(sq, c.verif.texte, c.verif.lignes.length ? c.verif.lignes : undefined)] : []),
      ...(c.piege ? [piege(sq, c.piege)] : []),
    ];
  });
}

