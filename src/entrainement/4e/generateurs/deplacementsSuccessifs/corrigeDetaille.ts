import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import type { Composantes } from "../../core/vecteur.types";
import type { ExerciceDeplacementsSuccessifs } from "../../core/deplacementsSuccessifs.types";
import {
  carreNorme,
  distanceArrondie,
  distanceParcourue,
  ecrans,
  estDiagonale,
  lettreEcran,
  nomArrivee,
  nomCible,
  simplifierRacine,
  total,
  vecteurCible,
  vecteurDistance,
  vecteurRetour,
  vecteursDeplacements,
  type Ecran,
} from "../../moteur/modeleDeplacementsSuccessifs";
import { construireFigureDeplacements } from "../../ui/figureDeplacementsSuccessifs";
import {
  chaslesLatex,
  colonneLatex,
  descriptionGrandPas,
  instructionTexte,
  nomDistance,
  nombreLatex,
  positionEnMots,
  reponseDistanceFragments,
  uniteTexte,
  vecteurCibleLatex,
  vecteurDistanceLatex,
  vecteurTotalLatex,
  vecteurU,
} from "../../ui/formatDeplacementsSuccessifs";
import { COURS_CHASLES, COURS_COMPOSANTES, COURS_MULTIPLE_REPERE, COURS_NORME, COURS_OPPOSES, COURS_SOMME_REPERE, finaliserVecteurs } from "../../ui/corrigeVecteurs2";

/**
 * Corrigé détaillé « comme au tableau » de gen86 « Carte au trésor et randonnée : déplacements
 * successifs » — règle `.claude/rules/feuilles-evaluations.md`. Une lettre par ÉCRAN
 * (`moteur/modeleDeplacementsSuccessifs.ts::ecrans`) ; partagé par l'adaptateur papier et l'appli.
 * Chaque instruction traduite en vecteur, somme de Chasles composante par composante, distance par
 * la norme (racine simplifiée, puis arrondi si demandé), retour (opposé), dernier déplacement
 * (Chasles par le départ), nombre de grands pas (même k sur les deux composantes).
 */

type E = ExerciceDeplacementsSuccessifs;

function np(n: number): string {
  return n < 0 ? `(${nombreLatex(n)})` : nombreLatex(n);
}

function etapesTraduction(e: E): EtapeCorrection[] {
  const l = lettreEcran(e, "traduire");
  const diag = e.deplacements.some((d) => estDiagonale(d.direction));
  return [
    utilise(l, [
      texte(
        `Repère : x vers l'est, y vers le nord ${COURS_COMPOSANTES}. L'est et le nord donnent des composantes positives, l'ouest et le sud des composantes négatives ; le long d'un seul axe, l'autre composante est nulle.${diag ? " Un pas en diagonale change les deux composantes d'une case chacune." : ""}`,
      ),
    ]),
    calcul(
      l,
      e.deplacements.map((d, i) => ligne(`${vecteurU(i + 1)}=${colonneLatex(vecteursDeplacements(e)[i]!)}`, instructionTexte(e.situation, d))),
    ),
    resultat(l, e.deplacements.flatMap((_, i) => [...(i > 0 ? [texte(" ; ")] : []), latex(`${vecteurU(i + 1)} = ${colonneLatex(vecteursDeplacements(e)[i]!)}`)])),
  ];
}

function sommeColonne(vs: Composantes[], axe: "x" | "y"): string {
  return vs.map((v, i) => (i === 0 ? nombreLatex(v[axe]) : `+${np(v[axe])}`)).join("");
}

function etapesTotal(e: E): EtapeCorrection[] {
  const l = lettreEcran(e, "total");
  const vs = vecteursDeplacements(e);
  const t = total(e);
  const lieu = e.question === "repetition" ? "Le rocher R" : `Le point ${nomArrivee(e)}`;
  return [
    utilise(l, [
      texte(`Relation de Chasles ${COURS_CHASLES} : les déplacements se mettent bout à bout, le déplacement total est leur somme ; on additionne composante par composante ${COURS_SOMME_REPERE}.`),
    ]),
    calcul(l, [
      ligne(chaslesLatex(e).replace(/ /g, ""), "relation de Chasles"),
      ligne(`=\\begin{pmatrix} ${sommeColonne(vs, "x")} \\\\ ${sommeColonne(vs, "y")} \\end{pmatrix}`, "composante par composante"),
      ligne(`=${colonneLatex(t)}`),
    ]),
    {
      ...resultat(l, [latex(`${vecteurTotalLatex(e)} = ${colonneLatex(t)}`), texte(` : ${lieu.charAt(0).toLowerCase() + lieu.slice(1)} se trouve ${positionEnMots(e, t)} du départ.`)]),
      figureHtml: construireFigureDeplacements(e, { theme: "papier", trajet: true, complet: true }),
    },
  ];
}

