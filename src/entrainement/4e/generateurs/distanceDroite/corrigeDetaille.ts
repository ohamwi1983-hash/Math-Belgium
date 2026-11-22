import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceDistanceDroite } from "../../core/distanceDroite.types";
import type { DroiteImplicite } from "../../core/droite.types";
import type { Point } from "../../core/vecteur.types";
import { moinsH, q, qp, somme } from "../../ui/corrigeChapitre3";
import {
  COURS_DISTANCE,
  COURS_RELATIONS,
  dedoublonner,
  eqLatex,
  equation,
  lignesSysteme2,
  type Eq2,
  lignesDistanceDeuxPoints,
  lignesPointCartesienne,
  lignesPointSurCartesienne,
  pt,
} from "../../ui/corrigeAnalytique1";
import { COURS_INTERSECTION } from "../../ui/corrigeLotG";
import { finaliserVecteurs } from "../../ui/corrigeVecteurs2";
import { figureLotG } from "../../ui/figureLotG";
import { formatDistanceAttendueLatex, formatDroiteLatex, nomDroiteCible, normaliserSigneAffichage } from "../../ui/formatDistanceDroite";
import { implicteDepuisPointVecteur, intersectionDeuxDroites } from "../droite/geometrieDroite";

/**
 * Corrigé détaillé « comme au tableau » de gen47 « Distance point-droite et droite-droite » — règle
 * `.claude/rules/feuilles-evaluations.md`. Une lettre par ÉCRAN (`AppDistanceDroite.tsx`,
 * `sequencePourExercice`) : (parallèles : point P de la droite de départ) ; perpendiculaire b par P
 * (pentes m_b = −1/m_d, puis y − y_P = m_b(x − x_P)) ; pied Q = b ∩ d (système) ; distance PQ. Figure
 * (d, b, P, Q, angle droit) sous la distance. `pointChoisi` : à l'écran, le point P confirmé à l'étape
 * « choix du point » (celui de l'élève, ou celui du moteur après trois échecs) ; sur papier, le point
 * entier de la droite de départ le plus proche de l'origine. Partagé par l'adaptateur et l'appli.
 */

type E = ExerciceDistanceDroite;

function pgcdEtendu(a: number, b: number): { g: number; x: number; y: number } {
  let [oldR, r] = [a, b];
  let [oldS, s] = [1, 0];
  let [oldT, t] = [0, 1];
  while (r !== 0) {
    const k = Math.floor(oldR / r);
    [oldR, r] = [r, oldR - k * r];
    [oldS, s] = [s, oldS - k * s];
    [oldT, t] = [t, oldT - k * t];
  }
  return oldR < 0 ? { g: -oldR, x: -oldS, y: -oldT } : { g: oldR, x: oldS, y: oldT };
}

/** Un point ENTIER de la droite ax + by + c = 0, le plus proche de l'origine (déterministe). */
export function pointEntierSurDroite(d: DroiteImplicite): Point {
  const { a, b, c } = d;
  if (a === 0) return { x: 0, y: -c / b };
  if (b === 0) return { x: -c / a, y: 0 };
  const { g, x: x0, y: y0 } = pgcdEtendu(a, b);
  const k = -c / g;
  const baseX = x0 * k;
  const baseY = y0 * k;
  const dirX = -b / g;
  const dirY = a / g;
  const t = Math.round(-(baseX * dirX + baseY * dirY) / (dirX * dirX + dirY * dirY));
  return { x: baseX + t * dirX, y: baseY + t * dirY };
}

/** Données de la résolution, identiques pour les deux variantes : point P, droite cible, b, Q. */
export function donneesResolution(e: E, pointChoisi?: Point | null): { point: Point; cible: DroiteImplicite; nomCible: string; source: DroiteImplicite | null; nomSource: string; b: DroiteImplicite; q: Point } {
  if (e.variante === "point") return { point: e.point, cible: e.d, nomCible: "d", source: null, nomSource: "", b: e.bAttendue, q: e.q };
  const source = e.droiteSource === "d1" ? e.d1 : e.d2;
  const cible = e.droiteSource === "d1" ? e.d2 : e.d1;
  const point = pointChoisi ?? pointEntierSurDroite(source);
  const b = implicteDepuisPointVecteur(point, e.vecteurNormal);
  return { point, cible, nomCible: nomDroiteCible(e).latex, source, nomSource: e.droiteSource === "d1" ? "d_1" : "d_2", b, q: intersectionDeuxDroites(b, cible)! };
}

