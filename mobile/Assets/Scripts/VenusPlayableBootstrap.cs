using UnityEngine;

namespace Helios.Mobile
{
    /// <summary>
    /// Fully local playable engineering vertical slice, using built-in Unity primitives.
    /// Add this component to an empty GameObject in a Unity 6 scene.
    /// OnGUI is temporary prototype UI; replace with UI Toolkit/uGUI for production.
    /// </summary>
    public sealed class VenusPlayableBootstrap : MonoBehaviour
    {
        private const string SaveKey = "HELIOS_VENUS_MOBILE_V1";
        private VenusSessionModel game;
        private GameObject planet;
        private GameObject aerostat;
        private GameObject laboratory;
        private Vector2 scroll;
        private GUIStyle titleStyle;
        private GUIStyle hintStyle;

        private void Start()
        {
            Application.targetFrameRate = 30;
            game = new VenusSessionModel();

            string existing = PlayerPrefs.GetString(SaveKey, "");
            if (!string.IsNullOrEmpty(existing)) {
                try {
                    var state = JsonUtility.FromJson<VenusGameState>(existing);
                    game.Restore(state);
                } catch {
                    // Malformed or older saves cannot block the prototype from starting.
                    game.Start(true);
                }
            }

            planet = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            planet.name = "Venus";
            planet.transform.localScale = Vector3.one * 5.2f;
            var bodyRenderer = planet.GetComponent<Renderer>();
            bodyRenderer.material.color = new Color(0.88f, 0.56f, 0.36f);

            aerostat = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            aerostat.name = "Venus Aerostat";
            aerostat.transform.localScale = new Vector3(0.85f, 0.45f, 0.45f);
            aerostat.transform.position = new Vector3(1.4f, 2.7f, -0.8f);
            aerostat.GetComponent<Renderer>().material.color = new Color(0.94f, 0.79f, 0.57f);

            laboratory = GameObject.CreatePrimitive(PrimitiveType.Cube);
            laboratory.name = "Cloud Laboratory";
            laboratory.transform.localScale = new Vector3(0.35f, 0.2f, 0.3f);
            laboratory.transform.position = new Vector3(1.4f, 2.35f, -0.8f);
            laboratory.GetComponent<Renderer>().material.color = new Color(0.4f, 0.86f, 0.92f);

            var cameraObject = new GameObject("Venus Campaign Camera");
            var camera = cameraObject.AddComponent<Camera>();
            camera.clearFlags = CameraClearFlags.SolidColor;
            camera.backgroundColor = new Color(0.025f, 0.049f, 0.084f);
            cameraObject.transform.position = new Vector3(3f, 1.7f, -11f);
            cameraObject.transform.LookAt(Vector3.zero);
            camera.fieldOfView = 57f;
            camera.nearClipPlane = 0.05f;

            var keyLight = new GameObject("Preview Sun");
            var source = keyLight.AddComponent<Light>();
            source.type = LightType.Directional;
            source.intensity = 1.4f;
            keyLight.transform.rotation = Quaternion.Euler(32f, -55f, 0f);
            RefreshWorld();
        }

        private void RefreshWorld()
        {
            if (game == null || aerostat == null || laboratory == null) return;
            aerostat.SetActive(game.Has("aerostat"));
            laboratory.SetActive(game.Has("lab"));
            if (game.Has("aerostat")) {
                float state = game.State.Condition / 100f;
                aerostat.GetComponent<Renderer>().material.color =
                    Color.Lerp(new Color(0.85f, 0.27f, 0.2f), new Color(0.94f, 0.79f, 0.57f), state);
            }
        }

        private void PersistAndRefresh()
        {
            try {
                PlayerPrefs.SetString(SaveKey, JsonUtility.ToJson(game.State));
                PlayerPrefs.Save();
            } catch {
                Debug.LogWarning("HELIOS: could not persist local Venus state.");
            }
            RefreshWorld();
        }

        private void Update()
        {
            if (planet != null) planet.transform.Rotate(Vector3.up, Time.deltaTime * 1.5f, Space.World);
        }

