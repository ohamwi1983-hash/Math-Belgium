/**
 * Couche présentation (5e) — consignes/labels/aides/LaTeX/champs pour 5gen32 ("Optimisation
 * géométrique"). Dépend librement des couches inférieures (jamais l'inverse) : réutilise
 * `valeurNumeriqueAvecPi`/`alphaOptTrapeze`/`xOptimal`/`OPTIONS_JUSTIFICATION_LONGUEUR`/
 * `signeReelAvantApres`/`conclusionReelle` (`moteur5e/verificationOptimisationGeometrique.ts`).
 *
 * `champsEcran` est la SEULE source de vérité pour la LISTE des champs affichés par écran/famille
 * — les identifiants qu'elle produit doivent coïncider EXACTEMENT avec ceux attendus par
 * `verificationOptimisationGeometrique.ts::diagnostiquerEcran` (voir le commentaire de cette
 * fonction).
 */
import type { ExerciceOptimisation } from "../core5e/optimisationGeometrique.types";
import { alphaOptTrapeze, OPTIONS_JUSTIFICATION_LONGUEUR, xOptimal } from "../moteur5e/verificationOptimisationGeometrique";
import type { EcranOptimisation } from "../moteur5e/typesOptimisationGeometrique";
import { ordreEcransOptimisation } from "../moteur5e/typesOptimisationGeometrique";

// ============================================================================
// Fragments LaTeX de bas niveau.
// ============================================================================

function formatFractionLatex(num: number, den: number): string {
  if (den === 1) return `${num}`;
  return `\\frac{${num}}{${den}}`;
}

/** "+n·suffixe" ou "-n·suffixe" — jamais un "+" juxtaposé à une valeur négative (audit
 * transversal, `promptauditdoublesigne.md`). */
function formatTermeAdditif(valeur: number, suffixe: string): string {
  const corps = suffixe === "" ? `${Math.abs(valeur)}` : `${Math.abs(valeur)}${suffixe}`;
  return valeur < 0 ? `-${corps}` : `+${corps}`;
}

/** "4+3\\pi" / "5\\pi" / "8" — jamais un flottant reconstruit. */
export function formatValeurAvecPiLatex(v: { rationnel: number; coeffPi: number }): string {
  const { rationnel, coeffPi } = v;
  if (coeffPi === 0) return `${rationnel}`;
  const partiePi = coeffPi === 1 ? "\\pi" : `${coeffPi}\\pi`;
  if (rationnel === 0) return partiePi;
  return `${rationnel}+${partiePi}`;
}

// ============================================================================
// Consigne générale, bloc de données, question finale persistante — par famille.
// ============================================================================

export function consigneGenerale(exercice: ExerciceOptimisation): string {
  switch (exercice.famille) {
    case "trapeze":
      return "On construit un trapèze isocèle à partir d'un rectangle de base b, en relevant les deux côtés latéraux de longueur l d'un angle α (0°<α<90°). On cherche l'angle α qui maximise l'aire du trapèze.";
    case "cylindre":
      return "Un cylindre fermé (avec ses 2 disques) doit contenir un volume V fixé. On cherche le rayon qui minimise la quantité de matériau utilisée (l'aire totale de la surface).";
    case "margesA":
      return "Une page imprimée occupe une zone rectangulaire (largeur x, hauteur y) entourée de marges horizontale mh et verticale mv. L'aire TOTALE de la page (zone imprimée + marges) est fixée. On cherche la largeur x qui MAXIMISE l'aire de la zone imprimée.";
    case "margesB":
      return "Une page imprimée occupe une zone rectangulaire (largeur x, hauteur y) entourée de marges horizontale mh et verticale mv. L'aire de la zone IMPRIMÉE est fixée. On cherche la largeur x qui MINIMISE l'aire totale de la page.";
    case "fenetreA":
      return "Une fenêtre a la forme d'un rectangle (largeur 2r, hauteur h) surmonté d'un demi-cercle de rayon r. Le périmètre extérieur de la fenêtre est fixé. On cherche le rayon r qui MAXIMISE l'aire de la fenêtre.";
    case "fenetreB":
      return "Une fenêtre a la forme d'un rectangle (largeur 2r, hauteur h) surmonté d'un demi-cercle de rayon r. L'aire de la fenêtre est fixée. On cherche le rayon r qui MINIMISE le périmètre extérieur de la fenêtre.";
    case "cubique":
      return "On reconstruit une fonction cubique f(x)=ax³+bx²+cx+d coefficient par coefficient, à partir de conditions données en langage naturel.";
  }
}

