import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, lignesDepuisChaine, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceRotationsContexte } from "../../core/rotationsContexte.types";
import { angleReference, grandeurRetour, hauteurDirecte, kInverse, positionDirecte, propre, quadrantDe, solutionsContexte, solutionsTheta, thetaBrut, thetaDirect } from "../../moteur/modeleRotationsContexte";
import {
  alphaCalculLatex,
  decimalesRetour,
  egalOuApprox,
  estArrondiExact,
  formuleConversionLatex,
  hauteurExacteLatex,
  heureApresMidi,
  kLatex,
  libelleOrigine,
  libelleRotation,
  nombreFixeLatex,
  nombreLatex,
  objet,
  positionLatex,
  produitExactLatex,
  pronom,
  reference,
  reponseEcranLatex,
  retoursLatex,
  solutionsThetaLatex,
  thetaDirectLatex,
  valeurExacteLatex,
} from "../../ui/formatRotationsContexte";
import { figureRotationsContexteSvg } from "../../ui/figureRotationsContexte";
import { calculExact } from "../../moteur/modeleRotationsContexte";
import { avecFinale, COURS_CERCLE, COURS_EQUATIONS, COURS_REMARQUABLES, finaliserCorrige, lignesCandidats, lignesReduction, prefixesCandidats, quadrantsCandidats } from "../../ui/corrigeCercleTrigo";

/**
 * Corrigé détaillé « comme au tableau » de gen79 (rotations en contexte) — règle
 * `.claude/rules/feuilles-evaluations.md`. Quatre écrans, quatre lettres : a) départ et sens de
 * rotation (lecture du schéma), b) angle trigonométrique θ (sens direct) ou mise en équation
 * (inverse), c) coordonnées du point (direct) ou solutions de sin θ = k (inverse), d) hauteur
 * (direct) ou retour au contexte (inverse). Valeurs approchées calculées depuis les valeurs NON
 * arrondies (θ₀ = sin⁻¹|k|, y exact), écrites par les fonctions de l'écran (`egalOuApprox`,
 * `nombreFixeLatex`, `retoursLatex`…). Écran de pure lecture (niveau) : a.
 */

type E = ExerciceRotationsContexte;

export const LETTRES_LECTURE_ROTATIONS = ["a"];

export function lettreEcranRotationsContexte(ecran: number): string {
  return "abcd"[ecran] ?? "a";
}

/** Morceaux « A ; B » d'une réponse de l'écran → une formule par valeur (jamais « ; » dans une formule). */
function morceaux(l: string): FragmentConsigne[] {
  return l.split(/\s*\\quad\s*;\s*\\quad\s*/).flatMap((m, i) => (i === 0 ? [latex(m)] : [texte(" ; "), latex(m)]));
}

function etapeRepere(e: E): EtapeCorrection[] {
  return [
    utilise("a", [texte(`Sur le cercle trigonométrique, 0° est à droite, 90° en haut, 180° à gauche, 270° en bas ; le sens trigonométrique est le sens contraire des aiguilles d'une montre ${COURS_CERCLE}.`)]),
    calcul("a", [
      ligne(`\\theta_{\\text{départ}}=${e.origine}^\\circ`, `${objet(e)} part de ${libelleOrigine(e.origine)}`),
      ligne(formuleConversionLatex(e).replace(/\s*=\s*/, "="), e.rotation === 1 ? "sens trigonométrique : on ajoute l'angle parcouru α" : "sens horaire : on retranche l'angle parcouru α"),
    ]),
    resultat("a", [texte(`Départ : ${libelleOrigine(e.origine)} ; ${libelleRotation(e.rotation).toLowerCase()}.`)]),
  ];
}

