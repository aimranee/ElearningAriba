# Contribuer

Ce document décrit le flux de livraison de ce dépôt : de la branche à la mise en
production.

## Flux de livraison

1. **Branche de fonctionnalité** — tout le travail se fait sur une branche créée
   à partir de `main`, jamais directement sur `main`.
2. **Déploiement de prévisualisation** — pousser la branche déclenche un
   déploiement de prévisualisation en HTTPS, une fois le dépôt connecté côté
   hébergement.
3. **Pull request** — une pull request ciblant `main` déclenche le workflow
   `CI`, qui doit être vert.
4. **Fusion dans `main`** — la fusion dans `main` déploie la production.

## Format des commits

```
#<type>: <une phrase>
```

Types acceptés : `feat`, `fix`, `refactor`, `chore`, `docs`.

## Dépendance externe — gestion des accès d'hébergement

Deux réglages appartiennent à la partie propriétaire des comptes
d'hébergement et ne peuvent pas être appliqués depuis ce dépôt :

- **Activer la protection de branche sur `main`**, exigeant le succès du job
  `quality` du workflow `CI` avant toute fusion.
- **Exiger une pull request plutôt qu'un push direct** sur `main`.

Tant que cette règle n'est pas activée, le workflow `CI` remonte un statut
mais ne bloque rien : c'est la moitié restante, externe, de l'exigence
SOCLE-05.
