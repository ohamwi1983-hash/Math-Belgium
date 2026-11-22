/**
 * Questions « Formule » des évaluations : banque ÉCRITE À LA MAIN, chapitre par chapitre (décision de
 * l'utilisateur, 22/11/2026 — elle remplace la fabrication automatique depuis `ChapterContent.formulaire`,
 * qui donnait des énoncés sans objet : « Écris la formule : pour $x\in[-1;1]$. »).
 *
 * Règles de rédaction (`.claude/rules/feuilles-evaluations.md`, « Questions « Formule » ») :
 * - énoncé autonome : il dit DE QUOI on parle et CE qu'on attend, avec les notations du cours ;
 * - la réponse n'est jamais lisible dans l'énoncé ; corrigé = la formule (et sa condition si elle compte) ;
 * - chaque question est rattachée à la section où la formule est enseignée ;
 * - RichText du site : `$…$` (jamais `$$`), « − » dans le texte, virgule décimale `{,}`, `**gras**`
 *   jamais autour de `$…$`.
 *
 * `id` : stable dans son chapitre. Quand la question reprend une formule du formulaire qui avait déjà
 * sa question automatique, `id` est le TEXTE de cette formule (ancien identifiant, `normaliserCle`) : un
 * plan enregistré avec un choix explicite retrouve ainsi sa question. Sinon, un identifiant court.
 */
export interface QuestionFormuleBrute {
  id: string
  enonce: string
  /** Une ligne, ou plusieurs (une par élément du tableau). */
  corrige: string | string[]
}

/** chapitre (slug) → section (id) → questions, dans l'ordre du cours. */
export type BanqueFormules = Record<string, Record<string, QuestionFormuleBrute[]>>
