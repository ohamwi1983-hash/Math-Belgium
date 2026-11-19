import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import type { ExerciceTriangleLies } from "../../core/triangleLies.types";
import { formatAnglesConfirmes, formatCibleConfirmee, formatPontConfirme, formatSoustractionConfirmee, uniteLongueurPont } from "../../ui/formatTriangleLies";
import {
  COURS_TRIANGLE,
  COURS_TRIANGULATION,
  angleDonne,
  apres,
  coteMemoire,
  donnee,
  finaliserCorrigeTriangles,
  lignesAire,
  lignesAlKashiCote,
  lignesLoiSinusCote,
  lignesSommeAngles,
  nb,
  rel,
  relSubst,
  tex,
  u,
  type Val,
} from "../../ui/corrigeTriangles";

/**
 * Corrigé détaillé « comme au tableau » de gen58 (triangles liés : la triangulation) — règle
 * `.claude/rules/feuilles-evaluations.md`. Une étape par écran de l'appli (`sessionTriangleLies` :
 * pont, puis angles OU soustraction selon la variante, cible, interprétation) : a) le triangle
 * « pont » résolu (Pythagore, trigonométrie du triangle rectangle, Al-Kashi ou somme des angles +
 * loi des sinus, selon la famille), b) les deux angles du triangle cible (différence des visées,
 * hypothèse) ou ses deux côtés (soustraction), c) le triangle cible (loi des sinus, Al-Kashi, aire,
 * hauteur totale), d) l'interprétation (lecture : grandeur et unité). Les valeurs calculées sont
 * réutilisées EXACTES (mémoire), écrites arrondies au centième. Partagé par l'adaptateur et l'appli.
 */

type E = ExerciceTriangleLies;

/** Point en LaTeX (« I1 » → « I_1 »). */
const P = (nom: string) => nom.replace(/^([A-Z])(\d)$/, "$1_$2");
const seg = (p: string, q: string) => `${P(p)}${P(q)}`;
const ang = (p: string, q: string, r: string) => `\\widehat{${P(p)}${P(q)}${P(r)}}`;

/** Noms des points du triangle « pont » et du triangle cible, selon la famille. */
function noms(e: E) {
  switch (e.famille) {
    case "distanceInaccessible":
      return { O: "O", R: "R", M: "I1", T: "I2" };
    default:
      return { O: "O", R: "R", M: "M", T: "T" };
  }
}

const verticale = (e: E) => e.famille === "hauteurInaccessible" || e.famille === "inclinaisonCable" || e.famille === "hauteurArbre" || e.famille === "sectionFalaise";

/** Sommet commun des familles « sommet partagé » (O pour les navires, S sinon). */
const sommet = (e: E) => (e.famille === "naviresConvergents" ? "O" : "S");

function U(e: E): string {
  return uniteLongueurPont(e);
}

// ---------------------------------------------------------------------------------------------
// a) Le triangle pont
// ---------------------------------------------------------------------------------------------

