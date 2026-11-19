import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, lignesDepuisChaine, piege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import type { CalculTriangle, ExerciceDeuxPositions, ExerciceTexteTriangle, ExerciceTexteTriangleStandard, Grandeur } from "../../core/texteTriangle.types";
import { arrondir, valeurCalcul } from "../../moteur/modeleTexteTriangle";
import { aidesEcran, degres, n, nomLoi, loiAttendue, nomsDeuxPositions, uniteLatex } from "../../ui/formatTexteTriangle";
import { construireFigureTexteTriangle, PALETTE_PAPIER } from "../../ui/figureTexteTriangle";
import {
  COURS_TRIANGLE,
  COURS_TRIANGULATION,
  angleDonne,
  donnee,
  finaliserCorrigeTriangles,
  fragmentsAide,
  fragmentsListe,
  lignesAire,
  lignesAlKashiCote,
  lignesArcsin,
  lignesLoiSinusCote,
  lignesLoiSinusSinus,
  lignesSommeAngles,
  angleMemoire,
  nbFixe,
} from "../../ui/corrigeTriangles";

/**
 * Corrigé détaillé « comme au tableau » de gen77 (du texte au triangle) — règle
 * `.claude/rules/feuilles-evaluations.md`. Cinq étapes = cinq écrans (`sequenceEcrans`). Variantes
 * standard : a) les éléments du triangle repérés dans le texte (lecture), b) les angles intérieurs
 * (chaînes de conversion de l'écran, `ConversionAngle.calculLatex`), c) la loi (ce qu'elle demande,
 * testé sur les données), d) le calcul (loi écrite avec les noms du triangle, isolée, substituée),
 * e) la réponse arrondie comme la question (lecture, avec la figure résolue). « Deux positions » :
 * a) les données, b) la loi des sinus, c) les deux angles candidats, d) les deux distances, e) la
 * position retenue (comparaison au seuil de l'énoncé, figure résolue). Partagé par l'adaptateur et
 * l'appli (`AppTexteTriangle.tsx`).
 */

type E = ExerciceTexteTriangle;
type S = ExerciceTexteTriangleStandard;
type D = ExerciceDeuxPositions;

function figure(e: E): string {
  return construireFigureTexteTriangle(e, { palette: PALETTE_PAPIER, resolue: true }).replace(
    "<svg ",
    '<svg style="display:block;margin:8px auto 12px;width:300px;max-width:100%;height:auto;border:1px solid #e6e6f0;border-radius:8px" ',
  );
}

/** Nombre au format de la précision demandée (zéros finaux gardés ; « à la dizaine » : entier). */
function nFixe(v: number, decimales: number): string {
  if (decimales <= 0) return String(arrondir(v, decimales));
  return arrondir(v, decimales).toFixed(decimales).replace(".", "{,}");
}

const uniteBase = (u: string) => u.replace("²", "");

function grandeurs(c: CalculTriangle): Grandeur[] {
  switch (c.loi) {
    case "cosinus":
    case "aire":
      return [c.cote1, c.cote2, c.angle];
    case "sinus":
      return [c.coteConnu, c.angleOpposeConnu, c.angleOpposeCherche];
  }
}

const estAngle = (latexNom: string) => /\\widehat|\\hat|\^\\circ/.test(latexNom);

function valeurGrandeur(e: S, g: Grandeur): string {
  return estAngle(g.latex) ? degres(g.valeur) : `${n(g.valeur)}${uniteLatex(uniteBase(e.unite))}`;
}

/** Valeur d'un élément donné qui ne sert pas directement au calcul final (utilisé par une
 * conversion) : longueur relevée (`longueurs`) ou angle au sommet du milieu de `\widehat{…}`
 * (`angles`, angle d'élévation en A). */
function donneeDuTexte(e: S, nom: string): Grandeur | undefined {
  const seg = e.longueurs.find(([p, q]) => nom === `${p}${q}` || nom === `${q}${p}`);
  if (seg) return { latex: nom, valeur: seg[2] };
  const sommet = /^\\widehat\{(.)(.)(.)\}$/.exec(nom)?.[2];
  const valeur = sommet ? (e.angles[sommet] ?? (sommet === "A" ? e.angles.alpha : undefined)) : undefined;
  return valeur !== undefined ? { latex: nom, valeur } : undefined;
}

