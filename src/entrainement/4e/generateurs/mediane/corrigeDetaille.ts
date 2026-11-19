import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceMediane, ExerciceMedianeClasses, ExerciceMedianeDiscrete } from "../../core/mediane.types";
import { LABEL_X_MAX, LABEL_X_MIN, formatFormuleInterpolationLatex, libellePrecisionLecture, pointsEncadresLecture, polygonePoints } from "../../ui/formatMediane";
import { precisionLecture, seuilLecture, valeurCibleLecture } from "../../moteur/verificationMediane";
import {
  COURS_POSITION,
  FORMULE_SEUIL_LATEX,
  NOM_PARAMETRE,
  SYMBOLE_PARAMETRE,
  classeLatex,
  classeTexte,
  egalOuEnviron,
  formulesInsecables,
  exact,
  ligneCentre,
  ligneOrdre,
  ligneSeuil,
  listeResultat,
  nb,
  nbp,
  nbt,
  net,
  type ParametrePosition,
} from "../../ui/corrigeStatistique1";
import { construireSvgPolygoneEffectifs } from "./polygoneEffectifsSvg";

/**
 * Corrigé détaillé « comme au tableau » de gen33 (paramètres de position) — règle
 * `.claude/rules/feuilles-evaluations.md`, conventions « Lectures graphiques et décisions » (une
 * ligne par chose lue, avec une relation, la justification dit où on lit). Une étape par écran :
 * - discrète : a) médiane, b) Q₁, c) Q₃, d) minimum, maximum, mode(s) ;
 * - classes : a) polygone des effectifs cumulés (figure, lectures de Q₁, Q₂, Q₃ marquées),
 *   b) médiane, c) Q₁, d) Q₃ (seuil puis interpolation linéaire sur le polygone),
 *   e) x_min, x_max, étendue, classe modale, mode.
 * Valeurs de l'instance (règle « dépasse STRICTEMENT le seuil » déjà appliquée par le générateur),
 * segment d'interpolation de `pointsEncadresLecture` (la même fonction que l'aide de l'écran).
 * Constructeurs réutilisés par l'exercice de synthèse (gen35).
 */

type D = ExerciceMedianeDiscrete;
type C = ExerciceMedianeClasses;

const SEUIL: Record<ParametrePosition, (e: D) => number> = { mediane: (e) => e.seuil, q1: (e) => e.seuilQ1, q3: (e) => e.seuilQ3 };
const INDEX: Record<ParametrePosition, (e: D) => number> = { mediane: (e) => e.indexMediane, q1: (e) => e.indexQ1, q3: (e) => e.indexQ3 };

function nomTexte(p: ParametrePosition): string {
  return p === "mediane" ? "la médiane " : p === "q1" ? "le premier quartile " : "le troisième quartile ";
}

/** Écran « médiane » / « Q₁ » / « Q₃ » (discrète) : seuil, puis la ligne du tableau où l'effectif
 * cumulé dépasse strictement le seuil. */
