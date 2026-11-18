import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { Axe, ExerciceTransformationsEnsembles, Intervalle, Transformation, TypeTransformation } from "../../core/transformationsEnsembles.types";
import { appliquer, axeDe, ensembleDeDepart, ensembleFinal, natureDe, transformationsDeLAxe } from "../../moteur/modeleTransformationsEnsembles";
import { DOM_F, DOM_G, IM_F, IM_G, ensembleGLatex, intervalleLatex, nombreLatex, sigleTransformation } from "../../ui/formatTransformationsEnsembles";
import { COURS_TRANSFORMATIONS, nombreTexte } from "../../ui/corrigeChapitre3";

/**
 * Corrigé détaillé « comme au tableau » de gen72 (domaine et ensemble image après transformations)
 * — règle `.claude/rules/feuilles-evaluations.md`. Trois étapes = trois écrans : a) ce que touche
 * chaque transformation, b) le domaine de g, c) l'ensemble image de g. Les intervalles viennent des
 * MÊMES fonctions que l'écran (`appliquer`, `transformationsDeLAxe`, `intervalleLatex`) ; partagé
 * par l'adaptateur papier et l'appli (étape échouée).
 */

type E = ExerciceTransformationsEnsembles;

/** Effet d'une transformation sur la coordonnée qu'elle modifie (x′ ou y′). */
function effetCoordonnee(t: Transformation): string {
  const k = nombreLatex(t.valeur);
  switch (t.type) {
    case "TH":
      return t.valeur < 0 ? `x'=x-${nombreLatex(-t.valeur)}` : `x'=x+${k}`;
    case "TV":
      return t.valeur < 0 ? `y'=y-${nombreLatex(-t.valeur)}` : `y'=y+${k}`;
    case "SOX":
      return "y'=-y";
    case "SOY":
      return "x'=-x";
    case "EH":
      return `x'=${k}x`;
    case "CH":
      return `x'=\\dfrac{x}{${k}}`;
    case "EV":
      return `y'=${k}y`;
    case "CV":
      return `y'=\\dfrac{y}{${k}}`;
  }
}

function etapeClassement(e: E): EtapeCorrection[] {
  const h = transformationsDeLAxe(e, "H").map(({ rang }) => rang);
  const v = transformationsDeLAxe(e, "V").map(({ rang }) => rang);
  const liste = (r: number[]) => (r.length === 0 ? "aucune" : r.length === 1 ? `la transformation ${r[0]}` : `les transformations ${r.slice(0, -1).join(", ")} et ${r[r.length - 1]}`);
  const lignes: LigneCalcul[] = e.transformations.map((t, i) =>
    ligne(effetCoordonnee(t), [texte(`${i + 1}. `), ...sigleTransformation(t), texte(axeDe(t) === "H" ? " : l'abscisse change → domaine" : " : l'ordonnée change → ensemble image")]),
  );
  return [
    utilise("a", [
      texte("Une transformation horizontale (TH, SOY, EH, CH) change l'abscisse "),
      latex("x"),
      texte(" de chaque point : elle agit sur le domaine. Une transformation verticale (TV, SOX, EV, CV) change l'ordonnée "),
      latex("y"),
      texte(` : elle agit sur l'ensemble image ${COURS_TRANSFORMATIONS}.`),
    ]),
    calcul("a", lignes, [texte("Effet de chaque transformation sur un point "), latex("(x\\,;\\,y)"), texte(" du graphique de f :")]),
    resultat("a", [texte(`Domaine : ${liste(h)} ; ensemble image : ${liste(v)}.`)]),
  ];
}

