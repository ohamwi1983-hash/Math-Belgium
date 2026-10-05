import { useEffect, useState } from "react";
import type { ExerciceExtremaBornes } from "../core5e/extremaBornes.types";
import type { EcranExtremaBornes } from "../moteur5e/typesExtremaBornes";
import type { StatutVerification } from "../moteur/statutVerification";
import { Katex } from "../components/Katex";
import { BoutonAide } from "./BoutonAide";
import { CalculatriceScientifique } from "./CalculatriceScientifique";
import { EnonceExtremaBornes } from "./EnonceExtremaBornes";
import { formatMessageErreur } from "../ui/messageErreur";
import { consigneEcranExtremaBornes, texteAideNiveau1ExtremaBornes, texteAideNiveau2ExtremaBornes } from "../ui5e/formatExtremaBornes";

interface Props {
  exercice: ExerciceExtremaBornes;
  phase: EcranExtremaBornes;
  labels: string[];
  placeholders: string[];
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponses: string[]) => void;
  /** Diagnostic PAR CHAMP — correct si la valeur saisie correspond à N'IMPORTE LAQUELLE des cibles
   * attendues (ensemble, ordre indifférent). */
  diagnostiquer?: (texte: string) => StatutVerification;
}

/** Écran générique "N champs numériques, vérifiés comme un ENSEMBLE" — réutilisé par
 * "valeursExtremums" (2 ou 3 champs) et "valeursBornes" (toujours 2 champs), les 2 seuls écrans à
 * N champs numériques de ce générateur. Même patron que `EtapeChampsNumeriquesEtudeLocale.tsx`
 * (5gen29), réécrit localement (contrat propre à ce générateur) — MÊME `useEffect` de
 * resynchronisation dès le départ (voir CLAUDE.md : piège de troncature d'état déjà rencontré 2
 * fois cette semaine sur ce patron de composant à N champs). Calculatrice PRÉSENTE (valeur décimale
 * calculée à la main, même si toujours entière ici par construction — convention transversale). */
export function EtapeChampsNumeriquesExtremaBornes({ exercice, phase, labels, placeholders, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const nb = labels.length;
  const [valeurs, setValeurs] = useState<string[]>(() => new Array(nb).fill(""));
  useEffect(() => {
    setValeurs(new Array(nb).fill(""));
  }, [nb]);
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = valeurs.every((v) => v.trim() !== "");
  const apresEchec = tentativesUtilisees > 0;
  const statuts = apresEchec && diagnostiquer && complet ? valeurs.map((v) => diagnostiquer(v)) : null;

  function modifier(i: number, valeur: string) {
    setValeurs((arr) => arr.map((v, j) => (j === i ? valeur : v)));
  }
  function valider() {
    if (!complet) return;
    if (diagnostiquer) setDernierStatut(valeurs.map((v) => diagnostiquer(v)).find((s) => s !== "correct") ?? "correct");
    onValider(valeurs);
  }

  return (
    <div>
      <EnonceExtremaBornes exercice={exercice} phase={phase} />
      <p className="prompt-text">{consigneEcranExtremaBornes(phase)}</p>
      {labels.map((label, i) => (
        <div key={i} className="field field-inline">
          <label className="field-label field-label-minuscule">
            <Katex expression={label} />
          </label>
          <input
            type="text"
            className={`text-input${statuts && statuts[i] !== "correct" ? " is-erronee" : ""}`}
            value={valeurs[i]}
            onChange={(e) => modifier(i, e.target.value)}
            placeholder={placeholders[i] ?? ""}
          />
        </div>
      ))}
      <CalculatriceScientifique />
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, dernierStatut)}
        </p>
      )}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{texteAideNiveau1ExtremaBornes(phase)}</p>
          {niveauAide >= 2 && <p>{texteAideNiveau2ExtremaBornes(phase)}</p>}
        </div>
      )}
    </div>
  );
}