export function etapeSeuilDiscrete(e: D, lettre: string, p: ParametrePosition): EtapeCorrection[] {
  const seuil = SEUIL[p](e);
  const index = INDEX[p](e);
  const ligneRetenue = e.lignes[index];
  const symbole = SYMBOLE_PARAMETRE[p];
  const lignes: LigneCalcul[] = [ligneSeuil(p, e.n, seuil)];
  const egalSeuil = index > 0 && e.lignes[index - 1].effectifCumule === seuil;
  if (index > 0) {
    const prec = e.lignes[index - 1];
    lignes.push(
      egalSeuil
        ? ligne(`v_{${index}}=${nb(prec.effectifCumule)}`, `x = ${nbt(prec.valeur)} : égal au seuil, pas strictement supérieur — on passe à la valeur suivante`)
        : ligne(`v_{${index}}=${nb(prec.effectifCumule)}<${nb(seuil)}`, `x = ${nbt(prec.valeur)} : pas encore au-delà du seuil`),
    );
  }
  lignes.push(ligne(`v_{${index + 1}}=${nb(ligneRetenue.effectifCumule)}>${nb(seuil)}`, `x = ${nbt(ligneRetenue.valeur)} : premier effectif cumulé strictement supérieur au seuil`));
  lignes.push(ligne(`${symbole}=${nb(ligneRetenue.valeur)}`, "valeur de cette ligne du tableau"));
  const etapes: EtapeCorrection[] = [
    utilise(lettre, [
      texte(`Règle du seuil : ${nomTexte(p)}`),
      latex(symbole),
      texte(" est la première valeur du tableau dont l'effectif cumulé "),
      latex("v_i"),
      texte(" dépasse STRICTEMENT le seuil "),
      latex(FORMULE_SEUIL_LATEX[p]),
      texte(` ${COURS_POSITION}.`),
    ]),
    calcul(lettre, lignes),
    resultat(lettre, [latex(`${symbole}=${nb(ligneRetenue.valeur)}`), texte(` ${e.contexte.unite}${p === "mediane" ? " (médiane)" : ""}`)]),
  ];
  if (egalSeuil) etapes.push(piege(lettre, [texte(`L'effectif cumulé ${nbt(seuil)} est ÉGAL au seuil : il ne le dépasse pas strictement, la valeur ${nbt(e.lignes[index - 1].valeur)} n'est donc pas ${NOM_PARAMETRE[p] === "médiane" ? "la médiane" : `le ${NOM_PARAMETRE[p]}`}.`)]));
  else if (p === "mediane") etapes.push(piege(lettre, [texte("On cherche sur les effectifs CUMULÉS, pas au milieu de la liste des valeurs distinctes.")]));
  return etapes;
}

/** Écran « min, max, mode(s) » (discrète) : lecture du tableau, puis vérification de l'ordre. */
export function etapeMinMaxMode(e: D, lettre: string): EtapeCorrection[] {
  const nMax = Math.max(...e.lignes.map((l) => l.effectif));
  const u = e.contexte.unite;
  const plusieurs = e.modes.length > 1;
  return [
    utilise(lettre, [texte(`Minimum et maximum : plus petite et plus grande valeur observée. Mode : la valeur (ou les valeurs) de plus grand effectif ${COURS_POSITION}.`)]),
    calcul(lettre, [
      ligne(`${LABEL_X_MIN}=${nb(e.min)}`, "première valeur du tableau"),
      ligne(`${LABEL_X_MAX}=${nb(e.max)}`, "dernière valeur du tableau"),
      ligne(`\\max n_i=${nb(nMax)}`, "plus grand effectif du tableau"),
      ...e.modes.map((m) => ligne(`\\text{mode}=${nb(m)}`, `valeur d'effectif ${nMax}${plusieurs ? ` (${e.modes.length} modes)` : ""}`)),
    ]),
    resultat(lettre, [
      latex(`${LABEL_X_MIN}=${nb(e.min)}`),
      texte(" ; "),
      latex(`${LABEL_X_MAX}=${nb(e.max)}`),
      texte(` ; mode${plusieurs ? "s" : ""} : `),
      ...listeResultat(e.modes.map(nb)).map((f) => (f.type === "texte" ? { ...f, valeur: " et " } : f)),
      texte(` (en ${u})`),
    ]),
    verification(lettre, [texte("Les paramètres sont rangés : "), latex(`${LABEL_X_MIN}\\leq Q_1\\leq Q_2\\leq Q_3\\leq ${LABEL_X_MAX}`), texte(" :")], [ligneOrdre([e.min, e.q1, e.mediane, e.q3, e.max])]),
    piege(lettre, [texte(`Le mode est la VALEUR la plus fréquente, pas son effectif (${nMax}).`)]),
  ];
}

const indice = (i: number) => String(i).replace(/\d/g, (c) => "₀₁₂₃₄₅₆₇₈₉"[Number(c)]);
const sommet = (i: number, x: number, y: number) => `P_{${i}}=(${nb(x)}\\,;\\,${nb(y)})`;

