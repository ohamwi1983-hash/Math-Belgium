import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceAireTriangleSinus, NombreRadical } from "../../core/aireTriangleSinus.types";
import {
  aireABC,
  aireACD,
  aireExacte,
  aireHeron,
  anglesAttendus,
  coteAttendu,
  demiPerimetre,
  diagonale,
  produitHeron,
  radical,
  sinusAttendu,
  sinusExact,
  valeurRadical,
} from "../../moteur/modeleAireTriangleSinus";
import { AIRE, LIBELLES_NOMBRE_ANGLES, aireDonneeLatex, chapeau, latexOptionFormule, noms, radicalLatex, reponseAnglesLatex, reponseNumeriqueLatex, uniteAire, uniteLongueur } from "../../ui/formatAireTriangleSinus";
import { figureSvgPapier } from "../../ui/figureAireTriangleSinus";
import {
  COURS_ANGLES_ASSOCIES,
  COURS_TRIANGLE,
  COURS_VALEURS_REMARQUABLES,
  angleDonne,
  apres,
  coteMemoire,
  donnee,
  finaliserCorrigeTriangles,
  lignesAire,
  lignesAlKashiCote,
  lignesArcsin,
  nb,
  nbFixe,
  rel,
} from "../../ui/corrigeTriangles";

/**
 * Corrigé détaillé « comme au tableau » de gen75 (aire d'un triangle quelconque) — règle
 * `.claude/rules/feuilles-evaluations.md`. Une étape par écran (`etapes(e)` du moteur) : formule de
 * l'aire choisie puis calculée (famille « aire ») ; formule isolée pour un côté puis calculée
 * (« cote ») ; sinus de l'angle, nombre d'amplitudes, amplitudes (« angle », avec la figure des deux
 * configurations) ; aire de ABC, diagonale AC, aire de ABCD (« quadrilatere ») ; demi-périmètre puis
 * Héron (« heron »). Sinus remarquables écrits exactement (`sinusExact`, `radicalLatex`), réponses
 * de l'écran (`reponseNumeriqueLatex`, `reponseAnglesLatex`). Partagé par l'adaptateur et l'appli.
 */

type E = ExerciceAireTriangleSinus;
type Angle = Extract<E, { famille: "aire" | "angle" | "cote" }>;
type Quadri = Extract<E, { famille: "quadrilatere" }>;
type Heron = Extract<E, { famille: "heron" }>;
type FamilleAngle = Extract<E, { famille: "angle" }>;
type FamilleCote = Extract<E, { famille: "cote" }>;

/** Produit d'un entier par un nombre radical. */
function fois(k: number, x: NombreRadical, diviseur = 1): NombreRadical {
  return radical(k * x.n, x.d * diviseur, x.r);
}

const cours = (angle: number) => (sinusExact(angle) ? `valeur remarquable ${COURS_VALEURS_REMARQUABLES}` : "calculatrice en degrés");

// ---------------------------------------------------------------------------------------------
// Famille « aire »
// ---------------------------------------------------------------------------------------------

function lignesAireExacte(e: Angle, nom: string): LigneCalcul[] {
  const { X, seg1, seg2 } = noms(e);
  const s = sinusExact(e.angle)!;
  const ex = aireExacte(e.cote1, e.cote2, e.angle)!;
  const demi = (e.cote1 * e.cote2) / 2;
  const lignes: LigneCalcul[] = [
    ligne(`${nom}=\\dfrac{1}{2}\\cdot ${seg1}\\cdot ${seg2}\\cdot\\sin ${chapeau(X)}`, "aire : demi-produit de deux côtés par le sinus de l'angle compris"),
    ligne(`=\\dfrac{1}{2}\\cdot ${e.cote1}\\cdot ${e.cote2}\\cdot\\sin ${e.angle}^\\circ`, "on remplace"),
    ligne(`=${nb(demi)}\\cdot\\sin ${e.angle}^\\circ`, "on calcule le demi-produit des côtés"),
  ];
  if (s.r === 1 && s.d === 1) {
    lignes.push(ligne(`=${nb(demi)}\\cdot 1`, [texte(`${cours(e.angle)} : `), latex(`\\sin ${e.angle}^\\circ=1`)]));
  } else {
    lignes.push(ligne(`=${nb(demi)}\\cdot ${radicalLatex(s)}`, [texte(`${cours(e.angle)} : `), latex(`\\sin ${e.angle}^\\circ=${radicalLatex(s)}`)]));
  }
  lignes.push(ligne(`=${radicalLatex(ex)}${ex.r === 1 ? uniteAire(e) : ""}`, "on simplifie"));
  if (ex.r !== 1) lignes.push(ligne(`\\approx ${nbFixe(valeurRadical(ex), 2)}${uniteAire(e)}`, "valeur approchée au centième"));
  return lignes;
}

