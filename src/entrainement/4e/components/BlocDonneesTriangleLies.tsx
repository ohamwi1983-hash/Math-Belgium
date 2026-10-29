interface Props {
  titre?: string;
  lignes: string[];
}

/** Petit bloc de données textuelles (pas de KaTeX — les données de ce générateur sont des nombres
 * narratifs avec unité, ex. "AB = 9 m"/"angle ROI1 = 40°", jamais une expression symbolique) —
 * réutilisé par les écrans "pont"/"angles"/"cible" de ce seul générateur (composant local, pas
 * partagé plus largement). Lignes en `.bloc-donnees-ligne`, jamais `.prompt-text` : la dernière
 * aurait sinon reçu la mise en avant réservée à « la question » de l'écran
 * (`.prompt-text:not(:has(~ .prompt-text))`, theme.css), contrairement aux lignes précédentes. */
export function BlocDonneesTriangleLies({ titre, lignes }: Props) {
  if (lignes.length === 0) return null;
  return (
    <div className="equation-box">
      {titre && <p className="field-label">{titre}</p>}
      {lignes.map((ligne) => (
        <p key={ligne} className="bloc-donnees-ligne">
          {ligne}
        </p>
      ))}
    </div>
  );
}