function correctionDirecte(e: E): EtapeCorrection[] {
  const theta = thetaDirect(e);
  const brut = thetaBrut(e);
  const ref = angleReference(theta);
  const q = quadrantDe(theta);
  const { x, y } = positionDirecte(e);
  const H = hauteurDirecte(e);
  const exacte = calculExact(e);
  const r = nombreLatex(e.rayon);
  const etapes: EtapeCorrection[] = [...etapeRepere(e)];

  // b) Angle trigonométrique.
  const lignesB: LigneCalcul[] = [];
  if (e.situation === "roue" || e.situation === "horloge") {
    lignesB.push(...lignesDepuisChaine(alphaCalculLatex(e).replace(/\s*=\s*/g, "="), [e.situation === "roue" ? "un tour (360°) par période : angle proportionnel au temps" : "6° par minute"]));
  }
  lignesB.push(ligne(`\\theta=${e.origine}^\\circ${e.rotation === 1 ? "+" : "-"}${e.alpha}^\\circ=${brut}^\\circ`, e.rotation === 1 ? "sens trigonométrique" : "sens horaire"));
  lignesB.push(...lignesReduction(brut));
  etapes.push(
    utilise("b", [texte(`Angle de la position atteinte : `), latex(formuleConversionLatex(e)), texte(`, puis ramené dans [0° ; 360°[ ${COURS_CERCLE}.`)]),
    calcul("b", lignesB),
    resultat("b", [latex(thetaDirectLatex(e))]),
  );
  etapes.push(
    piege("b", [
      texte(`Prendre directement α comme angle trigonométrique revient à faire partir ${objet(e)} de la droite et tourner dans le sens trigonométrique : ici ${pronom(e)} part de ${e.origine}° et tourne dans le sens ${e.rotation === 1 ? "trigonométrique" : "horaire"}, d'où `),
      latex(`\\theta=${theta}^\\circ`),
      texte("."),
    ]),
  );

  // c) Coordonnées.
  const lignesC: LigneCalcul[] = [];
  for (const [nom, f, v] of [["x", "cos", x], ["y", "sin", y]] as const) {
    const debut = ligne(`${nom}=${r}\\${f} ${theta}^\\circ`, nom === "x" ? "abscisse : r cos θ" : "ordonnée : r sin θ");
    if (exacte) {
      const val = valeurExacteLatex(f, theta);
      const prod = produitExactLatex(e.rayon, f, theta);
      const l = [debut, ligne(`=${r}\\cdot ${val.startsWith("-") ? `\\left(${val}\\right)` : val}`, [texte(`quadrant ${q}, angle du premier quadrant ${ref}° : `), latex(`\\${f} ${theta}^\\circ=${val}`)])];
      const avec = avecFinale(l, prod);
      lignesC.push(...avec);
      if (prod.includes("\\sqrt")) lignesC.push(ligne(`\\approx ${nombreFixeLatex(v, 2)}`, `au centième (en ${e.unite})`));
    } else {
      lignesC.push(debut, ligne(`${egalOuApprox(v, 2).replace(/^=\s*/, "=")}`, `calculatrice, mode degrés (en ${e.unite})`));
    }
  }
  etapes.push(
    utilise("c", [
      texte("Un point d'un cercle de rayon r centré à l'origine, repéré par l'angle θ, a pour coordonnées "),
      latex("(r\\cos\\theta\\,;\\,r\\sin\\theta)"),
      texte(exacte ? ` ; θ = ${theta}° est un angle remarquable ${COURS_REMARQUABLES}, ses signes viennent du quadrant ${COURS_CERCLE}.` : ` ; la calculatrice (mode degrés) donne cos θ et sin θ avec leur signe ${COURS_CERCLE}.`),
    ]),
    calcul("c", lignesC),
    resultat("c", morceaux(positionLatex(e))),
  );

  // d) Hauteur.
  const lignesD: LigneCalcul[] = [ligne(`\\text{hauteur}=${nombreLatex(e.hauteurCentre)}+y`, `hauteur du centre + ordonnée du point (en ${e.unite})`)];
  if (exacte) {
    const yEx = produitExactLatex(e.rayon, "sin", theta);
    lignesD.push(ligne(`=${nombreLatex(e.hauteurCentre)}+${yEx.startsWith("-") ? `(${yEx})` : yEx}`, "y exact"));
    const fin = avecFinale(lignesD, hauteurExacteLatex(e));
    lignesD.length = 0;
    lignesD.push(...fin);
    if (hauteurExacteLatex(e).includes("\\sqrt")) lignesD.push(ligne(`\\approx ${nombreFixeLatex(H, 2)}`, "au centième"));
  } else {
    lignesD.push(ligne(`=${nombreLatex(e.hauteurCentre)}+${r}\\sin ${theta}^\\circ`, "y non arrondi"), ligne(`${egalOuApprox(H, 2).replace(/^=\s*/, "=")}`, "au centième"));
  }
  etapes.push(
    utilise("d", [texte(`Hauteur au-dessus ${reference(e)} = hauteur du centre + ordonnée du point (y est négatif sous le centre) : `), latex("h+y"), texte(".")]),
    calcul("d", lignesD),
    { ...resultat("d", [latex(reponseEcranLatex(e, 3))]), figureHtml: figureRotationsContexteSvg(e, "corrige") },
  );
  return etapes;
}

