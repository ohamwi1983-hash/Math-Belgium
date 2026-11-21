import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import type { Composantes, EcranConstruction, ExerciceConstruireSomme } from "../../core/construireSomme.types";
import { VEC_U, VEC_V, coefficientsEffectifs, ecrans, moins, vecteurDemandeLatex } from "../../moteur/modeleConstruireSomme";
import { coefficientLatex, colonneLatex, origineFragments, relationLatex, sourceConstruction } from "../../ui/formatConstruireSomme";
import { COURS_CHASLES, COURS_COMPOSANTES, COURS_DIFFERENCE, COURS_MULTIPLE, COURS_OPPOSES, COURS_SOMME, COURS_VECTEUR, deplacementTexte, nb, nbp, finaliserVecteurs } from "../../ui/corrigeVecteurs2";
import { figureConstruireSomme } from "./figure";

/**
 * Corrigé détaillé « comme au tableau » de gen83 « Construire une somme, une différence, un point » —
 * règle `.claude/rules/feuilles-evaluations.md`. Une lettre par ÉCRAN (`moteur/modeleConstruireSomme.ts::ecrans`) ;
 * partagé par l'adaptateur papier et l'appli. Chaque construction : le déplacement calculé en
 * composantes (carreaux du quadrillage), puis le tracé décrit à partir de son origine ; la figure de
 * la construction complète (étapes en pointillés, résultat en orange) sous le dernier résultat.
 */

type E = ExerciceConstruireSomme;

const LETTRES = "abcd";

/** Colonne d'une somme non calculée : « (3 + (−1) ; 2 + 4) ». */
function colonneSomme(a: Composantes, b: Composantes): string {
  return `\\begin{pmatrix} ${nb(a.x)}+${nbp(b.x)} \\\\ ${nb(a.y)}+${nbp(b.y)} \\end{pmatrix}`;
}

function colonneDifference(a: Composantes, b: Composantes): string {
  return `\\begin{pmatrix} ${nb(a.x)}-${nbp(b.x)} \\\\ ${nb(a.y)}-${nbp(b.y)} \\end{pmatrix}`;
}

/** Déplacement d'un vecteur source multiplié : « 2\vec{u}=\begin{pmatrix}2\cdot 3\\…\end{pmatrix}=… ». */
function lignesSource(gauche: string, nomSource: string, source: Composantes, coef: number): LigneCalcul[] {
  if (coef === 1) return [ligne(`${gauche}=${colonneLatex(source)}`, "déplacements lus sur le quadrillage (carreaux)")];
  if (coef === -1) {
    return [
      ligne(`${gauche}=-${colonneLatex(source)}`, [texte("composantes de "), latex(nomSource), texte(" lues sur le quadrillage")]),
      ligne(`=${colonneLatex(moins({ x: 0, y: 0 }, source))}`, "opposé : on change le signe de chaque composante"),
    ];
  }
  const k = coefficientLatex(coef);
  return [
    ligne(`${gauche}=${k}${colonneLatex(source)}`, [texte("composantes de "), latex(nomSource), texte(" lues sur le quadrillage")]),
    ligne(`=\\begin{pmatrix} ${k}\\cdot ${nbp(source.x)} \\\\ ${k}\\cdot ${nbp(source.y)} \\end{pmatrix}`, "on multiplie chaque composante"),
    ligne(`=${colonneLatex({ x: coef * source.x, y: coef * source.y })}`),
  ];
}