function etapePont(e: E): EtapeCorrection[] {
  const t = e.trianglePont;
  const d = (i: number) => e.donneesPont[i]!.valeur;
  const unite = U(e);
  let lignes: LigneCalcul[] = [];
  let blocs: EtapeCorrection[] | null = null;
  let regle: string;
  switch (e.famille) {
    case "terrainRectangle": {
      const carre = d(0) ** 2 + d(1) ** 2;
      regle = "Le triangle ABC est rectangle en B : théorème de Pythagore, AC est l'hypoténuse.";
      lignes = [
        ligne("AC^2=AB^2+BC^2", "Pythagore dans ABC, rectangle en B"),
        ligne(`=${d(0)}^2+${d(1)}^2`, "on remplace"),
        ligne(`=${d(0) ** 2}+${d(1) ** 2}`),
        ligne(`=${carre}`),
        ligne(`AC=\\sqrt{${carre}}`, "une longueur est positive : racine carrée"),
        ligne(`${apres(rel(t.a, 2), t.a, 2)}${u(unite)}`),
      ];
      break;
    }
    case "terrainQuelconque":
    case "terrainSportif":
      regle = `Dans ABC, on connaît deux côtés et l'angle compris en B : loi des cosinus (Al-Kashi) ${COURS_TRIANGLE}.`;
      lignes = lignesAlKashiCote({ x: "AC", p: "AB", q: "BC", X: ang("A", "B", "C"), vp: donnee(d(0)), vq: donnee(d(1)), vX: angleDonne(d(2)), resultat: t.a, unite });
      break;
    case "hauteurInaccessible":
    case "inclinaisonCable": {
      regle = "Le triangle OFM est rectangle en F : dans un triangle rectangle, le sinus d'un angle aigu est le côté opposé divisé par l'hypoténuse.";
      lignes = [
        ligne(`\\sin ${ang("F", "O", "M")}=\\dfrac{FM}{OM}`, "côté opposé à l'angle d'élévation, sur l'hypoténuse"),
        ligne(`OM=\\dfrac{FM}{\\sin ${ang("F", "O", "M")}}`, "on isole OM"),
        ligne(`=\\dfrac{${d(0)}}{\\sin ${d(1)}^\\circ}`, "on remplace : FM est la hauteur de M, l'angle d'élévation est en O"),
        ligne(`${apres(rel(t.a, 2), t.a, 2)}${u(unite)}`, "calculatrice en degrés"),
      ];
      break;
    }
    case "distanceInaccessible":
    case "hauteurArbre":
    case "sectionFalaise": {
      const { O, R, M } = noms(e);
      regle = `Dans le triangle ${P(O)}${P(R)}${P(M)}, on connaît un côté et deux angles : le troisième angle par la somme, puis la loi des sinus ${COURS_TRIANGLE}.`;
      blocs = [
        calcul("a", lignesSommeAngles({ inconnu: ang(O, M, R), autres: [ang(R, O, M), ang(O, R, M)], valeurs: [angleDonne(d(1)), angleDonne(d(2))], resultat: t.B }), [], `Angle en ${P(M)}`),
        calcul(
          "a",
          lignesLoiSinusCote({ x: seg(O, M), X: ang(O, R, M), k: seg(O, R), K: ang(O, M, R), vk: donnee(d(0)), vX: angleDonne(d(2)), vK: angleDonne(t.B), resultat: t.a, unite }),
          [],
          `Distance ${P(O)}${P(M)}`,
        ),
      ];
      break;
    }
    case "naviresConvergents":
    case "randonneursSommet": {
      const S = sommet(e);
      const angS = ang("A", S, "B");
      regle = `Dans le triangle ${S}AB, on connaît la base AB et les deux angles qui lui sont adjacents : l'angle en ${S} par la somme, puis la loi des sinus pour chacun des deux autres côtés ${COURS_TRIANGLE}.`;
      blocs = [
        calcul("a", lignesSommeAngles({ inconnu: angS, autres: [ang(S, "A", "B"), ang(S, "B", "A")], valeurs: [angleDonne(d(1)), angleDonne(d(2))], resultat: t.A }), [], `Angle en ${S}`),
        calcul("a", lignesLoiSinusCote({ x: `${S}A`, X: ang(S, "B", "A"), k: "AB", K: angS, vk: donnee(d(0)), vX: angleDonne(d(2)), vK: angleDonne(t.A), resultat: t.b, unite }), [], `Distance ${S}A`),
        calcul("a", lignesLoiSinusCote({ x: `${S}B`, X: ang(S, "A", "B"), k: "AB", K: angS, vk: donnee(d(0)), vX: angleDonne(d(1)), vK: angleDonne(t.A), resultat: t.c, unite }), [], `Distance ${S}B`),
      ];
      break;
    }
    case "avionsConvergents": {
      const carre = d(1) ** 2 - d(0) ** 2;
      regle = "Les deux routes sont perpendiculaires en S : le triangle SAB est rectangle en S, AB est l'hypoténuse (théorème de Pythagore).";
      lignes = [
        ligne("AB^2=SA^2+SB^2", "Pythagore dans SAB, rectangle en S"),
        ligne("SB^2=AB^2-SA^2", [texte("on retranche "), latex("SA^2"), texte(" aux deux membres")]),
        ligne(`=${d(1)}^2-${d(0)}^2`, "on remplace"),
        ligne(`=${d(1) ** 2}-${d(0) ** 2}`),
        ligne(`=${carre}`),
        ligne(`SB=\\sqrt{${carre}}`, "une longueur est positive : racine carrée"),
        ligne(`${apres(rel(t.c, 2), t.c, 2)}${u(unite)}`),
      ];
      break;
    }
  }
  return [
    utilise("a", [texte(`${regle} Le triangle « pont » fournit l'élément commun aux deux triangles ${COURS_TRIANGULATION}.`)]),
    ...(blocs ?? [calcul("a", lignes)]),
    resultat("a", [texte(`${formatPontConfirme(e).replace(/^./, (c) => c.toUpperCase())}.`)]),
    piege("a", [texte("Le côté commun se calcule dans le triangle pont : il ne se mesure pas sur le croquis, qui n'est pas à l'échelle. On le garde en mémoire de la calculatrice.")]),
  ];
}