function correctionInverse(e: E): EtapeCorrection[] {
  const k = kInverse(e);
  const sols = solutionsContexte(e);
  const thetas = solutionsTheta(e);
  const h = nombreLatex(e.hauteurCentre);
  const r = nombreLatex(e.rayon);
  const H = nombreLatex(e.hauteurCible ?? 0);
  const ecart = nombreLatex(propre((e.hauteurCible ?? 0) - e.hauteurCentre));
  const kL = nombreLatex(k, 4);
  const etapes: EtapeCorrection[] = [...etapeRepere(e)];

  // b) Mise en équation.
  etapes.push(
    utilise("b", [texte("Le point repéré par θ est à la hauteur "), latex("h+r\\sin\\theta"), texte(` au-dessus ${reference(e)} ; on écrit qu'elle vaut H ${COURS_EQUATIONS}.`)]),
    calcul("b", [
      ligne(`${h}+${r}\\sin\\theta=${H}`, `hauteur visée (en ${e.unite})`),
      ligne(`${r}\\sin\\theta=${ecart}`, `on retranche ${nombreLatex(e.hauteurCentre).replace("{,}", ",")} aux deux membres`),
      ligne(`\\sin\\theta=\\dfrac{${ecart}}{${r}}`, `on divise par ${nombreLatex(e.rayon).replace("{,}", ",")}`),
      ligne(`=${kL}`),
    ]),
    resultat("b", [latex(kLatex(e))]),
  );

  // c) Solutions de sin θ = k.
  const lignesC: LigneCalcul[] = [];
  const absK = nombreLatex(Math.abs(k), 4);
  let utiliseC: FragmentConsigne[];
  if (thetas.length === 1) {
    lignesC.push(ligne(`\\sin ${thetas[0]}^\\circ=${kL}`, k === 1 ? "point le plus haut du cercle" : "point le plus bas du cercle"), ligne(`\\theta=${thetas[0]}^\\circ`, "une seule solution dans [0° ; 360°["));
    utiliseC = [texte(`sin θ = ${k === 1 ? "1" : "−1"} : un seul point du cercle a cette ordonnée ${COURS_EQUATIONS}.`)];
  } else if (Math.abs(k) === 0.5) {
    if (k < 0) lignesC.push(ligne(`\\left|${kL}\\right|=${absK}`, "on cherche l'angle de référence sur la valeur absolue"));
    lignesC.push(ligne(`\\sin 30^\\circ=\\dfrac{1}{2}`, [texte("valeur remarquable : "), latex("\\theta_0=30^\\circ")]), ...lignesCandidats("sin", 30, k > 0, "\\theta"));
    utiliseC = [texte(`Valeur remarquable ${COURS_REMARQUABLES}, puis les deux solutions de même sinus : ${k > 0 ? "quadrants I et II" : "quadrants III et IV"} ${COURS_EQUATIONS}.`)];
  } else {
    const ref0 = (Math.asin(Math.abs(k)) * 180) / Math.PI;
    if (k < 0) lignesC.push(ligne(`\\left|${kL}\\right|=${absK}`, "on cherche l'angle de référence sur la valeur absolue"));
    lignesC.push(ligne(`\\theta_0=\\sin^{-1}(${absK})`, "calculatrice, en mode degrés"), ligne(`\\approx ${nombreFixeLatex(ref0, 1)}^\\circ`));
    const pref = prefixesCandidats("sin", k > 0);
    const quad = quadrantsCandidats("sin", k > 0);
    pref.forEach((p, j) => {
      lignesC.push(ligne(`\\theta_{${j + 1}}=${p === "" ? "\\theta_0" : `${p}\\theta_0`}`, quad[j]!), ligne(`\\approx ${nombreFixeLatex(thetas[j]!, 1)}^\\circ`, j === 0 ? undefined : [texte("avec "), latex("\\theta_0"), texte(" non arrondi")]));
    });
    utiliseC = [texte(`|k| n'est pas une valeur remarquable : angle de référence `), latex("\\theta_0"), texte(` à la calculatrice (mode degrés), puis les deux angles de même sinus, ${k > 0 ? "quadrants I et II" : "quadrants III et IV"} ${COURS_EQUATIONS}.`)];
  }
  etapes.push(
    utilise("c", utiliseC),
    calcul("c", lignesC),
    resultat("c", morceaux(solutionsThetaLatex(e))),
    verification(
      "c",
      [texte(thetas.length > 1 ? "Chaque angle redonne bien sin θ :" : "L'angle redonne bien sin θ :")],
      thetas.map((t) => ligne(`\\sin ${nombreLatex(t, 1)}^\\circ${estArrondiExact(t, 1) ? "=" : "\\approx "}${kL}`)),
    ),
  );
  if (thetas.length === 1) etapes.push(piege("c", [texte("Une seule solution ici : la droite horizontale touche le cercle en un seul point. Ne pas inventer une seconde solution symétrique.")]));

  // d) Retour au contexte.
  const n = sols.length;
  const idx = (i: number) => (n > 1 ? `_{${i + 1}}` : "");
  const exact = (v: number, d: number) => estArrondiExact(v, d);
  const lignesD: LigneCalcul[] = [];
  sols.forEach((s, i) => {
    const j = thetas.indexOf(s.theta);
    const thetaNom = thetas.length > 1 ? `\\theta_{${j + 1}}` : "\\theta";
    const brut = propre(e.rotation === 1 ? s.theta - e.origine : e.origine - s.theta);
    const thExact = exact(s.theta, 1);
    const terme = thExact ? `${nombreLatex(s.theta, 1)}^\\circ` : thetaNom;
    const diff = e.rotation === 1 ? `${terme}-${e.origine}^\\circ` : `${e.origine}^\\circ-${terme}`;
    const rel = thExact ? "=" : "\\approx ";
    const brutL = thExact ? `${nombreLatex(brut, 1)}^\\circ` : `${nombreFixeLatex(brut, 1)}^\\circ`;
    if (brut < 0) {
      lignesD.push(ligne(`${diff}${rel}${brutL}`, e.rotation === 1 ? "θ − θ départ (sens trigonométrique)" : "θ départ − θ (sens horaire)"));
      lignesD.push(ligne(`\\alpha${idx(i)}=${diff}+360^\\circ`, "négatif : on ajoute un tour"), ligne(`${rel}${thExact ? `${nombreLatex(s.alpha, 1)}^\\circ` : `${nombreFixeLatex(s.alpha, 1)}^\\circ`}`));
    } else {
      lignesD.push(ligne(`\\alpha${idx(i)}=${diff}`, e.rotation === 1 ? "θ − θ départ (sens trigonométrique)" : "θ départ − θ (sens horaire)"), ligne(`${rel}${brutL}`));
    }
    const d = decimalesRetour(e);
    const vL = exact(s.valeur, d) ? `=${nombreLatex(s.valeur, d)}` : `\\approx ${nombreFixeLatex(s.valeur, d)}`;
    const aL = `\\alpha${idx(i)}`;
    switch (grandeurRetour(e.situation)) {
      case "secondes": {
        const duree = e.situation === "roue" ? (e.periode ?? 0) * 60 : (e.periode ?? 0);
        lignesD.push(ligne(`t${idx(i)}=\\dfrac{${aL}}{360^\\circ}\\times ${duree}`, `un tour dure ${duree} s`), ligne(vL, "en secondes"));
        break;
      }
      case "minutes":
        lignesD.push(ligne(`m${idx(i)}=\\dfrac{${aL}}{6^\\circ}`, "6° par minute"), ligne(vL, "en minutes après midi"));
        break;
      default:
        break;
    }
  });
  const conversion: FragmentConsigne[] =
    e.situation === "roue" || e.situation === "eolienne"
      ? [texte(" Puis la durée, proportionnelle à l'angle : "), latex(`t=\\dfrac{\\alpha}{360^\\circ}\\times T`), texte(".")]
      : e.situation === "horloge"
        ? [texte(" Puis les minutes : "), latex("m=\\dfrac{\\alpha}{6^\\circ}"), texte(".")]
        : [texte(" La réponse du contexte est cet angle α lui-même.")];
  etapes.push(
    utilise("d", [
      texte(`Angle parcouru depuis le départ (${e.origine}°), ramené dans [0° ; 360°[ : `),
      latex(e.rotation === 1 ? `\\alpha=\\theta-${e.origine}^\\circ` : `\\alpha=${e.origine}^\\circ-\\theta`),
      texte("."),
      ...conversion,
    ]),
    calcul("d", lignesD),
    {
      ...resultat("d", [...morceaux(retoursLatex(e)), ...(e.situation === "horloge" ? [texte(`, soit ${sols.every((s) => Number.isInteger(s.valeur)) ? "à" : "vers"} ${sols.map((s) => heureApresMidi(s.valeur)).join(" et ")}.`)] : [])]),
      figureHtml: figureRotationsContexteSvg(e, "corrige"),
    },
  );
  if (thetas.length > 1) {
    etapes.push(
      piege("d", [
        texte("Les angles θ trouvés sont comptés depuis 0° (à droite) dans le sens trigonométrique : ce ne sont pas encore les réponses. Il faut les recompter depuis la position de départ ("),
        latex(`${e.origine}^\\circ`),
        texte(`), dans le sens ${e.rotation === 1 ? "trigonométrique" : "horaire"}.`),
      ]),
    );
  }
  return etapes;
}

export function correctionDetailleeRotationsContexte(e: E): EtapeCorrection[] {
  return finaliserCorrige(e.sens === "direct" ? correctionDirecte(e) : correctionInverse(e));
}