function regle(e: E, ec: EcranConstruction): FragmentConsigne[] {
  switch (ec.role) {
    case "reporter":
      if (e.methode === "parallelogramme") return [texte(`Méthode du parallélogramme ${COURS_SOMME} : le côté issu de l'extrémité de `), latex(VEC_U), texte(" est une copie de "), latex(VEC_V), texte(` ; reporter un vecteur garde sa direction, son sens et sa longueur, seule l'origine change ${COURS_VECTEUR}.`)];
      if (e.methode === "triangle") return [texte(`Méthode du triangle ${COURS_SOMME} : on place `), latex(VEC_V), texte(" bout à bout, à partir de l'extrémité de "), latex(VEC_U), texte(` ; un vecteur reporté garde sa direction, son sens et sa longueur ${COURS_VECTEUR}.`)];
      return [texte(`Reporter un vecteur : même direction, même sens, même longueur ; seule l'origine change ${COURS_VECTEUR}. Ses composantes ne changent pas ${COURS_COMPOSANTES}.`)];
    case "oppose":
      return [texte(`L'opposé d'un vecteur a la même direction et la même longueur, mais le sens contraire ${COURS_OPPOSES} ; en composantes, chaque composante change de signe. `), ...(e.methode === "oppose" ? [texte(`Soustraire, c'est ajouter l'opposé ${COURS_DIFFERENCE}.`)] : [])];
    case "multiple":
      return [texte("Le vecteur "), latex("k\\vec{w}"), texte(` a la direction de `), latex("\\vec{w}"), texte(`, le même sens si k > 0, le sens contraire si k < 0, et une longueur multipliée par |k| ${COURS_MULTIPLE} ; en composantes, chaque composante est multipliée par k.`)];
    case "differenceCommune":
      return [latex(`${VEC_U}-${VEC_V}`), texte(" est le vecteur qui, ajouté à "), latex(VEC_V), texte(", redonne "), latex(VEC_U), texte(" : "), latex(`${VEC_V}+(${VEC_U}-${VEC_V})=${VEC_U}`), texte(`. Avec une origine commune, il va de l'extrémité de `), latex(VEC_V), texte(" à celle de "), latex(VEC_U), texte(` ${COURS_DIFFERENCE}.`)];
    case "resultat":
      if (e.methode === "parallelogramme") return [texte(`Méthode du parallélogramme ${COURS_SOMME} : la somme est la diagonale issue de O ; ses composantes sont les sommes des composantes ${COURS_COMPOSANTES}.`)];
      if (e.methode === "origineCommune") return [texte(`On reporte `), latex(`${VEC_U}-${VEC_V}`), texte(` à partir de O ${COURS_VECTEUR}.`)];
      return [texte(`Relation de Chasles ${COURS_CHASLES} : le vecteur demandé relie O directement au bout de la chaîne construite bout à bout ; ses composantes sont les sommes des composantes des étapes.`)];
    case "placerPoint":
      return [texte(`Relation de Chasles ${COURS_CHASLES} : `), latex("\\vec{AM}=\\vec{AP}+\\vec{PM}"), texte(" ; M s'obtient en traçant le second terme à partir de P.")];
  }
}

