using System;
using System.Collections.Generic;
namespace Helios.Mobile
{
    [Serializable]
    public sealed class CelestialBody
    {
        public string Id;
        public string DisplayName;
        public double MassKg;
        public double OrbitRadiusAu;
        public CelestialBody(string id, string displayName, double massKg, double orbitRadiusAu)
        { Id=id; DisplayName=displayName; MassKg=massKg; OrbitRadiusAu=orbitRadiusAu; }
    }
    public static class SolarSystemCatalog
    {
        public static IReadOnlyList<CelestialBody> Create() => new List<CelestialBody>
        {
            new CelestialBody("mercury", "Меркурий", 3.3011e23, 0.387),
            new CelestialBody("venus", "Венера", 4.8675e24, 0.723),
            new CelestialBody("earth", "Земля", 5.9722e24, 1.0),
            new CelestialBody("mars", "Марс", 6.4171e23, 1.524),
            new CelestialBody("jupiter", "Юпитер", 1.8982e27, 5.203),
            new CelestialBody("saturn", "Сатурн", 5.6834e26, 9.537),
            new CelestialBody("uranus", "Уран", 8.6810e25, 19.191),
            new CelestialBody("neptune", "Нептун", 1.02413e26, 30.07)
        };
    }
}
