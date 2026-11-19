import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege as lignePiege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import type { ExerciceDetectiveErreurs, LigneResolution, Sommet } from "../../core/detectiveErreurs.types";
import { DECIMALES, SCENARIOS, copieEleve, descriptionCorrecte, indiceLigneFausse, nombreLatex, resolutionCorrecte, solutionAmbigue, typeErreur, valeurAffichee } from "../../moteur/modeleDetectiveErreurs";
import { champsAttendus } from "../../moteur/verificationDetectiveErreurs";
import { constat, descriptionFragments, piege, relationResultat, valeurLatex } from "../../ui/formatDetectiveErreurs";
import { COURS_ANGLES_ASSOCIES, COURS_TRIANGLE, finaliserCorrigeTriangles, fragmentsListe, lignesArcsin, nbFixe } from "../../ui/corrigeTriangles";

/**
 * Corrigé détaillé « comme au tableau » de gen81 (le détective d'erreurs : triangles) — règle
 * `.claude/rules/feuilles-evaluations.md`, sur le modèle de gen112 (4e ch. 4). Trois étapes = trois
 * écrans : a) la ligne fausse (la ligne refaite, comparée à la copie), b) l'erreur commise (le constat
 * chiffré, puis la description de l'écran), c) la correction : la résolution reprise à partir de la
 * ligne fausse, un bloc « Ligne k » par ligne de la copie, une transformation par ligne.
 * Lignes : `resolutionCorrecte` (la MÊME méthode que la copie, qui recopie les valeurs ARRONDIES
 * d'une ligne à l'autre comme le fait l'élève — la valeur attendue à l'écran en dépend) ; une
 * substitution d'une valeur arrondie s'écrit « ≈ » (`membresLatex`). Partagé par l'adaptateur et
 * l'appli (`AppDetectiveErreurs.tsx`).
 */

type E = ExerciceDetectiveErreurs;

const CHAPEAU: Record<Sommet, string> = { A: "\\hat{A}", B: "\\hat{B}", C: "\\hat{C}" };
const COTE: Record<Sommet, string> = { A: "a", B: "b", C: "c" };
const UNITE: Record<string, string> = { cote: "\\text{ cm}", carre: "", angle: "^\\circ", trig: "", aire: "\\text{ cm}^2", aucune: "" };

/** Nombres écrits ARRONDIS par les lignes précédentes de la résolution (résultat « ≈ ») : les
 * recopier dans une substitution en fait un « ≈ », même quand l'arrondi tombe sur un entier
 * (« Ĉ₂ ≈ 25° », puis « c₂ ≈ 7 sin 25° / sin 39° »). */
function nombresArrondis(e: E, jusqua: LigneResolution): Set<string> {
  const vus = new Set<string>();
  for (const l of resolutionCorrecte(e)) {
    if (l.membres.join() === jusqua.membres.join()) break;
    if (l.valeur !== null && (relationResultat(l) === "\\approx" || l.relation === "\\approx")) vus.add(nombreLatex(l.valeur, DECIMALES[l.nature]));
  }
  if (e.scenario === "G1") {
    const s = solutionAmbigue(e);
    vus.add(nombreLatex(s.B1, 1)).add(nombreLatex(s.B2, 1));
  }
  return vus;
}

/** Une ligne de la résolution en lignes de calcul alignées : membres successifs, puis le résultat. */
function lignesResolution(e: E, l: LigneResolution, justification?: string): LigneCalcul[] {
  const arrondis = nombresArrondis(e, l);
  const arrondi = (m: string) => /\d\{,\}\d/.test(m) || (m.match(/\d+(?:\{,\}\d+)?/g) ?? []).some((x) => arrondis.has(x));
  const relMembre = (m: string) => (arrondi(m) ? "\\approx" : "=");
  const [m0, ...suite] = l.membres;
  const lignes: LigneCalcul[] = [];
  suite.forEach((m, k) => lignes.push(ligne(k === 0 ? `${m0}${relMembre(m)}${m}` : `${relMembre(m)}${m}`, k === 0 ? justification : k === suite.length - 1 ? "on remplace" : undefined)));
  if (l.resultat !== null) lignes.push(ligne(`${arrondi(suite[suite.length - 1] ?? "") ? "\\approx" : relationResultat(l)}${l.resultat}`));
  return lignes;
}

/** Justification d'une ligne : son préfixe dans la copie (« Loi des sinus : » → « loi des sinus » ; « Al-Kashi » gardé). */
function justifPrefixe(l: LigneResolution): string | undefined {
  const p = l.prefixe?.replace(/ : $/, "");
  return p ? (p.startsWith("Al-") ? p : p.charAt(0).toLowerCase() + p.slice(1)) : undefined;
}

function valeurLigne(l: LigneResolution): string {
  return `${nombreLatex(l.valeur!, DECIMALES[l.nature])}${UNITE[l.nature]}`;
}

// ---------------------------------------------------------------------------------------------
// a) La ligne fausse, refaite
// ---------------------------------------------------------------------------------------------

