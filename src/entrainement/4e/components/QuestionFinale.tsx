interface Props {
  question: string | null;
}

/** Bandeau persistant, discret, rappelant la question finale de l'exercice sur chaque écran — voir
 * CLAUDE.md, "Question finale persistante". Ne rend rien si `question` est `null` (convention déjà
 * établie sur la plateforme, ex. `EtatActuelPanel`) : cas d'un exercice "Problèmes d'optimisation"
 * (gen55) réutilisé comme `base` par un autre générateur, dont la vraie question finale est portée
 * ailleurs (ex. `ExerciceEquationInequationCommun.questionFinale`, toujours non nulle). */
export function QuestionFinale({ question }: Props) {
  if (question === null) return null;
  return <p className="question-finale">{question}</p>;
}