// ---------------------------------------------------------------------------------------------
// Variantes standard
// ---------------------------------------------------------------------------------------------

function etapesStandard(e: S): EtapeCorrection[] {
  const connues = grandeurs(e.calcul);
  const conv = new Set(e.conversions.map((c) => c.latex));
  const ordre = { donne: 0, convertir: 1, cherche: 2 } as const;
  const lignesA: LigneCalcul[] = [...e.elements].sort((x, y) => ordre[x.role] - ordre[y.role]).map((el) => {
    if (el.role === "cherche") return ligne(`${el.latex}=\\,?`, "cherché : la grandeur demandée par la question");
    if (el.role === "convertir") return ligne(`${el.latex}=\\,?`, "à déduire du texte : cap, élévation ou dépression à traduire en angle du triangle");
    const g = connues.find((x) => x.latex === el.latex) ?? donneeDuTexte(e, el.latex);
    return g ? ligne(`${el.latex}=${valeurGrandeur(e, g)}`, "donné tel quel dans le texte") : ligne(`${el.latex}=\\,\\text{donné}`, "donné tel quel dans le texte");
  });
  const liste = (role: string) => e.elements.filter((x) => x.role === role).map((x) => x.latex);
  const x = e.inconnue.latex;
  const c = e.calcul;
  const v = valeurCalcul(c);
  const d = Math.max(e.precision.decimales, 0) + 2;
  const U = uniteBase(e.unite);
  const val = (g: Grandeur) => (estAngle(g.latex) || conv.has(g.latex) ? angleDonne(g.valeur) : donnee(g.valeur));
  let lignesD: LigneCalcul[];
  let lignesC: LigneCalcul[];
  switch (c.loi) {
    case "cosinus":
      lignesD = lignesAlKashiCote({ x, p: c.cote1.latex, q: c.cote2.latex, X: c.angle.latex, vp: val(c.cote1), vq: val(c.cote2), vX: val(c.angle), resultat: v, d, unite: U });
      lignesC = [ligne(`\\text{angle compris entre } ${c.cote1.latex} \\text{ et } ${c.cote2.latex}=${c.angle.latex}`, "deux côtés et l'angle compris connus : loi des cosinus")];
      break;
    case "sinus":
      lignesD = lignesLoiSinusCote({ x, X: c.angleOpposeCherche.latex, k: c.coteConnu.latex, K: c.angleOpposeConnu.latex, vk: val(c.coteConnu), vX: val(c.angleOpposeCherche), vK: val(c.angleOpposeConnu), resultat: v, d, unite: U });
      lignesC = [
        ligne(`\\text{couple complet}=(${c.coteConnu.latex}\\,;\\,${c.angleOpposeConnu.latex})`, "un côté et l'angle qui lui fait face"),
        ligne(`\\text{angle opposé à } ${x}=${c.angleOpposeCherche.latex}`, "connu : loi des sinus"),
      ];
      break;
    case "aire":
      lignesD = lignesAire({ nom: x, p: c.cote1.latex, q: c.cote2.latex, X: c.angle.latex, vp: val(c.cote1), vq: val(c.cote2), vX: val(c.angle), aire: v, d, unite: U });
      lignesC = [ligne(`${x}=\\,?`, "on cherche une aire"), ligne(`\\text{angle compris entre } ${c.cote1.latex} \\text{ et } ${c.cote2.latex}=${c.angle.latex}`, "deux côtés et l'angle compris : formule de l'aire")];
      break;
  }
  const lettrePiege = e.variante === "distanceInaccessible" && e.sousType === "somme" ? "d" : "b";
  const pg = piege(lettrePiege, [texte(e.piege.description)]);
  const prec = e.precision.decimales;
  const etapes: EtapeCorrection[] = [
    utilise("a", [texte(`On travaille dans le triangle ${e.triangle} ${COURS_TRIANGULATION} : un élément est donné tel quel seulement si le texte le mesure entre deux côtés du triangle ; un cap, un angle d'élévation ou de dépression se convertit.`)]),
    calcul("a", lignesA),
    resultat("a", [texte("Donnés : "), ...fragmentsListe(liste("donne"), ", "), texte(" ; à déduire : "), ...fragmentsListe(liste("convertir"), ", "), texte(" ; cherché : "), latex(x), texte(".")]),
    utilise("b", fragmentsAide(aidesEcran(e, "convertir")[0]!)),
    ...e.conversions.map((cv, k) =>
      calcul(
        "b",
        lignesDepuisChaine(`${cv.latex}=${cv.calculLatex}${cv.detailLatex ? `=${cv.detailLatex}` : ""}=${degres(cv.valeur)}`),
        [texte(cv.justification)],
        e.conversions.length > 1 ? `Angle ${k + 1}` : "Calcul",
      ),
    ),
    resultat("b", fragmentsListe(e.conversions.map((cv) => `${cv.latex}=${degres(cv.valeur)}`))),
    ...(lettrePiege === "b" ? [pg] : []),
    utilise("c", [texte(`Ce que demande chaque loi ${COURS_TRIANGLE} : deux côtés et l'angle compris — loi des cosinus, ou formule de l'aire si c'est l'aire qui est demandée ; un côté, l'angle qui lui fait face et un autre angle — loi des sinus.`)]),
    calcul("c", lignesC),
    resultat("c", [texte(`${nomLoi(loiAttendue(e)).replace(/^./, (l) => l.toUpperCase())}.`)]),
    utilise("d", [texte(`La loi écrite avec les noms du triangle ${e.triangle}, puis les valeurs (angles intérieurs de l'étape 2), calculatrice en degrés.`)]),
    calcul("d", lignesD),
    resultat("d", [latex(`${x} \\approx ${n(v, d)}${uniteLatex(e.unite)}`)]),
    ...(lettrePiege === "d" ? [pg] : []),
    utilise("e", [texte(`La question demande la réponse en ${e.unite}, ${e.precision.texte} : on regarde le premier chiffre supprimé (5 ou plus : on arrondit vers le haut).`)]),
    calcul("e", [ligne(`${x}\\approx ${nbFixe(v, Math.max(prec, 0) + 3)}${uniteLatex(e.unite)}`, "valeur de la calculatrice"), ligne(`\\approx ${nFixe(v, prec)}${uniteLatex(e.unite)}`, `arrondi ${e.precision.texte}`)]),
    { ...resultat("e", [texte(e.options.find((o) => o.correcte)!.texte)]), figureHtml: figure(e) },
  ];
  return etapes;
}

