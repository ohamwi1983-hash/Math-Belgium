import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceOmbreSoleil, ExerciceOmbreSoleilDirectionInconnue, Piquet } from "../../core/ombreSoleil.types";
import type { Point3D } from "../../core/geometrieEspace.types";
import { COURS_OMBRE, listeEt, nomTex, phrase } from "../../ui/corrigeEspace1";
import { libelleObstacle } from "../../ui/formatOmbreSoleil";
import { construireSvgOmbreSoleil, nomPied } from "./figure";

/**
 * Corrigé détaillé « comme au tableau » de gen41 « Ombre au soleil » — règle
 * `.claude/rules/feuilles-evaluations.md`. Une lettre par ÉCRAN (`moteur/sessionOmbreSoleil.ts::
 * sequencePourExercice`), plus la conclusion de la variante « direction inconnue » (contour). Le
 * « Calcul » est la construction : rayon d parallèle au rayon connu (rayons du soleil parallèles),
 * trace au sol d′ issue du PIED (ombres au sol parallèles), ombre = d ∩ d′ — ou premier obstacle
 * touché. Pieds nommés A₀, E₀, K₀… (cours, § 12 : « le pied L₀ de la lampe »), aucune valeur
 * numérique (la direction n'est jamais chiffrée).
 */

type E = ExerciceOmbreSoleil;

const t = (id: string) => nomTex(id);
const pied = (id: string) => nomTex(nomPied(id));
const ombre = (id: string) => `${nomTex(id)}'`;

/** Le pied du sommet est-il sur la trace au sol connue (même droite : la trace est cette droite prolongée) ? */
function piedSurTraceConnue(piedX: Point3D, piedK: Point3D, ombreK: Point3D): boolean {
  const u = { x: ombreK.x - piedK.x, y: ombreK.y - piedK.y };
  const v = { x: piedX.x - piedK.x, y: piedX.y - piedK.y };
  return Math.abs(u.x * v.y - u.y * v.x) < 1e-6 * Math.max(1, Math.hypot(u.x, u.y) * Math.hypot(v.x, v.y));
}

/** Ligne « d′ ∥ trace connue » (ou « d′ = trace connue » quand le pied est déjà sur elle). */
function ligneTrace(id: string, connu: string, dp: string, surTrace: boolean): LigneCalcul {
  return surTrace
    ? ligne(`${dp}=(${pied(connu)}${ombre(connu)})`, phrase(`$${dp}$ : trace au sol issue du pied $${pied(id)}$, déjà sur la trace connue (prolongée)`))
    : ligne(`${dp}\\parallel(${pied(connu)}${ombre(connu)})`, phrase(`$${dp}$ : trace au sol issue du pied $${pied(id)}$ (ombres au sol parallèles)`));
}

/** Lignes « d ∥ rayon connu, d′ ∥ trace connue, X′ = d ∩ d′ » pour le sommet `id`. */
function lignesOmbre(id: string, connu: string, suffixe: string, surTrace: boolean): LigneCalcul[] {
  const d = `d${suffixe}`;
  const dp = `d'${suffixe}`;
  return [
    ligne(`${d}\\parallel(${t(connu)}${ombre(connu)})`, phrase(`$${d}$ : rayon issu de $${t(id)}$ (les rayons du soleil sont parallèles)`)),
    ligneTrace(id, connu, dp, surTrace),
    ligne(`${ombre(id)}=${d}\\cap ${dp}`, "l'ombre du sommet est sur le rayon ET au sol"),
  ];
}

const UTILISE_SOLEIL = (connu: string) =>
  phrase(
    `Au soleil, les rayons sont parallèles ${COURS_OMBRE} : chaque rayon est parallèle au rayon connu $(${t(connu)}${ombre(connu)})$, de même sens. Les ombres au sol de deux verticales sont parallèles aussi : la trace au sol part du PIED du sommet (le point du sol à sa verticale).`,
  );

