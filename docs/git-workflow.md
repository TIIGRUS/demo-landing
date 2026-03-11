# Git Workflow

---

## Проблема: develop всегда на 1 коммит впереди master

При использовании стратегии **"Create a merge commit"** возникает цикл:

```
develop: A → B → C
PR develop → master: создаётся merge-коммит M на master
master: A → B → C → M
Синхронизация develop с master: создаётся merge-коммит M2 на develop
develop: A → B → C → M → M2  ← снова впереди на 1 коммит
```

---

## Решение

### 1. Стратегия слияния PR

При мерже PR в `master` всегда выбирать **"Squash and merge"** вместо "Create a merge commit".

### 2. Разовый сброс develop (выполняется один раз)

```bash
git checkout develop
git fetch origin
git reset --hard origin/master
git push --force
```

> `push --force` требует временно отключить "Restrict force pushes" в настройках ветки:
> **Settings → Rules → Rulesets → develop → Restrict force pushes**

### 3. Настройки репозитория (опционально)

**Settings → General → Pull Requests** — снять галку с "Allow merge commits", оставить только "Allow squash merging".

---

## Порядок действий при наличии открытых PR

| Ситуация | Действие |
| --- | --- |
| PR с реальными изменениями (feature → develop) | Смержить до сброса |
| PR без изменений (develop → master, Files changed: 0) | Закрыть, не мержить |

---

## Итоговый workflow

```
feature-branch → develop  (PR, Squash and merge)
develop → master           (PR, Squash and merge)
```

Ветки остаются на одном уровне, история линейная.
