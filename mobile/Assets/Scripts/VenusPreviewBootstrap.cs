using UnityEngine;

namespace Helios.Mobile
{
    /// <summary>
    /// Standalone asset-free preview: sphere, light, camera and touchable zone selector.
    /// Place in an empty Unity scene, or enable auto bootstrap in a prototype build.
    /// Not production UX; Unity editor and device build still require verification.
    /// </summary>
    public sealed class VenusPreviewBootstrap : MonoBehaviour
    {
        private VenusRegion selectedRegion = VenusRegion.CloudDeck;
        private Transform planet;
        private Transform marker;

        private void Start()
        {
            var body = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            body.name = "Venus — visual proxy";
            body.transform.localScale = Vector3.one * 5f;
            planet = body.transform;

            var renderer = body.GetComponent<Renderer>();
            if (renderer != null) renderer.material.color = new Color(0.86f, 0.54f, 0.31f);

            var buoy = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            buoy.name = "Atmospheric mission marker";
            buoy.transform.localScale = Vector3.one * 0.24f;
            marker = buoy.transform;
            var buoyRenderer = buoy.GetComponent<Renderer>();
            if (buoyRenderer != null) buoyRenderer.material.color = new Color(0.45f, 0.91f, 0.91f);

            var cameraObject = new GameObject("HELIOS Preview Camera");
            var camera = cameraObject.AddComponent<Camera>();
            camera.clearFlags = CameraClearFlags.SolidColor;
            camera.backgroundColor = new Color(0.025f, 0.047f, 0.09f);
            cameraObject.transform.position = new Vector3(0, 2.0f, -11.5f);
            cameraObject.transform.LookAt(Vector3.zero);
            camera.fieldOfView = 53f;
            camera.nearClipPlane = 0.05f;
            camera.farClipPlane = 1000f;

            var lightObject = new GameObject("Preview Sun");
            var sun = lightObject.AddComponent<Light>();
            sun.type = LightType.Directional;
            sun.intensity = 1.5f;
            lightObject.transform.rotation = Quaternion.Euler(35f, -50f, 0f);
            UpdateMarker();
        }

        private void Update()
        {
            if (planet != null)
                planet.Rotate(Vector3.up, 4f * Time.deltaTime, Space.World);
        }

        private void UpdateMarker()
        {
            if (marker == null) return;
            float distance = selectedRegion == VenusRegion.Orbit ? 4.1f
                : selectedRegion == VenusRegion.CloudDeck ? 2.8f
                : selectedRegion == VenusRegion.LowerAtmosphere ? 2.35f : 2.5f;
            marker.position = new Vector3(0.5f, distance, 0f);
        }

        private void OnGUI()
        {
            float scale = Mathf.Max(0.75f, Screen.width / 390f);
            GUI.matrix = Matrix4x4.Scale(new Vector3(scale, scale, 1));
            GUI.Box(new Rect(12, 20, 350, 142), "HELIOS · VENUS INITIATIVE");
            GUI.Label(new Rect(24, 47, 320, 25), "Кампания / сессия: 4 венерианские зоны");
            for (int i = 0; i < VenusMissionCatalog.Regions.Count; i++)
            {
                var region = VenusMissionCatalog.Regions[i];
                int row = i / 2;
                int col = i % 2;
                if (GUI.Button(new Rect(22 + col * 165, 80 + row * 32, 156, 28), region.Name))
                {
                    selectedRegion = region.Region;
                    UpdateMarker();
                }
            }
            GUI.Box(new Rect(12, 168, 350, 54),
                VenusMissionCatalog.Regions[(int)selectedRegion].Environment);
        }
    }
}
