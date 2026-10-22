using System.IO;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;

namespace Helios.Mobile.Editor
{
    public static class HeliosSceneCreator
    {
        [MenuItem("HELIOS/Create Venus Playable Scene")]
        public static void Create()
        {
            const string folder = "Assets/Scenes";
            const string path = "Assets/Scenes/VenusPrototype.unity";
            if (!Directory.Exists(folder)) Directory.CreateDirectory(folder);

            var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
            var root = new GameObject("HELIOS Venus Mission");
            root.AddComponent<VenusPlayableBootstrap>();
            EditorSceneManager.SaveScene(scene, path);

            EditorBuildSettings.scenes = new[] {
                new EditorBuildSettingsScene(path, true)
            };
            AssetDatabase.Refresh();
            Debug.Log("HELIOS Venus playable scene created: " + path);
            EditorSceneManager.OpenScene(path);
        }
    }
}
