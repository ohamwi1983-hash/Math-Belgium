-- =================================================================================================
-- Math-Belgium — carnet de matière vue (phase 2 des comptes professeurs)
-- =================================================================================================
--
-- À exécuter APRÈS 0001_comptes.sql, dans l'éditeur SQL du projet Supabase (SQL Editor → New
-- query → coller TOUT ce fichier → Run). Idempotent : le relancer ne casse rien et ne perd aucune
-- donnée (tables `if not exists`, contraintes ajoutées seulement si absentes, fonctions
-- `create or replace`, politiques et déclencheurs supprimés puis recréés).
--
-- Résultat attendu : « Success. No rows returned ». Le site détecte tout seul les nouvelles
-- tables : la page /carnet passe de « Carnet pas encore activé » au carnet lui-même (recharger la
-- page ; Supabase peut mettre quelques secondes à voir les nouvelles tables).
--
-- Contenu :
--   tables     classes (« 5e B », rattachée à une école DU professeur), seances (classe, date,
--              horaire, chapitre, sections / sous-parties vues, générateurs utilisés, devoir,
--              remarque), carnet_reglages (format d'horaire préféré). AUCUNE donnée d'élève.
--   RLS        partout : chaque professeur ne voit / modifie que SES lignes, compte actif seulement
--              (même fonction `est_actif()` que 0001). L'administrateur ne voit PAS les carnets.
--   cohérence  une classe ne peut pointer que vers une école du même professeur, une séance que
--              vers une classe du même professeur : clés étrangères COMPOSÉES (id, proprietaire)
--              — vérifiées par Postgres lui-même, impossibles à contourner depuis le client, et
--              sans rien révéler des lignes des autres (la clé ne peut viser que ses propres
--              lignes, puisque le RLS impose proprietaire = auth.uid()).
--   suppression  supprimer une école supprime ses classes et leurs séances (cascade) ;
--              `supprimer_mon_compte()` (0001) efface toujours tout : écoles → classes → séances
--              en cascade, et le profil (cascade sur `proprietaire`). Rien à modifier dans 0001.
--
-- Plus tard (PAS fait) : partage entre collègues — une table `partages_classes (classe_id,
-- destinataire, droit)` et des politiques SELECT AJOUTÉES (les politiques ci-dessous ne changent pas).
-- =================================================================================================

-- -------------------------------------------------------------------------------------------------
-- Fonction d'aide : tableau jsonb de textes courts (validation des colonnes jsonb)
-- -------------------------------------------------------------------------------------------------

create or replace function public.tableau_de_textes(j jsonb, max_elements int, max_longueur int)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select jsonb_typeof(j) = 'array'
     and jsonb_array_length(j) <= max_elements
     and not exists (
       select 1 from jsonb_array_elements(j) e
        where jsonb_typeof(e) <> 'string'
           or char_length(e #>> '{}') not between 1 and max_longueur
     );
$$;

-- -------------------------------------------------------------------------------------------------
-- Clé (id, proprietaire) sur ecoles : cible des clés étrangères composées des classes
-- -------------------------------------------------------------------------------------------------

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'ecoles_id_proprietaire_uniq' and conrelid = 'public.ecoles'::regclass) then
    alter table public.ecoles add constraint ecoles_id_proprietaire_uniq unique (id, proprietaire);
  end if;
end;
$$;

-- -------------------------------------------------------------------------------------------------
-- Tables
-- -------------------------------------------------------------------------------------------------

create table if not exists public.classes (
  id           uuid primary key default gen_random_uuid(),
  proprietaire uuid not null default auth.uid() references public.profils (id) on delete cascade,
  ecole_id     uuid not null,
  nom          text not null check (char_length(btrim(nom)) between 1 and 40),
  -- Niveau du site (`levelSlug` : 4e, 5e-4h, 6e-6h…), facultatif : propose les bons chapitres.
  niveau       text check (niveau is null or niveau ~ '^[a-z0-9-]{1,20}$'),
  cree_le      timestamptz not null default now(),
  modifie_le   timestamptz not null default now(),
  constraint classes_id_proprietaire_uniq unique (id, proprietaire),
  -- L'école doit appartenir au MÊME professeur (clé composée) ; la supprimer supprime la classe.
  constraint classes_ecole_du_proprietaire foreign key (ecole_id, proprietaire)
    references public.ecoles (id, proprietaire) on delete cascade
);
comment on table public.classes is 'Carnet de matière vue : classes d''un professeur (« 5e B »), rattachées à une de SES écoles. Aucune donnée d''élève.';
create index if not exists classes_proprietaire_idx on public.classes (proprietaire);
create index if not exists classes_ecole_idx on public.classes (ecole_id, proprietaire);
-- Pas deux classes du même nom dans la même école (casse et espaces ignorés).
create unique index if not exists classes_nom_unique on public.classes (proprietaire, ecole_id, lower(btrim(nom)));

create table if not exists public.seances (
  id           uuid primary key default gen_random_uuid(),
  proprietaire uuid not null default auth.uid() references public.profils (id) on delete cascade,
  classe_id    uuid not null,
  date_seance  date not null default current_date,
  -- Horaire structuré : plage (heure_debut → heure_fin) et/ou numéro d'heure (« 3e heure »).
  heure_debut  time,
  heure_fin    time,
  numero_heure smallint check (numero_heure is null or numero_heure between 1 and 15),
  -- Chapitre du site : /{niveau}/{chapitre}.
  niveau       text not null check (niveau ~ '^[a-z0-9-]{1,20}$'),
  chapitre     text not null check (chapitre ~ '^[a-z0-9-]{1,80}$'),
  -- Sections et sous-parties vues : « sectionId » (section entière) ou « sectionId/sous-partie ».
  parties      jsonb not null default '[]'::jsonb
               check (public.tableau_de_textes(parties, 300, 200) and octet_length(parties::text) <= 30000),
  -- Générateurs utilisés en classe (identifiants : 6gen13, gen7…).
  generateurs  jsonb not null default '[]'::jsonb
               check (public.tableau_de_textes(generateurs, 100, 40)),
  devoir       text not null default '' check (char_length(devoir) <= 2000),
  remarque     text not null default '' check (char_length(remarque) <= 2000),
  cree_le      timestamptz not null default now(),
  modifie_le   timestamptz not null default now(),
  constraint seances_heures_ordonnees check (heure_debut is null or heure_fin is null or heure_fin > heure_debut),
  constraint seances_fin_sans_debut check (heure_fin is null or heure_debut is not null),
  constraint seances_date_raisonnable check (date_seance between date '2000-01-01' and date '2100-12-31'),
  -- La classe doit appartenir au MÊME professeur (clé composée) ; la supprimer supprime ses séances.
  constraint seances_classe_du_proprietaire foreign key (classe_id, proprietaire)
    references public.classes (id, proprietaire) on delete cascade
);
comment on table public.seances is 'Carnet de matière vue : une séance = classe, date, horaire, chapitre, sections / sous-parties vues, générateurs utilisés, devoir, remarque. Aucune donnée d''élève.';
create index if not exists seances_classe_idx on public.seances (classe_id, proprietaire, date_seance desc);
create index if not exists seances_proprietaire_idx on public.seances (proprietaire, date_seance desc);

create table if not exists public.carnet_reglages (
  proprietaire   uuid primary key default auth.uid() references public.profils (id) on delete cascade,
  -- « plage » : 08h50 → 09h40 ; « numero » : 3e heure.
  format_horaire text not null default 'plage' check (format_horaire in ('plage', 'numero')),
  -- Durée d'une heure de cours (minutes), pour proposer la fin de la plage.
  duree_heure    smallint not null default 50 check (duree_heure between 20 and 240),
  modifie_le     timestamptz not null default now()
);
comment on table public.carnet_reglages is 'Réglages du carnet d''un professeur (format d''horaire mémorisé).';

drop trigger if exists classes_modifie_le on public.classes;
create trigger classes_modifie_le before update on public.classes
  for each row execute function public.toucher_modifie_le();
drop trigger if exists seances_modifie_le on public.seances;
create trigger seances_modifie_le before update on public.seances
  for each row execute function public.toucher_modifie_le();
drop trigger if exists carnet_reglages_modifie_le on public.carnet_reglages;
create trigger carnet_reglages_modifie_le before update on public.carnet_reglages
  for each row execute function public.toucher_modifie_le();

-- -------------------------------------------------------------------------------------------------
-- Droits de base : rien pour `anon` ; `authenticated` peut agir, le RLS filtre les lignes.
-- -------------------------------------------------------------------------------------------------

revoke all on public.classes, public.seances, public.carnet_reglages from anon;
revoke all on public.classes, public.seances, public.carnet_reglages from authenticated;
grant select, insert, update, delete on public.classes, public.seances, public.carnet_reglages to authenticated;

revoke all on function public.tableau_de_textes(jsonb, int, int) from public, anon;
grant execute on function public.tableau_de_textes(jsonb, int, int) to authenticated;

-- -------------------------------------------------------------------------------------------------
-- Row Level Security : uniquement ses lignes, compte actif (comme `ecoles` et `plans`).
-- -------------------------------------------------------------------------------------------------

alter table public.classes enable row level security;
alter table public.seances enable row level security;
alter table public.carnet_reglages enable row level security;

drop policy if exists classes_proprietaire on public.classes;
create policy classes_proprietaire on public.classes for all to authenticated
  using (proprietaire = (select auth.uid()) and (select public.est_actif()))
  with check (proprietaire = (select auth.uid()) and (select public.est_actif()));

drop policy if exists seances_proprietaire on public.seances;
create policy seances_proprietaire on public.seances for all to authenticated
  using (proprietaire = (select auth.uid()) and (select public.est_actif()))
  with check (proprietaire = (select auth.uid()) and (select public.est_actif()));

drop policy if exists carnet_reglages_proprietaire on public.carnet_reglages;
create policy carnet_reglages_proprietaire on public.carnet_reglages for all to authenticated
  using (proprietaire = (select auth.uid()) and (select public.est_actif()))
  with check (proprietaire = (select auth.uid()) and (select public.est_actif()));

-- Supabase recharge son cache de schéma à chaque DDL ; on le demande quand même (sans effet ailleurs).
notify pgrst, 'reload schema';
