import { Fragment, useState } from "react";
import type { ReactNode } from "react";
import { Katex } from "../components/Katex";
import { RenduFragments } from "../components/RenduFragments";
import { activerAide, demarrerSession, phaseCourante, soumettre, tentativesMaxCourant } from "../moteur6e/sessionCombinatoire";
import type { DefinitionSession, EtatSession } from "../moteur6e/sessionCombinatoire";
import type { Attente } from "../moteur6e/attentesCombinatoire";
import { f } from "../ui6e/fragmentsCombinatoire";
import type { FormatCombinatoire } from "../ui6e/fragmentsCombinatoire";
import { EcranCombinatoire } from "./EcranCombinatoire";
import { RecapitulatifPanel } from "./RecapitulatifPanel";
import { SelecteurVarianteDev } from "./SelecteurVarianteDev";
import type { EtatPuceProgression } from "../../components/ProgressionPuces";
import { ProgressionPuces } from "../../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../../components/FicheReponseEcran";
import { FicheReponseEcran } from "../../components/FicheReponseEcran";
import { genererAvecCode, lireCodeDepuisUrl } from "../../export/codeExercice";

export interface ConfigAppCombinatoire<E, P extends string> {
  id: string;
  titre: string;
  /** Catalogue complet (`retiree` : entrée gardée pour les indices des `?code=`, jamais montrée). */
  catalogue: { id: string; label: string; retiree?: boolean }[];
  genererLibre: () => E;
  genererVariante: (id: string) => E;
  definition: DefinitionSession<E, P>;
  attentes: (e: E, p: P) => Attente[];
  format: FormatCombinatoire<E, P>;
  /** Figure de l'énoncé (facultative). */
  illustration?: (e: E, p: P) => ReactNode;
  /** Outil propre à l'écran, rendu sous sa consigne (6e ch. 8 : tableau de la loi, courbe de Gauss,
   * table de Φ consultable) — reste visible quand l'énoncé se replie. Facultatif. `closes` : écrans
   * déjà jugés, l'écran courant compris dès qu'il est clos (6e ch. 9 : le lieu n'est tracé qu'APRÈS
   * la réponse qu'il trahirait). */
  complement?: (e: E, p: P, closes: readonly P[]) => ReactNode;
  /** Sous-titre de l'en-tête (défaut : « Chapitre 7 — Analyse combinatoire »). */
  sousTitre?: string;
  /** Nombre de puces montré tant que le PREMIER écran n'est pas clos, quand le nombre réel d'écrans
   * trahirait la réponse de cet écran (6gen48 : la stratégie). */
  pucesAvantPremierEcran?: (e: E) => number | null;
  /** Même chose pour un écran plus loin (6e ch. 9) : `nombre` puces tant que l'écran d'indice
   * `jusqua` n'est pas clos (le nombre d'écrans suivants trahirait sa réponse). */
  pucesMasquees?: (e: E) => { nombre: number; jusqua: number } | null;
  /** Rappels « Ce qu'on sait déjà » : valeurs d'un écran séparées par « ; » (6e ch. 9 : « A(…) ; B(…) »,
   * « a = 5 ; b = 3 »). Absent : rendu d'avant (ch. 7 et 8 inchangés). */
  recapSepare?: boolean;
  /** Corrigé détaillé de l'écran (lot E) ; à défaut, l'explication du format. */
  corrigeDetaille?: (e: E, p: P) => ReactNode;
}

interface Transition<E, P extends string> {
  suivant: EtatSession<E, P>;
  revele: boolean;
  valeurs: string[];
}

/**
 * Appli COMMUNE des générateurs 6gen43–6gen48 (6e ch. 7, audit, lot B). Ce qu'elle garantit pour les
 * six : première instance tirée par `?code=` avec les MÊMES fonctions que l'adaptateur papier
 * (`genererAvecCode`) ; champs vides à chaque nouvel exercice (clé de génération) ; validation avant
 * de passer à l'écran suivant ; message propre à un choix fermé faux ; explication après un échec ;
 * aucun point affiché ; `SelecteurVarianteDev` alimenté par le catalogue, jamais modifié.
 */