export function formatTermesDonneesLatex(exercice: ExerciceOptimisation): string[] {
  switch (exercice.famille) {
    case "trapeze":
      return [`b=${exercice.b}`, `l=${exercice.l}`];
    case "cylindre":
      return [`V=${formatValeurAvecPiLatex({ rationnel: 0, coeffPi: exercice.coeffV })}\\ \\text{cm}^3`];
    case "margesA":
      return [`T=${exercice.T}`, `m_h=${exercice.mh}`, `m_v=${exercice.mv}`];
    case "margesB":
      return [`A=${exercice.A}`, `m_h=${exercice.mh}`, `m_v=${exercice.mv}`];
    case "fenetreA":
      return [`P=${formatValeurAvecPiLatex(exercice.P!)}`];
    case "fenetreB":
      return [`A=${formatValeurAvecPiLatex(exercice.A!)}`];
    case "cubique":
      return [`f(0)=${exercice.d}`, `f'(0)=0`, `f'(${exercice.x2})=0`, `f(${exercice.x3})=${exercice.y3}`];
  }
}

export function questionFinale(exercice: ExerciceOptimisation): string {
  switch (exercice.famille) {
    case "trapeze":
      return "\\text{Trouver } \\alpha \\text{ qui MAXIMISE l'aire du trapèze.}";
    case "cylindre":
      return "\\text{Trouver le rayon qui MINIMISE l'aire totale du cylindre.}";
    case "margesA":
      return "\\text{Trouver } x \\text{ qui MAXIMISE l'aire imprimée.}";
    case "margesB":
      return "\\text{Trouver } x \\text{ qui MINIMISE l'aire totale.}";
    case "fenetreA":
      return "\\text{Trouver } r \\text{ qui MAXIMISE l'aire de la fenêtre.}";
    case "fenetreB":
      return "\\text{Trouver } r \\text{ qui MINIMISE le périmètre de la fenêtre.}";
    case "cubique":
      return "\\text{Reconstruire } f(x)=ax^3+bx^2+cx+d.";
  }
}

// ============================================================================
// Libellés d'écran (récapitulatif).
// ============================================================================

export const LIBELLE_ECRAN: Record<EcranOptimisation, string> = {
  lien: "Lien entre les inconnues",
  construire: "Fonction à optimiser",
  deriver: "Dérivée",
  resoudre: "Résolution",
  justifier: "Nature de l'extremum",
  conclure: "Conclusion",
  application: "Application numérique",
  coeffsImmediats: "Coefficients immédiats",
  relation: "Relation entre coefficients",
  resoudreA: "Résoudre pour a",
  expressionFinale: "Expression finale",
};

function variableAffichee(exercice: ExerciceOptimisation): string {
  if (exercice.famille === "trapeze") return "\\alpha";
  if (exercice.famille === "fenetreA" || exercice.famille === "fenetreB") return "r";
  return "x";
}

// ============================================================================
// Consigne par écran.
// ============================================================================