function etapesAire(e: Extract<E, { famille: "aire" }>): EtapeCorrection[] {
  const { X, seg1, seg2 } = noms(e);
  const x = chapeau(X);
  const exact = sinusExact(e.angle) !== null;
  const v = 0.5 * e.cote1 * e.cote2 * Math.sin((e.angle * Math.PI) / 180);
  return [
    utilise("a", [texte(`L'aire d'un triangle est le demi-produit de deux côtés par le sinus de l'angle COMPRIS entre eux ${COURS_TRIANGLE} : l'angle au sommet commun des deux côtés.`)]),
    calcul("a", [ligne(`${AIRE}=\\dfrac{1}{2}\\cdot ${seg1}\\cdot ${seg2}\\cdot\\sin ${x}`, `l'angle ${X} est compris entre ${seg1} et ${seg2}`)]),
    resultat("a", [latex(latexOptionFormule(e, "formuleAire", "correcte"))]),
    piege("a", [texte("Le sinus, pas le cosinus ; le facteur ½ ; et l'angle compris entre les deux côtés connus, pas un autre angle du triangle.")]),
    utilise("b", [texte("On remplace dans la formule : "), latex(`\\sin ${e.angle}^\\circ`), texte(exact ? ` est une valeur remarquable ${COURS_VALEURS_REMARQUABLES}, sans calculatrice.` : " se calcule à la calculatrice, en degrés.")]),
    calcul(
      "b",
      exact
        ? lignesAireExacte(e, AIRE)
        : lignesAire({ p: seg1, q: seg2, X: x, vp: donnee(e.cote1), vq: donnee(e.cote2), vX: angleDonne(e.angle), aire: v, unite: e.unite }),
    ),
    resultat("b", [latex(reponseNumeriqueLatex(e, "calculAire"))]),
    piege("b", [texte(exact ? "La valeur exacte est demandée : garder la racine, l'arrondi ne vient qu'en plus." : "Calculatrice en mode degrés : en radians, le sinus serait faux.")]),
  ];
}

// ---------------------------------------------------------------------------------------------
// Famille « cote »
// ---------------------------------------------------------------------------------------------