// ---------------------------------------------------------------------------------------------
// « Deux positions » (cas ambigu)
// ---------------------------------------------------------------------------------------------

function etapesDeuxPositions(e: D): EtapeCorrection[] {
  const N = nomsDeuxPositions(e);
  const km = uniteLatex("km");
  const sinB = (e.RP * Math.sin((e.angleP * Math.PI) / 180)) / e.RB;
  const parAngle = e.info.type.startsWith("angle");
  const comparaisons: LigneCalcul[] = [0, 1].map((k) => {
    const valeur = parAngle ? e.anglesR[k]! : e.distances[k]!;
    const nom = parAngle ? (k === 0 ? N.angleR1 : N.angleR2) : k === 0 ? N.PB1 : N.PB2;
    const seuil = parAngle ? `${e.info.seuil}^\\circ` : `${e.info.seuil}${km}`;
    const r = valeur < e.info.seuil ? "<" : ">";
    return ligne(`${nom}\\approx ${parAngle ? `${nbFixe(valeur, 2)}^\\circ` : `${nbFixe(valeur, 2)}${km}`}${r}${seuil}`, k === e.retenue ? `position ${k + 1} : elle vérifie l'information de l'énoncé` : `position ${k + 1} : écartée`);
  });
  const position = (k: 0 | 1): EtapeCorrection => {
    const R = k === 0 ? N.angleR1 : N.angleR2;
    const B = k === 0 ? N.angleB1 : N.angleB2;
    const PB = k === 0 ? N.PB1 : N.PB2;
    return calcul(
      "d",
      [
        ...lignesSommeAngles({ inconnu: R, autres: [N.angleP, B], valeurs: [angleDonne(e.angleP), angleMemoire(e.candidats[k], 2)], resultat: e.anglesR[k], d: 2 }),
        ...lignesLoiSinusCote({ x: PB, X: R, k: N.RB, K: N.angleP, vk: donnee(e.RB), vX: angleMemoire(e.anglesR[k], 2), vK: angleDonne(e.angleP), resultat: e.distances[k], unite: "km" }),
      ],
      [],
      `Position ${k + 1}`,
    );
  };
  return [
    utilise("a", [texte(`On repère dans le triangle ${e.triangle} les deux côtés connus, l'angle connu et ce qu'on cherche ${COURS_TRIANGULATION}.`)]),
    calcul("a", [
      ligne(`${N.RP}=${n(e.RP)}${km}`, "donné"),
      ligne(`${N.RB}=${n(e.RB)}${km}`, "donné"),
      ligne(`${N.angleP}=${degres(e.angleP)}`, "donné"),
      ligne(`${N.PB}=\\,?`, "cherché"),
      ligne(`\\text{côté opposé à } ${N.angleP}=${N.RB}`, "l'angle connu n'est pas compris entre les deux côtés connus : cas ambigu"),
    ]),
    resultat("a", [texte(e.optionsConfiguration.find((o) => o.correcte)!.texte)]),
    utilise("b", [texte(`Loi des sinus ${COURS_TRIANGLE} : chaque côté avec le sinus de l'angle qui lui fait face.`)]),
    calcul("b", [
      ligne(`\\text{couple complet}=(${N.RB}\\,;\\,${N.angleP})`, `${e.noms.R}${e.noms.B} fait face à l'angle en ${e.noms.P}`),
      ligne(`\\text{angle opposé à } ${N.RP}=${N.angleB}`, "la loi des sinus donne son sinus"),
    ]),
    resultat("b", [texte("La loi des sinus.")]),
    utilise("c", [texte("La loi des sinus donne le sinus de l'angle ; entre 0° et 180°, deux angles ont ce sinus : l'angle aigu de la calculatrice et son supplémentaire.")]),
    calcul("c", [
      ...lignesLoiSinusSinus({ X: N.angleB, x: N.RP, K: N.angleP, k: N.RB, vx: donnee(e.RP), vK: angleDonne(e.angleP), vk: donnee(e.RB), sinus: sinB }),
      ...lignesArcsin({ X: N.angleB1, angle: e.candidats[0], d: 2, supplementaire: { X2: N.angleB2, angle2: e.candidats[1] } }),
    ]),
    resultat("c", fragmentsListe([`${N.angleB1} \\approx ${degres(e.candidats[0])}`, `${N.angleB2} \\approx ${degres(e.candidats[1])}`])),
    piege("c", [texte(`La calculatrice ne donne que l'angle aigu. Oublier son supplémentaire, c'est oublier une des deux positions — ici, c'est la position ${e.retenue + 1} qui est la bonne.`)]),
    utilise("d", [texte("Pour chaque position : l'angle en " + e.noms.R + " complète la somme à 180°, puis la loi des sinus donne la distance.")]),
    position(0),
    position(1),
    resultat("d", fragmentsListe([`${N.PB1} \\approx ${n(e.distances[0])}${km}`, `${N.PB2} \\approx ${n(e.distances[1])}${km}`])),
    utilise("e", [texte(`Information de l'énoncé : « ${e.info.texte.replace(/\.$/, "")} ». On la teste sur chacune des deux positions.`)]),
    calcul("e", comparaisons),
    { ...resultat("e", [texte(e.options.find((o) => o.correcte)!.texte)]), figureHtml: figure(e) },
  ];
}

export function correctionDetailleeTexteTriangle(e: E): EtapeCorrection[] {
  return finaliserCorrigeTriangles(e.variante === "deuxPositions" ? etapesDeuxPositions(e) : etapesStandard(e));
}

