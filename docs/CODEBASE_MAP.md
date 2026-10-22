# HELIOS — карта кодовой базы

Статус: инвентаризация обновлена 23.10.2026, после Venus 0.7. Основная ветка `main`, репозиторий `Anatolichka2202/HELIOS`.

## Цель и границы

**HELIOS** — будущая стратегия обо всей Солнечной системе. Первый доступный вертикальный срез — **Венера**, и кампания, и сессия. PC, Mobile и Lite — разные продукты одной вселенной, а не три готовых сборки одной игры.

## Куда относится каждый основной файл

| Путь | Владелец подсистемы | Назначение | Реальный статус |
|---|---|---|---|
| `lite/sw.js`, `lite/manifest.webmanifest`, `lite/assets/helios-icon.svg` | Web PWA | Офлайн-кэш и установка браузерного клиента (после HTTPS) | Source committed, device test pending |
| `lite/index.html` | Web UI | Разметка игры: вступление, зоны, проекты, решения, журнал | Активный клиент |
| `lite/style.css` | Web UI / Art | Адаптивный мобильный интерфейс, фон, панели и кнопки | Активный клиент |
| `lite/assets/venus-clouds.svg` | Web Art | Векторный арт облачной Венеры и аэростата | Активный ассет |
| `lite/game.js` | Web UI Controller | События DOM, обновление отображения, режимы и локальное сохранение | Активный клиент |
| `lite/engine.js` | Lite Simulation | Детерминированные правила: ресурсы, стройка, финансирование, рейсы, износ, поражение/победа | Активное ядро **только Lite** |
| `lite/tests/*.test.cjs` | Lite QA | Проверки экономики, сохранений, режимов, договоров, JSON-контракта и экранов | Автоматические тесты |
| `lite/package.json` | Lite Dev | Команды `npm run check` и `npm test`, без runtime-пакетов | Активная конфигурация |
| `shared/venus-scenario.json` | Data Contract | Идентификаторы зон и проектов, ресурсы и ограничения | Контракт, **не подключён** напрямую к PC/Mobile |
| `pc/HELIOS.uproject` | PC / Unreal | Точка входа Unreal Editor | Исходники, сборка UE не подтверждена |
| `pc/Source/HELIOS.Target.cs`, `HELIOSEditor.Target.cs` | PC Build | Build targets игры и редактора | Не проверены в UE Editor |
| `pc/Source/HELIOS/HELIOS.Build.cs`, `Private/HELIOS.cpp` | PC Build | Unreal module и зависимости движка | Не проверены в UE Editor |
| `pc/Source/HELIOS/Public/VenusMissionSubsystem.h`, `Private/VenusMissionSubsystem.cpp` | PC Domain | GameInstance: общие ресурсы, сделки, стройка, груз, ремонт, финал | Исходник UE, компиляция не проверена |
| `pc/Source/HELIOS/Public/VenusPrototypeGameMode.h`, `Private/VenusPrototypeGameMode.cpp` | PC Runtime | Запуск игрового мира с венерианской сценой | Исходник UE, компиляция не проверена |
| `pc/Source/HELIOS/Public/VenusPrototypePlayerController.h`, `Private/VenusPrototypePlayerController.cpp` | PC Controls | Отладочные команды клавиатуры | Исходник UE, компиляция не проверена |
| `pc/Source/HELIOS/Public/VenusMissionConsole.h`, `Private/VenusMissionConsole.cpp` | PC First-person integration | Терминал читает тот же mission state, может выполнять ремонт | Исходник UE, компиляция не проверена |
| `pc/Source/HELIOS/Public/VenusPrototypeActor.h`, `Private/VenusPrototypeActor.cpp` | PC View | Венера, условный аэростат и ретранслятор в 3D | Заготовка сцены, не игра |
| `pc/Source/HELIOS/Public/SolarSystemActor.h`, `Private/SolarSystemActor.cpp` | PC / Future | Демонстрация восьми планет | Долгосрочный эксперимент, не венерианская сцена |
| `mobile/Assets/Scripts/VenusSessionModel.cs` | Mobile Domain | Собственная локальная C# Венера: стройка, снабжение, износ, режимы, сюжеты и финалы | Исходник, Unity compile не проверен |
| `mobile/Assets/Scripts/VenusPlayableBootstrap.cs` | Mobile Client | Игровая 3D-заготовка с временным OnGUI, PlayerPrefs, управлением симуляцией | Интерактивный исходник, Android/iOS не собраны |
| `mobile/Assets/Editor/HeliosSceneCreator.cs` | Mobile Tooling | Генерация стартовой игровой сцены через меню Unity Editor | Не проверено в Unity |
| `mobile/Assets/Scripts/VenusMissionCatalog.cs` | Mobile / Data | Каталог четырёх венерианских операционных зон | Начальный C# источник |
| `mobile/Assets/Scripts/VenusPreviewBootstrap.cs` | Mobile View | Создаёт заглушку 3D-планеты, камеру, свет, debug-переключение зон | Unity-прототип без сборки |
| `mobile/Assets/Scripts/SolarSystemCatalog.cs` | Mobile / Future | Каталог восьми планет | Задел полной франшизы |
| `mobile/Assets/Scripts/SolarSystemController.cs` | Mobile / Future | Восемь примитивов и выбор планеты | Устаревающий учебный экран |
| `core/include/helios/Simulation.h`, `core/src/Simulation.cpp` | Research Core | Отдельная C++17-модель Венеры: лаборатория, авария и выбор будущего | Компилируемый исследовательский код; не связан с Lite/UE |
| `core/tests/main.cpp`, `core/CMakeLists.txt` | Core QA / Build | Smoke-тест и CMake | Локальный компилятор и CTest доступны |
| `archive/p1-python/` | History | Самый ранний Python reference simulator и пять тестов | Историческая реализация, не production |
| `archive/lite-0.1/` | History | Первый отдельный HTML-прототип | Историческая версия, не production |
| `archive/lite-0.2/` | History | Реестр раннего логистического этапа | Исходный ZIP 0.2 ещё не импортирован полностью как отдельный снимок |
| `design/VENUS_CAMPAIGN.md` | Narrative | Завязка СССР → Россия → международная программа | Сценарный план |
| `design/VENUS_NARRATIVE_PRODUCTION.md` | Narrative | Кинематографическая завязка, характер героя, сцены | Production brief |
| `design/VENUS_VERTICAL_SLICE.md` | Product | Критерии приёмки венерианского прототипа | Спецификация |
| `design/originals/` | Design History | Исходные GDD, Mercury/Venus, ТЗ и ADR | Историческая документация |
| `.github/workflows/check.yml` | CI | Проверки Lite и C++ | Конфигурация Actions |
| `.github/workflows/pages.yml` | CI/CD | Пакетирование Lite и публикация GitHub Pages | Публикация требует разрешённой Pages и успешного workflow |

