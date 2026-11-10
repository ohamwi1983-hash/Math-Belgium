import type { DroiteDonneeRelation, ExerciceRelationsDroites } from "../../core/relationsDroites.types";
import type { Composantes } from "../../core/vecteur.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, EnoncePapier, EtapeCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { FragmentConsigne } from "../../ui/formatEquationDroite";
import {
  consigneConstruction,
  consigneEquation,
  consigneExtraction,
  consigneExtraction2,
  droiteDonnee1,
  formatAideConstructionNiveau2Latex,
  formatAideEquationNiveau2Latex,
  formatAideRelationNiveau2Latex,
  formatDonneesRechercheeLatex,
  formatEnonceLatex,
  formatEquationAttendueLatex,
  formatEquationCartesienneAttendueLatex,
  formatDroiteDonneeLatex,
  formatPointLatex,
  formatRelationAttendueLatex,
  formatVecteurLatex,
  segmentsAideConstructionNiveau1,
  segmentsAideEquationNiveau1,
  segmentsAideExtraction2Niveau1,
  segmentsAideExtractionNiveau1,
  segmentsAideRelationNiveau1,
  segmentsConsigneGeneraleRelationsDroites,
  LIBELLE_CRITERE,
  LIBELLE_RELATION,
} from "../../ui/formatRelationsDroites";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceRelationsDroites } from "./index";
import { LIBELLE_CAS_PARALLELE_AXE, profilRelationsDroites } from "../profilsEvaluation4eCh7Droites";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceRelationsDroites>` pour gen45 (Relations entre
 * droites — parallèle/perpendiculaire, chapitre "Géométrie analytique plane", `AppRelationsDroites.tsx`)
 * — voir `generateurs/analyseFonction/exportWord.ts` pour le mécanisme générique de référence.
 *
 * **Écran → question** (`moteur/sessionRelationsDroites.ts`, lu avant d'écrire ce fichier) — les 6
 * variantes du catalogue (`PARAMETRES_PAR_VARIANTE`, `generateurs/relationsDroites/index.ts`)
 * partagent TOUJOURS le même pipeline à 3 écrans FIXES, dans le même ordre, sans aucun cas
 * "impossible" (contrairement à "Équation d'une droite") — seuls varient : la forme d'entrée de la
 * droite de référence `b` (`formeEntree`, cartésienne implicite/explicite_y/explicite_x, ou déjà
 * paramétrique), la forme de sortie demandée pour la droite cherchée `d` (`formeSortie`) et le
 * critère (`critere`, parallèle ou perpendiculaire). D'où un dispatch UNIQUE sur ces 3 champs à
 * l'intérieur de 3 questions FIXES, jamais un dispatch par variante (contrairement à
 * `orthogonalite/exportEvaluation.ts`, dont les 4 variantes ont des séquences d'écrans disjointes) :
 * - **Écran 1 "extraction"** (`EtapeExtractionRelationsDroites.tsx`) → **question a)** : extraire
 *   (ou recopier, si `formeEntree === "parametrique"`) un vecteur directeur de `b` — `consigneExtraction`
 *   dispatche déjà ce libellé, réutilisé tel quel.
 * - **Écran 2 "construction"** (`EtapeConstructionRelationsDroites.tsx`) → **question b)** :
 *   construire un vecteur directeur de `d`, parallèle ou perpendiculaire (`consigneConstruction`,
 *   déjà paramétrée par `exercice.critere`) au vecteur de référence confirmé en a).
 * - **Écran 3 "equation"** (`EtapeEquationRelationsDroites.tsx`) → **question c)** : donner
 *   l'équation cartésienne ou la représentation paramétrique de `d` (`consigneEquation`, déjà
 *   paramétrée par `exercice.formeSortie`), à partir du point cherché confirmé dès l'énoncé et du
 *   vecteur construit en b).
 * Le bloc d'énoncé commun aux 3 écrans (consigne générale + équation de `b` + point `A`,
 * `ConsigneGeneraleRelationsDroites.tsx` + `equation-box`) devient `enteteFragments`, affiché UNE
 * SEULE FOIS en tête de l'exercice papier plutôt que répété sur 3 écrans successifs — seul son
 * placement change, jamais son contenu (`segmentsConsigneGeneraleRelationsDroites` +
 * `formatEnonceLatex` + `formatDonneesRechercheeLatex`, les 3 déjà utilisés tels quels côté écran).
 *
 * **PAS `regroupable`** — la doc de `AdaptateurFeuilleExercices.regroupable`
 * (`export/genererFeuilleExercices.ts`) exige une instance à TOUJOURS une seule question, à consigne
 * GÉNÉRIQUE (indépendante des valeurs tirées). Ce générateur produit systématiquement 3 questions par
 * instance (jamais 1 seule) et ses 3 consignes dépendent en outre de l'instance (`formeEntree`/
 * `critere`/`formeSortie`, jamais une constante) : aucun des deux critères n'est rempli, pour aucune
 * des 6 variantes.
 *
 * **Aucune zone de réponse vierge** (`reponse: { type: "lignes", nombre: 0 }` sur les 3 questions) —
 * même décision documentée que `orthogonalite`/`triangleQuelconque`/`quelAngle` (même
 * chapitre/projet) : l'élève répond sur une feuille à part, jamais sur la copie imprimée.
 *
 * **Correction RESYNTHÉTISÉE** depuis les valeurs déjà connues et correctes de l'instance tirée
 * (`vecteurReference`, `vecteurCherche`, `referenceImpliciteSortie`, `pointCherche` — jamais
 * recalculées indépendamment ici), en réutilisant directement les formateurs déjà utilisés côté
 * écran interactif (`ui/formatRelationsDroites.ts` — `segmentsAideExtractionNiveau1`/
 * `segmentsAideConstructionNiveau1`/`formatAideConstructionNiveau2Latex`/
 * `formatAideEquationNiveau2Latex`, les textes/formules d'aide progressive de chaque écran, déjà
 * corrects par construction) plutôt que d'en resynthétiser de nouvelles. Seule différence avec le
 * texte d'aide affiché à l'écran : la correction conclut chaque question par la valeur EFFECTIVEMENT
 * tirée (`vecteurReference`/`vecteurCherche`/`referenceImpliciteSortie`), jamais seulement la
 * formule générale — un correcteur doit voir le résultat concret, pas seulement la méthode.
 * `formatAideEquationNiveau2Latex` donne déjà, non simplifiée, la substitution point+vecteur dans le
 * gabarit (`y_v·(x−x_A) − x_v·(y−y_A) = 0` pour la forme cartésienne, négatifs entre parenthèses ;
 * la représentation paramétrique complète et déjà simplifiée pour la forme paramétrique) — la
 * question c) l'affiche donc telle quelle pour "parametrique", et la fait suivre du résultat
 * développé et simplifié (`formatEquationCartesienneAttendueLatex`, proportionnel à
 * `referenceImpliciteSortie`, seule vérité canonique de l'écran 3) pour "cartesienne".
 *
 * Famille `reconnaissance` : 3 questions FIXES aussi (vecteur de d₁, vecteur de d₂, relation
 * justifiée par les deux critères), voir `construireEnonceReconnaissance`.
 */

/** `a) `/`b) `/`c) ` + fragments — même petit helper que `orthogonalite/exportEvaluation.ts`. */
function paragraphe(lettre: string, fragments: FragmentConsigne[]): BlocCorrection {
  return { type: "paragraphe", fragments: [texte(`${lettre}) `), ...fragments] };
}

/** Famille `reconnaissance` (audit chapitre 7, gen45 point 23) — mêmes 3 questions que les 3
 * écrans : a) vecteur de d₁, b) vecteur de d₂, c) relation (sans consigne « une seule tentative »,
 * propre à l'écran). Consigne générale + d₁ + d₂ en ligne dans la question a), même raison que la
 * famille `construction` ci-dessous. */
function construireEnonceReconnaissance(exercice: ExerciceRelationsDroites): SectionExercice {
  return {
    enteteFragments: [...segmentsConsigneGeneraleRelationsDroites(exercice), texte(" "), latex(formatEnonceLatex(exercice)), texte(", "), latex(formatDonneesRechercheeLatex(exercice)), texte(".")],
    questions: [
      { consigne: [texte(consigneExtraction(exercice))] },
      { consigne: [texte(consigneExtraction2(exercice))] },
      { consigne: [texte("Compare les vecteurs directeurs pour conclure : parallèles, perpendiculaires, ou ni l'un ni l'autre ?")] },
    ],
  };
}

function construireCorrectionReconnaissance(exercice: ExerciceRelationsDroites): BlocCorrection[] {
  return [
    paragraphe("a", [...segmentsAideExtractionNiveau1(exercice), texte(" On peut donc choisir "), latex(`\\vec{u} = ${formatVecteurLatex(exercice.vecteurReference)}`), texte(".")]),
    paragraphe("b", [...segmentsAideExtraction2Niveau1(exercice), texte(" On peut donc choisir "), latex(`\\vec{v} = ${formatVecteurLatex(exercice.droite2!.vecteur)}`), texte(".")]),
    paragraphe("c", [
      ...segmentsAideRelationNiveau1(),
      texte(" Ici : "),
      latex(formatAideRelationNiveau2Latex(exercice)),
      texte(", donc "),
      latex(formatRelationAttendueLatex(exercice)),
      texte("."),
    ]),
  ];
}

function construireEnonceRelationsDroites(exercice: ExerciceRelationsDroites): SectionExercice {
  if (exercice.famille === "reconnaissance") return construireEnonceReconnaissance(exercice);
  // En-tête rendu EN LIGNE (`fragmentsEnteteHtml`) : la consigne générale, l'équation de d et le
  // point A restent dans la même phrase. Les 3 questions sont les étapes (écrans) du corrigé.
  return {
    enteteFragments: [...segmentsConsigneGeneraleRelationsDroites(exercice), texte(" "), latex(formatEnonceLatex(exercice)), texte(", "), latex(formatDonneesRechercheeLatex(exercice)), texte(".")],
    questions: [{ consigne: [texte(consigneExtraction(exercice))] }, { consigne: [texte(consigneConstruction(exercice))] }, { consigne: [texte(consigneEquation(exercice))] }],
  };
}

function construireCorrectionRelationsDroites(exercice: ExerciceRelationsDroites): BlocCorrection[] {
  if (exercice.famille === "reconnaissance") return construireCorrectionReconnaissance(exercice);
  const { vecteurCherche } = exercice;

  const blocs: BlocCorrection[] = [
    paragraphe("a", [
      ...segmentsAideExtractionNiveau1(exercice),
      texte(" On peut donc choisir "),
      latex(`\\vec{u} = ${formatVecteurLatex(exercice.vecteurReference)}`),
      texte(" (tout multiple non nul convient)."),
    ]),
    paragraphe("b", [
      ...segmentsAideConstructionNiveau1(exercice.critere),
      texte(" En appliquant ce critère au vecteur de référence, "),
      latex(formatAideConstructionNiveau2Latex(exercice)),
      texte(", on peut donc choisir "),
      latex(`\\vec{v} = ${formatVecteurLatex(vecteurCherche)}`),
      texte(" (tout vecteur colinéaire à celui-ci convient)."),
    ]),
  ];

  if (exercice.formeSortie === "cartesienne") {
    blocs.push(
      paragraphe("c", [
        texte("En substituant le point "),
        latex("A"),
        texte(" et le vecteur "),
        latex("\\vec{v}"),
        texte(" confirmés ci-dessus dans le gabarit "),
        latex("y_{\\vec v}\\cdot(x-x_A) - x_{\\vec v}\\cdot(y-y_A) = 0"),
        texte(", on obtient "),
        latex(formatAideEquationNiveau2Latex(exercice)),
        texte(", soit, une fois développé et simplifié : "),
        latex(formatEquationCartesienneAttendueLatex(exercice)),
        texte("."),
      ]),
    );
  } else {
    blocs.push(
      paragraphe("c", [
        texte("En substituant le point "),
        latex("A"),
        texte(" et le vecteur "),
        latex("\\vec{v}"),
        texte(" confirmés ci-dessus dans le gabarit "),
        latex("x = x_A + x_{\\vec v}\\cdot t, \\; y = y_A + y_{\\vec v}\\cdot t"),
        texte(", on obtient : "),
        latex(formatAideEquationNiveau2Latex(exercice)),
        texte("."),
      ]),
    );
  }

  return blocs;
}

// --- Papier (refonte `.claude/rules/feuilles-evaluations.md`) ---
// Les 3 écrans (vecteur directeur de d, vecteur directeur de d′, équation — ou les deux vecteurs
// puis la relation en reconnaissance) sont les étapes d'APPRENTISSAGE : sur papier, l'énoncé donne
// la (les) droite(s) et UNE consigne. La relation reconnue est un verdict : la consigne propose
// toujours les trois issues.

function enoncePapier(exercice: ExerciceRelationsDroites): EnoncePapier {
  if (exercice.famille === "reconnaissance") {
    return {
      section: {
        enteteFragments: [texte("On donne les droites :"), latex(`\\begin{gathered} ${formatEnonceLatex(exercice)} \\\\ ${formatDonneesRechercheeLatex(exercice)} \\end{gathered}`)],
        questions: [{ consigne: [texte("Les droites "), latex("d_1"), texte(" et "), latex("d_2"), texte(" sont-elles parallèles, perpendiculaires, ou ni l'un ni l'autre ? Justifie.")] }],
      },
      etapesParQuestion: [["a", "b", "c"]],
    };
  }
  const forme = exercice.formeSortie === "cartesienne" ? "une équation cartésienne" : "des équations paramétriques";
  return {
    section: {
      enteteFragments: [texte("On donne la droite :"), latex(formatEnonceLatex(exercice))],
      questions: [
        {
          consigne: [
            texte(`Détermine ${forme} de la droite `),
            latex("d'"),
            texte(" passant par le point "),
            latex(`A${formatPointLatex(exercice.pointCherche)}`),
            texte(` et ${LIBELLE_CRITERE[exercice.critere]} à `),
            latex("d"),
            texte("."),
          ],
        },
      ],
    },
    etapesParQuestion: [["a", "b", "c"]],
  };
}

/** Vecteur directeur lu sur l'équation AFFICHÉE (règle de l'aide de l'écran) — peut être un
 * multiple du vecteur de l'instance (équation normalisée, forme explicite à coefficient
 * fractionnaire). */
function vecteurLu(d: DroiteDonneeRelation): Composantes {
  switch (d.formeEntree) {
    case "implicite":
      return { x: d.impliciteEntree!.b === 0 ? 0 : -d.impliciteEntree!.b, y: d.impliciteEntree!.a };
    case "explicite_y":
      return { x: 1, y: d.expliciteYEntree!.m };
    case "explicite_x":
      return { x: d.expliciteXEntree!.n, y: 1 };
    case "parametrique":
      return { x: d.parametriqueEntree!.a, y: d.parametriqueEntree!.b };
  }
}

/** Lignes « Calcul » + « Conclusion » d'une extraction : vecteur lu, puis (s'il diffère) le
 * multiple entier retenu pour la suite. */
function lignesExtraction(d: DroiteDonneeRelation, nom: "u" | "v", lettre: string, retenu: Composantes): EtapeCorrection[] {
  const lu = vecteurLu(d);
  const egal = lu.x === retenu.x && lu.y === retenu.y;
  const lignes: EtapeCorrection[] = [];
  if (d.formeEntree !== "parametrique") lignes.push({ label: "Calcul", sousQuestion: lettre, fragments: [latex(`\\vec{${nom}}${formatVecteurLatex(lu)}`)] });
  lignes.push({
    label: "Conclusion",
    sousQuestion: lettre,
    fragments: egal
      ? [texte("Vecteur directeur retenu : "), latex(`\\vec{${nom}}${formatVecteurLatex(retenu)}`), texte(".")]
      : [texte("On peut prendre le multiple "), latex(`\\vec{${nom}}${formatVecteurLatex(retenu)}`), texte(" (même direction, composantes entières).")],
  });
  return lignes;
}

function estAxe(v: Composantes): boolean {
  return v.x === 0 || v.y === 0;
}

function correctionDetaillee(exercice: ExerciceRelationsDroites): EtapeCorrection[] {
  if (exercice.famille === "reconnaissance") {
    const d2 = exercice.droite2!;
    return [
      { label: "Méthode", sousQuestion: "a", fragments: segmentsAideExtractionNiveau1(exercice) },
      ...lignesExtraction(droiteDonnee1(exercice), "u", "a", exercice.vecteurReference),
      { label: "Méthode", sousQuestion: "b", fragments: segmentsAideExtraction2Niveau1(exercice) },
      ...lignesExtraction(d2, "v", "b", d2.vecteur),
      { label: "Méthode", sousQuestion: "c", fragments: [texte("D'abord le critère de colinéarité "), latex("x_{\\vec{u}}\\,y_{\\vec{v}}-y_{\\vec{u}}\\,x_{\\vec{v}}"), texte(" (nul : parallèles), puis le critère d'orthogonalité "), latex("x_{\\vec{u}}\\,x_{\\vec{v}}+y_{\\vec{u}}\\,y_{\\vec{v}}"), texte(" (nul : perpendiculaires).")] },
      { label: "Calcul", sousQuestion: "c", fragments: [latex(formatAideRelationNiveau2Latex(exercice))] },
      { label: "Conclusion", sousQuestion: "c", fragments: [latex(formatRelationAttendueLatex(exercice))] },
      {
        label: "Piège",
        sousQuestion: "c",
        fragments: [texte("Les deux critères ne se confondent pas : le critère de colinéarité « croise » les composantes ("), latex("x_{\\vec{u}}\\,y_{\\vec{v}}-y_{\\vec{u}}\\,x_{\\vec{v}}"), texte("), celui d'orthogonalité multiplie les composantes de même nom ("), latex("x_{\\vec{u}}\\,x_{\\vec{v}}+y_{\\vec{u}}\\,y_{\\vec{v}}"), texte(").")],
      },
    ];
  }
  const piege: EtapeCorrection = estAxe(exercice.vecteurReference)
    ? {
        label: "Piège",
        sousQuestion: "b",
        fragments: [texte(exercice.critere === "parallele" ? "La parallèle à une droite horizontale (verticale) est elle aussi horizontale (verticale) : seule sa constante change, imposée par A." : "La perpendiculaire à une droite horizontale est verticale (et inversement) : son équation est du type "), ...(exercice.critere === "parallele" ? [] : [latex("x = k"), texte(" ou "), latex("y = k"), texte(".")])],
      }
    : exercice.critere === "perpendiculaire"
      ? { label: "Piège", sousQuestion: "b", fragments: [texte("Pour un vecteur perpendiculaire, on échange les composantes ET on change le signe d'une seule : "), latex("\\begin{pmatrix} x \\\\ y \\end{pmatrix} \\to \\begin{pmatrix} -y \\\\ x \\end{pmatrix}"), texte(".")] }
      : { label: "Piège", sousQuestion: "c", fragments: [texte("d′ a le même vecteur directeur que d mais passe par A : recopier l'équation de d donnerait d elle-même, pas d′.")] };
  return [
    { label: "Méthode", sousQuestion: "a", fragments: segmentsAideExtractionNiveau1(exercice) },
    ...lignesExtraction(droiteDonnee1(exercice), "u", "a", exercice.vecteurReference),
    { label: "Méthode", sousQuestion: "b", fragments: segmentsAideConstructionNiveau1(exercice.critere) },
    { label: "Calcul", sousQuestion: "b", fragments: [latex(formatAideConstructionNiveau2Latex(exercice))] },
    { label: "Conclusion", sousQuestion: "b", fragments: [texte("Vecteur directeur de d′ : "), latex(`\\vec{v}${formatVecteurLatex(exercice.vecteurCherche)}`), texte(".")] },
    { label: "Méthode", sousQuestion: "c", fragments: segmentsAideEquationNiveau1(exercice) },
    ...(exercice.formeSortie === "cartesienne" ? [{ label: "Calcul", sousQuestion: "c", fragments: [latex(formatAideEquationNiveau2Latex(exercice))] }] : []),
    { label: "Conclusion", sousQuestion: "c", fragments: [latex(`d' \\equiv ${formatEquationAttendueLatex(exercice)}`)] },
    piege,
  ];
}