/** « m(x−2) », « −(x+1) », « x−2 » : coefficient devant une parenthèse. */
function facteur(m: number, expr: string, nu: boolean): string {
  if (m === 1) return nu ? expr : `(${expr})`;
  if (m === -1) return `-(${expr})`;
  return `${q(m)}(${expr})`;
}

/** Équation de b, perpendiculaire à d par P : pentes, puis point-pente, puis forme cartésienne. */
function lignesPerpendiculaire(cible: DroiteImplicite, nom: string, p: Point, bN: DroiteImplicite): LigneCalcul[] {
  const md = `m_{${nom}}`;
  if (cible.b === 0) return [ligne("m_b=0", `${lisible(nom)} est verticale : la perpendiculaire b est horizontale`), ligne(`y=${q(p.y)}`, "b passe par P"), ligne(equation(bN), "on passe tout dans le membre de gauche")];
  if (cible.a === 0) return [ligne(`${md}=0`, `${lisible(nom)} est horizontale`), ligne(`x=${q(p.x)}`, "la perpendiculaire à une horizontale est verticale ; b passe par P"), ligne(equation(bN), "on passe tout dans le membre de gauche")];
  const m = -cible.a / cible.b;
  const mb = cible.b / cible.a;
  const k = p.y - mb * p.x;
  const den = denominateur(mb, k);
  return dedoublonner([
    ligne(`${md}=-\\dfrac{a}{b}=-\\dfrac{${q(cible.a)}}{${q(cible.b)}}`, `pente de ${lisible(nom)}`),
    ...(`-\\dfrac{${q(cible.a)}}{${q(cible.b)}}` === q(m) ? [] : [ligne(`=${q(m)}`)]),
    ...(Math.abs(cible.a) === 1
      ? [ligne(`m_b=-\\dfrac{1}{${md}}=${q(mb)}`, "droites perpendiculaires : produit des pentes = −1")]
      : [ligne(`m_b=-\\dfrac{1}{${md}}=\\dfrac{${q(cible.b)}}{${q(cible.a)}}`, "droites perpendiculaires : produit des pentes = −1"), ligne(`=${q(mb)}`)]),
    ligne(`${moinsH(p.y, "y")}=${facteur(mb, moinsH(p.x, "x"), p.x === 0)}`, [texte("b passe par P : "), latex("y-y_P=m_b\\,(x-x_P)")]),
    ligne(`y=${somme([[mb, "x"], [k, ""]])}`, "on distribue et on isole y"),
    ligne(equation(bN), den > 1 ? `on multiplie par ${den} et on passe tout dans le membre de gauche` : "on passe tout dans le membre de gauche"),
  ]);
}

/** « d_1 » → « d₁ » (texte et figure). */
function lisible(nom: string): string {
  return nom.replace("_1", "₁").replace("_2", "₂");
}

/** Plus petit dénominateur commun de deux rationnels. */
function denominateur(...v: number[]): number {
  let d = 1;
  while (d < 1000 && !v.every((x) => Math.abs(x * d - Math.round(x * d)) < 1e-9)) d++;
  return d;
}