function etapesSimple(e: Extract<E, { variante: "simple" }>): EtapeCorrection[] {
  const a = e.piquet.piquet.id;
  const k = e.piquetExemple.id;
  return [
    utilise("a", UTILISE_SOLEIL(k)),
    calcul("a", lignesOmbre(a, k, "", piedSurTraceConnue(e.piquet.piquet.base, e.piquetExemple.base, e.ombreExemple))),
    { ...resultat("a", phrase(`$${ombre(a)}=d\\cap d'$ ; l'ombre du bâton $${t(a)}$ est le segment $[${pied(a)}${ombre(a)}]$.`)), figureHtml: construireSvgOmbreSoleil(e, true) },
    verification("a", phrase(`$[${pied(a)}${ombre(a)}]$ est parallèle à $[${pied(k)}${ombre(k)}]$ et dirigée du même côté : les deux ombres vont dans le même sens.`)),
    piege("a", [texte(`Le rayon part du SOMMET du bâton, la trace au sol part de son PIED : les échanger, ou partir du pied de ${k}, donne une ombre trop courte ou trop longue.`)]),
  ];
}

function etapesObstacle(e: Extract<E, { variante: "obstacle" }>): EtapeCorrection[] {
  const a = e.baton.id;
  const k = e.piquetExemple.id;
  const auSol = e.indexObstacleTouche === null;
  const obstacle = auSol ? "" : libelleObstacle(e, e.indexObstacleTouche!);
  const lignesB: LigneCalcul[] = [
    ligneTrace(a, k, "d'", piedSurTraceConnue(e.baton.base, e.piquetExemple.base, e.ombreExemple)),
    auSol
      ? ligne(`${ombre(a)}=d\\cap d'`, "le rayon passe au-dessus des obstacles : il atteint le sol")
      : ligne(`${t(a)}_1=d\\cap d'`, "point où le rayon atteindrait le sol sans obstacle"),
  ];
  if (!auSol) lignesB.push(ligne(`${ombre(a)}\\in d`, `avant d'atteindre le sol, le rayon heurte ${obstacle} : premier point touché`));
  return [
    utilise("a", UTILISE_SOLEIL(k)),
    calcul("a", [ligne(`d\\parallel(${t(k)}${ombre(k)})`, phrase(`$d$ : rayon issu de $${t(a)}$, même direction et même sens que le rayon de l'exemple`))]),
    resultat("a", phrase(`Le rayon issu de $${t(a)}$ est la parallèle $d$ à $(${t(k)}${ombre(k)})$, dirigée vers le sol comme $[${t(k)}${ombre(k)}]$.`)),
    piege("a", [texte("La verticale n'est pas la direction du soleil, et une direction de sens opposé projetterait l'ombre du mauvais côté.")]),
    utilise("b", phrase(`On suit la trace au sol issue du pied ${COURS_OMBRE} : pour chaque obstacle qu'elle traverse, on regarde si le rayon passe au-dessus ou s'il le heurte. L'ombre se forme sur la PREMIÈRE surface que le rayon touche.`)),
    calcul("b", lignesB),
    {
      ...resultat("b", auSol ? phrase(`$${ombre(a)}=d\\cap d'$ : l'ombre du sommet de $${t(a)}$ atteint le sol ; l'ombre du bâton est $[${pied(a)}${ombre(a)}]$.`) : phrase(`$${ombre(a)}$ est sur ${obstacle} : l'ombre du sommet de $${t(a)}$ s'arrête sur sa surface, elle n'atteint pas $${t(a)}_1$.`)),
      figureHtml: construireSvgOmbreSoleil(e, true),
    },
    piege("b", [texte(auSol ? "Un obstacle traversé par la trace au sol n'arrête l'ombre que si le rayon le heurte : ici le rayon passe au-dessus." : "Ne pas prolonger l'ombre jusqu'au sol à travers l'obstacle : elle s'arrête sur la première surface touchée.")]),
  ];
}