function etapesConstruction(e: E, ec: EcranConstruction, i: number, dernier: boolean): EtapeCorrection[] {
  const l = LETTRES[i]!;
  const w = moins(ec.attendu, ec.origine);
  const source = sourceConstruction(e, ec, i);
  const lignes: LigneCalcul[] = [];
  if (ec.role === "differenceCommune") {
    lignes.push(ligne(`${VEC_U}-${VEC_V}=${colonneDifference(e.u, e.v)}`, "composantes lues sur le quadrillage"), ligne(`=${colonneLatex(w)}`));
  } else if (ec.role === "resultat") {
    const eff = coefficientsEffectifs(e);
    if (e.methode === "origineCommune") {
      lignes.push(ligne(`${VEC_U}-${VEC_V}=${colonneLatex(w)}`, "étape précédente : mêmes composantes à partir de O"));
    } else {
      const t1 = { x: eff.k * e.u.x, y: eff.k * e.u.y };
      const t2 = { x: eff.l * e.v.x, y: eff.l * e.v.y };
      const gauche = vecteurDemandeLatex(e).replace(/ /g, "");
      if (e.methode === "chaine") {
        lignes.push(ligne(`${gauche}=${colonneSomme(t1, t2)}`, "déplacements des étapes a et b, bout à bout"), ligne(`=${colonneLatex(w)}`));
      } else if (e.methode === "oppose") {
        lignes.push(ligne(`${gauche}=${VEC_U}+(-${VEC_V})`, "soustraire, c'est ajouter l'opposé"), ligne(`=${colonneSomme(e.u, t2)}`, "composantes de u et de −v"), ligne(`=${colonneLatex(w)}`));
      } else {
        lignes.push(ligne(`${gauche}=${colonneSomme(e.u, e.v)}`, "composantes de u et de v lues sur le quadrillage"), ligne(`=${colonneLatex(w)}`));
      }
    }
  } else if (ec.role === "placerPoint" && source) {
    const P = ec.origine;
    const ap = moins(P, e.O);
    lignes.push(...lignesSource(`\\vec{PM}`, source.nom, source.composantes, source.coefficient));
    lignes.push(ligne(`\\vec{AM}=\\vec{AP}+\\vec{PM}`, "relation de Chasles"), ligne(`=${colonneSomme(ap, w)}`, [latex("\\vec{AP}"), texte(" : étape précédente ; "), latex("\\vec{PM}"), texte(" : ci-dessus")]), ligne(`=${colonneLatex(moins(ec.attendu, e.O))}`));
  } else if (source) {
    const gauche = e.variante === "point" ? "\\vec{AP}" : ec.vecteurLatex;
    lignes.push(...lignesSource(gauche, source.nom, source.composantes, source.coefficient));
  }
  const origine = origineFragments(e, ec, i);
  const fin: FragmentConsigne[] =
    ec.role === "placerPoint"
      ? [texte(`M est atteint à partir de P en se déplaçant de ${deplacementTexte(w)} : `), latex(`{\\vec{AM}=${colonneLatex(moins(ec.attendu, e.O))}}`), texte(".")]
      : [texte("On trace "), latex(e.variante === "point" ? "\\vec{AP}" : ec.vecteurLatex), texte(" à partir de "), ...origine, texte(` : ${deplacementTexte(w)}.`)];
  const res: EtapeCorrection = resultat(l, fin);
  const etapes: EtapeCorrection[] = [utilise(l, regle(e, ec)), calcul(l, lignes), dernier ? { ...res, figureHtml: figureConstruireSomme(e, true) } : res];
  return etapes;
}

function etapesChoix(e: E, options: string[], correct: number): EtapeCorrection[] {
  return [
    utilise("a", [texte("Deux vecteurs opposés : "), latex("\\vec{AM}=-\\vec{MA}"), texte(` ${COURS_OPPOSES} ; on change le signe de chaque terme.`)]),
    calcul("a", [
      ligne("\\vec{AM}=-\\vec{MA}", "vecteurs opposés"),
      ligne(`=-(${vecteurDemandeLatex(e).replace(/ /g, "")})`, [texte("relation de l'énoncé : "), latex(`{${relationLatex(e)}}`)]),
      ligne(`=${options[correct]!.replace(/ /g, "")}`, "on change le signe de chaque terme"),
    ]),
    resultat("a", [latex(`\\vec{AM} = ${options[correct]!}`)]),
  ];
}

function etapesLecture(e: E): EtapeCorrection[] {
  const lignes: LigneCalcul[] = [];
  for (const [nom, c] of [
    ["u", e.u],
    ["v", e.v],
  ] as const) {
    const dx = c.x === 0 ? "aucun déplacement horizontal" : `${String(Math.abs(c.x))} carreau${Math.abs(c.x) > 1 ? "x" : ""} vers la ${c.x > 0 ? "droite" : "gauche"}`;
    const dy = c.y === 0 ? "aucun déplacement vertical" : `${String(Math.abs(c.y))} carreau${Math.abs(c.y) > 1 ? "x" : ""} vers le ${c.y > 0 ? "haut" : "bas"}`;
    lignes.push(ligne(`x_${nom}=${nb(c.x)}`, `de l'origine à l'extrémité de ${nom} : ${dx}`), ligne(`y_${nom}=${nb(c.y)}`, dy));
  }
  return [
    utilise("a", [texte(`Les composantes se lisent de l'origine vers l'extrémité ${COURS_COMPOSANTES} : d'abord le déplacement horizontal (vers la droite : positif, vers la gauche : négatif), puis le vertical (vers le haut : positif, vers le bas : négatif) ; on les écrit en colonne.`)]),
    calcul("a", lignes),
    { ...resultat("a", [latex(`${VEC_U} = ${colonneLatex(e.u)}`), texte(" et "), latex(`${VEC_V} = ${colonneLatex(e.v)}`)]), figureHtml: figureConstruireSomme(e, true) },
  ];
}