function etapesCote(e: FamilleCote): EtapeCorrection[] {
  const { X, seg1, seg2 } = noms(e);
  const x = chapeau(X);
  const v = coteAttendu(e);
  const u = uniteLongueur(e);
  const lignesB: LigneCalcul[] = [ligne(`${seg2}=\\dfrac{2\\cdot ${aireDonneeLatex(e)}}{${e.cote1}\\cdot\\sin ${e.angle}^\\circ}`, "on remplace")];
  const s = sinusExact(e.angle);
  if (e.aire.exacte && s) {
    const num = fois(2, e.aire.exacte);
    const den = fois(e.cote1, s);
    lignesB.push(ligne(`=\\dfrac{2\\cdot ${radicalLatex(e.aire.exacte)}}{${e.cote1}\\cdot ${radicalLatex(s)}}`, [texte(`${cours(e.angle)} : `), latex(`\\sin ${e.angle}^\\circ=${radicalLatex(s)}`)]));
    lignesB.push(ligne(`=\\dfrac{${radicalLatex(num)}}{${radicalLatex(den)}}`, "on calcule le numérateur et le dénominateur"));
    lignesB.push(ligne(`${apres(rel(v, 2), v, 2)}${u}`, "on simplifie"));
  } else {
    lignesB.push(ligne(`=\\dfrac{${nb(2 * e.aire.valeur)}}{${e.cote1}\\cdot\\sin ${e.angle}^\\circ}`, "on calcule le double de l'aire"));
    lignesB.push(ligne(`${apres(rel(v, 2), v, 2)}${u}`, "calculatrice en degrés"));
  }
  return [
    utilise("a", [texte(`On part de la formule de l'aire ${COURS_TRIANGLE} et on isole le côté cherché, une opération par ligne.`)]),
    calcul("a", [
      ligne(`${AIRE}=\\dfrac{1}{2}\\cdot ${seg1}\\cdot ${seg2}\\cdot\\sin ${x}`, `formule de l'aire, avec l'angle ${X} compris entre ${seg1} et ${seg2}`),
      ligne(`2${AIRE}=${seg1}\\cdot ${seg2}\\cdot\\sin ${x}`, "on multiplie les deux membres par 2"),
      ligne(`${seg2}=\\dfrac{2${AIRE}}{${seg1}\\cdot\\sin ${x}}`, [texte("on divise les deux membres par "), latex(`${seg1}\\cdot\\sin ${x}`)]),
    ]),
    resultat("a", [latex(latexOptionFormule(e, "formuleCote", "correcte"))]),
    piege("a", [texte("En isolant, le ½ devient un facteur 2 au numérateur, et le sinus divise.")]),
    utilise("b", [texte("On remplace dans l'expression trouvée : "), latex(`\\sin ${e.angle}^\\circ`), texte(s ? ` est une valeur remarquable ${COURS_VALEURS_REMARQUABLES}.` : " à la calculatrice, en degrés.")]),
    calcul("b", lignesB),
    resultat("b", [latex(reponseNumeriqueLatex(e, "calculCote"))]),
    verification(
      "b",
      [texte("On retrouve l'aire donnée :")],
      [
        ligne(`\\dfrac{1}{2}\\cdot ${e.cote1}\\cdot ${auPlusDeux(v)}\\cdot\\sin ${e.angle}^\\circ${rel(v, 2) === "=" && e.aire.exacte ? `=${radicalLatex(e.aire.exacte)}` : apres(rel(v, 2) === "=" ? rel(e.aire.valeur, 1) : "\\approx", 0.5 * e.cote1 * v * Math.sin((e.angle * Math.PI) / 180), 1)}${uniteAire(e)}`, "aire : ½ · côté · côté · sinus de l'angle compris"),
      ],
    ),
  ];
}

function auPlusDeux(v: number): string {
  return rel(v, 2) === "=" ? nb(v, 2) : nbFixe(v, 2);
}

// ---------------------------------------------------------------------------------------------
// Famille « angle »
// ---------------------------------------------------------------------------------------------

