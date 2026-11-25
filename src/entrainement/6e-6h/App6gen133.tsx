import { useState } from "react";
import type { ReglagesSession5e } from "../5e-4h/core5e/session5e.types";
import { activerAideEcran, demarrerSessionEcrans, soumettreEcran, TENTATIVES_CHAMP, tentativesMaxEcran } from "../5e-4h/moteur5e/sessionEcransTrigo";
import type { EtatSessionEcrans } from "../5e-4h/moteur5e/sessionEcransTrigo";
import { EtapePlacerPointsTrig5e } from "../5e-4h/components5e/EtapePlacerPointsTrig5e";
import { Fragments } from "../5e-4h/components5e/EtapeEcransTrigo";
import { SelecteurVarianteDev } from "../5e-4h/components5e/SelecteurVarianteDev";
import type { Geometrie, PointFigure } from "../5e-4h/ui5e/figureSinusoidePoints";
import type { Cadre, PointPlace } from "../5e-4h/moteur5e/modeleSinusoidePoints";
import type { DiagnosticSaisie } from "../5e-4h/moteur5e/saisieTrig";
import type { AideEcran } from "../5e-4h/ui5e/ecransTrigo.types";
import { ProgressionPuces } from "../components/ProgressionPuces";
import type { EtatPuceProgression } from "../components/ProgressionPuces";
import { PanneauRappels } from "../components/PanneauRappels";
import type { EntreeHistoriqueEtape } from "../components/FicheReponseEcran";
import { FicheReponseEcran } from "../components/FicheReponseEcran";
import { CorrigeDetailleEcran } from "../components/CorrigeDetailleEcran";
import { genererAvecCode, lireCodeDepuisUrl } from "../export/codeExercice";
import { lettreEtape, lignesDeLEtape } from "../export/corrigeTableau";
import type { FragmentConsigne } from "../export/genererFeuilleExercices";
import type { Exercice133, Phase133 } from "./core6e/representerConique";
import { pointsAttendus133 } from "./core6e/representerConique";
import { CATALOGUE_133, construireAvecVariante133, genererExercice133 } from "./generateurs6e/representerConique";
import { DEFINITION_133, nombrePoints133 } from "./ui6e/definitionRepresenterConique";
import { MARGE, pointsConfirmes133, repere133, unite133 } from "./ui6e/formatRepresenterConique";
import type { StylePlace } from "./ui6e/formatRepresenterConique";
import { encoderPoint, indicesFaux133, piege133 } from "./moteur6e/verificationRepresenterConique";
import type { P } from "./ui6e/outilsLieuxLotH1";

/**
 * `6gen133` — « Représenter une conique » (6e ch. 10, § 1–2, processus 1 CONNAÎTRE). Réponse
 * GRAPHIQUE : l'élève place des points sur un repère quadrillé, avec le mécanisme de placement de 5gen52
 * (`EtapePlacerPointsTrig5e` : toucher un nœud place le point aimanté, le toucher à nouveau l'enlève,
 * « Valider » au bon nombre de points, points faux en rouge) — réutilisé tel quel, sur une géométrie
 * construite ici (un nœud = une unité). Moteur de session partagé des écrans (`sessionEcransTrigo`, trois
 * tentatives, aides à deux niveaux, réponse révélée et points attendus entourés), corrigé « comme au
 * tableau » consultable après chaque réponse (validation ET fiche de puce), `?code=` par les MÊMES
 * fonctions que l'adaptateur, `SelecteurVarianteDev` intact.
 */

const REGLAGES: ReglagesSession5e = { nombreExercices: 1, tentativesMax: TENTATIVES_CHAMP };
const def = DEFINITION_133;
type Etat = EtatSessionEcrans<Exercice133, Phase133>;

