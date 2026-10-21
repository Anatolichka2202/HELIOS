using UnityEngine;
namespace Helios.Mobile
{
    /// <summary>Attach to an empty GameObject. Creates selectable placeholder planets.</summary>
    public sealed class SolarSystemController : MonoBehaviour
    {
        [SerializeField] private float orbitScale = 2f;
        [SerializeField] private float outerSystemCompression = 0.45f;
        private void Start()
        {
            foreach (var body in SolarSystemCatalog.Create())
            {
                var sphere = GameObject.CreatePrimitive(PrimitiveType.Sphere);
                sphere.name = body.DisplayName;
                var distance = Mathf.Log(1f + (float)body.OrbitRadiusAu) * orbitScale;
                sphere.transform.position = new Vector3(distance * outerSystemCompression, 0f, 0f);
                sphere.transform.localScale = Vector3.one * 0.3f;
                var selection = sphere.AddComponent<PlanetSelection>();
                selection.Initialize(body.Id);
            }
        }
    }
    public sealed class PlanetSelection : MonoBehaviour
    {
        private string bodyId;
        public void Initialize(string id) => bodyId = id;
        private void OnMouseDown() => Debug.Log("HELIOS selected: " + bodyId);
    }
}