/** Borne transformée écrite en clair (« -2+3 », « 2\times(-1) », « \dfrac{-8}{2} ») — une borne infinie reste infinie. */
function operation(t: Transformation, b: number): string {
  if (!Number.isFinite(b)) return nombreLatex(t.type === "SOX" || t.type === "SOY" ? -b : b);
  const bp = b < 0 ? `(${nombreLatex(b)})` : nombreLatex(b);
  switch (t.type) {
    case "TH":
    case "TV":
      return `${nombreLatex(b)}${t.valeur < 0 ? "-" : "+"}${nombreLatex(Math.abs(t.valeur))}`;
    case "EH":
    case "EV":
      return `${nombreLatex(t.valeur)}\\times ${bp}`;
    case "CH":
    case "CV":
      return `\\dfrac{${nombreLatex(b)}}{${nombreLatex(t.valeur)}}`;
    case "SOX":
    case "SOY":
      return nombreLatex(-b);
  }
}

function crochets(i: Intervalle, g: string, d: string): string {
  return `${i.gaucheFerme ? "[" : "\\mathopen{]}"}${g} \\,;\\, ${d}${i.droiteFerme ? "]" : "\\mathclose{[}"}`;
}

const REGLE: Record<TypeTransformation, string> = {
  TH: "on ajoute la translation aux deux bornes, mêmes crochets",
  TV: "on ajoute la translation aux deux bornes, mêmes crochets",
  SOX: "bornes opposées et échangées, chaque crochet suit sa borne",
  SOY: "bornes opposées et échangées, chaque crochet suit sa borne",
  EH: "on multiplie les deux bornes par le facteur, mêmes crochets",
  EV: "on multiplie les deux bornes par le facteur, mêmes crochets",
  CH: "on divise les deux bornes par le facteur, mêmes crochets",
  CV: "on divise les deux bornes par le facteur, mêmes crochets",
};

function etapeAxe(e: E, axe: Axe, lettre: string): EtapeCorrection[] {
  const liste = transformationsDeLAxe(e, axe);
  const depart = ensembleDeDepart(e, axe);
  const nomF = axe === "H" ? DOM_F : IM_F;
  const nom = axe === "H" ? "le domaine" : "l'ensemble image";
  const lettreE = axe === "H" ? "D" : "I";
  const final = ensembleFinal(e, axe);
  if (liste.length === 0) {
    return [
      utilise(lettre, [texte(`Seules les transformations ${axe === "H" ? "horizontales (TH, SOY, EH, CH)" : "verticales (TV, SOX, EV, CV)"} modifient ${nom} ${COURS_TRANSFORMATIONS}.`)]),
      calcul(lettre, [ligne(`${ensembleGLatex(axe)}=${nomF}=${intervalleLatex(depart)}`, `aucune transformation ${axe === "H" ? "horizontale" : "verticale"} dans la liste`)]),
      resultat(lettre, [latex(`${ensembleGLatex(axe)}=${intervalleLatex(final)}`)]),
    ];
  }
  const types = [...new Set(liste.map(({ t }) => t.type))];
  const regles = types.map((ty) => `${ty} : ${REGLE[ty]}`).join(" ; ");
  const lignes: LigneCalcul[] = [ligne(`${lettreE}_0=${intervalleLatex(depart)}`, `${nom} de f`)];
  let courant = depart;
  liste.forEach(({ t, rang }, i) => {
    const suivant = appliquer(t, courant);
    const nomI = `${lettreE}_{${i + 1}}`;
    const just = [texte(`${rang}. `), ...sigleTransformation(t), texte(` : ${REGLE[t.type]}`)];
    if (natureDe(t) === "S") {
      // Les bornes s'échangent : la nouvelle borne de gauche est l'opposé de l'ancienne borne de droite.
      lignes.push(ligne(`${nomI}=${crochets(suivant, operation(t, courant.droite), operation(t, courant.gauche))}`, just));
    } else {
      const brut = crochets(suivant, operation(t, courant.gauche), operation(t, courant.droite));
      lignes.push(ligne(`${nomI}=${brut}`, just));
      if (brut !== intervalleLatex(suivant)) lignes.push(ligne(`=${intervalleLatex(suivant)}`));
    }
    courant = suivant;
  });
  const infini = [depart.gauche, depart.droite].some((b) => !Number.isFinite(b));
  return [
    utilise(lettre, [texte(`On applique, dans l'ordre de la liste, les seules transformations qui modifient ${nom}, chacune à l'intervalle obtenu juste avant. Règles sur les bornes : ${regles}${infini ? " ; une borne infinie reste infinie, avec un crochet ouvert" : ""} ${COURS_TRANSFORMATIONS}.`)]),
    calcul(lettre, lignes),
    resultat(lettre, [latex(`${ensembleGLatex(axe)}=${intervalleLatex(final)}`)]),
    ...verificationAxe(e, axe, lettre),
  ];
}

