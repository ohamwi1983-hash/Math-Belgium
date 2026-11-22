import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { DroiteSupport, EtapeConstructionFuite, ExercicePointFuite, Pt, VariantePointFuite } from "../../core/pointFuite.types";
import { figurePointFuiteSvg, sceneComplete, type LigneFigureFuite } from "../../ui/figurePointFuite";
import { reponseAffirmations, reponseConstruction } from "../../ui/formatPointFuite";
import { COURS_DURER, COURS_FUITE, finaliserEspace2, nomL } from "../../ui/corrigeEspace2";
import { distanceDroite } from "./geometrieFuite";

/**
 * Corrigé détaillé « comme au tableau » de gen105 « Perspective centrale : point de fuite » — règle
 * `.claude/rules/feuilles-evaluations.md`. Une lettre par ÉCRAN : a) et b) chaque point construit est
 * sur deux droites — une ligne par droite, la propriété de la perspective centrale à droite (fuyante qui
 * passe par le point de fuite, droite parallèle à la vitre qui reste horizontale ou verticale,
 * diagonales parallèles et leur point de fuite sur la ligne d'horizon, droite (BM) des poteaux) — puis
 * l'intersection ; la figure finale (prolongements, points construits) en `figureHtml`. c) chaque
 * affirmation traduite en relation sur la figure (∥, ∈, ∩, longueurs), vraie ou fausse.
 * Les noms des droites sont retrouvés par les POSITIONS des points nommés (mêmes données que l'écran).
 */

type E = ExercicePointFuite;

const PROCHE = 1e-6;

function pointsNommes(e: E): { nom: string; p: Pt }[] {
  return sceneComplete(e, 2).points.map((x) => ({ nom: x.nom, p: x.p }));
}

function nomEn(e: E, p: Pt): string | null {
  return pointsNommes(e).find((x) => Math.hypot(x.p.x - p.x, x.p.y - p.y) < PROCHE)?.nom ?? null;
}

/** Nom LaTeX d'une droite support : « (BF) », « \text{horizontale de }I », « \text{ligne d'horizon} ». */
function supportL(e: E, s: DroiteSupport): string {
  if (s.nature === "horizon") return "\\text{ligne d'horizon}";
  const a = nomEn(e, s.a);
  if (s.nature === "horizontale") return `\\text{horizontale de }${nomL(a ?? "?")}`;
  if (s.nature === "verticale") return `\\text{verticale de }${nomL(a ?? "?")}`;
  return `(${nomL(a ?? "?")}${nomL(nomEn(e, s.b) ?? "?")})`;
}

/** Propriété qui place le point sur la droite support (justification à droite). */
function justification(e: E, k: number, s: DroiteSupport): string {
  const et = e.etapes[k];
  switch (s.nature) {
    case "fuyante":
      if (e.variante === "boite" && k === 0) return "arête fuyante : elle passe par le point de fuite";
      if (e.variante === "poteaux") return k === 0 ? "sommets à la même hauteur : sur une fuyante issue de B" : "les pieds des poteaux sont sur la fuyante (AF)";
      return "parallèle aux autres fuyantes : passe par le point de fuite F";
    case "horizontale":
      return "côté parallèle à la vitre : il reste horizontal";
    case "verticale":
      return e.variante === "poteaux" ? "poteau vertical, parallèle à la vitre : il reste vertical" : "côté parallèle à la vitre : il reste vertical";
    case "horizon":
      return "un point de fuite est sur la ligne d'horizon";
    case "diagonale":
      return k === 0 ? "diagonales parallèles dans la réalité : même point de fuite" : "diagonale prolongée : c'est aussi celle du carreau du 2e rang";
    case "droite":
      return `dans la réalité, (BM) descend d'une demi-hauteur à chaque écart : elle atteint le sol au pied ${et.cible}`;
  }
}

function lignesConstruction(e: E, k: number): LigneCalcul[] {
  const et = e.etapes[k];
  const c = nomL(et.cible);
  const [s0, s1] = et.supports;
  return [ligne(`${c}\\in ${supportL(e, s0)}`, justification(e, k, s0)), ligne(`${c}\\in ${supportL(e, s1)}`, justification(e, k, s1)), ligne(`\\{${c}\\}=${supportL(e, s0)}\\cap ${supportL(e, s1)}`, "intersection des deux droites")];
}