## Поток управления в Lite

```text
Игрок (кнопка)
  → game.js: сбор команды
  → engine.js: apply(state, command)
      → валидация затрат и требований
      → новое состояние / ошибка
  → game.js: сохранение в localStorage
  → game.js: отрисовка зон, ресурсов, событий
```

В `engine.js` нет обращения к DOM; он тестируется без браузера. Именно **сюда** добавлять новые правила игры, а не в `game.js`.

## Хранение данных

- **Правила и ID**: `shared/venus-scenario.json` — желаемый источник правды; сейчас литералы временно дублируются в `lite/engine.js`. Тесты проверяют совпадение ключевых полей.
- **Состояние текущей партии**: объект в `engine.js`, сериализуется в `localStorage` с ключом `helios-venus-v4`. Нет синхронизации между устройствами.
- **Сюжетные тексты**: пока в `lite/game.js`, концепция в `design/`. Следующая задача — перенести контент в версионированные JSON с локализациями.
- **Визуальные ассеты**: `lite/assets/`, описание происхождения и статуса — `assets/ASSET_REGISTER.md`.
- **Тесты**: отдельно от игрового кода, нельзя менять правила без обновления сценарных проверок.

## Что не должно происходить

- Не превращать `archive/` в библиотеку runtime-кода.
- Не выдавать самостоятельный C++ research prototype из `core/` за движок, уже подключённый к Unreal и Unity.
- Не переписывать экономику в каждом клиенте независимо без общей спецификации.
- Не считать UI-сферы в Unity и Unreal готовой 3D-игрой.
- Не утверждать, что GitHub Projects board существует: пока задачи живут в GitHub Issues.

## Локальные команды

```sh
cd lite && npm run check && npm test
cmake -S core -B build/helios-core && cmake --build build/helios-core
ctest --test-dir build/helios-core --output-on-failure
cd archive/p1-python && python -m unittest discover -s tests -v
```

GitHub Pages: `Settings → Pages → Build and deployment → GitHub Actions`; реальный мобильный тест проводится после успешной публикации.

## Дополнение: Lite 0.7 vs native

Version 0.7 is **implemented in the browser only**: `lite/engine.js` owns new dynamic aerostat construction costs, scheduled commissioning, pending acid-front choices, novel chemistry prototype, and different endings. `shared/venus-scenario.json` version 5 records it under `liteExperimentalV07` explicitly to prevent false native parity. `mobile/VenusSessionModel.cs` and `pc/VenusMissionSubsystem.cpp` retain their earlier implementation and must not be described as already supporting these new mechanics.

Player-facing QA and routes: [Venus playtest v0.7](PLAYTEST_VENUS_0_7.md).