/** Vérification sur une borne finie : on suit un point du graphique de f à travers les transformations. */
function verificationAxe(e: E, axe: Axe, lettre: string): EtapeCorrection[] {
  const liste = transformationsDeLAxe(e, axe);
  const depart = ensembleDeDepart(e, axe);
  const borne = Number.isFinite(depart.gauche) ? depart.gauche : depart.droite;
  if (!Number.isFinite(borne) || liste.length < 2) return [];
  let x = borne;
  for (const { t } of liste) x = appliquer(t, { gauche: x, gaucheFerme: true, droite: x, droiteFerme: true }).gauche;
  const c = axe === "H" ? "abscisse" : "ordonnée";
  const final = ensembleFinal(e, axe);
  const est = [final.gauche, final.droite].some((b) => Math.abs(b - x) < 1e-9);
  if (!est) return [];
  return [verification(lettre, [texte(`Un point d'${c} ${nombreTexte(borne)} (borne de départ) arrive, après les ${liste.length} transformations, à l'${c} ${nombreTexte(x)} : c'est bien une borne de `), latex(ensembleGLatex(axe)), texte(".")])];
}

function resultatOrdreInverse(e: E, axe: Axe): Intervalle {
  return [...transformationsDeLAxe(e, axe)].reverse().reduce((i, { t }) => appliquer(t, i), ensembleDeDepart(e, axe));
}

function etapePiege(e: E): EtapeCorrection {
  for (const axe of ["H", "V"] as const) {
    let courant = ensembleDeDepart(e, axe);
    for (const { t } of transformationsDeLAxe(e, axe)) {
      if (natureDe(t) === "S") {
        const faux: Intervalle = { gauche: -courant.gauche, gaucheFerme: courant.gaucheFerme, droite: -courant.droite, droiteFerme: courant.droiteFerme };
        return piege(axe === "H" ? "b" : "c", [
          texte(`${t.type} : changer les signes ne suffit pas. `),
          latex(intervalleLatex(courant)),
          texte(" devient "),
          latex(intervalleLatex(appliquer(t, courant))),
          texte(" — les bornes s'échangent et chaque crochet suit sa borne —, et pas "),
          latex(intervalleLatex(faux)),
          texte("."),
        ]);
      }
      courant = appliquer(t, courant);
    }
  }
  for (const axe of ["H", "V"] as const) {
    const inverse = resultatOrdreInverse(e, axe);
    const final = ensembleFinal(e, axe);
    const lisible = [inverse.gauche, inverse.droite].every((b) => !Number.isFinite(b) || Number.isInteger(b * 10));
    if (lisible && intervalleLatex(inverse) !== intervalleLatex(final)) {
      return piege(axe === "H" ? "b" : "c", [texte("L'ordre compte : appliquer les transformations dans le désordre donnerait "), latex(intervalleLatex(inverse)), texte(" au lieu de "), latex(intervalleLatex(final)), texte(".")]);
    }
  }
  const exemple = e.transformations[0]!;
  return piege("a", [
    texte("Ne pas appliquer une transformation au mauvais ensemble : "),
    ...sigleTransformation(exemple),
    texte(axeDe(exemple) === "H" ? " déplace les points horizontalement, elle ne change pas l'ensemble image." : " déplace les points verticalement, elle ne change pas le domaine."),
  ]);
}

export function correctionDetailleeTransformationsEnsembles(e: E): EtapeCorrection[] {
  return [...etapeClassement(e), ...etapeAxe(e, "H", "b"), ...etapeAxe(e, "V", "c"), etapePiege(e)];
}

export { DOM_G, IM_G };