// ---------------------------------------------------------------------------------------------
// b) Les angles (visées depuis un même point) ou les côtés (soustractions) du triangle cible
// ---------------------------------------------------------------------------------------------

function etapeAngles(e: E): EtapeCorrection[] {
  const { O, M, T } = noms(e);
  const [v1, v2] = e.anglesBrutsVisee!;
  const c = e.triangleCible;
  const lignesHyp: LigneCalcul[] = verticale(e)
    ? [
        ligne(`${ang(O, M, T)}=180^\\circ-(90^\\circ-${v1.valeur}^\\circ)`, "M et T sur la même verticale : en M, l'angle entre la verticale vers le bas et (MO) vaut 90° moins l'élévation ; l'angle du triangle est son supplémentaire"),
        ligne(`=${nb(c.C)}^\\circ`),
      ]
    : [ligne(`${ang(O, M, T)}=90^\\circ`, [texte("hypothèse : "), latex(`(${seg(M, T)})\\perp(${seg(O, M)})`)])];
  return [
    utilise("b", [texte(`Les deux visées partent du même point ${O} : l'angle du triangle cible en ${O} est leur DIFFÉRENCE ${COURS_TRIANGULATION}. L'hypothèse de l'énoncé donne le deuxième angle.`)]),
    calcul("b", [ligne(`${ang(M, O, T)}=${nb(v2.valeur)}^\\circ-${nb(v1.valeur)}^\\circ`, "différence des deux visées"), ligne(`=${nb(c.B)}^\\circ`)], [], `Angle en ${O}`),
    calcul("b", lignesHyp, [texte(`Hypothèse : ${(e.hypotheseAnnexe ?? "").replace(/\.$/, "").replace(/^./, (x) => x.toLowerCase())}.`)], `Angle en ${P(M)}`),
    resultat("b", [texte(`${formatAnglesConfirmes(e).replace(/^./, (x) => x.toUpperCase())}.`)]),
    piege("b", [texte("L'angle du triangle cible est la différence des deux visées, jamais l'une des deux visées prise seule.")]),
  ];
}

function etapeSoustraction(e: E): EtapeCorrection[] {
  const S = sommet(e);
  const [d1, d2] = e.distancesParcourues!;
  const t = e.trianglePont;
  const unite = U(e);
  const lignesCote = (nom: string, total: string, vTotal: Val, dist: number, resultatV: number): LigneCalcul[] => [
    ligne(`${nom}=${total}-${nb(dist)}`, "distance qui reste à parcourir : côté du pont moins la distance déjà parcourue"),
    ligne(`${relSubst(vTotal)}${tex(vTotal)}-${nb(dist)}`, relSubst(vTotal) === "=" ? "on remplace" : "on remplace (valeur exacte gardée en mémoire)"),
    ligne(`${relSubst(vTotal) === "=" ? apres(rel(resultatV, 2), resultatV, 2) : apres("\\approx", resultatV, 2)}${u(unite)}`),
  ];
  const vb = e.famille === "avionsConvergents" ? donnee(t.b) : coteMemoire(t.b);
  return [
    utilise("b", [texte(`Le triangle cible a le même angle au sommet ${S} ; ses côtés sont les distances qui RESTENT à parcourir.`)]),
    calcul("b", lignesCote(`${S}C`, `${S}A`, vb, d1!.valeur, e.triangleCible.b), [], `Côté ${S}C`),
    calcul("b", lignesCote(`${S}D`, `${S}B`, coteMemoire(t.c), d2!.valeur, e.triangleCible.c), [], `Côté ${S}D`),
    resultat("b", [texte(`${formatSoustractionConfirmee(e)} ; angle en ${S} inchangé.`)]),
    piege("b", [texte("Les distances déjà parcourues ne sont pas les côtés du triangle cible : on les retranche aux côtés du triangle pont.")]),
  ];
}