        private void OnGUI()
        {
            if (game == null) return;
            float scale = Mathf.Max(0.85f, Screen.width / 430f);
            GUI.matrix = Matrix4x4.Scale(new Vector3(scale, scale, 1f));
            float width = Mathf.Min(410f, Screen.width / scale - 22f);
            float availableHeight = Screen.height / scale - 26f;

            if (titleStyle == null) {
                titleStyle = new GUIStyle(GUI.skin.label) { fontSize = 21, fontStyle = FontStyle.Bold, wordWrap = true };
                titleStyle.normal.textColor = new Color(0.98f, 0.88f, 0.67f);
                hintStyle = new GUIStyle(GUI.skin.label) { fontSize = 13, wordWrap = true };
                hintStyle.normal.textColor = new Color(0.84f, 0.91f, 0.96f);
            }

            GUILayout.BeginArea(new Rect(11f, 10f, width, availableHeight), GUI.skin.box);
            scroll = GUILayout.BeginScrollView(scroll);
            GUILayout.Label("HELIOS · VENUS INITIATIVE", titleStyle);
            GUILayout.Label("Unity — ранний интерактивный прототип · версия 0.1", hintStyle);
            GUILayout.Space(7);
            GUILayout.Label((game.State.Campaign ? "КАМПАНИЯ" : "СЕССИЯ") + " · " + game.State.Year + " · ХОД " + game.State.Turn);
            GUILayout.Label("Бюджет " + game.State.Credits + "  •  Наука " + game.State.Science);
            GUILayout.Label("Энергия " + game.State.Energy + "  •  Снабжение " + game.State.Supplies);
            GUILayout.Label(game.Has("aerostat") ? "Состояние аэростата: " + game.State.Condition + "%" : "Аэростат ещё не построен.");
            GUILayout.Label("Устойчивых периодов: " + game.State.StableYears + "/3");
            GUILayout.Space(7);

            if (GUILayout.Button("Кампания · начать заново", GUILayout.Height(40))) {
                game.Start(true);PersistAndRefresh();
            }
            if (GUILayout.Button("Свободная сессия · начать заново", GUILayout.Height(40))) {
                game.Start(false);PersistAndRefresh();
            }

            if (game.State.Finished) {
                GUILayout.Label(game.State.Outcome == "victory" ? "ПОБЕДА — станция устойчива" : "ПОРАЖЕНИЕ — аэростат потерян", titleStyle);
                GUILayout.Label("Итоговая оценка: " + game.Score());
            } else {
                DrawCampaign();
                DrawProjects();
                DrawOperations();
                if (GUILayout.Button("Следующий игровой период →", GUILayout.Height(47))) {
                    game.Next();PersistAndRefresh();
                }
            }

            GUILayout.Space(8);
            GUILayout.Label(game.LastMessage, hintStyle);
            if (game.State.Log.Count > 0) {
                GUILayout.Label("Журнал:");
                for (int i=0; i<Mathf.Min(4,game.State.Log.Count);i++)
                    GUILayout.Label("• " + game.State.Log[i], hintStyle);
            }

            GUILayout.EndScrollView();
            GUILayout.EndArea();
        }

        private void DrawCampaign()
        {
            if (!game.State.Campaign) return;
            GUILayout.Space(10);
            GUILayout.Label("СЮЖЕТ: ЗАКРЫТАЯ ПРОГРАММА", titleStyle);
            if (game.State.StoryStep == 0) {
                GUILayout.Label("Молодой российский инженер намерен возродить секретный советский проект Венеры.", hintStyle);
                if (GUILayout.Button("Убедить научный совет", GUILayout.Height(42))) {
                    game.Council();PersistAndRefresh();
                }
            } else if (game.State.StoryStep == 1) {
                if (string.IsNullOrEmpty(game.State.Funding)) {
                    GUILayout.Label("Выберите, кому доверить финансирование:", hintStyle);
                    if (GUILayout.Button("Открытые исследования", GUILayout.Height(42))) {
                        game.Fund("public");PersistAndRefresh();
                    }
                    if (GUILayout.Button("Частные инвестиции", GUILayout.Height(42))) {
                        game.Fund("private");PersistAndRefresh();
                    }
                } else if (GUILayout.Button("Пригласить международных партнёров", GUILayout.Height(42))) {
                    game.Treaty();PersistAndRefresh();
                }
            } else GUILayout.Label("Международный консорциум открыт. Поддержите облачную инфраструктуру.", hintStyle);
        }

        private void DrawProjects()
        {
            GUILayout.Space(8);
            GUILayout.Label("СТРОИТЕЛЬСТВО И ИССЛЕДОВАНИЯ", titleStyle);
            foreach (var project in VenusSessionModel.Projects) {
                if (game.Has(project.Id)) continue;
                if (game.CanBuild(project)) {
                    if (GUILayout.Button(project.Name + " · " + project.Credits + " бюджета", GUILayout.Height(42))) {
                        game.Build(project.Id);PersistAndRefresh();
                    }
                }
            }
        }

        private void DrawOperations()
        {
            if (!game.Has("aerostat")) return;
            GUILayout.Space(8);
            GUILayout.Label("ЭКСПЛУАТАЦИЯ АЭРОСТАТА", titleStyle);
            if (GUILayout.Button("Экономный режим", GUILayout.Height(38))) { game.SetPolicy("conserve");PersistAndRefresh(); }
            if (GUILayout.Button("Штатный режим", GUILayout.Height(38))) { game.SetPolicy("standard");PersistAndRefresh(); }
            if (GUILayout.Button("Интенсивные исследования", GUILayout.Height(38))) { game.SetPolicy("intensive");PersistAndRefresh(); }
            if (game.State.Condition < 100 && GUILayout.Button("Ремонт (12 бюджета / 7 расходников)", GUILayout.Height(42))) {
                game.Repair();PersistAndRefresh();
            }
            if (game.Has("logistics") && GUILayout.Button("Отправить груз (+22 через 2 хода)", GUILayout.Height(42))) {
                game.Dispatch();PersistAndRefresh();
            }
        }
    }
}