/** Vérification : le point de fuite sur la ligne d'horizon (boîte), ou le dernier point du même objet,
 * construit de la même façon, qui retombe sur la troisième droite (boîte, panneaux). */
function verificationEtape(e: E, k: number): EtapeCorrection | null {
  const et = e.etapes[k];
  if (e.variante === "boite" && k === 0) return verification("a", [texte("Les deux fuyantes se coupent bien sur la ligne d'horizon :")], [ligne("F\\in\\text{ligne d'horizon}", "même hauteur que la ligne pointillée")]);
  if (k !== 1 || (e.variante !== "boite" && e.variante !== "panneaux")) return null;
  const dernier = et.ajout.points.find((x) => x.nom !== et.cible);
  if (!dernier) return null;
  const F = pointsNommes(e).find((x) => x.nom === "F")!.p;
  const nommes = pointsNommes(e).filter((x) => x.nom !== dernier.nom && x.nom !== "F");
  const origine = nommes.find((x) => distanceDroite(x.p, F, dernier.p) < PROCHE && Math.abs(x.p.x - dernier.p.x) + Math.abs(x.p.y - dernier.p.y) > PROCHE);
  const lignes: LigneCalcul[] = [];
  if (origine) lignes.push(ligne(`${nomL(dernier.nom)}\\in(${nomL(origine.nom)}F)`, "fuyante"));
  const construits = nommes.filter((x) => /′/.test(x.nom) || ["I", "J", "K", "L"].includes(x.nom));
  const horiz = construits.find((x) => Math.abs(x.p.y - dernier.p.y) < PROCHE);
  const vert = construits.find((x) => Math.abs(x.p.x - dernier.p.x) < PROCHE);
  if (vert) lignes.push(ligne(`${nomL(dernier.nom)}\\in\\text{verticale de }${nomL(vert.nom)}`, "côté vertical"));
  if (horiz) lignes.push(ligne(`${nomL(dernier.nom)}\\in\\text{horizontale de }${nomL(horiz.nom)}`, "côté horizontal"));
  if (lignes.length < 2) return null;
  return verification("b", [texte(`Le dernier sommet ${dernier.nom}, construit de la même façon, ferme bien la face (parallèle à la vitre) :`)], lignes);
}

