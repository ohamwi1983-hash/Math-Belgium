interface Props {
  titre?: string;
  lignes: string[];
}

/** Petit bloc de données textuelles (pas de KaTeX — les données de ce générateur sont des nombres
 * narratifs avec unité, ex. "AB = 9 m"/"angle ROI1 = 40°", jamais une expression symbolique) —
 * réutilisé par les écrans "pont"/"angles"/"cible" de ce seul générateur (composant local, pas
 * partagé plus largement). */
export function BlocDonneesTriangleLies({ titre, lignes }: Props) {
  if (lignes.length === 0) return null;
  return (
    <div className="equation-box">
      {titre && <p className="field-label">{titre}</p>}
      {lignes.map((ligne) => (
        <p key={ligne} className="prompt-text">
          {ligne}
        </p>
      ))}
    </div>
  );
}