function lignePiege(e: E): EtapeCorrection {
  const nombre = ecrans(e).length;
  const derniere = LETTRES[nombre - 1]!;
  switch (e.methode) {
    case "triangle":
      return piege("a", [texte("Bout à bout : la copie de "), latex(VEC_V), texte(" part de l'extrémité de "), latex(VEC_U), texte(", pas de O. Placer les deux vecteurs origine contre origine et relier leurs extrémités ne donne pas la somme.")]);
    case "parallelogramme":
      return piege(derniere, [texte("La somme est la diagonale issue de O. Le segment qui joint les extrémités de "), latex(VEC_U), texte(" et de "), latex(VEC_V), texte(" représente une différence, pas la somme.")]);
    case "oppose":
      return piege("a", [latex(`-${VEC_V}`), texte(" a le sens contraire de "), latex(VEC_V), texte(" : reporter "), latex(VEC_V), texte(" tel quel au bout de "), latex(VEC_U), texte(" donnerait "), latex(`${VEC_U}+${VEC_V}`), texte(".")]);
    case "origineCommune":
      return piege("a", [latex(`${VEC_U}-${VEC_V}`), texte(" va de l'extrémité de "), latex(VEC_V), texte(" vers celle de "), latex(VEC_U), texte(" ; la flèche dans l'autre sens représente "), latex(`${VEC_V}-${VEC_U}`), texte(".")]);
    case "chaine": {
      const negatif = e.k < 0 ? { c: e.k, nom: VEC_U, lettre: "a" } : e.l < 0 ? { c: e.l, nom: VEC_V, lettre: "b" } : null;
      if (negatif) return piege(negatif.lettre, [texte("Le coefficient de "), latex(negatif.nom), texte(" est négatif ("), latex(coefficientLatex(negatif.c)), texte(") : sa flèche va dans le sens contraire de "), latex(negatif.nom), texte(".")]);
      return piege("b", [texte("Bout à bout : le second terme part de l'extrémité du premier, pas de O.")]);
    }
    case "AM":
      return piege("b", [texte("Relation de Chasles : M s'atteint en passant par P, "), latex("\\vec{AM} = \\vec{AP} + \\vec{PM}"), texte(" ; le second terme part de P, pas de A.")]);
    case "MA":
      return piege("a", [latex("\\vec{MA}"), texte(" et "), latex("\\vec{AM}"), texte(" sont opposés : sans retourner la relation, on placerait le symétrique de M par rapport à A.")]);
    case "lecture":
      return piege("a", [texte("On lit de l'origine vers l'extrémité : un déplacement vers la gauche ou vers le bas donne une composante négative.")]);
  }
}

function corrigeBrutConstruireSomme(e: E): EtapeCorrection[] {
  const liste = ecrans(e);
  const etapes: EtapeCorrection[] = [];
  liste.forEach((ec, i) => {
    if (ec.type === "choix") etapes.push(...etapesChoix(e, ec.options, ec.correct));
    else if (ec.type === "lecture") etapes.push(...etapesLecture(e));
    else etapes.push(...etapesConstruction(e, ec, i, i === liste.length - 1));
  });
  const p = lignePiege(e);
  const fin = etapes.map((x) => x.sousQuestion).lastIndexOf(p.sousQuestion);
  etapes.splice(fin + 1, 0, p);
  return etapes;
}

export function correctionDetailleeConstruireSomme(e: E): EtapeCorrection[] {
  return finaliserVecteurs(corrigeBrutConstruireSomme(e));
}