function etapesAngle(e: FamilleAngle): EtapeCorrection[] {
  const { X, seg1, seg2 } = noms(e);
  const x = chapeau(X);
  const s = sinusAttendu(e);
  const angles = anglesAttendus(e);
  const lignesA: LigneCalcul[] = [
    ligne(`${AIRE}=\\dfrac{1}{2}\\cdot ${seg1}\\cdot ${seg2}\\cdot\\sin ${x}`, `formule de l'aire, avec l'angle ${X} compris entre ${seg1} et ${seg2}`),
    ligne(`2${AIRE}=${seg1}\\cdot ${seg2}\\cdot\\sin ${x}`, "on multiplie les deux membres par 2"),
    ligne(`\\sin ${x}=\\dfrac{2${AIRE}}{${seg1}\\cdot ${seg2}}`, [texte("on divise les deux membres par "), latex(`${seg1}\\cdot ${seg2}`)]),
    ligne(`=\\dfrac{2\\cdot ${aireDonneeLatex(e)}}{${e.cote1}\\cdot ${e.cote2}}`, "on remplace"),
  ];
  const se = sinusExact(e.angle);
  if (e.aire.exacte && se) {
    lignesA.push(ligne(`=\\dfrac{${radicalLatex(fois(2, e.aire.exacte, 1))}}{${e.cote1 * e.cote2}}`, "on calcule"));
    lignesA.push(ligne(`=${radicalLatex(se)}`, "on simplifie"));
    if (se.r !== 1) lignesA.push(ligne(`\\approx ${nbFixe(s, 3)}`));
  } else {
    lignesA.push(ligne(`=\\dfrac{${nb(2 * e.aire.valeur)}}{${e.cote1 * e.cote2}}`, "on calcule"));
    lignesA.push(ligne(`${apres(rel(s, 3), s, 3)}`, "valeur exacte gardée en mémoire"));
  }
  const etapes: EtapeCorrection[] = [
    utilise("a", [texte(`On part de la formule de l'aire ${COURS_TRIANGLE} et on isole le sinus de l'angle compris, une opération par ligne.`)]),
    calcul("a", lignesA),
    resultat("a", [latex(reponseNumeriqueLatex(e, "sinus"))]),
    utilise("b", [texte("Entre 0° et 180°, deux angles supplémentaires ont le même sinus "), latex("\\sin(180^\\circ-x)=\\sin x"), texte(` ${COURS_ANGLES_ASSOCIES} ; seul l'angle droit a un sinus égal à 1.`)]),
  ];
  if (angles.length === 1) {
    etapes.push(calcul("b", [ligne(`\\sin ${x}=1`, "sinus maximal"), ligne(`${x}=90^\\circ`, "un seul angle entre 0° et 180° : 180° − 90° = 90°, le même")]));
    etapes.push(resultat("b", [texte(LIBELLES_NOMBRE_ANGLES.un)]));
  } else {
    etapes.push(
      calcul("b", [
        ligne(`\\sin ${x}${apres(rel(s, 3), s, 3)}<1`, "un sinus strictement compris entre 0 et 1"),
        ligne(`\\sin(180^\\circ-${x}_1)=\\sin ${x}_1`, "l'angle aigu et son supplémentaire conviennent tous les deux"),
      ]),
    );
    etapes.push(resultat("b", [texte(LIBELLES_NOMBRE_ANGLES.deux)]));
  }
  etapes.push(piege("b", [texte("La touche "), latex("\\sin^{-1}"), texte(" ne donne que l'angle aigu : ne pas oublier son supplémentaire, qui donne un second triangle de même aire.")]));
  // c) les amplitudes
  let lignesC: LigneCalcul[];
  if (angles.length === 1) {
    lignesC = [ligne(`${x}=90^\\circ`, "le seul angle de sinus 1")];
  } else if (se && e.aire.exacte) {
    const aigu = e.angle > 90 ? 180 - e.angle : e.angle;
    lignesC = [
      ligne(`${x}_1=${aigu}^\\circ`, [texte(`valeur remarquable ${COURS_VALEURS_REMARQUABLES} : `), latex(`\\sin ${aigu}^\\circ=${radicalLatex(se)}`)]),
      ligne(`${x}_2=180^\\circ-${x}_1`, `angle supplémentaire, de même sinus ${COURS_ANGLES_ASSOCIES}`),
      ligne(`=180^\\circ-${aigu}^\\circ`),
      ligne(`=${180 - aigu}^\\circ`),
    ];
  } else {
    lignesC = lignesArcsin({ X: `${x}_1`, angle: angles[0]!, supplementaire: { X2: `${x}_2`, angle2: angles[1]! } });
  }
  etapes.push(
    utilise("c", [texte("La touche "), latex("\\sin^{-1}"), texte(` (ou une valeur remarquable) donne l'angle aigu ; le second angle est son supplémentaire ${COURS_ANGLES_ASSOCIES}.`)]),
    calcul("c", lignesC),
    { ...resultat("c", [latex(reponseAnglesLatex(e))]), figureHtml: figureSvgPapier(e, true) },
  );
  return etapes;
}

// ---------------------------------------------------------------------------------------------
// Famille « quadrilatere »
// ---------------------------------------------------------------------------------------------