function lignesSecondCandidat(e: E): LigneCalcul[] {
  const { A } = e.donnees as { A: number };
  const s = solutionAmbigue(e);
  const B2 = valeurAffichee(s.B2, "angle");
  return [
    ...lignesArcsin({ X: "\\hat{B}_1", angle: s.B1, supplementaire: { X2: "\\hat{B}_2", angle2: s.B2 } }),
    ligne(`\\hat{A}+\\hat{B}_2\\approx ${A}^\\circ+${nbFixe(B2, 1)}^\\circ`, "on teste le second candidat"),
    ligne(`\\approx ${nbFixe(A + B2, 1)}^\\circ`),
    ligne("<180^\\circ", "il reste de la place pour Ĉ : second triangle"),
  ];
}

function lignesControle(e: E): LigneCalcul[] {
  if (e.scenario === "G1") return lignesSecondCandidat(e);
  const i = indiceLigneFausse(e);
  const juste = resolutionCorrecte(e)[i]!;
  const copie = copieEleve(e)[i]!;
  return [...lignesResolution(e, juste, "règle du cours"), ligne(`${valeurLigne(juste)}\\neq ${copie.resultat}`, `valeur de la copie à la ligne ${i + 1}`)];
}

// ---------------------------------------------------------------------------------------------
// b) L'erreur commise : constat chiffré
// ---------------------------------------------------------------------------------------------

const DEG = Math.PI / 180;

function lignesConstat(e: E): LigneCalcul[] {
  const d = e.donnees;
  const i = indiceLigneFausse(e);
  const copie = copieEleve(e)[i]!;
  const juste = resolutionCorrecte(e)[i]!;
  switch (descriptionCorrecte(e)) {
    case "obtus": {
      const aigu = copie.valeur!;
      return [
        ligne(`${copie.membres[1]}\\approx ${nombreLatex(aigu, 1)}^\\circ`, "la touche ne donne que l'angle aigu : c'est la valeur de la copie"),
        ligne(`180^\\circ-${nombreLatex(aigu, 1)}^\\circ\\approx ${nombreLatex(180 - aigu, 1)}^\\circ`, "son supplémentaire, de même sinus : l'angle obtus cherché"),
      ];
    }
    case "ambigu": {
      const s = solutionAmbigue(e);
      const B2 = valeurAffichee(s.B2, "angle");
      return [ligne(`\\hat{A}+\\hat{B}_2\\approx ${nbFixe(d.A! + B2, 1)}^\\circ<180^\\circ`, "le second candidat convient aussi : deux triangles")];
    }
    case "radians": {
      if (e.scenario === "R1") {
        return [
          ligne(`\\cos(${d.A}\\text{ rad})\\approx ${nombreLatex(Math.cos(d.A!), 4)}`, "calculatrice en radians : le nombre utilisé par la copie"),
          ligne(`\\cos ${d.A}^\\circ\\approx ${nombreLatex(Math.cos(d.A! * DEG), 4)}`, "calculatrice en degrés : la bonne valeur"),
        ];
      }
      if (e.scenario === "R2") {
        const C = 180 - d.A! - d.B!;
        return [
          ligne(`\\sin(${C}\\text{ rad})\\approx ${nombreLatex(Math.sin(C), 4)}`, "calculatrice en radians : le nombre utilisé par la copie"),
          ligne(`\\sin ${C}^\\circ\\approx ${nombreLatex(Math.sin(C * DEG), 4)}`, "calculatrice en degrés : la bonne valeur"),
        ];
      }
      const x = resolutionCorrecte(e)[0]!.valeur!;
      return [
        ligne(`\\cos^{-1}(${nombreLatex(x, 4)})\\approx ${nombreLatex(Math.acos(x), 1)}\\text{ rad}`, "calculatrice en radians : la copie a écrit ce nombre en degrés"),
        ligne(`\\cos^{-1}(${nombreLatex(x, 4)})\\approx ${nombreLatex(Math.acos(x) / DEG, 1)}^\\circ`, "calculatrice en degrés : la bonne valeur"),
      ];
    }
    case "arrondi":
      return [
        ligne(`${juste.quantite}\\approx ${nombreLatex(juste.valeur!, DECIMALES[juste.nature])}${UNITE[juste.nature]}`, "valeur à garder en mémoire"),
        ligne(`\\approx ${copie.resultat}`, "la copie arrondit beaucoup plus tôt, puis réutilise ce nombre à la ligne suivante"),
      ];
    case "coteOppose": {
      const X = e.sousVariante as Sommet;
      const cote = e.scenario === "C1" ? "c" : e.scenario === "C2" ? "a" : "b";
      const bon = cote === "c" ? "C" : cote === "a" ? "A" : "B";
      return [ligne(`\\text{angle opposé à } ${cote}=${CHAPEAU[bon as Sommet]}\\neq ${CHAPEAU[X]}`, `la copie associe ${cote} au sinus d'un angle qui ne lui fait pas face (${COTE[X]} fait face à ${X})`)];
    }
    case "signe":
      return e.scenario === "K1"
        ? [ligne("+2bc\\cos\\hat{A}\\neq -2bc\\cos\\hat{A}", "terme en cosinus de la copie, puis celui du cours")]
        : [ligne("b^2-a^2-c^2\\neq a^2+c^2-b^2", "numérateur de la copie, puis celui du cours : signes inversés")];
    case "facteur":
      return e.scenario === "K1"
        ? [ligne("bc\\cos\\hat{A}\\neq 2bc\\cos\\hat{A}", "terme en cosinus de la copie, puis celui du cours")]
        : [ligne("ac\\neq 2ac", "dénominateur de la copie, puis celui du cours")];
    default:
      return [];
  }
}

