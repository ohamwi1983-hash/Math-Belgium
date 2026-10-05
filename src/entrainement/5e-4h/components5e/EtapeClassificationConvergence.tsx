import { useState } from "react";
import type { ExerciceConvergenceSuite } from "../core5e/convergenceSuites.types";
import type { PhaseConvergenceSuite } from "../moteur5e/typesConvergenceSuites";
import { consigneGenerale, consignePhase, formatTermesDonneesLatex, formatTermesEtatActuelConvergence, optionsClassification, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatConvergenceSuites";
import { Katex } from "../components/Katex";
import { BoutonAide } from "./BoutonAide";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

/** Bloc "état actuel" — ne rend rien pour "classificationArithmetique"/"classificationGeometrique"
 * (écran unique de leur variante, rien à récapituler avant) ni pour "diviserQuelconque" (premier
 * écran de la variante "quelconque") — seul "classifierQuelconque" rappelle l'expression déjà
 * simplifiée à l'écran précédent. */
function EtatActuelConvergence({ exercice, phase }: { exercice: ExerciceConvergenceSuite; phase: PhaseConvergenceSuite }) {
  const termes = formatTermesEtatActuelConvergence(exercice, phase);
  if (termes.length === 0) return null;
  return (
    <div className="etat-actuel-box etat-actuel-box-termes">
      {termes.map((t, i) => (
        <Katex key={i} expression={t} />
      ))}
    </div>
  );
}

interface Props {
  exercice: ExerciceConvergenceSuite;
  phase: "classificationArithmetique" | "classificationGeometrique" | "classifierQuelconque";
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: { classification: string; valeur?: string }) => void;
  /**
   * Statut à 3 valeurs (A.1) calculé côté PRÉSENTATION uniquement — optionnel, et VOLONTAIREMENT
   * omis par `App5gen16.tsx` pour les 2 écrans purement catégoriels (classificationArithmetique/
   * classificationGeometrique, aucun champ texte libre, donc aucune fonction `diagnostiquerXxx`
   * n'existe pour eux côté `verificationConvergenceSuites.ts` — leur vérification reste un simple
   * booléen, `verifierClassificationArithmetique`/`verifierClassificationGeometrique`) — fourni
   * uniquement pour "classifierQuelconque", dont le champ conditionnel "valeur" peut légitimement
   * échouer au parsing (`diagnostiquerClassifierQuelconque`, déjà exportée).
   */
  diagnostiquer?: (reponse: { classification: string; valeur?: string }) => StatutVerification;
  /** Diagnostic INDÉPENDANT du seul champ texte libre de cet écran (A.2, surlignage rouge) —
   * n'existe que pour "classifierQuelconque" quand l'option choisie exige une valeur numérique
   * ("Converge vers une autre valeur"), jamais pour les 2 écrans purement catégoriels. */
  diagnostiquerValeur?: (valeur: string) => StatutVerification;
}

/** Écran de classification catégorielle — réutilisé par les 3 écrans "classification" de 5gen16
 * (arithmétique : 3 boutons ; géométrique : 6 boutons ; quelconque/classifierQuelconque : 4
 * boutons dont 1 révèle un champ numérique — "Converge vers une autre valeur"). */
export function EtapeClassificationConvergence({
  exercice,
  phase,
  tentativesUtilisees,
  tentativesMax,
  niveauAide,
  niveauAideMax,
  onActiverAide,
  onValider,
  diagnostiquer,
  diagnostiquerValeur,
}: Props) {
  const options = optionsClassification(exercice, phase as PhaseConvergenceSuite);
  const [choixId, setChoixId] = useState<string | null>(null);
  const [valeur, setValeur] = useState("");
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const optionChoisie = options.find((o) => o.id === choixId);
  const complet = choixId !== null && (!optionChoisie?.requiertValeur || valeur.trim() !== "");
  const apresEchec = tentativesUtilisees > 0;
  const valeurErronee = apresEchec && !!optionChoisie?.requiertValeur && !!diagnostiquerValeur && diagnostiquerValeur(valeur) !== "correct";
  const aide2 = texteAideNiveau2(exercice, phase as PhaseConvergenceSuite);

  function valider() {
    if (!complet || choixId === null) return;
    const reponse = { classification: choixId, valeur: optionChoisie?.requiertValeur ? valeur : undefined };
    if (diagnostiquer) setDernierStatut(diagnostiquer(reponse));
    onValider(reponse);
  }

  return (
    <div>
      <p className="prompt-text">{consigneGenerale(exercice)}</p>
      <div className="equation-box equation-box-donnees">
        {formatTermesDonneesLatex(exercice).map((frag, i) => (
          <Katex key={i} expression={frag} />
        ))}
      </div>
      <EtatActuelConvergence exercice={exercice} phase={phase as PhaseConvergenceSuite} />
      <p className="prompt-text">{consignePhase(exercice, phase as PhaseConvergenceSuite)}</p>

      <div className={options.length > 4 ? "options-liste-longue" : "options-grid-compact"}>
        {options.map((o) => (
          <button key={o.id} type="button" className={`btn ${choixId === o.id ? "toggle-active" : ""}`} onClick={() => setChoixId(o.id)}>
            {o.label}
          </button>
        ))}
      </div>

      {optionChoisie?.requiertValeur && (
        <div className="field field-inline contenu-conditionnel">
          <label className="field-label field-label-minuscule">
            <Katex expression="\lim =" />
          </label>
          <input type="text" className={`text-input${valeurErronee ? " is-erronee" : ""}`} value={valeur} onChange={(e) => setValeur(e.target.value)} />
        </div>
      )}

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
          <Katex expression={texteAideNiveau1(exercice, phase as PhaseConvergenceSuite)} block />
          {niveauAide >= 2 && aide2.length > 0 && <Katex expression={aide2} block />}
        </div>
      )}
    </div>
  );
}