// ---------------------------------------------------------------------------------------------
// c) Le triangle cible
// ---------------------------------------------------------------------------------------------

function etapeCible(e: E, lettre: string): EtapeCorrection[] {
  const c = e.triangleCible;
  const unite = U(e);
  const blocs: EtapeCorrection[] = [];
  let regle = "";
  const objet = e.questionCible.replace(/^Calcule /, "").replace(/\.$/, "").replace(/,.*$/, "");
  if (e.variante === "cotePartage") {
    const d1 = e.donneesCibleEnonce[0]!.valeur;
    const d2 = e.donneesCibleEnonce[1]!.valeur;
    regle = `Dans ACD, on connaît le côté commun AC et les deux angles adjacents : l'angle en D par la somme, puis la loi des sinus ${COURS_TRIANGLE}.`;
    blocs.push(calcul(lettre, lignesSommeAngles({ inconnu: ang("A", "D", "C"), autres: [ang("D", "A", "C"), ang("D", "C", "A")], valeurs: [angleDonne(d1), angleDonne(d2)], resultat: c.A }), [], "Angle en D"));
    blocs.push(calcul(lettre, lignesLoiSinusCote({ x: "CD", X: ang("D", "A", "C"), k: "AC", K: ang("A", "D", "C"), vk: coteMemoire(c.a), vX: angleDonne(d1), vK: angleDonne(c.A), resultat: c.b, unite }), [], "Côté CD"));
    if (e.grandeurDemandee === "aire") {
      regle += " Puis l'aire avec deux côtés et l'angle compris.";
      blocs.push(calcul(lettre, lignesAire({ nom: "\\mathcal{A}_{ACD}", p: "AC", q: "CD", X: ang("A", "C", "D"), vp: coteMemoire(c.a), vq: coteMemoire(c.b), vX: angleDonne(d2), aire: e.valeurCibleAttendue, unite }), [], "Aire de ACD"));
    }
  } else if (e.variante === "anglePartage") {
    const { O, M, T } = noms(e);
    regle = `Dans le triangle ${P(O)}${P(M)}${P(T)}, on connaît ${seg(O, M)} et deux angles : l'angle en ${P(T)} par la somme, puis la loi des sinus ${COURS_TRIANGLE}.`;
    blocs.push(calcul(lettre, lignesSommeAngles({ inconnu: ang(O, T, M), autres: [ang(M, O, T), ang(O, M, T)], valeurs: [angleDonne(c.B), angleDonne(c.C)], resultat: c.A }), [], `Angle en ${P(T)}`));
    if (e.famille !== "inclinaisonCable") {
      blocs.push(
        calcul(lettre, lignesLoiSinusCote({ x: seg(M, T), X: ang(M, O, T), k: seg(O, M), K: ang(O, T, M), vk: coteMemoire(c.a), vX: angleDonne(c.B), vK: angleDonne(c.A), resultat: c.b, unite }), [], `Côté ${seg(M, T).replace(/_/g, "")}`),
      );
    }
    if (e.famille === "hauteurInaccessible") {
      const hM = e.donneesPont[0]!.valeur;
      regle += " La hauteur totale est la hauteur de M plus MT.";
      blocs.push(calcul(lettre, [ligne("FT=FM+MT", "F, M et T alignés sur la verticale"), ligne(`\\approx ${hM}+${tex(coteMemoire(c.b))}`, "valeur exacte de MT gardée en mémoire"), ligne(`${apres("\\approx", e.valeurCibleAttendue, 2)}${u(unite)}`)], [], "Hauteur totale"));
    } else if (e.famille === "hauteurArbre") {
      const elev = e.anglesBrutsVisee![0].valeur;
      const hM = e.valeurCibleAttendue - c.b;
      regle += " La hauteur de M se calcule dans le triangle rectangle formé par O, M et le pied de la verticale.";
      blocs.push(
        calcul(
          lettre,
          [
            ligne(`h_M=OM\\cdot\\sin ${elev}^\\circ`, "hauteur de M : côté opposé à l'élévation, dans le triangle rectangle d'hypoténuse OM"),
            ligne(`\\approx ${tex(coteMemoire(c.a))}\\cdot\\sin ${elev}^\\circ`, "OM gardé en mémoire"),
            ligne(`${apres("\\approx", hM, 2)}${u(unite)}`),
            ligne("h=h_M+MT", "M et T sur la même verticale"),
            ligne(`\\approx ${tex(coteMemoire(hM))}+${tex(coteMemoire(c.b))}`, "valeurs exactes gardées en mémoire"),
            ligne(`${apres("\\approx", e.valeurCibleAttendue, 2)}${u(unite)}`),
          ],
          [],
          "Hauteur totale",
        ),
      );
    } else if (e.famille === "sectionFalaise") {
      regle += " Puis l'aire avec deux côtés et l'angle compris.";
      blocs.push(calcul(lettre, lignesAire({ nom: "\\mathcal{A}_{OMT}", p: "OM", q: "MT", X: ang("O", "M", "T"), vp: coteMemoire(c.a), vq: coteMemoire(c.b), vX: angleDonne(c.C), aire: e.valeurCibleAttendue, unite }), [], "Aire de OMT"));
    }
  } else {
    const S = sommet(e);
    const t = e.trianglePont;
    const vb = e.famille === "avionsConvergents" ? donnee(c.b) : coteMemoire(c.b);
    if (e.grandeurDemandee === "aire") {
      regle = `Le triangle ${S}CD a deux côtés connus et l'angle compris en ${S} (90°) : aire = demi-produit des côtés par le sinus de l'angle compris ${COURS_TRIANGLE}.`;
      blocs.push(calcul(lettre, lignesAire({ nom: `\\mathcal{A}_{${S}CD}`, p: `${S}C`, q: `${S}D`, X: ang("C", S, "D"), vp: vb, vq: coteMemoire(c.c), vX: angleDonne(t.A), aire: e.valeurCibleAttendue, unite })));
    } else {
      regle = `Le triangle ${S}CD a deux côtés connus et l'angle compris en ${S} (celui du triangle pont) : loi des cosinus (Al-Kashi) ${COURS_TRIANGLE}.`;
      blocs.push(calcul(lettre, lignesAlKashiCote({ x: "CD", p: `${S}C`, q: `${S}D`, X: ang("C", S, "D"), vp: vb, vq: coteMemoire(c.c), vX: coteAngleMemoire(t.A), resultat: c.a, unite })));
    }
  }
  return [
    utilise(lettre, [texte(regle)]),
    ...blocs,
    resultat(lettre, [texte(`${objet.replace(/^./, (x) => x.toUpperCase())} ≈ ${formatCibleConfirmee(e)}.`)]),
  ];
}