function etapesQuadrilatere(q: Quadri): EtapeCorrection[] {
  const B = "\\widehat{ABC}";
  const a1 = aireABC(q);
  const AC = diagonale(q);
  const a2 = aireACD(q);
  const total = a1 + a2;
  const lignesB: LigneCalcul[] =
    q.angleB === 90
      ? [
          ligne("AC^2=AB^2+BC^2", "théorème de Pythagore : ABC est rectangle en B"),
          ligne(`=${q.AB}^2+${q.BC}^2`, "on remplace"),
          ligne(`=${q.AB * q.AB}+${q.BC * q.BC}`),
          ligne(`=${q.AB * q.AB + q.BC * q.BC}`),
          ligne(`AC=\\sqrt{${q.AB * q.AB + q.BC * q.BC}}`, "une longueur est positive : racine carrée"),
          ligne(`${apres(rel(AC, 2), AC, 2)}${uniteLongueur(q)}`),
        ]
      : lignesAlKashiCote({ x: "AC", p: "AB", q: "BC", X: B, vp: donnee(q.AB), vq: donnee(q.BC), vX: angleDonne(q.angleB), resultat: AC, unite: q.unite });
  return [
    utilise("a", [texte(`La diagonale AC découpe ABCD en deux triangles, ABC et ACD : l'aire de ABCD est la somme de leurs aires ${COURS_TRIANGLE}. Dans ABC, l'angle B est compris entre AB et BC.`)]),
    calcul("a", lignesAire({ nom: `${AIRE}_{ABC}`, p: "AB", q: "BC", X: B, vp: donnee(q.AB), vq: donnee(q.BC), vX: angleDonne(q.angleB), aire: a1, unite: q.unite })),
    resultat("a", [latex(reponseNumeriqueLatex(q, "aireABC"))]),
    utilise("b", q.angleB === 90 ? [texte("Pour l'aire de ACD, il faut AC : le triangle ABC est rectangle en B, théorème de Pythagore.")] : [texte(`Pour l'aire de ACD, il faut AC : loi des cosinus (Al-Kashi) dans ABC, avec l'angle B compris entre AB et BC ${COURS_TRIANGLE} : `), latex(`AC^2=AB^2+BC^2-2\\cdot AB\\cdot BC\\cdot\\cos ${B}`)]),
    calcul("b", lignesB),
    resultat("b", [latex(reponseNumeriqueLatex(q, "diagonale"))]),
    piege("b", [texte(q.angleB > 90 ? "L'angle B est obtus : son cosinus est négatif, le terme retranché s'ajoute. Ne pas oublier la racine carrée, et garder AC en mémoire." : q.angleB === 90 ? "Ne pas oublier la racine carrée ; garder AC en mémoire de la calculatrice." : "Ne pas oublier le terme en cosinus ni la racine carrée ; garder AC en mémoire de la calculatrice.")]),
    utilise("c", [texte("Dans ACD, l'angle C est compris entre CA et CD ; on additionne ensuite les aires des deux triangles.")]),
    calcul("c", lignesAire({ nom: `${AIRE}_{ACD}`, p: "AC", q: "CD", X: "\\widehat{ACD}", vp: coteMemoire(AC), vq: donnee(q.CD), vX: angleDonne(q.angleACD), aire: a2, unite: q.unite }), [], "Aire de ACD"),
    calcul(
      "c",
      [
        ligne(`${AIRE}_{ABCD}=${AIRE}_{ABC}+${AIRE}_{ACD}`, "la diagonale découpe ABCD en deux triangles"),
        ligne(`\\approx ${rel(a1, 2) === "=" ? nb(a1, 2) : nbFixe(a1, 2)}+${nbFixe(a2, 2)}`, "valeurs exactes gardées en mémoire, écrites arrondies"),
        ligne(`${apres("\\approx", total, 2)}${uniteAire(q)}`),
      ],
      [],
      "Aire de ABCD",
    ),
    resultat("c", [latex(reponseNumeriqueLatex(q, "aireTotale"))]),
    piege("c", [texte("L'aire de ACD seule n'est pas l'aire du quadrilatère : il faut ajouter celle de ABC.")]),
  ];
}

