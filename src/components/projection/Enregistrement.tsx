import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import type { ChapterContent } from '../../content/types'
import type { Diapo as DonneesDiapo, Role } from '../../lib/projection/diapos'
import { titreCourt } from '../../lib/parcoursChapitre'
import { texteBrut } from '../../lib/projection/diapos'
import { fenetreDiapos } from '../../lib/projection/fenetre'
import { downloadBlob } from '../../lib/export/downloadBlob'
import {
  barresNiveau,
  chapitresYouTube,
  DEBIT_VOIX,
  descriptionVideo,
  duree as dureeLisible,
  formatVideo,
  jugerNiveau,
  MESSAGE_NIVEAU,
  microParDefaut,
  niveauLisible,
  nomFichierVideo,
  nomMicro,
  poids,
  QUALITES,
  teteAvecDuree,
  titreVideo,
  voixDetectee,
} from '../../lib/projection/enregistrement'
import type { ChapitreVideo, JugementNiveau, MicroDisponible, Qualite } from '../../lib/projection/enregistrement'
import { formatDuree } from './BarreOutils'
import './enregistrement.css'

/**
 * « ● Enregistrer » (P5, maquette validée du 28/11/2026) : la diapo, les annotations et la voix du professeur, en
 * vidéo WebM sur SON appareil (rien n'est envoyé à aucun serveur), prête à importer sur YouTube avec un titre, une
 * description et des chapitres horodatés d'après les étapes montrées.
 *
 * Ce qui est filmé :
 * - un écran : la DIAPO seulement (cadre de la scène : diapo, annotations, pages blanches, traceur, instruments,
 *   exercice projeté), par Element Capture (`RestrictionTarget`, Chrome / Edge récents : ce qui est posé PAR-DESSUS —
 *   barre, petites barres, pastilles, points de participation, point rouge — n'est jamais dans la vidéo) ; à défaut,
 *   Region Capture (`CropTarget`) : la région de la diapo, mais ce qui la recouvre est filmé (barre quand elle revient,
 *   petites barres) — les points de participation sont alors masqués pendant l'enregistrement ; ailleurs (Firefox,
 *   Safari), seulement en vue à deux écrans ;
 * - deux écrans : la fenêtre des diapos (celle de la classe), choisie dans la fenêtre de partage du navigateur ; la vue
 *   du professeur n'est jamais filmée ; pendant l'enregistrement, la fenêtre des diapos cache sa barre, ses petites
 *   barres et les points de participation (message `BroadcastChannel`).
 * Micro choisi (`getUserMedia` + `deviceId`, le dernier retenu sur l'appareil), niveau en direct, test de 5 s.
 * « Couper le silence du début » : l'enregistrement attend la voix (rien n'est réencodé) ; la fin n'est pas coupée
 * (voir la note de `couperFin`).
 */

const CLE_MICRO = 'projection:micro'
const CLE_QUALITE = 'projection:qualite-video'
const canalEnregistrement = (c: ChapterContent) => `math-belgium-enregistrement:${c.levelSlug}/${c.slug}`

type Phase = 'repos' | 'reglages' | 'attente' | 'enregistre' | 'pause' | 'fini'
export type ModeCapture = 'element' | 'region' | 'fenetre' | 'aucun'

interface Resultat {
  url: string
  blob: Blob
  duree: number
  chapitres: ChapitreVideo[]
  passages: ChapitreVideo[]
  coupeDebut: number
  date: Date
  extension: string
  qualite: Qualite
  telecharge: boolean
}

function lireLocal(cle: string): string | null {
  try {
    return localStorage.getItem(cle)
  } catch {
    return null
  }
}
function ecrireLocal(cle: string, v: string) {
  try {
    localStorage.setItem(cle, v)
  } catch {
    // rien : le choix vaut pour cette visite
  }
}

/** Mode de capture possible dans ce navigateur et cette fenêtre. */
export function modeCapture(role: Role): ModeCapture {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getDisplayMedia || typeof MediaRecorder === 'undefined') return 'aucun'
  if (role === 'prof') return 'fenetre'
  if ('RestrictionTarget' in window) return 'element'
  if ('CropTarget' in window) return 'region'
  return 'aucun'
}

interface CibleRestriction {
  restrictTo?: (t: unknown) => Promise<void>
  cropTo?: (t: unknown) => Promise<void>
}

/**
 * Enregistrement de la projection : réglages (micro, niveau, test, qualité), capture, pause / reprise, arrêt,
 * chapitres d'après les étapes montrées, résultat.
 */