/** Nom des points du contour de l'ombre : sommet de la base (nommé) ou ombre X′. */
function nomContour(e: ExerciceOmbreSoleilDirectionInconnue, p: Point3D): string {
  const proche = (q: Point3D) => Math.hypot(q.x - p.x, q.y - p.y, q.z - p.z) < 1e-6;
  for (const [nom, q] of Object.entries(e.solide.sommets)) if (proche(q)) return nomTex(nom);
  for (const x of e.piquets) if (proche(x.ombre)) return ombre(x.piquet.id);
  for (const o of e.ombresAutres) if (proche(o.ombre)) return ombre(o.id);
  if (proche(e.ombreConnue)) return ombre(e.piquetConnu.id);
  return "?";
}

function etapesDirectionInconnue(e: ExerciceOmbreSoleilDirectionInconnue): EtapeCorrection[] {
  const k = e.piquetConnu.id;
  const premier = e.piquets[0]!.piquet.id;
  const L = "abcdefghij";
  const etapes: EtapeCorrection[] = [
    utilise("a", phrase(`La lumière va du sommet $${t(k)}$ vers son ombre $${ombre(k)}$ ${COURS_OMBRE} : tous les rayons sont parallèles à $(${t(k)}${ombre(k)})$, de même sens (vers le sol, du côté de l'ombre).`)),
    calcul("a", [ligne(`d_{${t(premier)}}\\parallel(${t(k)}${ombre(k)})`, phrase(`rayon issu de $${t(premier)}$ : même direction, même sens`))]),
    resultat("a", phrase(`Le rayon issu de $${t(premier)}$ est la parallèle à $(${t(k)}${ombre(k)})$ menée par $${t(premier)}$, dirigée vers le sol.`)),
    piege("a", [texte("La verticale n'est pas la direction de la lumière : elle relie un sommet à son pied, pas à son ombre.")]),
  ];
  e.piquets.forEach((p, i) => {
    const id = p.piquet.id;
    etapes.push(
      utilise(L[i + 1]!, UTILISE_SOLEIL(k)),
      calcul(L[i + 1]!, lignesOmbre(id, k, `_{${t(id)}}`, piedSurTraceConnue(p.piquet.base, e.piquetConnu.base, e.ombreConnue))),
      resultat(L[i + 1]!, phrase(`$${ombre(id)}=d_{${t(id)}}\\cap d'_{${t(id)}}$ : ombre du sommet $${t(id)}$.`)),
    );
    if (i === 0) etapes.push(piege(L[1]!, [texte("La trace au sol part du PIED du sommet (le point du sol à sa verticale), pas d'un coin de la base pris au hasard.")]));
  });
  const fin = L[e.piquets.length + 1]!;
  const lignes: LigneCalcul[] = e.ombresAutres.map((o) => ligne(`${ombre(o.id)}=d_{${t(o.id)}}\\cap d'_{${t(o.id)}}`, phrase(`même construction pour le sommet $${t(o.id)}$`)));
  const contour = e.contourOmbre.map((p) => nomContour(e, p));
  lignes.push(ligne(`\\text{contour}=${contour.join("")}`, "polygone qui entoure la base et les ombres des sommets"));
  etapes.push(
    utilise(fin, phrase(`L'ombre portée d'un solide au sol est la plus petite surface qui contient sa base et les ombres de tous ses sommets ${COURS_OMBRE} : son contour relie les points les plus extérieurs.`)),
    calcul(fin, lignes),
    { ...resultat(fin, phrase(`Contour de l'ombre portée : $${contour.join("")}$ (en vert sur la figure)${e.ombresAutres.length ? ` ; ombres des autres sommets : ${listeEt(e.ombresAutres.map((o) => `$${ombre(o.id)}$`))}` : ""}.`)), figureHtml: construireSvgOmbreSoleil(e, true) },
  );
  return etapes;
}

export function correctionDetailleeOmbreSoleil(e: E): EtapeCorrection[] {
  if (e.variante === "simple") return etapesSimple(e);
  if (e.variante === "obstacle") return etapesObstacle(e);
  return etapesDirectionInconnue(e);
}

/** Pied d'un piquet (contrôle). */
export function piedDe(p: Piquet): Point3D {
  return { x: p.base.x, y: p.base.y, z: 0 };
}