function reponseBreve(exercice: ExerciceRelationsDroites) {
  if (exercice.famille === "reconnaissance") return [texte(`${LIBELLE_RELATION[exercice.relation!]}.`)];
  return [latex(`d' \\equiv ${formatEquationAttendueLatex(exercice)}`)];
}

function bareme(exercice: ExerciceRelationsDroites): BaremeExercice {
  if (exercice.famille === "reconnaissance") {
    return {
      reponseFinale: reponseBreve(exercice),
      criteres: [
        { sousQuestion: "a", critere: [texte("Vecteur directeur de "), latex("d_1"), texte(" : "), latex(`\\vec{u}${formatVecteurLatex(exercice.vecteurReference)}`), texte(" (ou un multiple)")], points: 1 },
        { sousQuestion: "b", critere: [texte("Vecteur directeur de "), latex("d_2"), texte(" : "), latex(`\\vec{v}${formatVecteurLatex(exercice.droite2!.vecteur)}`), texte(" (ou un multiple)")], points: 1 },
        { sousQuestion: "c", critere: [texte("Critère(s) calculé(s) correctement")], points: 1 },
        { sousQuestion: "c", critere: [texte(`Conclusion justifiée : ${LIBELLE_RELATION[exercice.relation!].toLowerCase()}`)], points: 1 },
      ],
      erreursFrequentes: [
        { description: [texte("Critères de colinéarité et d'orthogonalité confondus")], cout: "0 pt sur l'étape 3" },
        { description: [texte("Conclusion sans calcul de critère")], cout: "−1" },
      ],
      reponsesAcceptees: [[texte("Comparaison des pentes (égales : parallèles ; produit −1 : perpendiculaires) quand elles existent")]],
    };
  }
  return {
    reponseFinale: reponseBreve(exercice),
    criteres: [
      { sousQuestion: "a", critere: [texte("Vecteur directeur de d : "), latex(`\\vec{u}${formatVecteurLatex(exercice.vecteurReference)}`), texte(" (ou un multiple)")], points: 1 },
      { sousQuestion: "b", critere: [texte(`Vecteur directeur de d′ ${LIBELLE_CRITERE[exercice.critere]} : `), latex(`\\vec{v}${formatVecteurLatex(exercice.vecteurCherche)}`), texte(" (ou un multiple)")], points: 1 },
      { sousQuestion: "c", critere: [texte("Point A et vecteur de d′ correctement remplacés")], points: 1 },
      { sousQuestion: "c", critere: [texte("Équation finale : "), latex(formatEquationAttendueLatex(exercice))], points: 1 },
    ],
    erreursFrequentes: [
      exercice.critere === "perpendiculaire"
        ? { description: [texte("Vecteur perpendiculaire mal construit (composantes échangées sans changement de signe)")], cout: "0 pt sur b) et c)" }
        : { description: [texte("Équation de d recopiée (d′ ne passe alors pas par A)")], cout: "0 pt sur c)" },
      { description: [texte("Droite trouvée ne passant pas par A (point mal remplacé)")], cout: "−1" },
    ],
    reponsesAcceptees: [[texte(exercice.formeSortie === "cartesienne" ? "Toute équation équivalente (multiple non nul, forme explicite)" : "Tout point de d′ et tout vecteur directeur colinéaire")]],
  };
}

/** ★ droite de référence parallèle à un axe ; ★★ sinon. */
function difficulte(exercice: ExerciceRelationsDroites): 1 | 2 | 3 {
  return estAxe(exercice.vecteurReference) ? 1 : 2;
}

export const adaptateurEvaluationRelationsDroites: AdaptateurFeuilleExercices<ExerciceRelationsDroites> = {
  titreDocument: "Relations entre droites (parallèles / perpendiculaires) — Évaluation",
  nomFichierBase: "relations-droites-paralleles-perpendiculaires",
  genererInstance: genererExerciceRelationsDroites,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnonceRelationsDroites,
  construireCorrection: construireCorrectionRelationsDroites,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 5,
  profilInstance: profilRelationsDroites,
  libelleCasParticulier: LIBELLE_CAS_PARALLELE_AXE,
  // PAS regroupable : toujours 3 questions par instance (jamais 1 seule), à consigne dépendante de
  // l'instance (formeEntree/critere/formeSortie) — voir le commentaire de tête.
};