export function useEnregistrement({ chapter, diapos, index, role, cible }: { chapter: ChapterContent; diapos: DonneesDiapo[]; index: number; role: Role; cible: () => HTMLElement | null }) {
  const [phase, setPhase] = useState<Phase>('repos')
  const [message, setMessage] = useState<string | null>(null)
  const [micros, setMicros] = useState<MicroDisponible[]>([])
  const [micro, setMicro] = useState<string | null>(null)
  const [niveau, setNiveau] = useState<{ barres: number; jugement: JugementNiveau }>({ barres: 0, jugement: 'silence' })
  const [qualite, setQualiteEtat] = useState<Qualite>(() => (lireLocal(CLE_QUALITE) === '720p' ? '720p' : '1080p'))
  const [couperSilences, setCouperSilences] = useState(true)
  const [test, setTest] = useState<{ etat: 'non' | 'encours' | 'fini'; url?: string; jugement?: JugementNiveau }>({ etat: 'non' })
  const [resultat, setResultat] = useState<Resultat | null>(null)
  const mode = useMemo(() => modeCapture(role), [role])

  const micStream = useRef<MediaStream | null>(null)
  const ecran = useRef<MediaStream | null>(null)
  const recorder = useRef<MediaRecorder | null>(null)
  const morceaux = useRef<Blob[]>([])
  const audio = useRef<{ ctx: AudioContext; analyseur: AnalyserNode; donnees: Float32Array<ArrayBuffer> } | null>(null)
  const boucle = useRef<number | null>(null)
  const chrono = useRef({ cumul: 0, depuis: 0, actif: false })
  const debutAttente = useRef(0)
  const coupeDebut = useRef(0)
  const passages = useRef<ChapitreVideo[]>([])
  const testMesure = useRef({ rms: 0, crete: 0 })
  const cibleRestriction = useRef<unknown>(null)
  const phaseRef = useRef(phase)
  phaseRef.current = phase
  const canal = useRef<BroadcastChannel | null>(null)

  const setQualite = (q: Qualite) => {
    setQualiteEtat(q)
    ecrireLocal(CLE_QUALITE, q)
  }

  const ecoule = useCallback(() => chrono.current.cumul + (chrono.current.actif ? (performance.now() - chrono.current.depuis) / 1000 : 0), [])

  // Canal : la fenêtre des diapos cache ses barres et les points pendant l'enregistrement (deux écrans).
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return
    const c = new BroadcastChannel(canalEnregistrement(chapter))
    canal.current = c
    return () => {
      c.close()
      canal.current = null
    }
  }, [chapter])
  const annoncer = useCallback((actif: boolean) => {
    try {
      canal.current?.postMessage({ type: 'enregistrement', actif })
    } catch {
      // rien
    }
  }, [])

  // ---------- micro : flux, niveau en direct ----------

  const arreterMicro = useCallback(() => {
    if (boucle.current !== null) cancelAnimationFrame(boucle.current)
    boucle.current = null
    micStream.current?.getTracks().forEach((t) => t.stop())
    micStream.current = null
    void audio.current?.ctx.close().catch(() => undefined)
    audio.current = null
  }, [])

  const ouvrirMicro = useCallback(
    async (deviceId: string | null) => {
      arreterMicro()
      try {
        const s = await navigator.mediaDevices.getUserMedia({ audio: deviceId ? { deviceId: { exact: deviceId }, echoCancellation: false, noiseSuppression: true, autoGainControl: true } : true })
        micStream.current = s
        const liste = (await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === 'audioinput').map((d) => ({ deviceId: d.deviceId, label: d.label }))
        setMicros(liste)
        const choisi = deviceId ?? microParDefaut(liste, lireLocal(CLE_MICRO)) ?? s.getAudioTracks()[0]?.getSettings().deviceId ?? null
        setMicro(choisi)
        if (!deviceId && choisi && choisi !== s.getAudioTracks()[0]?.getSettings().deviceId) {
          // Le micro proposé d'office n'est pas celui que le navigateur a ouvert : on rouvre le bon.
          return ouvrirMicro(choisi)
        }
        const ctx = new AudioContext()
        const source = ctx.createMediaStreamSource(s)
        const analyseur = ctx.createAnalyser()
        analyseur.fftSize = 2048
        source.connect(analyseur)
        audio.current = { ctx, analyseur, donnees: new Float32Array(analyseur.fftSize) }
        let dernier = 0
        const mesurer = () => {
          const a = audio.current
          if (!a) return
          a.analyseur.getFloatTimeDomainData(a.donnees)
          let somme = 0
          let crete = 0
          for (const v of a.donnees) {
            somme += v * v
            crete = Math.max(crete, Math.abs(v))
          }
          const rms = Math.sqrt(somme / a.donnees.length)
          testMesure.current = { rms: Math.max(testMesure.current.rms, rms), crete: Math.max(testMesure.current.crete, crete) }
          const p = phaseRef.current
          if (p === 'attente' && voixDetectee(rms)) reprendreApresSilence()
          const t = performance.now()
          if (t - dernier > 100) {
            dernier = t
            // Vumètre : seulement pendant les réglages (pendant l'enregistrement, rien ne re-rend la projection).
            if (p === 'reglages') setNiveau({ barres: barresNiveau(rms), jugement: jugerNiveau(rms, crete) })
          }
          boucle.current = requestAnimationFrame(mesurer)
        }
        boucle.current = requestAnimationFrame(mesurer)
        setMessage(null)
      } catch {
        setMessage('Le micro n’est pas accessible : autorise le micro pour ce site (icône dans la barre d’adresse), puis réessaie.')
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [arreterMicro],
  )

  const ouvrir = useCallback(() => {
    setPhase('reglages')
    setTest({ etat: 'non' })
    setMessage(null)
    void ouvrirMicro(null)
    // Cible de la capture préparée tout de suite (asynchrone) : le partage d'écran doit être demandé DANS le clic.
    cibleRestriction.current = null
    const el = cible()
    const w = window as unknown as { RestrictionTarget?: { fromElement: (e: Element) => Promise<unknown> }; CropTarget?: { fromElement: (e: Element) => Promise<unknown> } }
    if (el && mode === 'element') {
      el.classList.add('rec-cible')
      void w.RestrictionTarget!.fromElement(el).then((t) => (cibleRestriction.current = t)).catch(() => undefined)
    } else if (el && mode === 'region') void w.CropTarget!.fromElement(el).then((t) => (cibleRestriction.current = t)).catch(() => undefined)
  }, [ouvrirMicro, cible, mode])

  const choisirMicro = (id: string) => {
    setMicro(id)
    ecrireLocal(CLE_MICRO, id)
    setTest({ etat: 'non' })
    void ouvrirMicro(id)
  }

  const tester = () => {
    const s = micStream.current
    if (!s || test.etat === 'encours') return
    const type = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find((t) => MediaRecorder.isTypeSupported(t))
    const r = new MediaRecorder(s, type ? { mimeType: type } : undefined)
    const bouts: Blob[] = []
    testMesure.current = { rms: 0, crete: 0 }
    r.ondataavailable = (e) => e.data.size && bouts.push(e.data)
    r.onstop = () => {
      const blob = new Blob(bouts, { type: r.mimeType || 'audio/webm' })
      const { rms, crete } = testMesure.current
      setTest({ etat: 'fini', url: URL.createObjectURL(blob), jugement: jugerNiveau(rms * 0.7, crete) })
    }
    r.start()
    setTest({ etat: 'encours' })
    window.setTimeout(() => r.state !== 'inactive' && r.stop(), 5000)
  }

  const fermerReglages = () => {
    arreterMicro()
    cible()?.classList.remove('rec-cible')
    setPhase('repos')
  }

  // ---------- capture ----------

  function reprendreApresSilence() {
    const r = recorder.current
    if (!r || r.state !== 'paused') return
    coupeDebut.current = (performance.now() - debutAttente.current) / 1000
    r.resume()
    chrono.current = { cumul: 0, depuis: performance.now(), actif: true }
    passages.current = passages.current.map((p) => ({ ...p, t: 0 })).slice(-1)
    setPhase('enregistre')
  }

  const nettoyerCapture = useCallback(() => {
    ecran.current?.getTracks().forEach((t) => t.stop())
    ecran.current = null
    arreterMicro()
    cible()?.classList.remove('rec-cible')
    annoncer(false)
  }, [arreterMicro, cible, annoncer])

  const commencer = async () => {
    const q = QUALITES[qualite]
    const type = formatVideo((t) => MediaRecorder.isTypeSupported(t)) ?? (MediaRecorder.isTypeSupported('video/mp4') ? 'video/mp4' : null)
    if (!type) {
      setMessage('Ce navigateur ne sait pas enregistrer de vidéo. Utilise Chrome, Edge ou Firefox récents.')
      return
    }
    if (mode === 'aucun') return
    if (mode === 'fenetre' && !(fenetreDiapos() && !fenetreDiapos()!.closed)) {
      setMessage('Ouvre d’abord la fenêtre des diapos (bouton « Ouvrir la fenêtre des diapos ») : c’est elle qui est filmée.')
      return
    }
    let flux: MediaStream
    try {
      const options: DisplayMediaStreamOptions & Record<string, unknown> = {
        video: { width: { ideal: q.largeur }, height: { ideal: q.hauteur }, frameRate: { ideal: 30, max: 30 } },
        audio: false,
        ...(mode === 'fenetre' ? { selfBrowserSurface: 'exclude', surfaceSwitching: 'exclude' } : { preferCurrentTab: true, selfBrowserSurface: 'include', surfaceSwitching: 'exclude', monitorTypeSurfaces: 'exclude' }),
      }
      flux = await navigator.mediaDevices.getDisplayMedia(options)
    } catch {
      setMessage('Partage refusé : sans ton accord, la page ne peut pas se filmer. Recommence et choisis « Partager ».')
      return
    }
    const piste = flux.getVideoTracks()[0] as MediaStreamTrack & CibleRestriction
    try {
      if (mode === 'element' || mode === 'region') {
        let t = cibleRestriction.current
        const el = cible()
        const w = window as unknown as { RestrictionTarget?: { fromElement: (e: Element) => Promise<unknown> }; CropTarget?: { fromElement: (e: Element) => Promise<unknown> } }
        if (!t && el) t = await (mode === 'element' ? w.RestrictionTarget!.fromElement(el) : w.CropTarget!.fromElement(el))
        if (mode === 'element') await piste.restrictTo!(t)
        else await piste.cropTo!(t)
      }
    } catch {
      flux.getTracks().forEach((x) => x.stop())
      setMessage('Choisis « cet onglet » dans la fenêtre de partage : seule la diapo de cet onglet peut être filmée.')
      return
    }
    ecran.current = flux
    const pistes = [piste, ...(micStream.current?.getAudioTracks() ?? [])]
    const r = new MediaRecorder(new MediaStream(pistes), { mimeType: type, videoBitsPerSecond: q.video, audioBitsPerSecond: DEBIT_VOIX })
    recorder.current = r
    morceaux.current = []
    r.ondataavailable = (e) => {
      if (e.data.size) morceaux.current.push(e.data)
    }
    r.onstop = async () => {
      let blob = new Blob(morceaux.current, { type: type.split(';')[0] })
      const d = Math.max(0, ecoule())
      // Durée écrite dans l'en-tête du WebM (quelques octets ; sinon le lecteur affiche 0:00).
      if (type.startsWith('video/webm')) {
        try {
          const corrigee = teteAvecDuree(new Uint8Array(await blob.slice(0, 65536).arrayBuffer()), d * 1000)
          if (corrigee) blob = new Blob([corrigee, blob.slice(Math.min(65536, blob.size))], { type: blob.type })
        } catch {
          // le fichier reste tel quel
        }
      }
      const tous = passages.current
      setResultat({ url: URL.createObjectURL(blob), blob, duree: d, passages: tous, chapitres: chapitresYouTube(tous, d), coupeDebut: coupeDebut.current, date: new Date(), extension: type.startsWith('video/mp4') ? 'mp4' : 'webm', qualite, telecharge: false })
      chrono.current.actif = false
      setPhase('fini')
      nettoyerCapture()
    }
    // L'utilisateur arrête le partage depuis le navigateur : on arrête l'enregistrement.
    piste.addEventListener('ended', () => {
      if (recorder.current && recorder.current.state !== 'inactive') recorder.current.stop()
    })
    passages.current = []
    coupeDebut.current = 0
    noterPassage(0)
    r.start(1000)
    annoncer(true)
    if (couperSilences) {
      r.pause()
      debutAttente.current = performance.now()
      chrono.current = { cumul: 0, depuis: 0, actif: false }
      setPhase('attente')
    } else {
      chrono.current = { cumul: 0, depuis: performance.now(), actif: true }
      setPhase('enregistre')
    }
    setMessage(null)
  }

  const indexRef = useRef(index)
  indexRef.current = index
  function noterPassage(t: number) {
    const d = diapos[indexRef.current]
    if (!d) return
    const titre = texteBrut(titreCourt(d.section))
    const dernier = passages.current[passages.current.length - 1]
    if (dernier?.titre === titre) return
    passages.current.push({ t, titre })
  }
  // Chapitres : une entrée à chaque changement d'étape montrée.
  useEffect(() => {
    if (phaseRef.current === 'enregistre' || phaseRef.current === 'pause') noterPassage(ecoule())
    else if (phaseRef.current === 'attente') noterPassage(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])

  const basculerPause = () => {
    const r = recorder.current
    if (!r) return
    if (r.state === 'recording') {
      r.pause()
      chrono.current = { cumul: ecoule(), depuis: 0, actif: false }
      setPhase('pause')
    } else if (r.state === 'paused' && phase === 'pause') {
      r.resume()
      chrono.current = { ...chrono.current, depuis: performance.now(), actif: true }
      setPhase('enregistre')
    }
  }
  const arreter = () => {
    const r = recorder.current
    if (phase === 'attente') coupeDebut.current = (performance.now() - debutAttente.current) / 1000
    if (r && r.state !== 'inactive') r.stop()
  }

  const supprimer = () => {
    if (resultat) URL.revokeObjectURL(resultat.url)
    setResultat(null)
    setPhase('repos')
  }
  const telecharger = () => {
    if (!resultat) return
    downloadBlob(resultat.blob, nomFichierVideo(texteBrut(chapter.title), resultat.date, resultat.extension))
    setResultat({ ...resultat, telecharge: true })
  }
  const reenregistrer = () => {
    supprimer()
    ouvrir()
  }

  // Démontage : tout s'arrête (micro, partage).
  useEffect(
    () => () => {
      if (recorder.current && recorder.current.state !== 'inactive') {
        recorder.current.onstop = null
        recorder.current.stop()
      }
      ecran.current?.getTracks().forEach((t) => t.stop())
      micStream.current?.getTracks().forEach((t) => t.stop())
      if (boucle.current !== null) cancelAnimationFrame(boucle.current)
    },
    [],
  )

  const enCours = phase === 'enregistre' || phase === 'pause' || phase === 'attente'
  return {
    phase,
    enCours,
    mode,
    message,
    micros,
    micro,
    niveau,
    qualite,
    setQualite,
    couperSilences,
    setCouperSilences,
    test,
    resultat,
    ecoule,
    ouvrir,
    fermerReglages,
    choisirMicro,
    tester,
    commencer,
    basculerPause,
    arreter,
    supprimer,
    telecharger,
    reenregistrer,
    fermerResultat: () => setPhase('repos'),
  }
}

export type Enregistrement = ReturnType<typeof useEnregistrement>

/** Fenêtre des diapos (deux écrans) : vrai pendant que la vue du professeur l'enregistre. */
export function useEnregistrementDistant(chapter: ChapterContent, actifIci: boolean): boolean {
  const [distant, setDistant] = useState(false)
  useEffect(() => {
    if (actifIci || typeof BroadcastChannel === 'undefined') return
    const c = new BroadcastChannel(canalEnregistrement(chapter))
    c.onmessage = (e: MessageEvent<{ type?: string; actif?: boolean }>) => {
      if (e.data?.type === 'enregistrement') setDistant(!!e.data.actif)
    }
    return () => c.close()
  }, [chapter, actifIci])
  return distant
}

// ---------- barre : bouton, chrono, pause, arrêt ----------

/** Chrono de l'enregistrement : se met à jour seul (deux fois par seconde), sans re-rendre la projection. */
function Chrono({ rec }: { rec: Enregistrement }) {
  const [, setTic] = useState(0)
  useEffect(() => {
    const t = window.setInterval(() => setTic((x) => x + 1), 500)
    return () => window.clearInterval(t)
  }, [])
  return <>{rec.phase === 'attente' ? 'attend ta voix' : formatDuree(rec.ecoule())}</>
}

function PointRouge({ pause }: { pause?: boolean }) {
  return <span className={`rec-point${pause ? ' pause' : ''}`} aria-hidden="true" />
}

/** Bouton de la barre : « ● Enregistrer » ; pendant l'enregistrement « ● 12:47 ⏸ ■ » (arrêt confirmé). */
export function BoutonEnregistrer({ rec, compacte = false }: { rec: Enregistrement; compacte?: boolean }) {
  const [confirmer, setConfirmer] = useState(false)
  if (!rec.enCours)
    return (
      <button
        type="button"
        className={`${compacte ? 'projection-bouton' : 'projection-outil'} rec-bouton${rec.phase === 'reglages' ? ' actif' : ''}`}
        aria-label="Enregistrer la projection en vidéo"
        title="Enregistrer la diapo, tes annotations et ta voix en vidéo (pour YouTube) — rien n'est envoyé au site"
        onClick={rec.ouvrir}
      >
        <PointRouge />
        {compacte && <span>Enregistrer</span>}
      </button>
    )
  return (
    <span className={`rec-barre${rec.phase === 'pause' ? ' pause' : ''}`} role="group" aria-label="Enregistrement en cours">
      <PointRouge pause={rec.phase !== 'enregistre'} />
      <span className="rec-temps" aria-live="off">
        <Chrono rec={rec} />
      </span>
      <button type="button" className="projection-outil rec-mini" aria-label={rec.phase === 'pause' ? 'Reprendre l’enregistrement' : 'Mettre l’enregistrement en pause'} title={rec.phase === 'pause' ? 'Reprendre' : 'Pause'} disabled={rec.phase === 'attente'} onClick={rec.basculerPause}>
        {rec.phase === 'pause' ? (
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 5l12 7-12 7z" fill="currentColor" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor" />
          </svg>
        )}
      </button>
      <button type="button" className="projection-outil rec-mini" aria-label="Arrêter l’enregistrement" title="Arrêter (avec confirmation)" onClick={() => setConfirmer(true)}>
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="5" y="5" width="14" height="14" rx="2" fill="currentColor" />
        </svg>
      </button>
      {confirmer && (
        <span className="rec-confirmer projection-palette" role="alertdialog" aria-label="Arrêter l’enregistrement ?">
          <span>Arrêter l’enregistrement ?</span>
          <button
            type="button"
            className="projection-duree projection-duree--stop"
            autoFocus
            onClick={() => {
              setConfirmer(false)
              rec.arreter()
            }}
          >
            Arrêter
          </button>
          <button type="button" className="projection-duree" onClick={() => setConfirmer(false)}>
            Continuer
          </button>
        </span>
      )}
    </span>
  )
}

/** Petit rappel (point rouge + chrono) quand la barre est masquée — jamais filmé (hors de la diapo). */
export function RappelEnregistrement({ rec, visible }: { rec: Enregistrement; visible: boolean }) {
  if (!rec.enCours || !visible || rec.mode === 'region') return null
  return (
    <span className={`rec-rappel${rec.phase !== 'enregistre' ? ' pause' : ''}`} role="status" aria-label="Enregistrement en cours">
      <PointRouge pause={rec.phase !== 'enregistre'} /> <Chrono rec={rec} />
    </span>
  )
}

// ---------- boîte « Enregistrer la projection en vidéo » ----------

export function DialogueEnregistrer({ rec, chapter }: { rec: Enregistrement; chapter: ChapterContent }) {
  const id = useId()
  if (rec.phase !== 'reglages') return null
  const impossible = rec.mode === 'aucun'
  const titrePage = `Projection — ${texteBrut(chapter.title)}`
  return (
    <div className="rec-voile" role="presentation" onClick={(e) => e.stopPropagation()}>
      <div className="rec-dialogue" role="dialog" aria-modal="true" aria-labelledby={`${id}-t`}>
        <h2 id={`${id}-t`}>Enregistrer la projection en vidéo</h2>
        <p className="rec-sous">La vidéo reste sur cet appareil. Rien n’est envoyé à aucun serveur.</p>
        <div className="rec-colonnes">
          <div>
            <p className="rec-lbl" id={`${id}-m`}>
              Micro
            </p>
            {rec.micros.length === 0 ? (
              <p className="rec-note">{rec.message ?? 'Autorise le micro pour voir la liste des micros de l’appareil…'}</p>
            ) : (
              <div className="rec-micros" role="radiogroup" aria-labelledby={`${id}-m`}>
                {rec.micros
                  .filter((m) => m.deviceId !== 'communications')
                  .map((m, i) => (
                    <label key={m.deviceId || i} className={`rec-micro${rec.micro === m.deviceId ? ' on' : ''}`}>
                      <input type="radio" name={`${id}-micro`} checked={rec.micro === m.deviceId} onChange={() => rec.choisirMicro(m.deviceId)} />
                      <span>{nomMicro(m, i)}</span>
                    </label>
                  ))}
              </div>
            )}
            <p className="rec-lbl">Niveau sonore, en direct</p>
            <div className="rec-niveau">
              <span className="rec-vu" aria-hidden="true">
                {Array.from({ length: 10 }, (_, i) => (
                  <i key={i} className={i < rec.niveau.barres ? (i >= 8 ? 'r' : i >= 6 ? 'j' : 'g') : ''} />
                ))}
              </span>
              <span className={`rec-jugement ${rec.niveau.jugement}`} role="status">
                {MESSAGE_NIVEAU[rec.niveau.jugement]}
              </span>
              <button type="button" className="projection-bouton rec-tester" disabled={rec.test.etat === 'encours' || rec.micros.length === 0} onClick={rec.tester}>
                {rec.test.etat === 'encours' ? 'Parle… (5 s)' : 'Tester (5 s)'}
              </button>
            </div>
            {rec.test.etat === 'fini' && rec.test.url && (
              <div className="rec-test">
                <audio src={rec.test.url} controls autoPlay aria-label="Réécouter le test de 5 secondes" />
                <span className={`rec-jugement ${rec.test.jugement}`}>{rec.test.jugement ? MESSAGE_NIVEAU[rec.test.jugement] : ''}</span>
              </div>
            )}
            <p className="rec-lbl">Qualité</p>
            <div className="rec-qualites" role="radiogroup" aria-label="Qualité">
              {(Object.keys(QUALITES) as Qualite[]).map((q) => (
                <button key={q} type="button" role="radio" aria-checked={rec.qualite === q} className={`projection-duree${rec.qualite === q ? ' on' : ''}`} onClick={() => rec.setQualite(q)}>
                  {QUALITES[q].libelle}
                </button>
              ))}
            </div>
            <label className="rec-case">
              <input type="checkbox" checked={rec.couperSilences} onChange={(e) => rec.setCouperSilences(e.target.checked)} />
              <span>
                <b>Couper le silence du début</b> : l’enregistrement commence quand tu parles (la fin, c’est toi qui l’arrêtes)
              </span>
            </label>
          </div>
          <div>
            <p className="rec-lbl">Ce qui est enregistré</p>
            <ul className="rec-liste">
              <li className="o">la diapo projetée</li>
              <li className="o">tes annotations (stylo, pages blanches, traceur, instruments, exercice au tableau)</li>
              <li className="o">ta voix (le micro choisi)</li>
              <li className="n">jamais la liste des élèves ni les points</li>
              <li className="n">jamais le tirage au sort</li>
              <li className="n">jamais ta vue de professeur ni tes notes</li>
              <li className="n">{rec.mode === 'region' ? 'ni le point rouge (la barre d’outils, si elle revient quand tu bouges la souris, peut apparaître)' : 'ni la barre d’outils, ni le point rouge'}</li>
            </ul>
            <p className="rec-lbl">Ensuite, ton navigateur te demande</p>
            {rec.mode === 'element' || rec.mode === 'region' ? (
              <p className="rec-note">
                de <b>partager cet onglet</b> (« {titrePage} »). C’est obligatoire : sans ton accord, une page ne peut pas se filmer. Choisis cet onglet puis « Partager ».
              </p>
            ) : rec.mode === 'fenetre' ? (
              <p className="rec-note">
                de choisir ce que tu partages : choisis <b>la fenêtre des diapos</b> (« Diapos — {texteBrut(chapter.title)} »), celle de la classe, puis « Partager ». Ta vue de professeur n’est jamais filmée.
              </p>
            ) : (
              <p className="rec-note rec-alerte">
                Ce navigateur ne sait pas filmer seulement la diapo de cet onglet (il faut Chrome ou Edge récents). Ici, l’enregistrement se fait <b>en vue à deux écrans</b> : lance la projection « Deux écrans », puis enregistre depuis la vue du professeur (la fenêtre des diapos est filmée).
              </p>
            )}
          </div>
        </div>
        {rec.message && rec.micros.length > 0 && (
          <p className="rec-alerte" role="alert">
            {rec.message}
          </p>
        )}
        <div className="rec-actions">
          <button type="button" className="projection-bouton" onClick={rec.fermerReglages}>
            Annuler
          </button>
          <button type="button" className="projection-bouton-plein rec-commencer" disabled={impossible} onClick={() => void rec.commencer()}>
            <span className="rec-point blanc" aria-hidden="true" /> Commencer l’enregistrement
          </button>
        </div>
      </div>
    </div>
  )
}

// ---------- « Ta vidéo est prête » ----------

export function DialogueVideoPrete({ rec, chapter }: { rec: Enregistrement; chapter: ChapterContent }) {
  const id = useId()
  const r = rec.resultat
  const video = useRef<HTMLVideoElement>(null)
  const lienCours = `math-belgium.vercel.app/${chapter.levelSlug}/${chapter.slug}`
  const [titre, setTitre] = useState('')
  const [description, setDescription] = useState('')
  const [copie, setCopie] = useState<string | null>(null)
  const [quitter, setQuitter] = useState(false)
  useEffect(() => {
    if (!r) return
    const etapes = r.passages.map((p) => p.titre)
    setTitre(titreVideo(texteBrut(chapter.title), etapes))
    setDescription(descriptionVideo(niveauLisible(chapter.level), r.chapitres, lienCours))
  }, [r, chapter, lienCours])
  if (rec.phase !== 'fini' || !r) return null
  const copier = (quoi: string, texte: string) => {
    void navigator.clipboard?.writeText(texte).then(
      () => setCopie(quoi),
      () => setCopie(null),
    )
  }
  const date = r.date.toLocaleDateString('fr-BE', { weekday: 'long', day: 'numeric', month: 'numeric' })
  const aller = (t: number) => {
    if (video.current) video.current.currentTime = t
  }
  return (
    <div className="rec-voile" role="presentation" onClick={(e) => e.stopPropagation()}>
      <div className="rec-dialogue rec-pret" role="dialog" aria-modal="true" aria-labelledby={`${id}-t`}>
        <h2 id={`${id}-t`}>Ta vidéo est prête</h2>
        <p className="rec-sous">
          {texteBrut(chapter.title)} · {chapter.level} · enregistrée le {date}
          {r.coupeDebut >= 1 ? ` · silence coupé : ${dureeLisible(r.coupeDebut)} au début` : ''}.
        </p>
        <div className="rec-colonnes">
          <div>
            <video ref={video} className="rec-video" src={r.url} controls preload="metadata" aria-label="Aperçu de la vidéo" />
            {r.chapitres.length > 0 && (
              <div className="rec-ligne-temps" aria-label="Changements d’étape (chapitres YouTube)">
                {r.chapitres.map((c, i) => (
                  <button key={i} type="button" className="rec-repere" style={{ left: `${(100 * c.t) / Math.max(1, r.duree)}%` }} title={`${dureeLisible(c.t)} · ${c.titre}`} aria-label={`Aller à ${dureeLisible(c.t)} : ${c.titre}`} onClick={() => aller(c.t)} />
                ))}
              </div>
            )}
            <p className="rec-infos">
              <span>
                Durée <b>{dureeLisible(r.duree)}</b>
              </span>
              <span>
                Poids <b>{poids(r.blob.size)}</b>
              </span>
              <span>
                {r.qualite} · .{r.extension}
              </span>
            </p>
            <button type="button" className="projection-bouton-plein rec-telecharger" onClick={rec.telecharger}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
              </svg>
              Télécharger la vidéo ({poids(r.blob.size)})
            </button>
            <p className="rec-note">
              {r.telecharge ? 'Téléchargée : le fichier est sur cet appareil (dossier Téléchargements). ' : 'Le fichier est enregistré sur cet appareil (dossier Téléchargements). '}
              Rien n’est envoyé à aucun serveur. Si tu fermes sans télécharger, la vidéo est perdue.
            </p>
            <div className="rec-actions gauche">
              <button type="button" className="projection-bouton" onClick={rec.reenregistrer}>
                Réenregistrer
              </button>
              <button type="button" className="projection-bouton rec-supprimer" onClick={rec.supprimer}>
                Supprimer la vidéo
              </button>
              {quitter ? (
                <span className="rec-confirmer-fermer" role="alertdialog" aria-label="Fermer sans télécharger ?">
                  La vidéo n’est pas téléchargée.
                  <button type="button" className="projection-duree projection-duree--stop" onClick={rec.supprimer}>
                    Fermer quand même
                  </button>
                </span>
              ) : (
                <button type="button" className="projection-bouton" onClick={() => (r.telecharge ? rec.fermerResultat() : setQuitter(true))}>
                  Fermer
                </button>
              )}
            </div>
          </div>
          <div className="rec-youtube">
            <h3>
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <rect x="2" y="5" width="20" height="14" rx="4" fill="#c4302b" />
                <path d="M10 9l5 3-5 3z" fill="#fff" />
              </svg>
              Pour YouTube
            </h3>
            <label className="rec-lbl" htmlFor={`${id}-titre`}>
              Titre proposé
            </label>
            <div className="rec-copie">
              <input id={`${id}-titre`} type="text" value={titre} onChange={(e) => setTitre(e.target.value)} maxLength={100} />
              <button type="button" className="projection-bouton" onClick={() => copier('titre', titre)}>
                {copie === 'titre' ? 'Copié' : 'Copier'}
              </button>
            </div>
            <label className="rec-lbl" htmlFor={`${id}-desc`}>
              Description (chapitres d’après les étapes montrées)
            </label>
            <div className="rec-copie">
              <textarea id={`${id}-desc`} value={description} onChange={(e) => setDescription(e.target.value)} rows={9} />
              <button type="button" className="projection-bouton" onClick={() => copier('description', description)}>
                {copie === 'description' ? 'Copié' : 'Copier'}
              </button>
            </div>
            {r.chapitres.length === 0 && <p className="rec-note">Pas de chapitres : YouTube en demande au moins 3, d’au moins 10 secondes, en commençant à 00:00 — ici, il n’y en aurait pas assez.</p>}
            <div className="rec-rappel-rgpd">
              <p>
                <b>La mise en ligne, c’est toi qui la fais</b>, sur YouTube : « Créer › Importer une vidéo », puis colle le titre et la description.
              </p>
              <p>
                <b>Voix ou prénoms d’élèves dans la vidéo ?</b> Il faut l’accord des élèves (et de leurs parents s’ils sont mineurs) et celui de l’école avant de publier (RGPD). Sinon, coupe ces passages ou réenregistre.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
