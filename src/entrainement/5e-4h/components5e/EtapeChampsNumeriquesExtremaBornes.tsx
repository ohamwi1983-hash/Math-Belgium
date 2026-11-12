import { useEffect, useState } from "react";
import type { EcranExtremaBornes } from "../moteur5e/typesExtremaBornes";
import type { StatutVerification } from "../moteur/statutVerification";
import { Katex } from "../components/Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { CalculatriceScientifique } from "./CalculatriceScientifique";
import { formatMessageErreur } from "../ui/messageErreur";
import { consigneEcranExtremaBornes, texteAideNiveau1ExtremaBornes, texteAideNiveau2ExtremaBornes } from "../ui5e/formatExtremaBornes";
import type { ExerciceExtremaBornes } from "../core5e/extremaBornes.types";
import { TexteRiche5e } from "./TexteRiche5e";
import { AideExtremaBornesBloc } from "./AideExtremaBornesBloc";

interface Props {
  phase: EcranExtremaBornes;
  exercice: ExerciceExtremaBornes;
  /** Contrôle de forme AVANT soumission (écran « racines » : champ vide, doublon) — renvoie un
   * message affiché SANS consommer de tentative, ou `null` si la saisie peut être soumise. */
  controlerAvantSoumission?: (valeurs: string[]) => string | null;
  /** Calculatrice affichée (défaut : oui) — inutile pour résoudre f'(t)=0 (valeurs entières). */
  avecCalculatrice?: boolean;
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
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran générique "N champs numériques, vérifiés comme un ENSEMBLE" — réutilisé par
 * "valeursExtremums" (2 ou 3 champs) et "valeursBornes" (toujours 2 champs), les 2 seuls écrans à
 * N champs numériques de ce générateur. Même patron que `EtapeChampsNumeriquesEtudeLocale.tsx`
 * (5gen29), réécrit localement (contrat propre à ce générateur) — MÊME `useEffect` de
 * resynchronisation dès le départ (voir CLAUDE.md : piège de troncature d'état déjà rencontré 2
 * fois cette semaine sur ce patron de composant à N champs). Calculatrice PRÉSENTE (valeur décimale
 * calculée à la main, même si toujours entière ici par construction — convention transversale). */
export function EtapeChampsNumeriquesExtremaBornes({ phase, exercice, controlerAvantSoumission, avecCalculatrice = true, labels, placeholders, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer, validation}: Props) {
  const nb = labels.length;
  const [valeurs, setValeurs] = useState<string[]>(() => new Array(nb).fill(""));
  useEffect(() => {
    setValeurs(new Array(nb).fill(""));
  }, [nb]);
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const [messageForme, setMessageForme] = useState<string | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = controlerAvantSoumission ? valeurs.some((v) => v.trim() !== "") : valeurs.every((v) => v.trim() !== "");
  const apresEchec = tentativesUtilisees > 0;
  const statuts = apresEchec && diagnostiquer && valeurs.every((v) => v.trim() !== "") ? valeurs.map((v) => diagnostiquer(v)) : null;

  function modifier(i: number, valeur: string) {
    setMessageForme(null);
    setValeurs((arr) => arr.map((v, j) => (j === i ? valeur : v)));
  }
  function valider() {
    if (!complet) return;
    const message = controlerAvantSoumission?.(valeurs) ?? null;
    if (message) {
      setMessageForme(message);
      return;
    }
    if (diagnostiquer) setDernierStatut(valeurs.map((v) => diagnostiquer(v)).find((s) => s !== "correct") ?? "correct");
    onValider(valeurs);
  }

  return (
    <div>
      <p className="prompt-text">
        <TexteRiche5e texte={consigneEcranExtremaBornes(phase, exercice)} />
      </p>
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
      {avecCalculatrice && <CalculatriceScientifique />}
      <AideExtremaBornesBloc niveauAide={niveauAide} niveau1={texteAideNiveau1ExtremaBornes(phase, exercice)} niveau2={texteAideNiveau2ExtremaBornes(phase, exercice)} />
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
          Valider
        </button>
        {messageForme ? (
          <p className="alert-error" role="alert">
            {messageForme}
          </p>
        ) : (
          montrerErreurs && (
            <p className="alert-error" role="alert">
              {formatMessageErreur(tentativesUtilisees, tentativesMax, dernierStatut)}
            </p>
          )
        )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