export function AppCombinatoire<E, P extends string>({ config }: { config: ConfigAppCombinatoire<E, P> }) {
  const { definition: def, format: fmt } = config;
  const [etat, setEtat] = useState<EtatSession<E, P>>(() => {
    const code = lireCodeDepuisUrl();
    const exercice = code ? genererAvecCode(code, config.catalogue, config.genererLibre, config.genererVariante) : config.genererLibre();
    return demarrerSession(def, exercice);
  });
  const [enAttente, setEnAttente] = useState<Transition<E, P> | null>(null);
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [fiche, setFiche] = useState<number | null>(null);
  const [generation, setGeneration] = useState(0);

  const exercice = etat.exercice;
  const phase = phaseCourante(etat);

  const modeDev = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDev) (window as unknown as Record<string, unknown>)[`__debug${config.id}`] = { exercice, phase };

  function reponseAttendue(p: P) {
    return (
      <span className="equation-box-termes">
        {fmt.reponseAttendue(exercice, p).map((frag, i) => (
          <Fragment key={i}>
            {i > 0 && <span> ; </span>}
            <Katex expression={frag} />
          </Fragment>
        ))}
      </span>
    );
  }

  function votreReponse(p: P, valeurs: string[]): ReactNode {
    const champs = fmt.champs(exercice, p);
    return (
      <span>
        {champs.map((c, i) => {
          const brut = valeurs[i] ?? "";
          const affiche = c.type === "choix" ? (c.options?.find((o) => o.valeur === brut)?.label ?? brut) : c.type === "liste" ? brut.split("\n").join(" | ") : brut;
          return (
            <span key={i} style={{ display: "block" }}>
              <RenduFragments fragments={f(c.label)} /> {c.type === "choix" ? <RenduFragments fragments={f(affiche)} /> : affiche}
            </span>
          );
        })}
      </span>
    );
  }

  function valider(valeurs: string[]) {
    const suivant = soumettre(def, etat, valeurs);
    const clos = suivant.index !== etat.index || suivant.terminee !== etat.terminee;
    if (!clos) {
      setEtat(suivant);
      return;
    }
    const revele = suivant.derniereRevelee;
    setHistorique((h) => [...h, { titre: fmt.libellePhase(exercice, phase), votreReponse: votreReponse(phase, valeurs), correcte: !revele, reponseAttendue: revele ? reponseAttendue(phase) : undefined, corrigeDetaille: corrigeDetailleEcranCourant() }]);
    setEnAttente({ suivant, revele, valeurs });
  }

  function nouvelExercice(e: E) {
    setEnAttente(null);
    setHistorique([]);
    setGeneration((g) => g + 1);
    setEtat(demarrerSession(def, e));
  }

  function passer() {
    if (!enAttente) return;
    if (enAttente.suivant.terminee) nouvelExercice(config.genererLibre());
    else {
      setEtat(enAttente.suivant);
      setEnAttente(null);
    }
  }

  // Puces : écrans clos (✓ / aide / révélé), écran courant, écrans à venir.
  const close = (p: P) => (enAttente && p === phase ? { revele: enAttente.revele, aide: etat.niveauAide > 0 } : etat.clos[p]);
  let segments: EtatPuceProgression[] = etat.phases.map((p, i) => {
    const c = close(p);
    if (c) return c.revele ? "revele" : c.aide ? "aide" : "correcte";
    return i === etat.index ? "courante" : "a-venir";
  });
  const pucesAvant = config.pucesAvantPremierEcran?.(exercice);
  if (pucesAvant && etat.index === 0 && !enAttente) segments = Array.from({ length: pucesAvant }, (_, i) => (i === 0 ? "courante" : "a-venir"));
  const masque = config.pucesMasquees?.(exercice);
  if (masque && (etat.index < masque.jusqua || (etat.index === masque.jusqua && !enAttente))) {
    const reels = segments;
    segments = Array.from({ length: masque.nombre }, (_, i) => (i < etat.index ? reels[i] : i === etat.index ? "courante" : "a-venir"));
  }

  const estChoix = def.estChoix(exercice, phase);
  /** Corrigé de l'écran courant : UNE seule source pour la validation (révélé : visible ; juste :
   * replié derrière « Voir comment on y arrive ») ET pour l'entrée d'historique (fiche de la puce).
   * Appelée quand l'écran se clôt : l'écran courant est encore celui qui se ferme. */
  function corrigeDetailleEcranCourant(): ReactNode {
    if (config.corrigeDetaille) return config.corrigeDetaille(exercice, phase);
    const explication = fmt.explication(exercice, phase);
    return explication.length > 0 ? (
      <div className="aide-5e" style={{ marginTop: 8 }}>
        {explication.map((l, i) => (
          <p key={i} style={{ margin: "4px 0" }}>
            <RenduFragments fragments={l} />
          </p>
        ))}
      </div>
    ) : undefined;
  }

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: estChoix ? undefined : reponseAttendue(phase),
        messageRevele: estChoix ? "Ce n'était pas le bon choix : la bonne réponse est marquée ✓." : undefined,
        corrigeDetaille: corrigeDetailleEcranCourant(),
        labelSuivant: enAttente.suivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: passer,
      }
    : null;

  const recap = etat.phases.slice(0, etat.index).map((p) => ({
    libelle: fmt.libellePhase(exercice, p),
    valeur: "",
    estLatex: true,
    valeurs: config.recapSepare ? fmt.reponseAttendue(exercice, p).map((v, i, t) => (i < t.length - 1 ? `${v}\\,;` : v)) : fmt.reponseAttendue(exercice, p),
    revele: etat.clos[p]?.revele ?? false,
  }));

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">{config.titre}</h1>
        <p className="app-subtitle">{config.sousTitre ?? "Chapitre 7 — Analyse combinatoire"}</p>
        <SelecteurVarianteDev options={config.catalogue.filter((v) => !v.retiree)} onGenerer={(id) => nouvelExercice(config.genererVariante(id))} />
        <ProgressionPuces segments={segments} onSegmentClick={(i) => setFiche(i)} />
      </header>
      <main className="card">
        <RecapitulatifPanel entrees={recap} />
        <EcranCombinatoire
          key={`${generation}-${etat.index}`}
          consigneGenerale={fmt.consigneGenerale(exercice)}
          donnees={fmt.donnees(exercice)}
          illustration={config.illustration?.(exercice, phase)}
          complement={config.complement?.(exercice, phase, etat.phases.filter((p) => !!close(p)))}
          consigneEcran={fmt.consigneEcran(exercice, phase)}
          champs={fmt.champs(exercice, phase)}
          attentes={config.attentes(exercice, phase)}
          aides={fmt.aides(exercice, phase)}
          niveauAide={etat.niveauAide}
          onActiverAide={() => setEtat(activerAide(etat))}
          tentativesUtilisees={etat.etape.tentativesUtilisees}
          tentativesMax={tentativesMaxCourant(def, etat)}
          messageCible={fmt.messageCible ? (v) => fmt.messageCible!(exercice, phase, v) : undefined}
          onValider={valider}
          validation={validation}
        />
      </main>
      {fiche !== null && historique[fiche] && <FicheReponseEcran entree={historique[fiche]} onFermer={() => setFiche(null)} />}
    </div>
  );
}