/** Écran « polygone » (classes) : un sommet par classe — placement de points (écran de lecture). */
export function etapePolygone(e: C, lettre: string): EtapeCorrection[] {
  const pts = polygonePoints(e);
  const k = e.classes.length;
  return [
    utilise(lettre, [
      texte(
        `Polygone des effectifs cumulés : on part de (borne inférieure de la première classe ; 0), puis un sommet par classe en (borne supérieure ; effectif cumulé), reliés par des segments ${COURS_POSITION}.`,
      ),
    ]),
    {
      ...calcul(
        lettre,
        pts.map((p, i) =>
          i === 0 ? ligne(sommet(0, p.x, p.y), "départ : rien n'est encore compté") : ligne(sommet(i, p.x, p.y), `fin de ${classeTexte(e.classes[i - 1].borneInf, e.classes[i - 1].borneSup, i === k)} : effectif cumulé ${nbt(p.y)}`),
        ),
      ),
      // La réponse est un graphique : le polygone, avec les lectures de Q₁, Q₂, Q₃ des écrans suivants.
      figureHtml: construireSvgPolygoneEffectifs(e),
    },
    resultat(lettre, [texte("Polygone ci-dessus, de sommets "), ...listeResultat(pts.map((p) => `(${nb(p.x)}\\,;\\,${nb(p.y)})`))]),
    piege(lettre, [texte("Chaque sommet se place à la borne SUPÉRIEURE de sa classe : à la fin de la classe, toutes ses données sont comptées.")]),
  ];
}

/** Écrans « lecture » (classes) : seuil, segment du polygone qui le franchit, interpolation linéaire. */
export function etapeLecture(e: C, lettre: string, p: ParametrePosition): EtapeCorrection[] {
  const seuil = seuilLecture(e, p);
  const { inf, sup } = pointsEncadresLecture(e, p);
  const pts = polygonePoints(e);
  const iSup = pts.findIndex((q) => q.x === sup.x && q.y === sup.y);
  const iInf = iSup - 1;
  const symbole = SYMBOLE_PARAMETRE[p];
  const cible = valeurCibleLecture(e, p);
  const precision = precisionLecture(e.etendue);
  const u = e.contexte.unite;
  const lignes: LigneCalcul[] = [ligneSeuil(p, e.n, seuil)];
  let valeurExacte: number;
  if (net(inf.y - seuil) === 0) {
    lignes.push(ligne(`${sommet(iInf, inf.x, inf.y)}`, "sommet exactement à la hauteur du seuil"));
    lignes.push(ligne(`${symbole}=${nb(inf.x)}`, "on lit l'abscisse de ce sommet"));
    valeurExacte = inf.x;
  } else {
    const dx = net(sup.x - inf.x);
    const dv = net(sup.y - inf.y);
    const ds = net(seuil - inf.y);
    valeurExacte = inf.x + (dx * ds) / dv;
    lignes.push(ligne(sommet(iInf, inf.x, inf.y), `dernier sommet sous le seuil ${nbt(seuil)}`));
    lignes.push(ligne(sommet(iSup, sup.x, sup.y), `premier sommet au-dessus du seuil : on lit sur le segment [P${indice(iInf)}P${indice(iSup)}]`));
    lignes.push(ligne(`${symbole}=${nb(inf.x)}+\\dfrac{${nb(sup.x)}-${nbp(inf.x)}}{${nb(sup.y)}-${nbp(inf.y)}}\\cdot (${nb(seuil)}-${nbp(inf.y)})`, "interpolation linéaire"));
    lignes.push(ligne(`=${nb(inf.x)}+\\dfrac{${nb(dx)}}{${nb(dv)}}\\cdot ${nb(ds)}`));
    const terme = (dx * ds) / dv;
    lignes.push(ligne(`=${nb(inf.x)}+${exact(terme)}`));
    lignes.push(ligne(`=${exact(valeurExacte)}`));
  }
  const rel = egalOuEnviron(cible, valeurExacte);
  if (rel !== "=") lignes.push(ligne(`\\approx ${nb(cible)}`, libellePrecisionLecture(precision)));
  return [
    utilise(lettre, [
      texte("On calcule le seuil "),
      latex(FORMULE_SEUIL_LATEX[p]),
      texte(` ; sur le polygone, ${nomTexte(p)}`),
      latex(symbole),
      texte(" est l'abscisse du point d'ordonnée égale au seuil — entre les deux sommets qui encadrent le seuil, interpolation linéaire "),
      latex(formatFormuleInterpolationLatex(p).replace(/x_\{inf\}|x_\{sup\}|v_\{inf\}|v_\{sup\}/g, (m) => m.replace("{inf}", "{\\text{inf}}").replace("{sup}", "{\\text{sup}}"))),
      texte(` ${COURS_POSITION}.`),
    ]),
    calcul(lettre, lignes),
    resultat(lettre, [latex(`${symbole}${rel}${nb(cible)}`), texte(` ${u}${p === "mediane" ? " (médiane)" : ""}${rel === "=" ? "" : ` (${libellePrecisionLecture(precision)})`}`)]),
  ];
}