export function consigneEcran(exercice: ExerciceOptimisation, phase: EcranOptimisation): string {
  const v = variableAffichee(exercice);
  switch (phase) {
    case "lien":
      if (exercice.famille === "trapeze") return "Exprime la hauteur h et la base supérieure B du trapèze en fonction de α (utilise x comme variable dans ta réponse).";
      return `Isole la dimension manquante en fonction de ${v} à partir de la contrainte donnée (utilise x comme variable dans ta réponse).`;
    case "construire":
      return `Construis la fonction à optimiser, à UNE seule variable ${v} (utilise x comme variable dans ta réponse).`;
    case "deriver":
      return "Calcule la dérivée de cette fonction (utilise x comme variable dans ta réponse).";
    case "resoudre":
      if (exercice.famille === "trapeze") return "Pose u=cos(α), résous l'équation dérivée=0 pour u, puis donne α (en degrés).";
      return `Résous dérivée=0 et donne la valeur de ${v} retenue. Si une racine doit être rejetée, justifie ton choix.`;
    case "justifier":
      if (exercice.famille === "trapeze") return "Calcule la dérivée seconde à la valeur trouvée et interprète son signe pour conclure.";
      return "Étudie le signe de la dérivée avant et après la valeur trouvée, puis conclus.";
    case "conclure":
      return "Donne les valeurs numériques finales dans le contexte de l'énoncé.";
    case "application":
      return "Utilise les dimensions optimales déjà trouvées pour calculer la quantité demandée.";
    case "coeffsImmediats":
      return "Donne c et d directement, à partir des 2 conditions en x=0.";
    case "relation":
      return "Exprime b en fonction de a à partir de la 2e tangente horizontale (utilise a comme variable dans ta réponse).";
    case "resoudreA":
      return "Utilise le point de passage supplémentaire pour résoudre et trouver a.";
    case "expressionFinale":
      return "Écris l'expression complète de f(x) (utilise x comme variable dans ta réponse).";
  }
}

// ============================================================================
// Champs d'un écran — SOURCE DE VÉRITÉ pour les identifiants (voir tête de fichier).
// ============================================================================

export type ChampOptimisation =
  | { kind: "texte"; id: string; label: string; placeholder: string; avecCalculatrice: boolean }
  | { kind: "choix"; id: string; label: string; options: { id: string; label: string }[] };

const OPTIONS_SIGNE = [
  { id: "+", label: "+" },
  { id: "-", label: "−" },
];
const OPTIONS_CONCLUSION = [
  { id: "max", label: "Maximum" },
  { id: "min", label: "Minimum" },
];