export function correctionDetailleeDistanceDroite(e: E, pointChoisi?: Point | null): EtapeCorrection[] {
  const { point: P, cible, nomCible, source, nomSource, b, q: Q } = donneesResolution(e, pointChoisi);
  const bN = normaliserSigneAffichage(b);
  const dN = normaliserSigneAffichage(cible);
  const eq1: Eq2 = { e: bN.a, f: bN.b, k: -bN.c };
  const eq2: Eq2 = { e: dN.a, f: dN.b, k: -dN.c };
  const [lB, lQ, lD] = e.variante === "point" ? ["a", "b", "c"] : ["b", "c", "d"];
  const etapes: EtapeCorrection[] = [];
  if (source) {
    const sN = normaliserSigneAffichage(source);
    etapes.push(
      utilise("a", [texte("La distance entre deux droites parallèles est la distance d'un point quelconque de l'une à l'autre ; pour un point à coordonnées entières de "), latex(nomSource), texte(", on choisit une abscisse (multiple du coefficient de y) et on résout l'équation "), texte(`${COURS_DISTANCE}.`)]),
      calcul("a", lignesPointCartesienne(sN, "P", P)),
      resultat("a", [latex(`${pt("P", P)}\\in ${nomSource}`)]),
      verification("a", [texte("P vérifie l'équation de "), latex(nomSource), texte(" : ")], lignesPointSurCartesienne(sN, P, "P")),
      piege("a", [texte("Le point doit être pris sur "), latex(nomSource), texte(" (la droite de départ), pas sur "), latex(nomCible), texte(".")]),
    );
  }
  etapes.push(
    utilise(lB, [texte("La distance de P à "), latex(nomCible), texte(" se mesure sur la perpendiculaire b menée par P ; deux droites (non verticales) sont perpendiculaires quand le produit de leurs pentes vaut −1 "), texte(`${COURS_RELATIONS}.`)]),
    calcul(lB, lignesPerpendiculaire(dN, nomCible, P, bN)),
    resultat(lB, [latex(formatDroiteLatex("b", b))]),
    verification(lB, [texte("P est bien sur b : ")], lignesPointSurCartesienne(bN, P, "P")),
    piege(lB, [texte("La droite b doit être PERPENDICULAIRE à "), latex(nomCible), texte(" : avec la parallèle menée par P, on ne retrouve jamais le pied de la perpendiculaire.")]),
    utilise(lQ, [texte("Le pied Q de la perpendiculaire est le point d'intersection de b et de "), latex(nomCible), texte(" : on résout le système (substitution ou combinaison) "), texte(`${COURS_INTERSECTION}.`)]),
    calcul(lQ, [ligne(`\\text{(1)}\\;\\;${eqLatex(eq1, "x", "y")}`, "équation de b, constante passée à droite"), ligne(`\\text{(2)}\\;\\;${eqLatex(eq2, "x", "y")}`, `équation de ${lisible(nomCible)}`)], [], "Système"),
    calcul(lQ, lignesSysteme2(eq1, eq2, "x", "y", { u: Q.x, v: Q.y }), [], "Résolution"),
    resultat(lQ, [latex(pt("Q", Q))]),
    verification(lQ, [texte("Q vérifie les deux équations : ")], [...lignesPointSurCartesienne(bN, Q, "Q"), ...lignesPointSurCartesienne(dN, Q, "Q")]),
    piege(lQ, [texte("Trouver une coordonnée ne suffit pas : on remplace sa valeur dans une équation pour obtenir l'autre.")]),
  );
  const nomDist = e.variante === "point" ? "\\operatorname{dist}(P,d)" : "\\operatorname{dist}(d_1,d_2)";
  const axe = dN.a === 0 || dN.b === 0;
  etapes.push(
    utilise(lD, [texte("La distance cherchée est la longueur PQ, distance de deux points : "), latex("PQ=\\sqrt{(x_Q-x_P)^2+(y_Q-y_P)^2}"), texte(` ${COURS_DISTANCE}.`)]),
    calcul(lD, lignesDistanceDeuxPoints(P, Q)),
    {
      ...resultat(lD, [latex(`${nomDist}=PQ=${formatDistanceAttendueLatex(e.distanceCarree)}`)]),
      figureHtml: figureLotG({
        graduationsLisibles: true,
        droites: [{ d: dN, couleur: "bleu", nom: lisible(nomCible) }, ...(source ? [{ d: normaliserSigneAffichage(source), couleur: "gris" as const, nom: lisible(nomSource) }] : []), { d: bN, couleur: "accent", nom: "b", pointilles: true }],
        points: [
          { p: P, nom: "P", couleur: "encre" },
          { p: Q, nom: "Q", couleur: "vert" },
        ],
        segments: [{ a: P, b: Q, couleur: "vert" }],
        anglesDroits: [{ sommet: Q, vers1: P, vers2: { x: Q.x + dN.b, y: Q.y - dN.a } }],
      }),
    },
    ...(axe
      ? [
          verification(lD, [texte(dN.b === 0 ? "Raccourci : la droite est verticale, la distance est l'écart des abscisses : " : "Raccourci : la droite est horizontale, la distance est l'écart des ordonnées : ")], [
            ligne(dN.b === 0 ? `|x_P-x_Q|=|${q(P.x)}-${qp(Q.x)}|` : `|y_P-y_Q|=|${q(P.y)}-${qp(Q.y)}|`, "même distance"),
            ligne(`=${q(dN.b === 0 ? Math.abs(P.x - Q.x) : Math.abs(P.y - Q.y))}`),
          ]),
        ]
      : []),
    piege(lD, [texte("La distance est une valeur EXACTE : on simplifie la racine ("), latex("\\sqrt{20}=2\\sqrt{5}"), texte(") au lieu de donner une valeur approchée.")]),
  );
  return finaliserVecteurs(etapes);
}