/** Écran « synthèse » (classes) : x_min, x_max, étendue, classe modale, mode (centre). */
export function etapeSyntheseClasses(e: C, lettre: string): EtapeCorrection[] {
  const k = e.classes.length;
  const modale = e.classes[e.indexClasseModale];
  const nMax = Math.max(...e.classes.map((c) => c.effectif));
  const ct = classeTexte(modale.borneInf, modale.borneSup, e.indexClasseModale === k - 1);
  const u = e.contexte.unite;
  return [
    utilise(lettre, [
      latex(LABEL_X_MIN),
      texte(" : borne inférieure de la première classe ; "),
      latex(LABEL_X_MAX),
      texte(" : borne supérieure de la dernière ; étendue = "),
      latex(`${LABEL_X_MAX}-${LABEL_X_MIN}`),
      texte(` ; classe modale : classe de plus grand effectif ; mode : centre de la classe modale ${COURS_POSITION}.`),
    ]),
    calcul(lettre, [
      ligne(`${LABEL_X_MIN}=${nb(e.xMin)}`, "borne inférieure de la première classe"),
      ligne(`${LABEL_X_MAX}=${nb(e.xMax)}`, "borne supérieure de la dernière classe"),
      ligne(`\\text{étendue}=${nb(e.xMax)}-${nbp(e.xMin)}=${nb(e.etendue)}`, [latex(`${LABEL_X_MAX}-${LABEL_X_MIN}`)]),
      ligne(`\\max n_i=${nb(nMax)}`, `classe ${ct} : classe modale`),
      ligneCentre("\\text{mode}", modale.borneInf, modale.borneSup, "centre de la classe modale"),
    ]),
    resultat(lettre, [
      latex(`${LABEL_X_MIN}=${nb(e.xMin)}`),
      texte(" ; "),
      latex(`${LABEL_X_MAX}=${nb(e.xMax)}`),
      texte(` ; étendue ${nbt(e.etendue)} ; classe modale `),
      latex(classeLatex(modale.borneInf, modale.borneSup, e.indexClasseModale === k - 1)),
      texte(" ; mode "),
      latex(nb(e.modeCentreClasseModale)),
      texte(` (en ${u})`),
    ]),
    verification(lettre, [texte("Les paramètres sont rangés : "), latex(`${LABEL_X_MIN}\\leq Q_1\\leq Q_2\\leq Q_3\\leq ${LABEL_X_MAX}`), texte(" :")], [ligneOrdre([e.xMin, e.q1, e.mediane, e.q3, e.xMax])]),
    piege(lettre, [texte("Pour des données en classes, le mode est le CENTRE de la classe modale, pas la classe elle-même ni son effectif.")]),
  ];
}

export function correctionDetailleeMediane(e: ExerciceMediane): EtapeCorrection[] {
  if (e.variante === "discrete") {
    return formulesInsecables([...etapeSeuilDiscrete(e, "a", "mediane"), ...etapeSeuilDiscrete(e, "b", "q1"), ...etapeSeuilDiscrete(e, "c", "q3"), ...etapeMinMaxMode(e, "d")]);
  }
  return formulesInsecables([...etapePolygone(e, "a"), ...etapeLecture(e, "b", "mediane"), ...etapeLecture(e, "c", "q1"), ...etapeLecture(e, "d", "q3"), ...etapeSyntheseClasses(e, "e")]);
}

/** Lettre d'étape d'un écran de gen33 (ordre des écrans de l'appli). */
export function lettrePhaseMediane(e: ExerciceMediane, phase: string): string {
  const ordre = e.variante === "discrete" ? ["mediane", "q1", "q3", "minMaxMode"] : ["polygone", "lectureMediane", "lectureQ1", "lectureQ3", "synthese"];
  return "abcde"[Math.max(0, ordre.indexOf(phase))];
}