/** Chaque affirmation, traduite en relation sur la figure. */
const RELATIONS: Record<string, [string, string]> = {
  // boîte
  "Sur le dessin, les arêtes verticales [AD] et [A′D′] restent parallèles.": ["[AD]\\parallel[A'D']", "verticales, parallèles à la vitre"],
  "Dans la réalité, la face arrière A′B′C′D′ a les mêmes dimensions que la face avant ABCD.": ["A'B'=AB\\text{ dans la réalité}", "faces avant et arrière d'un pavé identiques"],
  "Les droites (AA′) et (BB′) sont parallèles dans la réalité, mais elles se coupent sur le dessin.": ["(AA')\\cap(BB')=\\{F\\}", "deux fuyantes : elles se coupent en F"],
  "Sur le dessin, l'arête [A′B′] est parallèle à l'arête [AB].": ["[A'B']\\parallel[AB]", "parallèles à la vitre : pas de point de fuite"],
  "Sur le dessin, les droites (AB) et (A′B′) se coupent au point de fuite.": ["(AB)\\parallel(A'B')", "parallèles à la vitre : elles ne se coupent pas"],
  "Dans la réalité, l'arête [A′B′] est plus courte que l'arête [AB].": ["A'B'=AB\\text{ dans la réalité}", "elle paraît plus courte parce qu'elle est plus loin"],
  "Comme en perspective cavalière, deux arêtes parallèles de la boîte restent toujours parallèles sur le dessin.": ["(AA')\\cap(BB')=\\{F\\}", "arêtes parallèles fuyantes : elles convergent"],
  "Les arêtes verticales de la boîte convergent elles aussi vers le point de fuite.": ["[AD]\\parallel[A'D']", "verticales : elles restent parallèles"],
  // carrelage
  "Sur le dessin, les carreaux du 1er rang sont des trapèzes, alors que ce sont des carrés dans la réalité.": ["(AA')\\cap(BB')=\\{F\\}", "côtés fuyants qui se rapprochent, [AB] et [A′B′] horizontaux : trapèze"],
  "Les lignes des rangs de carreaux restent horizontales et parallèles sur le dessin.": ["(AB)\\parallel(A'B')", "parallèles à la vitre : pas de point de fuite"],
  "Les diagonales parallèles des carreaux ont leur propre point de fuite, sur la ligne d'horizon.": ["V\\in\\text{ligne d'horizon}", "V, point de fuite des diagonales, autre que F"],
  "Sur le dessin, le 2e rang est moins profond que le 1er, alors qu'ils ont la même profondeur dans la réalité.": ["\\text{profondeur dessinée du 2e rang}<\\text{celle du 1er}", "plus loin, dessiné plus petit"],
  "Dans la réalité, les rangs de carreaux sont de moins en moins profonds en s'éloignant.": ["\\text{profondeur réelle du 2e rang}=\\text{celle du 1er}", "carreaux identiques"],
  "Les lignes des rangs de carreaux convergent vers le point de fuite F.": ["(AB)\\parallel(A'B')", "parallèles à la vitre : elles restent horizontales"],
  "Les diagonales des carreaux convergent vers le même point de fuite F que les côtés qui s'éloignent.": ["V\\neq F", "autre direction : autre point de fuite"],
  "Pour dessiner le 2e rang, il suffit de reporter sur les fuyantes la profondeur du 1er rang mesurée sur le dessin.": ["\\text{profondeur dessinée du 2e rang}<\\text{celle du 1er}", "longueurs non conservées : on construit avec la diagonale"],
  // poteaux
  "Les poteaux sont verticaux : sur le dessin, ils restent verticaux et parallèles.": ["[AB]\\parallel[CD]", "verticaux, parallèles à la vitre"],
  "Sur le dessin, les sommets des trois poteaux sont alignés avec le point de fuite F.": ["D\\in(BF)", "sommets sur une fuyante"],
  "Sur le dessin, le milieu M du deuxième poteau est au milieu du segment [CD].": ["CM=MD", "poteau parallèle à la vitre : milieu conservé"],
  "Dans la réalité, les pieds A, C et E sont régulièrement espacés, même si les écarts dessinés diminuent.": ["AC=CE\\text{ dans la réalité}", "construction par le milieu M"],
  "Les poteaux, dessinés de plus en plus petits, convergent vers le point de fuite.": ["[AB]\\parallel[CD]", "verticaux : ils restent parallèles"],
  "Sur le dessin, les sommets des poteaux sont sur une droite horizontale.": ["D\\in(BF)", "sommets sur une fuyante, qui monte ou descend vers F"],
  "Pour placer le troisième poteau, on reporte au compas l'écart dessiné entre les deux premiers pieds.": ["CE<AC\\text{ sur le dessin}", "l'écart dessiné diminue en s'éloignant"],
  "Le milieu d'un poteau n'est pas au milieu de son dessin, comme pour un segment fuyant.": ["CM=MD", "poteau parallèle à la vitre : milieu conservé"],
  // panneaux
  "Sur le dessin, le côté [IJ] est parallèle au côté [AB].": ["[IJ]\\parallel[AB]", "parallèles à la vitre : horizontaux"],
  "Les côtés horizontaux des deux panneaux restent horizontaux sur le dessin.": ["[LK]\\parallel[DC]", "parallèles à la vitre : pas de point de fuite"],
  "Le second panneau est dessiné comme un rectangle plus petit, de même forme que le premier.": ["\\dfrac{IJ}{AB}=\\dfrac{IL}{AD}", "parallèle à la vitre : même forme, réduite"],
  "Les droites (AI), (BJ), (CK) et (DL) passent toutes par le point de fuite F.": ["(AI)\\cap(DL)=\\{F\\}", "fuyantes : elles convergent en F"],
  "Sur le dessin, les droites (AB) et (IJ) se coupent au point de fuite.": ["(AB)\\parallel(IJ)", "parallèles à la vitre : elles ne se coupent pas"],
  "Le second panneau est dessiné comme un trapèze, parce qu'il est plus loin.": ["\\dfrac{IJ}{AB}=\\dfrac{IL}{AD}", "il garde sa forme de rectangle"],
  "Sur le dessin, la droite (DL) est horizontale.": ["F\\in(DL)", "(DL) est une fuyante"],
  "Sur le dessin, le second panneau a la même largeur que le premier, comme en perspective cavalière.": ["IJ<AB\\text{ sur le dessin}", "plus loin, dessiné plus petit"],
};