export function champsEcran(exercice: ExerciceOptimisation, phase: EcranOptimisation): ChampOptimisation[] {
  switch (phase) {
    case "lien":
      if (exercice.famille === "trapeze") {
        return [
          { kind: "texte", id: "h", label: "h(x)=", placeholder: "ex : 3*sin(x)", avecCalculatrice: false },
          { kind: "texte", id: "B", label: "B(x)=", placeholder: "ex : 5+6*cos(x)", avecCalculatrice: false },
        ];
      }
      if (exercice.famille === "margesA" || exercice.famille === "margesB") {
        return [{ kind: "texte", id: "y", label: "y(x)=", placeholder: "ex : 10/(x+2)-4", avecCalculatrice: false }];
      }
      return [{ kind: "texte", id: "h", label: "h(x)=", placeholder: "ex : 16/x^2", avecCalculatrice: false }];

    case "construire":
      return [{ kind: "texte", id: "F", label: "F(x)=", placeholder: "ex : 2*pi*x^2+10/x", avecCalculatrice: false }];

    case "deriver":
      return [{ kind: "texte", id: "Fprime", label: "F'(x)=", placeholder: "ex : 4*pi*x-10/x^2", avecCalculatrice: false }];

    case "resoudre":
      if (exercice.famille === "trapeze") {
        return [
          { kind: "texte", id: "u", label: "u=cos(\\alpha)=", placeholder: "ex : 1/2", avecCalculatrice: true },
          { kind: "texte", id: "alpha", label: "\\alpha\\ (\\text{en degrés})=", placeholder: "ex : 60", avecCalculatrice: true },
        ];
      }
      {
        const idRacine = exercice.famille === "fenetreA" || exercice.famille === "fenetreB" ? "r" : "x";
        const champs: ChampOptimisation[] = [{ kind: "texte", id: idRacine, label: `${idRacine}=`, placeholder: "ex : 4", avecCalculatrice: true }];
        if (exercice.famille === "margesA" || exercice.famille === "margesB" || exercice.famille === "fenetreB") {
          champs.push({ kind: "choix", id: "justification", label: "Pourquoi rejette-t-on l'autre racine ?", options: OPTIONS_JUSTIFICATION_LONGUEUR });
        }
        return champs;
      }

    case "justifier":
      if (exercice.famille === "trapeze") {
        return [
          { kind: "texte", id: "Aseconde", label: "A''(\\alpha_{opt})=", placeholder: "ex : -12.5", avecCalculatrice: true },
          { kind: "choix", id: "conclusion", label: "Nature de l'extremum", options: OPTIONS_CONCLUSION },
        ];
      }
      return [
        { kind: "choix", id: "signeAvant", label: "Signe avant la racine", options: OPTIONS_SIGNE },
        { kind: "choix", id: "signeApres", label: "Signe après la racine", options: OPTIONS_SIGNE },
        { kind: "choix", id: "conclusion", label: "Nature de l'extremum", options: OPTIONS_CONCLUSION },
      ];

    case "conclure":
      if (exercice.famille === "trapeze") {
        return [
          { kind: "texte", id: "hauteur", label: "h_{opt}=", placeholder: "ex : 3.46", avecCalculatrice: true },
          { kind: "texte", id: "baseSup", label: "B_{opt}=", placeholder: "ex : 8", avecCalculatrice: true },
          { kind: "texte", id: "aire", label: "A_{max}=", placeholder: "ex : 27.71", avecCalculatrice: true },
        ];
      }
      if (exercice.famille === "cylindre") {
        return [
          { kind: "texte", id: "hauteur", label: "h_{opt}=", placeholder: "ex : 4", avecCalculatrice: true },
          { kind: "texte", id: "aire", label: "S_{min}=", placeholder: "ex : 24*pi", avecCalculatrice: true },
        ];
      }
      if (exercice.famille === "margesA") {
        return [
          { kind: "texte", id: "y", label: "y_{opt}=", placeholder: "ex : 6", avecCalculatrice: true },
          { kind: "texte", id: "aireImprimee", label: "A_{imprim\\acute{e}e,max}=", placeholder: "ex : 24", avecCalculatrice: true },
        ];
      }
      if (exercice.famille === "margesB") {
        return [
          { kind: "texte", id: "y", label: "y_{opt}=", placeholder: "ex : 6", avecCalculatrice: true },
          { kind: "texte", id: "aireTotale", label: "T_{min}=", placeholder: "ex : 96", avecCalculatrice: true },
        ];
      }
      if (exercice.famille === "fenetreA") {
        return [
          { kind: "texte", id: "hauteur", label: "h_{opt}=", placeholder: "ex : 4.20", avecCalculatrice: true },
          { kind: "texte", id: "aire", label: "\\text{Aire}_{max}=", placeholder: "ex : 44.13", avecCalculatrice: true },
        ];
      }
      return [
        { kind: "texte", id: "hauteur", label: "h_{opt}=", placeholder: "ex : 3.35", avecCalculatrice: true },
        { kind: "texte", id: "perimetre", label: "P_{min}=", placeholder: "ex : 23.44", avecCalculatrice: true },
      ];

    case "application":
      return [{ kind: "texte", id: "cout", label: "\\text{Coût}=", placeholder: "ex : 150", avecCalculatrice: true }];

    case "coeffsImmediats":
      return [
        { kind: "texte", id: "c", label: "c=", placeholder: "ex : 0", avecCalculatrice: false },
        { kind: "texte", id: "d", label: "d=", placeholder: "ex : 5", avecCalculatrice: false },
      ];
    case "relation":
      return [{ kind: "texte", id: "b", label: "b=", placeholder: "ex : -6*a", avecCalculatrice: false }];
    case "resoudreA":
      return [{ kind: "texte", id: "a", label: "a=", placeholder: "ex : 2", avecCalculatrice: true }];
    case "expressionFinale":
      return [{ kind: "texte", id: "f", label: "f(x)=", placeholder: "ex : 2*x^3-9*x^2+5", avecCalculatrice: false }];
  }
}

// ============================================================================
// Aides (2 niveaux, standard).
// ============================================================================