function etapesDistance(e: E): EtapeCorrection[] {
  const l = lettreEcran(e, "distance");
  const v = vecteurDistance(e);
  const nom = nomDistance(e);
  const n = carreNorme(v);
  const { a, b } = simplifierRacine(n);
  const lignes: LigneCalcul[] = [
    ligne(`${nom}=\\|${vecteurDistanceLatex(e)}\\|`, "distance à vol d'oiseau : norme du vecteur"),
    ligne(`=\\sqrt{${np(v.x)}^2+${np(v.y)}^2}`, "norme à partir des composantes"),
    ligne(`=\\sqrt{${nombreLatex(v.x * v.x)}+${nombreLatex(v.y * v.y)}}`),
    ligne(`=\\sqrt{${nombreLatex(n)}}`),
  ];
  if (b === 1) lignes.push(ligne(`=${nombreLatex(a)}`, `${nombreLatex(n).replace(/\\,/g, " ")} = ${nombreLatex(a).replace(/\\,/g, " ")}²`));
  else if (a > 1) lignes.push(ligne(`=\\sqrt{${nombreLatex(a * a)}\\cdot ${nombreLatex(b)}}`, "on extrait le plus grand carré"), ligne(`=${nombreLatex(a)}\\sqrt{${nombreLatex(b)}}`));
  if (b !== 1 && e.precision === "arrondi") lignes.push(ligne(`\\approx ${nombreLatex(distanceArrondie(e))}`, e.situation === "drone" ? "arrondi au mètre" : "arrondi au dixième"));
  return [
    utilise(l, [texte("La distance à vol d'oiseau entre deux points est la norme du vecteur qui les relie : "), latex("\\|\\vec{u}\\|=\\sqrt{x_u^2+y_u^2}"), texte(` ${COURS_NORME}.`)]),
    calcul(l, lignes),
    resultat(l, [...reponseDistanceFragments(e), texte(".")]),
  ];
}

function etapesRetour(e: E): EtapeCorrection[] {
  const l = lettreEcran(e, "retour");
  const t = total(e);
  const r = vecteurRetour(e);
  return [
    utilise(l, [texte(`Revenir au départ, c'est faire le déplacement opposé au déplacement total ${COURS_OPPOSES} : chaque composante change de signe.`)]),
    calcul(l, [ligne("\\vec{AD}=-\\vec{DA}", "vecteurs opposés"), ligne(`=-${colonneLatex(t)}`, "déplacement total"), ligne(`=${colonneLatex(r)}`, "on change le signe de chaque composante")]),
    resultat(l, [latex(`\\vec{AD} = ${colonneLatex(r)}`), texte(`, soit ${positionEnMots(e, r)}.`)]),
  ];
}

function etapesCible(e: E): EtapeCorrection[] {
  const l = lettreEcran(e, "cible");
  const A = nomArrivee(e);
  const C = nomCible(e) ?? "C";
  const c = e.cible ?? { x: 0, y: 0 };
  const t = total(e);
  const w = vecteurCible(e);
  return [
    utilise(l, [texte(`Relation de Chasles, en passant par le départ D ${COURS_CHASLES} : les composantes de `), latex(`\\vec{D${C}}`), texte(` sont les coordonnées de ${C}, celles de `), latex(`\\vec{D${A}}`), texte(` le déplacement total.`)]),
    calcul(l, [
      ligne(`\\vec{${A}${C}}=\\vec{${A}D}+\\vec{D${C}}`, "relation de Chasles"),
      ligne(`=\\vec{D${C}}-\\vec{D${A}}`, [latex(`\\vec{${A}D}=-\\vec{D${A}}`)]),
      ligne(`=\\begin{pmatrix} ${nombreLatex(c.x)}-${np(t.x)} \\\\ ${nombreLatex(c.y)}-${np(t.y)} \\end{pmatrix}`, `coordonnées de ${C} moins déplacement total`),
      ligne(`=${colonneLatex(w)}`),
    ]),
    resultat(l, [latex(`${vecteurCibleLatex(e)} = ${colonneLatex(w)}`), texte(`, soit ${positionEnMots(e, w)}.`)]),
  ];
}

