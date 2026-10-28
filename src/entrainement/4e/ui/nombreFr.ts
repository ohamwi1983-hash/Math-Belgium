/**
 * Notation décimale belge (virgule) pour tout ce que l'élève voit dans les générateurs du chapitre
 * « Statistique descriptive » (gen30 à gen38) — audit du chapitre 4, point 14 : « 12.5 % »,
 * « Q1 ≈ 4.2 », « seuil = 5.75 » apparaissaient avec un point, alors que les placeholders et les
 * aides LaTeX écrivaient déjà « 7,5 ». Ne touche JAMAIS aux valeurs internes ni à la vérification,
 * qui acceptent déjà le point et la virgule : seulement la présentation.
 */
import type { AdaptateurFeuilleExercices, BlocCorrection, FragmentConsigne, SectionExercice } from "../../export/genererFeuilleExercices";

/** Nombre sans bruit flottant (2,3000000000000003 → 2,3), virgule décimale. */
export function nombreFr(valeur: number): string {
  return String(Number(valeur.toFixed(10))).replace(".", ",");
}

/** Même nombre pour KaTeX : `{,}` évite l'espace que LaTeX ajoute après une virgule. */
export function nombreFrLatex(valeur: number): string {
  return String(Number(valeur.toFixed(10))).replace(".", "{,}");
}

/** Remplace dans un texte brut tout séparateur décimal « . » situé entre deux chiffres
 * (« 12.5 % » → « 12,5 % ») — jamais un point final de phrase, toujours suivi d'une espace. */
export function virgulesTexte(texte: string): string {
  return texte.replace(/(\d)\.(\d)/g, "$1,$2");
}

/** Même remplacement dans une chaîne LaTeX (« 12.5 » → « 12{,}5 »). */
export function virgulesLatex(latex: string): string {
  return latex.replace(/(\d)\.(\d)/g, "$1{,}$2");
}

/** Segment texte/LaTeX (`SegmentTexte` des `ui/format*.ts` : "texte"/"katex" ; `FragmentConsigne`
 * des exports : "texte"/"latex"). */
type Segment = { type: string; valeur: string };

export function segmentEnVirgules<S extends Segment>(segment: S): S {
  const estLatex = segment.type === "katex" || segment.type === "latex";
  return { ...segment, valeur: estLatex ? virgulesLatex(segment.valeur) : virgulesTexte(segment.valeur) };
}

function fragmentsEnVirgules(fragments: FragmentConsigne[] | undefined): FragmentConsigne[] | undefined {
  return fragments?.map(segmentEnVirgules);
}

/** Texte visible d'un fragment HTML (entre les balises) — jamais les attributs (coordonnées SVG). */
function htmlEnVirgules(html: string): string {
  return html.replace(/>([^<]*)</g, (_m, texte: string) => `>${virgulesTexte(texte)}<`);
}

function sectionEnVirgules(section: SectionExercice): SectionExercice {
  return {
    ...section,
    enteteFragments: fragmentsEnVirgules(section.enteteFragments),
    enteteHtml: section.enteteHtml === undefined ? undefined : htmlEnVirgules(section.enteteHtml),
    questions: section.questions.map((question) => ({
      ...question,
      consigne: fragmentsEnVirgules(question.consigne) ?? [],
      reponse:
        question.reponse?.type === "tableau"
          ? { ...question.reponse, libellesLignes: question.reponse.libellesLignes.map(virgulesTexte) }
          : question.reponse,
    })),
  };
}

function blocEnVirgules(bloc: BlocCorrection): BlocCorrection {
  if (bloc.type === "paragraphe") return { ...bloc, fragments: fragmentsEnVirgules(bloc.fragments) ?? [] };
  if (bloc.type === "html") return { ...bloc, html: htmlEnVirgules(bloc.html) };
  return {
    ...bloc,
    libellesLignes: bloc.libellesLignes.map(virgulesTexte),
    valeursParLigne: bloc.valeursParLigne.map((ligne) => ligne.map(virgulesTexte)),
  };
}

/** Enveloppe un adaptateur d'export : énoncé et correction passent en notation décimale belge. */
export function avecVirgulesBelges<T>(adaptateur: AdaptateurFeuilleExercices<T>): AdaptateurFeuilleExercices<T> {
  return {
    ...adaptateur,
    construireEnonce: (instance) => sectionEnVirgules(adaptateur.construireEnonce(instance)),
    construireCorrection: (instance) => adaptateur.construireCorrection(instance).map(blocEnVirgules),
  };
}