export function texteAideNiveau1(exercice: ExerciceOptimisation, phase: EcranOptimisation): string {
  switch (phase) {
    case "lien":
      if (exercice.famille === "trapeze") return "Dans le triangle rectangle formé par le côté latéral, sa hauteur et sa projection horizontale : hauteur = l·sin(angle), projection = l·cos(angle).";
      return "Isole la variable manquante dans l'équation de contrainte donnée dans l'énoncé.";
    case "construire":
      return "Remplace la dimension isolée à l'écran précédent dans la formule géométrique (aire, surface...) pour n'avoir plus qu'une seule variable.";
    case "deriver":
      return "Dérive terme à terme. Une puissance x^n se dérive en n·x^(n-1) ; pense à la règle du quotient/produit si nécessaire.";
    case "resoudre":
      if (exercice.famille === "trapeze") return "Utilise cos(2α)=2cos²(α)-1 pour transformer l'équation en une équation du 2e degré en u=cos(α).";
      return "Résous l'équation dérivée=0. Une des deux racines n'a pas de sens physique dans ce contexte (ex. une longueur négative) — rejette-la explicitement.";
    case "justifier":
      if (exercice.famille === "trapeze") return "A' donne l'EXISTENCE d'un extremum (là où A'=0), A'' donne sa NATURE (négatif = maximum, positif = minimum) — ce sont deux rôles différents, pas la même information.";
      return "Étudie le signe de la dérivée un peu avant, puis un peu après la valeur trouvée : + puis - signale un maximum, - puis + signale un minimum.";
    case "conclure":
      return "Reprends les formules des écrans précédents et substitue la valeur optimale trouvée.";
    case "application":
      return "Il ne s'agit pas d'une nouvelle optimisation : substitue simplement les valeurs déjà trouvées dans la formule demandée.";
    case "coeffsImmediats":
      return "f(0) donne directement d (terme constant). f'(0)=0 donne directement c (coefficient du terme en x).";
    case "relation":
      return "Calcule f'(x)=3ax²+2bx+c, remplace c=0 et x par x₂, puis isole b (x₂≠0 permet de simplifier par x₂).";
    case "resoudreA":
      return "Remplace b (en fonction de a), c=0 et d dans f(x₃)=y₃, puis résous cette équation linéaire en a.";
    case "expressionFinale":
      return "Rassemble les 4 coefficients a, b, c=0 et d trouvés aux écrans précédents.";
  }
}

export function texteAideNiveau2(exercice: ExerciceOptimisation, phase: EcranOptimisation): string {
  switch (phase) {
    case "lien":
      if (exercice.famille === "trapeze") return `Avec b=${exercice.b}, l=${exercice.l} : h(x)=${exercice.l}·sin(x), B(x)=${exercice.b}+2·${exercice.l}·cos(x).`;
      return "Une fois isolée, cette expression ne dépend plus que d'une seule variable — vérifie qu'aucune autre inconnue n'y apparaît encore.";
    case "construire":
      return "Attention : après substitution, un facteur du produit dépend ENCORE de la variable (ce n'est pas une fonction affine) — ne simplifie pas trop vite.";
    case "deriver":
      return "Vérifie ta dérivée en la recalculant terme à terme, sans sauter d'étape.";
    case "resoudre":
      return "Une longueur, une aire, un rayon... sont TOUJOURS positifs dans ce contexte : toute racine négative (ou hors du domaine physique) doit être rejetée explicitement, pas juste ignorée.";
    case "justifier":
      return "Si tu obtiens le même signe avant et après, la dérivée ne change pas de signe : ce n'est PAS un extremum (à revoir).";
    case "conclure":
      return "N'oublie pas les unités/le contexte : une aire se donne au carré, un volume au cube.";
    case "application":
      return "Coût = prix unitaire × quantité (aire, volume...) déjà calculée.";
    case "coeffsImmediats":
      return `Ici : d=${exercice.famille === "cubique" ? exercice.d : ""}, c=0 (tangente horizontale en x=0).`;
    case "relation":
      return exercice.famille === "cubique" ? `Avec x₂=${exercice.x2} : 3a·${exercice.x2}²+2b·${exercice.x2}=0, donc b=-3a·${exercice.x2}/2.` : "";
    case "resoudreA":
      return exercice.famille === "cubique" ? `f(${exercice.x3})=a·${exercice.x3}³+b·${exercice.x3}²+d=${exercice.y3}, avec b et d déjà connus.` : "";
    case "expressionFinale":
      return exercice.famille === "cubique" ? `f(x)=${exercice.a}x³${formatTermeAdditif(exercice.b, "x²")}${formatTermeAdditif(exercice.d, "")} (c=0, terme omis).` : "";
  }
}

