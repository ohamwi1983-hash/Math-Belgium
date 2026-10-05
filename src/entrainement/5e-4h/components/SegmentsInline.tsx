import { Katex } from "./Katex";

export type SegmentTexte = { type: "texte"; valeur: string } | { type: "katex"; valeur: string };

interface Props {
  segments: SegmentTexte[];
}

/**
 * Rendu générique d'un tableau de segments texte/KaTeX — "prose + fragments KaTeX courts", jamais
 * une phrase entière passée à KaTeX (même précaution que le reste du projet contre le débordement
 * horizontal mobile d'un bloc `\text{...}` monolithique). Réutilisé par plusieurs composants de
 * "Boîte à moustaches" (consignes/aides/révélations à notation indicielle,
 * `promptgen36modifications.md`) plutôt que dupliqué à chaque site consommateur — le nombre de
 * fragments par phrase y est trop élevé pour le patron plus léger `{avant, latex, apres}` utilisé
 * ailleurs dans le projet pour un seul fragment isolé.
 */
export function SegmentsInline({ segments }: Props) {
  return (
    <>
      {segments.map((segment, index) =>
        segment.type === "texte" ? <span key={index}>{segment.valeur}</span> : <Katex key={index} expression={segment.valeur} />,
      )}
    </>
  );
}