// ---------------------------------------------------------------------------------------------
// Famille « heron »
// ---------------------------------------------------------------------------------------------

function etapesHeron(h: Heron): EtapeCorrection[] {
  const p = demiPerimetre(h);
  const P = produitHeron(h);
  const aire = aireHeron(h);
  const pT = nb(p, 1);
  const u = uniteLongueur(h);
  const cosA = (h.b * h.b + h.c * h.c - h.a * h.a) / (2 * h.b * h.c);
  const A = (Math.acos(cosA) * 180) / Math.PI;
  return [
    utilise("a", [texte("Le demi-périmètre est la moitié de la somme des trois côtés.")]),
    calcul("a", [
      ligne("p=\\dfrac{BC+AC+AB}{2}", "demi-périmètre"),
      ligne(`=\\dfrac{${h.a}+${h.b}+${h.c}}{2}`, "on remplace"),
      ligne(`=\\dfrac{${h.a + h.b + h.c}}{2}`),
      ligne(`=${pT}${u}`),
    ]),
    resultat("a", [latex(reponseNumeriqueLatex(h, "demiPerimetre"))]),
    piege("a", [texte("La formule de Héron utilise le DEMI-périmètre p, pas le périmètre.")]),
    utilise("b", [texte(`Formule de Héron ${COURS_TRIANGLE}, avec le demi-périmètre p et les trois côtés : `), latex(`${AIRE}=\\sqrt{p\\,(p-BC)(p-AC)(p-AB)}`)]),
    calcul("b", [
      ligne(`${AIRE}=\\sqrt{p\\,(p-BC)(p-AC)(p-AB)}`, "formule de Héron"),
      ligne(`=\\sqrt{${pT}\\cdot(${pT}-${h.a})\\cdot(${pT}-${h.b})\\cdot(${pT}-${h.c})}`, "on remplace"),
      ligne(`=\\sqrt{${pT}\\cdot ${nb(p - h.a, 1)}\\cdot ${nb(p - h.b, 1)}\\cdot ${nb(p - h.c, 1)}}`, "on calcule chaque différence"),
      ligne(`=\\sqrt{${nb(P, 4)}}`, "on calcule le produit"),
      ligne(`${apres(rel(aire, 2), aire, 2)}${uniteAire(h)}`, rel(aire, 2) === "=" ? "le produit est un carré parfait" : "calculatrice"),
    ]),
    resultat("b", [latex(reponseNumeriqueLatex(h, "aireHeron"))]),
    verification(
      "b",
      [texte("Par Al-Kashi puis ½ · côté · côté · sinus :")],
      [
        ligne(`\\cos\\hat{A}=\\dfrac{${h.b}^2+${h.c}^2-${h.a}^2}{2\\cdot ${h.b}\\cdot ${h.c}}`, "Al-Kashi isolée en cosinus"),
        ligne(`${apres(rel(cosA, 4), cosA, 4)}`),
        ligne(`\\hat{A}${apres(rel(A, 1), A, 1)}^\\circ`, [texte("touche "), latex("\\cos^{-1}")]),
        ligne(`${AIRE}=\\dfrac{1}{2}\\cdot ${h.b}\\cdot ${h.c}\\cdot\\sin\\hat{A}`, "aire avec l'angle compris"),
        ligne(`${apres(rel(aire, 2), aire, 2)}${uniteAire(h)}`, "la même aire"),
      ],
    ),
  ];
}

export function correctionDetailleeAireTriangleSinus(e: E): EtapeCorrection[] {
  let etapes: EtapeCorrection[];
  switch (e.famille) {
    case "aire":
      etapes = etapesAire(e);
      break;
    case "cote":
      etapes = etapesCote(e);
      break;
    case "angle":
      etapes = etapesAngle(e);
      break;
    case "quadrilatere":
      etapes = etapesQuadrilatere(e);
      break;
    case "heron":
      etapes = etapesHeron(e);
      break;
  }
  return finaliserCorrigeTriangles(etapes);
}