function lignesAffirmations(e: E): LigneCalcul[] {
  return e.affirmations.map((a, i) => {
    const r = RELATIONS[a.texte];
    const verdict = a.vraie ? "vrai" : "faux";
    if (!r) return ligne(`\\text{affirmation ${i + 1}}=\\text{${verdict}}`, a.explication);
    return ligne(r[0], `${i + 1}) ${r[1]} : ${verdict}`);
  });
}

const METHODE: Record<VariantePointFuite, string> = {
  boite: "les fuyantes, parallèles dans la réalité, convergent vers le point de fuite, sur la ligne d'horizon ; les droites parallèles à la vitre restent horizontales ou verticales.",
  carrelage: "des droites horizontales parallèles ont un même point de fuite sur la ligne d'horizon (les diagonales ont le leur) ; les droites parallèles à la vitre restent horizontales.",
  poteaux: "les verticales restent verticales ; des points alignés sur une droite qui s'éloigne sont sur une fuyante ; un segment parallèle à la vitre garde son milieu.",
  panneaux: "un objet parallèle à la vitre garde sa forme (réduite) ; ses coins correspondants sont sur des fuyantes, qui passent par le point de fuite.",
};

const PIEGES: Record<VariantePointFuite, string> = {
  boite: "Faire passer une arête parallèle à la vitre (comme [A′B′]) par le point de fuite : elle n'a pas de point de fuite, elle reste horizontale ou verticale sur le dessin.",
  carrelage: "Reporter la profondeur du 1er rang pour dessiner le 2e : les longueurs ne sont pas conservées, le 2e rang est dessiné moins profond. On le construit avec la diagonale.",
  poteaux: "Reporter au compas l'écart dessiné entre les deux premiers pieds : sur le dessin, les écarts diminuent en s'éloignant. On construit le pied suivant avec le milieu du poteau.",
  panneaux: "Dessiner le second panneau de la même taille que le premier, comme en perspective cavalière : en perspective centrale, il est plus petit, ses coins sont sur les fuyantes.",
};

function figureFinale(e: E): string {
  const lignes: LigneFigureFuite[] = e.etapes
    .flatMap((et) => et.supports)
    .filter((s) => s.nature === "horizontale" || s.nature === "verticale")
    .map((s) => ({ a: s.a, b: s.b, ton: "correction" as const }));
  return figurePointFuiteSvg({ mode: "papier", horizon: e.horizon, scene: sceneComplete(e, 2), lignes });
}

function etapeConstruction(e: E, k: 0 | 1): EtapeCorrection[] {
  const sq = k === 0 ? "a" : "b";
  const et: EtapeConstructionFuite = e.etapes[k];
  const v = verificationEtape(e, k);
  const res = resultat(sq, [texte(reponseConstruction(et))]);
  return [
    utilise(sq, [texte(`Perspective centrale ${COURS_FUITE} : ${METHODE[e.variante]} Un point se construit à l'intersection de deux droites qui le portent.`)]),
    calcul(sq, lignesConstruction(e, k)),
    k === 1 ? { ...res, figureHtml: figureFinale(e) } : res,
    ...(v ? [v] : []),
    ...(k === 1 ? [piege("b", [texte(PIEGES[e.variante])])] : []),
  ];
}

export function correctionDetailleePointFuite(e: E): EtapeCorrection[] {
  return finaliserEspace2([
    ...etapeConstruction(e, 0),
    ...etapeConstruction(e, 1),
    utilise("c", [
      texte(`Sur la vitre ${COURS_DURER}, seules les fuyantes (droites qui s'éloignent de la vitre) convergent vers un point de fuite ; les droites parallèles à la vitre restent parallèles ; les longueurs ne sont pas conservées ${COURS_FUITE}.`),
    ]),
    calcul("c", lignesAffirmations(e), [texte("Chaque affirmation, testée sur la figure :")]),
    resultat("c", [texte(reponseAffirmations(e))]),
  ]);
}
