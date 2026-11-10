import type { ExerciceIntersectionDroites, LigneIntersection } from "../../core/intersectionDroites.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, EnoncePapier, EtapeCorrection, FragmentConsigne as FragmentConsignePapier, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { FragmentConsigne } from "../../ui/formatEquationDroite";
import { formatFractionIrreductible } from "../../ui/formatFraction";
import {
  formatAidePointNiveau2Latex,
  formatEnonceLatex,
  formatLignesEnonce,
  formatPointLatex,
  formatReponsePointAttendueLatex,
  formatVecteurLatex,
  segmentsConsignePoint,
  texteAidePointNiveau1,
  texteConclusionAttendue,
} from "../../ui/formatIntersectionDroites";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceIntersectionDroites } from "./index";
import { profilIntersectionDroites } from "../profilsEvaluation4eCh7Droites";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceIntersectionDroites>` pour gen48 (Intersection
 * entre deux droites, chapitre "Géométrie analytique plane", `AppIntersectionDroites.tsx`) — voir
 * `generateurs/analyseFonction/exportWord.ts` pour le mécanisme générique de référence.
 *
 * Écran → question (`AppIntersectionDroites.tsx`/`moteur/sessionIntersectionDroites.ts`, 2 phases
 * possibles, JAMAIS toujours traversées — voir le commentaire de tête de `sessionIntersectionDroites.ts`) :
 * - `diagnostic` (`EtapeDiagnosticIntersectionDroites.tsx`, TOUJOURS présent) — 3 boutons catégoriels
 *   (sécantes / parallèles distinctes / confondues) → question papier a), consigne reprise de
 *   `segmentsConsigneDiagnostic()` précédée de `CONSIGNE_GENERALE_INTERSECTION` (affichée sur les 2
 *   écrans à l'écran, ici factorisée une seule fois en tête de la première question).
 * - `point` (`EtapePointIntersectionDroites.tsx`, UNIQUEMENT si `conclusion === "secantes"` — sinon
 *   la session clôt l'exercice directement après le diagnostic, aucun second écran) → question
 *   papier b), consigne reprise de `segmentsConsignePoint()` (déjà spécifique par variante).
 *
 * PAS `regroupable` : le nombre de questions par instance est STRUCTURELLEMENT variable — 1 question
 * si `conclusion !== "secantes"`, 2 si `conclusion === "secantes"` — alors que
 * `AdaptateurFeuilleExercices.regroupable` exige TOUJOURS une seule question par instance (condition
 * 1, voir `export/genererFeuilleExercices.ts`). Cette variation dépend en outre de `conclusion`
 * (tirée indépendamment de `variante` dans `construireAvecVarianteId`), pas de la variante forçable
 * elle-même : même en fixant `variante`, `/admin` de Math-Belgium ne peut pas savoir à l'avance
 * combien de questions une instance donnée produira. Même décision, pour une raison analogue
 * (nombre de questions hétérogène selon l'instance), que `simplification/exportEvaluation.ts` et
 * `colinearite/exportEvaluation.ts`.
 *
 * Aucune zone de réponse vierge (`reponse: { type: "lignes", nombre: 0 }`, même décision documentée
 * que `quelAngle/exportEvaluation.ts`/`comparaisonSeries/exportEvaluation.ts`) : l'élève rédige
 * librement sa réponse sur la copie, jamais contraint par un nombre de lignes imprimées.
 *
 * Correction RESYNTHÉTISÉE depuis les valeurs déjà connues et correctes de l'instance tirée, en
 * réutilisant directement les fonctions déjà utilisées côté écran interactif
 * (`ui/formatIntersectionDroites.ts` — `texteConclusionAttendue`, `formatReponsePointAttendueLatex`,
 * `texteAidePointNiveau1`, `formatAidePointNiveau2Latex`, `segmentsConsigneDiagnostic`/
 * `segmentsConsignePoint`) plutôt que d'en reconstruire de nouvelles. Différence assumée avec les
 * AIDES progressives de l'écran diagnostic (`segmentsAideDiagnosticNiveau1`/
 * `formatAideDiagnosticNiveau2Latex`, volontairement NON réutilisées ici) : ces aides sont conçues
 * pour ne révéler qu'UNE SEULE donnée brute à la fois (ex. `m_1` seul, jamais `m_2`), l'élève devant
 * calculer l'autre côté lui-même — une correction papier doit au contraire dérouler la comparaison
 * COMPLÈTE des deux côtés (voir `fragmentsCalculColinearite` ci-dessous), donc une resynthèse dédiée
 * plutôt qu'un simple replay des fragments d'aide. Le verdict colinéaire/non-colinéaire de cette
 * resynthèse suit STRICTEMENT `instance.colineaires` (jamais une ré-égalité `===` recalculée
 * localement sur des pentes flottantes, qui pourrait diverger par un arrondi binaire even quand
 * `instance.colineaires` — calculé par produit en croix sur des entiers, exact — dit le contraire) ;
 * seules les VALEURS affichées (pentes, vecteurs, critère) sont recalculées indépendamment, jamais
 * la conclusion verbale elle-même. Quand `instance.colineaires` est vrai, `fragmentsTestAppartenance`
 * distingue ensuite parallèles-distinctes de confondues en testant si un point de `d1`
 * (`instance.d1.point`, garanti sur `d1` par construction — voir `construireLigneIntersection`,
 * `generateurs/intersectionDroites/index.ts`) appartient à `d2` via l'équation implicite de `d2`
 * (`instance.d2.implicite`, TOUJOURS calculable quelle que soit `forme` — voir la doc de
 * `LigneIntersection`, `core/intersectionDroites.types.ts`) — un test indépendant de
 * `instance.conclusion`, jamais une simple relecture de ce champ.
 */

// ============================================================================
// Petits formateurs locaux, dupliqués depuis `ui/formatIntersectionDroites.ts` (fonctions privées,
// non exportées) — mêmes principes exacts (fraction irréductible pour toute pente potentiellement
// non entière, jamais de notation décimale), même convention de duplication déjà établie ailleurs
// sur le projet pour ces wrappers trop petits pour justifier une extraction partagée.
// ============================================================================

function formatMagnitudeFractionLatex(abs: number): string {
  const texteFraction = formatFractionIrreductible(abs);
  const [numerateur, denominateur] = texteFraction.split("/");
  return denominateur === undefined ? numerateur! : `\\frac{${numerateur}}{${denominateur}}`;
}

function formatValeurFractionLatex(valeur: number): string {
  return valeur < 0 ? `-${formatMagnitudeFractionLatex(-valeur)}` : formatMagnitudeFractionLatex(valeur);
}

/** Facteur d'un produit : parenthèses seulement autour d'un nombre négatif (audit chapitre 7,
 * point 7) — `2\cdot(-3)`, jamais `(2)\cdot(3)` ni `2\cdot-3`. */
function facteurLatex(valeur: number): string {
  return valeur < 0 ? `(${valeur})` : String(valeur);
}

/** Terme ajouté à une somme : `+ 3`, `- 3` (jamais `+ (-3)`). */
function termeLatex(valeur: number): string {
  return valeur < 0 ? `- ${-valeur}` : `+ ${valeur}`;
}

/** Pente d'une droite depuis son vecteur directeur — toujours finie ici (composantes toujours non
 * nulles par construction, voir `generateurs/intersectionDroites/index.ts::tirerVecteur`). */
function penteDeLigne(ligne: LigneIntersection): number {
  return ligne.vecteur.y / ligne.vecteur.x;
}

/** Repère laquelle des deux droites est réellement paramétrique dans l'instance — jamais supposée
 * être `d1` (même précaution que `ligneParametrique`/`ligneCartesienne`, privées dans
 * `ui/formatIntersectionDroites.ts`). */
function ligneParametriqueDe(instance: ExerciceIntersectionDroites): { ligne: LigneIntersection; indice: 1 | 2 } {
  return instance.d1.forme === "parametrique" ? { ligne: instance.d1, indice: 1 } : { ligne: instance.d2, indice: 2 };
}

function ligneCartesienneDe(instance: ExerciceIntersectionDroites): { ligne: LigneIntersection; indice: 1 | 2 } {
  return instance.d1.forme === "parametrique" ? { ligne: instance.d2, indice: 2 } : { ligne: instance.d1, indice: 1 };
}

// ============================================================================
// Question a) — Diagnostic (sécantes / parallèles distinctes / confondues).
// ============================================================================

/** Comparaison COMPLÈTE (les deux côtés, jamais un seul comme les aides progressives de l'écran),
 * différenciée par variante — même critère que `segmentsAideDiagnosticNiveau1`/
 * `formatAideDiagnosticNiveau2Latex` (`ui/formatIntersectionDroites.ts`), mais jamais un simple
 * replay de ces fragments (voir le commentaire de tête du fichier). Le verdict verbal final suit
 * `instance.colineaires`, jamais une ré-égalité locale sur les pentes affichées. */
function fragmentsCalculColinearite(instance: ExerciceIntersectionDroites): FragmentConsigne[] {
  const { colineaires } = instance;

  if (instance.variante === "cart_cart") {
    const m1 = penteDeLigne(instance.d1);
    const m2 = penteDeLigne(instance.d2);
    return [
      texte("Pentes : "),
      latex(`m_1 = ${formatValeurFractionLatex(m1)}`),
      texte(", "),
      latex(`m_2 = ${formatValeurFractionLatex(m2)}`),
      texte(colineaires ? " — pentes égales." : " — pentes différentes."),
    ];
  }

  if (instance.variante === "param_param") {
    const u1 = instance.d1.vecteur;
    const u2 = instance.d2.vecteur;
    const critere = u1.x * u2.y - u1.y * u2.x;
    return [
      texte("Vecteurs directeurs "),
      latex(`\\vec{u_1}${formatVecteurLatex(u1)}`),
      texte(" et "),
      latex(`\\vec{u_2}${formatVecteurLatex(u2)}`),
      texte(" — critère de colinéarité "),
      latex(`${facteurLatex(u1.x)}\\cdot${facteurLatex(u2.y)} - ${facteurLatex(u1.y)}\\cdot${facteurLatex(u2.x)} = ${critere}`),
      texte(colineaires ? ", nul." : ", non nul."),
    ];
  }

  // Variante mixte (param_cart) — compare la pente de la droite cartésienne au rapport y/x du
  // vecteur directeur de la droite paramétrique, quel que soit l'indice réel de chacune (`d1`/`d2`).
  const { ligne: param, indice: iParam } = ligneParametriqueDe(instance);
  const { ligne: cart, indice: iCart } = ligneCartesienneDe(instance);
  const mCart = penteDeLigne(cart);
  const mParam = penteDeLigne(param);
  return [
    texte("Comparaison : "),
    latex(`m_${iCart} = ${formatValeurFractionLatex(mCart)}`),
    texte(", "),
    latex(`\\dfrac{y_{\\vec{u_${iParam}}}}{x_{\\vec{u_${iParam}}}} = ${formatValeurFractionLatex(mParam)}`),
    texte(colineaires ? " — égaux." : " — différents."),
  ];
}

/** Uniquement appelée quand `instance.colineaires` est vrai — distingue parallèles distinctes de
 * confondues en testant si un point de `d1` appartient à `d2` (voir le commentaire de tête du
 * fichier pour la justification géométrique complète). */
function fragmentsTestAppartenance(instance: ExerciceIntersectionDroites): FragmentConsigne[] {
  const { a, b, c } = instance.d2.implicite;
  const p1 = instance.d1.point;
  const evaluation = a * p1.x + b * p1.y + c;
  const appartient = evaluation === 0;
  return [
    texte(" Un point de "),
    latex("d_1"),
    texte(", "),
    latex(formatPointLatex(p1)),
    texte(", appartient-il à "),
    latex("d_2"),
    texte(" ? "),
    latex(`${facteurLatex(a)}\\cdot${facteurLatex(p1.x)} ${termeLatex(b)}\\cdot${facteurLatex(p1.y)} ${termeLatex(c)} = ${evaluation}`),
    texte(appartient ? " — nul : ce point appartient aussi à d₂." : " — non nul : ce point n'appartient pas à d₂."),
  ];
}

function fragmentsCorrectionDiagnostic(instance: ExerciceIntersectionDroites): FragmentConsigne[] {
  const fragments: FragmentConsigne[] = [texte("a) "), ...fragmentsCalculColinearite(instance)];

  if (instance.colineaires) {
    fragments.push(texte(" Les vecteurs directeurs sont colinéaires."), ...fragmentsTestAppartenance(instance));
  } else {
    fragments.push(texte(" Les vecteurs directeurs ne sont pas colinéaires."));
  }

  fragments.push(texte(` ${texteConclusionAttendue(instance)}`));
  return fragments;
}

// ============================================================================
// Question b) — Point d'intersection (uniquement si `conclusion === "secantes"`).
// ============================================================================

function fragmentsCorrectionPoint(instance: ExerciceIntersectionDroites): FragmentConsigne[] {
  // Non-null : appelée uniquement quand `conclusion === "secantes"` (voir
  // `construireCorrectionIntersectionDroites`), la seule condition sous laquelle
  // `formatReponsePointAttendueLatex` renvoie autre chose que `null`.
  const reponse = formatReponsePointAttendueLatex(instance)!;
  return [texte(`b) ${texteAidePointNiveau1(instance)} `), latex(formatAidePointNiveau2Latex(instance)), texte(". En résolvant : "), latex(reponse), texte(".")];
}

// ============================================================================
// Point d'entrée unique du contrat `AdaptateurFeuilleExercices`.
// ============================================================================

/** Étapes du corrigé (une par écran) — sans place de réponse ni tournure de saisie. L'étape
 * « point d'intersection » n'existe que pour des droites sécantes (comme à l'écran) ; l'énoncé
 * papier, lui, ne révèle jamais la conclusion (`enoncePapier`). */
function construireEnonceIntersectionDroites(instance: ExerciceIntersectionDroites): SectionExercice {
  const questions: SectionExercice["questions"] = [
    { consigne: [texte("Détermine la position relative des droites "), latex("d_1"), texte(" et "), latex("d_2"), texte(" : sécantes, parallèles distinctes ou confondues.")] },
  ];
  if (instance.conclusion === "secantes") {
    questions.push({
      consigne: segmentsConsignePoint(instance).map((f) => (f.type === "texte" ? { ...f, valeur: f.valeur.replace(" (fraction acceptée, par exemple 7/2)", "") } : f)),
    });
  }
  return {
    enteteFragments: [texte("On donne les droites suivantes :"), latex(formatEnonceLatex(instance))],
    questions,
  };
}

function construireCorrectionIntersectionDroites(instance: ExerciceIntersectionDroites): BlocCorrection[] {
  const blocs: BlocCorrection[] = [{ type: "paragraphe", fragments: fragmentsCorrectionDiagnostic(instance) }];

  if (instance.conclusion === "secantes") {
    blocs.push({ type: "paragraphe", fragments: fragmentsCorrectionPoint(instance) });
  }

  return blocs;
}

// --- Papier (refonte `.claude/rules/feuilles-evaluations.md`) ---
// Les écrans (diagnostic, puis point d'intersection s'il existe) sont les étapes d'APPRENTISSAGE :
// sur papier, l'énoncé donne les deux droites et UNE consigne qui prévoit toujours les trois
// issues — la présence d'une question « point d'intersection » trahirait sinon le verdict.

function enoncePapier(instance: ExerciceIntersectionDroites): EnoncePapier {
  const [l1, l2] = formatLignesEnonce(instance);
  return {
    section: {
      enteteFragments: [texte("On donne les droites :"), latex(`\\begin{gathered} ${l1} \\\\ ${l2} \\end{gathered}`)],
      questions: [
        {
          consigne: [
            texte("Détermine la position relative de "),
            latex("d_1"),
            texte(" et "),
            latex("d_2"),
            texte(" (sécantes, parallèles distinctes ou confondues) et, si elles sont sécantes, les coordonnées de leur point d'intersection. Justifie."),
          ],
        },
      ],
    },
    etapesParQuestion: [instance.conclusion === "secantes" ? ["a", "b"] : ["a"]],
  };
}

/** Test « le point de d₁ appartient-il à d₂ ? » écrit sur l'équation de d₂ TELLE QU'AFFICHÉE
 * (explicite, implicite ou paramétrique) — jamais sur une forme implicite non simplifiée que
 * l'élève ne voit pas. */
function testAppartenancePapier(instance: ExerciceIntersectionDroites): FragmentConsignePapier[] {
  const p = instance.d1.point;
  const d2 = instance.d2;
  const v = (x: number) => formatValeurFractionLatex(x);
  const debut: FragmentConsignePapier[] = [texte("Le point "), latex(`${formatPointLatex(p)}`), texte(" de "), latex("d_1"), texte(" appartient-il à "), latex("d_2"), texte(" ? ")];
  let calcul: string;
  let appartient: boolean;
  switch (d2.forme) {
    case "implicite": {
      const { a, b, c } = d2.implicite;
      const valeur = a * p.x + b * p.y + c;
      appartient = valeur === 0;
      calcul = `${facteurLatex(a)}\\cdot${facteurLatex(p.x)} ${termeLatex(b)}\\cdot${facteurLatex(p.y)} ${termeLatex(c)} = ${valeur}`;
      break;
    }
    case "explicite_y": {
      const { m, p: o } = d2.expliciteYAffichee!;
      const y = m * p.x + o;
      appartient = Math.abs(y - p.y) < 1e-9;
      calcul = `${v(m)}\\cdot${facteurLatex(p.x)} ${o < 0 ? "-" : "+"} ${v(Math.abs(o))} = ${v(y)} ${appartient ? "=" : "\\neq"} ${p.y}`;
      break;
    }
    case "explicite_x": {
      const { n, q } = d2.expliciteXAffichee!;
      const x = n * p.y + q;
      appartient = Math.abs(x - p.x) < 1e-9;
      calcul = `${v(n)}\\cdot${facteurLatex(p.y)} ${q < 0 ? "-" : "+"} ${v(Math.abs(q))} = ${v(x)} ${appartient ? "=" : "\\neq"} ${p.x}`;
      break;
    }
    case "parametrique": {
      const d = d2.parametriqueAffichee!;
      const sVal = (p.x - d.x0) / d.a;
      const y = d.y0 + d.b * sVal;
      appartient = Math.abs(y - p.y) < 1e-9;
      calcul = `${p.x} = ${d.x0} ${d.a < 0 ? "-" : "+"} ${Math.abs(d.a)}s \\Rightarrow s = ${v(sVal)}, \\quad y = ${d.y0} ${d.b < 0 ? "-" : "+"} ${Math.abs(d.b)}\\cdot${facteurLatex(sVal)} = ${v(y)} ${appartient ? "=" : "\\neq"} ${p.y}`;
      break;
    }
  }
  return [...debut, latex(calcul), texte(appartient ? " : oui, il appartient aussi à d₂." : " : non, il n'appartient pas à d₂.")];
}

function piege(instance: ExerciceIntersectionDroites): EtapeCorrection {
  if (instance.conclusion !== "secantes") {
    return { label: "Piège", sousQuestion: "a", fragments: [texte("Des directions identiques ne suffisent pas à conclure : il faut encore tester si un point de "), latex("d_1"), texte(" appartient à "), latex("d_2"), texte(" pour distinguer « parallèles distinctes » et « confondues ».")] };
  }
  switch (instance.variante) {
    case "cart_cart":
      return { label: "Piège", sousQuestion: "b", fragments: [texte("Une fois x trouvé, il faut encore calculer y en le remplaçant dans l'une des deux équations : le point d'intersection a deux coordonnées.")] };
    case "param_cart":
      return { label: "Piège", sousQuestion: "b", fragments: [texte("La valeur de t n'est pas la réponse : on la remplace dans les équations paramétriques pour obtenir les coordonnées du point.")] };
    case "param_param":
      return { label: "Piège", sousQuestion: "b", fragments: [texte("Les paramètres des deux droites sont différents (t et s) : écrire la même lettre dans les deux représentations rend le système faux.")] };
  }
}

function correctionDetaillee(instance: ExerciceIntersectionDroites): EtapeCorrection[] {
  const lignes: EtapeCorrection[] = [
    {
      label: "Méthode",
      sousQuestion: "a",
      fragments: [texte("On compare les directions des deux droites (pentes ou vecteurs directeurs) : différentes → sécantes ; identiques → on teste si un point de "), latex("d_1"), texte(" appartient à "), latex("d_2"), texte(" (oui → confondues, non → parallèles distinctes).")],
    },
    { label: "Calcul", sousQuestion: "a", fragments: fragmentsCalculColinearite(instance) },
  ];
  if (instance.colineaires) lignes.push({ label: "Calcul", sousQuestion: "a", fragments: testAppartenancePapier(instance) });
  lignes.push({ label: "Conclusion", sousQuestion: "a", fragments: [texte(texteConclusionAttendue(instance))] });
  if (instance.conclusion === "secantes") {
    lignes.push(
      { label: "Méthode", sousQuestion: "b", fragments: [texte(texteAidePointNiveau1(instance))] },
      { label: "Calcul", sousQuestion: "b", fragments: [latex(formatAidePointNiveau2Latex(instance))] },
      { label: "Conclusion", sousQuestion: "b", fragments: [latex(formatReponsePointAttendueLatex(instance)!)] },
    );
  }
  lignes.push(piege(instance));
  return lignes;
}

function reponseBreve(instance: ExerciceIntersectionDroites) {
  if (instance.conclusion === "secantes") return [texte("Sécantes en "), latex(formatPointLatex(instance.point!)), texte(".")];
  return [texte(texteConclusionAttendue(instance))];
}

function bareme(instance: ExerciceIntersectionDroites): BaremeExercice {
  const criteres =
    instance.conclusion === "secantes"
      ? [
          { sousQuestion: "a", critere: [texte("Directions comparées (pentes ou vecteurs directeurs)")], points: 1 },
          { sousQuestion: "a", critere: [texte("Conclusion : sécantes")], points: 0.5 },
          { sousQuestion: "b", critere: [texte("Système posé correctement")], points: 1 },
          { sousQuestion: "b", critere: [texte("Point d'intersection : "), latex(formatPointLatex(instance.point!))], points: 1.5 },
        ]
      : [
          { sousQuestion: "a", critere: [texte("Directions comparées : colinéaires")], points: 1 },
          { sousQuestion: "a", critere: [texte("Test d'appartenance d'un point de "), latex("d_1"), texte(" à "), latex("d_2")], points: 1.5 },
          { sousQuestion: "a", critere: [texte(`Conclusion : ${instance.conclusion === "confondues" ? "confondues" : "parallèles distinctes"}`)], points: 1.5 },
        ];
  return {
    reponseFinale: reponseBreve(instance),
    criteres,
    erreursFrequentes: [
      instance.conclusion === "secantes"
        ? { description: [texte("Seule une coordonnée (ou seulement t, s) donnée")], cout: "−1" }
        : { description: [texte("Conclusion « parallèles » sans test d'appartenance")], cout: "−1,5" },
      { description: [texte("Conclusion annoncée sans justification")], cout: "0 pt à la conclusion" },
    ],
    reponsesAcceptees: [[texte("Résolution directe du système (aucune solution : parallèles distinctes ; infinité : confondues ; une seule : sécantes)")]],
  };
}

/** ★★★ deux droites paramétriques sécantes ; ★★ sinon. */
function difficulte(instance: ExerciceIntersectionDroites): 1 | 2 | 3 {
  return instance.conclusion === "secantes" && instance.variante === "param_param" ? 3 : 2;
}

export const adaptateurEvaluationIntersectionDroites: AdaptateurFeuilleExercices<ExerciceIntersectionDroites> = {
  titreDocument: "Intersection de deux droites — Évaluation",
  nomFichierBase: "intersection-deux-droites",
  genererInstance: genererExerciceIntersectionDroites,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnonceIntersectionDroites,
  construireCorrection: construireCorrectionIntersectionDroites,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 6,
  profilInstance: profilIntersectionDroites,
};