function utiliseErreur(e: E): FragmentConsigne[] {
  switch (typeErreur(e)) {
    case "obtus":
      return [texte("La touche "), latex("\\sin^{-1}"), texte(` ne donne qu'un angle aigu ; son supplémentaire a le même sinus ${COURS_ANGLES_ASSOCIES}. Le plus grand côté fait face au plus grand angle.`)];
    case "ambigu":
      return [texte(`Deux côtés et un angle non compris : un sinus donne deux candidats, l'angle aigu et son supplémentaire, à tester chacun par `), latex("\\hat{A}+\\hat{B}<180^\\circ"), texte(` ${COURS_TRIANGLE}.`)];
    case "radians":
      return [texte("Les angles sont donnés en degrés : la calculatrice doit être en mode degrés pour calculer un sinus, un cosinus ou leur réciproque.")];
    case "arrondi":
      return [texte("On garde les valeurs exactes en mémoire de la calculatrice ; seuls les résultats demandés sont arrondis (au centième pour un côté, au dixième de degré pour un angle).")];
    case "coteOppose":
      return [texte(`Loi des sinus ${COURS_TRIANGLE} : chaque côté avec le sinus de l'angle qui lui fait face, `), latex("\\dfrac{a}{\\sin\\hat{A}}=\\dfrac{b}{\\sin\\hat{B}}=\\dfrac{c}{\\sin\\hat{C}}")];
    case "alKashi":
      return [texte(`Formule d'Al-Kashi du cours ${COURS_TRIANGLE} : `), latex("a^2=b^2+c^2-2bc\\cos\\hat{A}"), texte(" — un signe moins et un facteur 2 devant le terme en cosinus.")];
  }
}

// ---------------------------------------------------------------------------------------------
// c) La correction, bloc par bloc
// ---------------------------------------------------------------------------------------------

function blocsCorrection(e: E): EtapeCorrection[] {
  const i = indiceLigneFausse(e);
  const correcte = resolutionCorrecte(e);
  if (e.scenario === "G1") {
    // lignes 5 et 6 : second triangle (Ĉ₂, puis c₂)
    const t2 = correcte.filter((l) => /_2/.test(l.quantite) && l.valeur !== null && !l.fragmentsLibres);
    return [
      calcul("c", lignesSecondCandidat(e), [], "Second candidat"),
      ...t2.map((l) => calcul("c", lignesResolution(e, l, justifPrefixe(l)), [], l.nature === "angle" ? "Second triangle : angle Ĉ₂" : "Second triangle : côté c₂")),
    ];
  }
  return correcte
    .slice(i)
    .map((l, k) => ({ l, k }))
    .filter(({ l }) => l.valeur !== null && !l.fragmentsLibres)
    .map(({ l, k }) => calcul("c", lignesResolution(e, l, justifPrefixe(l)), [], `Ligne ${i + k + 1}`));
}

export function correctionDetailleeDetectiveErreurs(e: E): EtapeCorrection[] {
  const i = indiceLigneFausse(e);
  const n = SCENARIOS[e.scenario].nombreLignes;
  return finaliserCorrigeTriangles([
    utilise("a", [
      texte(`On refait la résolution ligne par ligne à partir des données, avec les lois du cours ${COURS_TRIANGLE}, et on contrôle la cohérence (somme des angles 180°, plus grand côté face au plus grand angle) : la première ligne qui ne redonne pas le même résultat est la ligne fausse.`),
    ]),
    calcul("a", lignesControle(e), [texte(`Ligne ${i + 1} refaite :`)]),
    resultat("a", [texte(`La ligne ${i + 1} est fausse. `), ...constat(e)]),
    utilise("b", utiliseErreur(e)),
    calcul("b", lignesConstat(e)),
    resultat("b", descriptionFragments(descriptionCorrecte(e), e)),
    lignePiege("b", piege(e)),
    utilise("c", [
      texte(
        e.scenario === "G1"
          ? "On ajoute le second candidat, puis on résout le second triangle comme le premier (somme des angles, puis loi des sinus)."
          : `On reprend la résolution à partir de la ligne ${i + 1} avec la bonne valeur, puis chaque ligne suivante jusqu'à la ligne ${n}, avec la même méthode que la copie (valeurs recopiées arrondies, comme l'élève).`,
      ),
    ]),
    ...blocsCorrection(e),
    resultat("c", fragmentsListe(champsAttendus(e).map(valeurLatex))),
  ]);
}