/** Angle au sommet commun : calculé dans le pont (mémoire, écrit au dixième) — angle donné (90°) pour
 * les avions. */
function coteAngleMemoire(v: number): Val {
  return Number.isInteger(v) ? angleDonne(v) : { v, d: 1, angle: true };
}

// ---------------------------------------------------------------------------------------------
// d) L'interprétation (lecture)
// ---------------------------------------------------------------------------------------------

function etapeInterpretation(e: E, lettre: string): EtapeCorrection[] {
  const unite = e.uniteGrandeurCible;
  const nature = e.grandeurDemandee === "aire" ? "une aire s'exprime en unité de longueur au carré" : e.grandeurDemandee === "angle" ? "un angle s'exprime en degrés" : "une longueur s'exprime en unité de longueur";
  const correcte = e.optionsInterpretation.find((o) => o.correcte)!;
  return [
    utilise(lettre, [texte("On relit la question : la grandeur réellement demandée et son unité.")]),
    calcul(lettre, [ligne(`\\text{unité}=${unite === "°" ? "\\text{degré}" : `\\text{${unite}}`}`, nature)]),
    resultat(lettre, [texte(correcte.texte)]),
  ];
}

export function lettresTriangleLies(e: E): string[] {
  return e.variante === "cotePartage" ? ["a", "b", "c"] : ["a", "b", "c", "d"];
}

export function correctionDetailleeTriangleLies(e: E): EtapeCorrection[] {
  const etapes: EtapeCorrection[] = [...etapePont(e)];
  if (e.variante === "anglePartage") etapes.push(...etapeAngles(e));
  if (e.variante === "sommetPartage") etapes.push(...etapeSoustraction(e));
  const cible = e.variante === "cotePartage" ? "b" : "c";
  const interp = e.variante === "cotePartage" ? "c" : "d";
  etapes.push(...etapeCible(e, cible), ...etapeInterpretation(e, interp));
  return finaliserCorrigeTriangles(etapes);
}