// ============================================================================
// Bloc "état actuel" — dernières réponses confirmées, formatées, écran par écran.
// ============================================================================

export function formatTermesEtatActuelLatex(exercice: ExerciceOptimisation, dernieresReponsesParEcran: Partial<Record<EcranOptimisation, Record<string, string>>>, phaseActuelle: EcranOptimisation): string[] | null {
  const ordre = ordreEcransOptimisation(exercice);
  const indexActuel = ordre.indexOf(phaseActuelle);
  const termes: string[] = [];
  for (let i = 0; i < indexActuel; i++) {
    const ecran = ordre[i];
    const reponses = dernieresReponsesParEcran[ecran];
    if (!reponses) continue;
    for (const champ of champsEcran(exercice, ecran)) {
      const valeur = reponses[champ.id];
      if (valeur === undefined || valeur === "") continue;
      const labelPropre = champ.label.replace(/=$/, "");
      const valeurAffichee = champ.kind === "choix" ? (champ.options.find((o) => o.id === valeur)?.label ?? valeur) : valeur;
      termes.push(`${labelPropre}=${champ.kind === "choix" ? `\\text{${valeurAffichee}}` : valeurAffichee}`);
    }
  }
  return termes.length === 0 ? null : termes;
}

// ============================================================================
// Récapitulatif final — réponse RÉELLEMENT attendue par écran (jamais recalculée depuis un score).
// ============================================================================

export function formatReponseAttendueEcranLatex(exercice: ExerciceOptimisation, phase: EcranOptimisation): string {
  const opt = exercice.famille === "cubique" ? null : xOptimal(exercice);
  switch (phase) {
    case "lien":
      if (exercice.famille === "trapeze") return `h(x)=${exercice.l}\\sin(x),\\ B(x)=${exercice.b}+2\\cdot ${exercice.l}\\cos(x)`;
      return "\\text{voir la formule isolée depuis la contrainte}";
    case "construire":
      return "\\text{fonction à une seule variable (voir aide)}";
    case "deriver":
      return "\\text{dérivée de la fonction précédente}";
    case "resoudre":
      if (exercice.famille === "trapeze") {
        return `u=${formatFractionLatex(exercice.u.num, exercice.u.den)},\\ \\alpha\\approx ${((alphaOptTrapeze(exercice) * 180) / Math.PI).toFixed(1)}°`;
      }
      return `${exercice.famille === "fenetreA" || exercice.famille === "fenetreB" ? "r" : "x"}\\approx ${opt!.toFixed(2)}`;
    case "justifier":
      return "\\text{signe de la dérivée avant/après (voir récap précédent)}";
    case "conclure":
      return "\\text{valeurs numériques optimales (voir bloc état actuel)}";
    case "application":
      return "\\text{substitution numérique dans les dimensions optimales}";
    case "coeffsImmediats":
      return exercice.famille === "cubique" ? `c=0,\\ d=${exercice.d}` : "";
    case "relation":
      return exercice.famille === "cubique" ? `b=${(-3 * exercice.x2) / 2}a` : "";
    case "resoudreA":
      return exercice.famille === "cubique" ? `a=${exercice.a}` : "";
    case "expressionFinale":
      return exercice.famille === "cubique" ? `f(x)=${exercice.a}x^3${exercice.b >= 0 ? "+" : ""}${exercice.b}x^2${exercice.d >= 0 ? "+" : ""}${exercice.d}` : "";
  }
}