function etapesK(e: E): EtapeCorrection[] {
  const l = lettreEcran(e, "k");
  const w = e.pas ?? { x: 1, y: 1 };
  const rt = vecteurCible(e);
  const k = e.k ?? 0;
  const surX = w.x !== 0;
  const [r1, w1, r2, w2, a1, a2] = surX ? [rt.x, w.x, rt.y, w.y, "x", "y"] : [rt.y, w.y, rt.x, w.x, "y", "x"];
  return [
    utilise(l, [
      texte(`Le grand pas (${descriptionGrandPas(w)}) se traduit par `),
      latex(`\\vec{w}=${colonneLatex(w)}`),
      texte(` ; répéter k fois ce pas, c'est `),
      latex("k\\vec{w}"),
      texte(` : chaque composante est multipliée par k ${COURS_MULTIPLE_REPERE}. On cherche k tel que `),
      latex("\\vec{RT}=k\\vec{w}"),
      texte("."),
    ]),
    calcul(l, [
      ligne(`${nombreLatex(r1)}=k\\cdot ${np(w1)}`, [texte(`composantes en ${a1} : `), latex(`${a1}_{RT}=k\\cdot ${a1}_w`)]),
      ligne(`k=\\dfrac{${nombreLatex(r1)}}{${nombreLatex(w1)}}`, `on divise par ${nombreLatex(w1).replace("-", "−")}`),
      ligne(`=${k}`),
      ligne(`k\\cdot ${a2}_w=${k}\\cdot ${np(w2)}`, `contrôle sur les composantes en ${a2}`),
      ligne(`=${nombreLatex(k * w2)}`, `c'est bien ${a2 === "y" ? "la seconde" : "la première"} composante de RT (${nombreLatex(r2).replace("-", "−")})`),
    ]),
    resultat(l, [texte(`Il faut répéter le grand pas ${k} fois : `), latex(`\\vec{RT} = ${k}\\,\\vec{w}`), texte(".")]),
  ];
}

function lignePiege(e: E): EtapeCorrection {
  const l = lettreEcran(e, "distance");
  const u = uniteTexte(e.situation);
  const parcourue = distanceParcourue(e);
  const parcourueLatex = Number.isInteger(parcourue) ? nombreLatex(parcourue) : `${nombreLatex(Math.round(parcourue * 10) / 10)}`;
  const approx = Number.isInteger(parcourue) ? "=" : "\\approx";
  const nom = nomDistance(e);
  const distanceFrag = reponseDistanceFragments(e)[0]!;
  if (e.question === "retour") {
    const somme = e.deplacements.map((d) => (estDiagonale(d.direction) ? `${d.longueur === 1 ? "" : nombreLatex(d.longueur)}\\sqrt{2}` : nombreLatex(d.longueur))).join(" + ");
    return piege(l, [texte("Ne pas confondre avec la distance parcourue en suivant le trajet : "), latex(`${somme} ${approx} ${parcourueLatex}`), texte(` ${u}. À vol d'oiseau, on va en ligne droite : `), distanceFrag, texte(` ${u}.`)]);
  }
  const v = vecteurDistance(e);
  return piege(l, [
    texte("Ne pas additionner les deux composantes (chemin en suivant le quadrillage) : "),
    latex(`${nombreLatex(Math.abs(v.x))} + ${nombreLatex(Math.abs(v.y))} = ${parcourueLatex}`),
    texte(` ${u}. À vol d'oiseau, la distance ${nom} est la norme : `),
    distanceFrag,
    texte(` ${u}.`),
  ]);
}

const CONSTRUCTEURS: Record<Ecran, (e: E) => EtapeCorrection[]> = {
  traduire: etapesTraduction,
  total: etapesTotal,
  distance: etapesDistance,
  retour: etapesRetour,
  cible: etapesCible,
  k: etapesK,
};

function corrigeBrutDeplacementsSuccessifs(e: E): EtapeCorrection[] {
  const etapes = ecrans(e).flatMap((ecran) => CONSTRUCTEURS[ecran](e));
  const p = lignePiege(e);
  const fin = etapes.map((x) => x.sousQuestion).lastIndexOf(p.sousQuestion);
  etapes.splice(fin + 1, 0, p);
  return etapes;
}

export function correctionDetailleeDeplacementsSuccessifs(e: E): EtapeCorrection[] {
  return finaliserVecteurs(corrigeBrutDeplacementsSuccessifs(e));
}