function geometrie133(e: Exercice133): Geometrie {
  const u = unite133(e);
  const f = e.fenetre;
  const cadre = { colonnes: f.xMax - f.xMin, yMin: f.yMin, yMax: f.yMax } as unknown as Cadre;
  return { W: (f.xMax - f.xMin) * u + 2 * MARGE, H: (f.yMax - f.yMin) * u + 2 * MARGE, gauche: MARGE, haut: MARGE, dx: u, dy: u, cadre };
}

const versP = (e: Exercice133, q: PointPlace): P => ({ x: e.fenetre.xMin + q.i, y: q.y });
const aideEnFragments = (a: AideEcran | null): FragmentConsigne[] => (a ? ([...a.texte, ...(a.latex ? [{ type: "texte", valeur: " " }, { type: "latex", valeur: a.latex }] : [])] as FragmentConsigne[]) : []);

export function App6gen133() {
  const [etat, setEtat] = useState<Etat>(() => {
    const code = lireCodeDepuisUrl();
    if (!code) return demarrerSessionEcrans(def, REGLAGES, genererExercice133);
    return demarrerSessionEcrans(def, REGLAGES, () => genererAvecCode(code, CATALOGUE_133, genererExercice133, construireAvecVariante133));
  });
  const [enAttente, setEnAttente] = useState<{ etatSuivant: Etat; revele: boolean } | null>(null);
  const [historique, setHistorique] = useState<EntreeHistoriqueEtape[]>([]);
  const [ficheOuverte, setFicheOuverte] = useState<number | null>(null);
  const [aideParPhase, setAideParPhase] = useState<Partial<Record<Phase133, boolean>>>({});
  const [compteur, setCompteur] = useState(0);

  const e = etat.exerciceCourant;
  const phase = etat.phase;
  const phases = def.phases(e);
  const indexPhase = phases.indexOf(phase);
  const g = geometrie133(e);

  function reinitialiser(nouvel: Etat) {
    setEtat(nouvel);
    setEnAttente(null);
    setHistorique([]);
    setAideParPhase({});
    setFicheOuverte(null);
    setCompteur((c) => c + 1);
  }

  /** Corrigé de l'écran en cours — UNE source pour la validation et pour la fiche de la puce. */
  function corrigeDetailleEcranCourant() {
    return <CorrigeDetailleEcran etapes={lignesDeLEtape(def.correction(e), lettreEtape(indexPhase))} />;
  }

  function terminerEtape(nouvel: Etat, pts: P[]) {
    const transition = nouvel.phase !== etat.phase || nouvel.terminee !== etat.terminee || nouvel.exerciceCourant !== etat.exerciceCourant;
    if (!transition) {
      setEtat(nouvel);
      return;
    }
    const revele = nouvel.derniereTransitionRevelee;
    setAideParPhase((p) => ({ ...p, [phase]: etat.niveauAide > 0 }));
    setHistorique((h) => [
      ...h,
      {
        corrigeDetaille: corrigeDetailleEcranCourant(),
        titre: def.libelle(e, phase),
        votreReponse: pts.map((q) => `(${String(q.x).replace("-", "−")} ; ${String(q.y).replace("-", "−")})`).join(" ; "),
        correcte: !revele,
        reponseAttendue: revele ? <Fragments fragments={def.reponseAttendue(e, phase)} /> : undefined,
      },
    ]);
    setEnAttente({ etatSuivant: nouvel, revele });
  }

  function suivant() {
    if (!enAttente) return;
    if (enAttente.etatSuivant.terminee) {
      reinitialiser(demarrerSessionEcrans(def, REGLAGES, genererExercice133));
      return;
    }
    setEtat(enAttente.etatSuivant);
    setEnAttente(null);
  }

  const modeDev = import.meta.env.DEV || new URLSearchParams(window.location.search).get("dev") === "1";
  if (modeDev) (window as unknown as Record<string, unknown>).__debug6gen133 = { exercice: e, phase };

  const validation = enAttente
    ? {
        revele: enAttente.revele,
        reponseAttendue: <Fragments fragments={def.reponseAttendue(e, phase)} />,
        labelSuivant: enAttente.etatSuivant.terminee ? "Nouvel exercice" : "Écran suivant",
        onSuivant: suivant,
        corrigeDetaille: corrigeDetailleEcranCourant(),
      }
    : null;

  const segments: EtatPuceProgression[] = phases.map((p, i) => {
    const idx = etat.terminee ? phases.length : indexPhase;
    if (i > idx) return "a-venir";
    if (i === idx) return enAttente ? (enAttente.revele ? "revele" : aideParPhase[p] || etat.niveauAide > 0 ? "aide" : "correcte") : "courante";
    if (etat.revelesPartiels[p]) return "revele";
    return aideParPhase[p] ? "aide" : "correcte";
  });

  const confirmes = pointsConfirmes133(e, phase);
  const dessiner = (pts: PointFigure[]) =>
    repere133(e, [
      ...confirmes,
      ...pts.filter((q) => q.style !== "base").map((q) => ({ P: versP(e, q), style: q.style as StylePlace })),
      ...(enAttente ? pointsAttendus133(e, phase).map((P) => ({ P, style: "attendu" as const })) : []),
    ]);
  const diagnostiquer = (pts: PointPlace[]): DiagnosticSaisie => {
    const lus = pts.map((q) => versP(e, q));
    const valeurs = lus.map(encoderPoint);
    const st = def.diagnostiquer(e, phase, valeurs);
    if (st[0] === "correct") return { statut: "correct" };
    return { statut: "faux", champsFaux: indicesFaux133(e, phase, lus), message: piege133(e, phase, valeurs) };
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">6e — Entraînement</p>
        <h1 className="app-title">Représenter une conique</h1>
        <p className="app-subtitle">Chapitre 10 — Les coniques</p>
        <SelecteurVarianteDev options={CATALOGUE_133} onGenerer={(id) => reinitialiser(demarrerSessionEcrans(def, REGLAGES, () => construireAvecVariante133(id)))} />
        <ProgressionPuces segments={segments} onSegmentClick={(i) => setFicheOuverte(i)} />
      </header>
      <main className="card">
        <PanneauRappels
          entrees={phases.slice(0, etat.terminee ? phases.length : indexPhase).map((p, i) => ({
            cle: `${i}-${p}`,
            libelle: def.libelle(e, p),
            revele: etat.revelesPartiels[p] ?? false,
            valeur: <Fragments fragments={def.recap(e, p)} />,
          }))}
        />
        <p style={{ lineHeight: 1.6, margin: "8px 0 12px" }}>
          <Fragments fragments={def.consigneGenerale(e)} />
        </p>
        <EtapePlacerPointsTrig5e
          key={`${compteur}-${phase}`}
          consigne={def.consigne(e, phase) as FragmentConsigne[]}
          nombre={nombrePoints133(e, phase)}
          geometrie={g}
          fixes={confirmes.map((q) => ({ i: q.P.x - e.fenetre.xMin, y: q.P.y }))}
          dessiner={dessiner}
          aides={[aideEnFragments(def.aide1(e, phase)), aideEnFragments(def.aide2(e, phase))].filter((a) => a.length > 0)}
          niveauAide={etat.niveauAide}
          onActiverAide={() => setEtat(activerAideEcran(def, etat))}
          tentativesUtilisees={etat.etapeCourante.tentativesUtilisees}
          tentativesMax={tentativesMaxEcran(def, etat)}
          diagnostiquer={diagnostiquer}
          onValider={(_ok, pts) => {
            const lus = pts.map((q) => versP(e, q));
            terminerEtape(soumettreEcran(def, etat, lus.map(encoderPoint)), lus);
          }}
          validation={validation}
        />
      </main>
      {ficheOuverte !== null && historique[ficheOuverte] && <FicheReponseEcran entree={historique[ficheOuverte]} onFermer={() => setFicheOuverte(null)} />}
    </div>
  );
}
