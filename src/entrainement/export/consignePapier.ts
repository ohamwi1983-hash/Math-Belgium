/**
 * Version PAPIER des consignes d'un adaptateur de feuille/évaluation.
 *
 * Les adaptateurs réutilisent les consignes des écrans interactifs (`consigneEcran`…), qui portent
 * des tournures propres à l'écran : « la valeur CORRECTE de l'étape précédente » (l'appli affiche la
 * bonne réponse de l'étape d'avant, jamais celle de l'élève), « choisis le verdict », syntaxe de
 * saisie au clavier (« sqrt(…) », « 3,2e-4 »)… Sur papier, l'élève enchaîne avec SES propres
 * résultats et écrit à la main : ces tournures n'ont plus de sens.
 *
 * Plutôt que de dupliquer chaque consigne, `versionPapier` enveloppe l'adaptateur et réécrit les
 * fragments de texte de l'énoncé (en-tête, questions, version aménagée) selon les règles
 * ci-dessous. Le texte des écrans interactifs n'est pas touché.
 */
import type { AdaptateurFeuilleExercices, FragmentConsigne, SectionExercice } from "./genererFeuilleExercices";

/** Réécritures appliquées, dans l'ordre, à chaque fragment de texte. */
const accord = (prefixe: string, suite: string) => (_: string, e: string, pluriel: string) => `${prefixe}${e.toLowerCase()}${pluriel.toLowerCase()}${suite}`;

const REECRITURES: [RegExp, string | ((...groupes: string[]) => string)][] = [
  // « la forme SIMPLIFIÉE et CORRECTE de l'étape précédente » → « la forme simplifiée obtenue à … »
  [/SIMPLIFIÉE et CORRECTE de l'étape/g, "simplifiée obtenue à l'étape"],
  // « la CE CORRECTE de l'étape 1 » → « la CE obtenue à l'étape 1 » (accord conservé)
  [/\bCORRECT(E?)(S?) de l'étape/g, accord("obtenu", " à l'étape")],
  [/\bCORRECT(E?)(S?) des étapes/g, accord("obtenu", " aux étapes")],
  // Reste (« l'expression CORRECTE de f'(x) obtenue à l'étape précédente ») : le mot disparaît.
  [/\s*\bCORRECT(E?)(S?)\b/g, ""],
  // Choix dans une liste à l'écran → conclusion rédigée sur papier.
  [/, puis choisis le verdict qui s'applique\./g, ", puis conclus en donnant l'ensemble des solutions (justifie)."],
  [/^Sélectionne le graphique qui représente f\.$/g, "Indique lequel des graphiques A à D représente f. Justifie."],
  [/^Choisis le signe de ch\(x₀\)\.$/g, "Détermine le signe de ch(x₀)."],
  // Syntaxe de saisie au clavier.
  [/ \(écris une racine avec sqrt\(…\)\)/g, ""],
  [/ \(en notation scientifique si besoin, par exemple 3,2e-4 pour 3,2·10⁻⁴\)/g, " (en notation scientifique si besoin)"],
];

/** Début du rappel de SYNTAXE de saisie (« un logarithme de base numérique s'écrit ln(…)/ln(…) —
 * jamais log(…) littéral ») : utile à l'évaluateur de l'écran, sans objet à la main. Ce fragment et
 * tous ceux qui le suivent sont retirés. */
const DEBUT_RAPPEL_SAISIE = "Rappel : un logarithme de base numérique s'écrit";

export function consignePapier(fragments: FragmentConsigne[]): FragmentConsigne[];
export function consignePapier(fragments: FragmentConsigne[] | undefined): FragmentConsigne[] | undefined;
export function consignePapier(fragments: FragmentConsigne[] | undefined): FragmentConsigne[] | undefined {
  if (!fragments) return fragments;
  const coupe = fragments.findIndex((f) => f.type === "texte" && f.valeur.startsWith(DEBUT_RAPPEL_SAISIE));
  const gardes = coupe === -1 ? fragments : fragments.slice(0, coupe);
  return gardes.map((f, i) => {
    if (f.type !== "texte") return f;
    let valeur = REECRITURES.reduce((v, [motif, remplacement]) => (typeof remplacement === "string" ? v.replace(motif, remplacement) : v.replace(motif, remplacement)), f.valeur);
    if (coupe !== -1 && i === gardes.length - 1) valeur = valeur.trimEnd();
    return valeur === f.valeur ? f : { ...f, valeur };
  });
}

function sectionPapier(section: SectionExercice): SectionExercice {
  return {
    ...section,
    enteteFragments: consignePapier(section.enteteFragments),
    questions: section.questions.map((q) => ({ ...q, consigne: consignePapier(q.consigne) })),
  };
}

/** Adaptateur identique, dont l'énoncé (normal et aménagé) est passé en version papier. */
export function versionPapier<T>(adaptateur: AdaptateurFeuilleExercices<T>): AdaptateurFeuilleExercices<T> {
  const { construireEnonce, enonceAmenage } = adaptateur;
  return {
    ...adaptateur,
    construireEnonce: (instance) => sectionPapier(construireEnonce(instance)),
    enonceAmenage: enonceAmenage
      ? (instance) => enonceAmenage(instance).map((e) => ({ ...e, consigne: consignePapier(e.consigne), rappel: consignePapier(e.rappel) }))
      : undefined,
  };
}
