using System;
using System.Collections.Generic;

namespace Helios.Mobile
{
    public enum VenusRegion { Orbit, CloudDeck, LowerAtmosphere, Surface }

    [Serializable]
    public sealed class VenusRegionInfo
    {
        public VenusRegion Region;
        public string Name;
        public string Environment;
        public string MainRisk;

        public VenusRegionInfo(VenusRegion region, string name, string environment, string mainRisk)
        {
            Region = region;
            Name = name;
            Environment = environment;
            MainRisk = mainRisk;
        }
    }

    /// <summary>
    /// Shared identifiers must be reconciled with shared/venus-scenario.json.
    /// Visual conditions are simplified and are not a physics simulator.
    /// </summary>
    public static class VenusMissionCatalog
    {
        public static readonly IReadOnlyList<VenusRegionInfo> Regions =
            new List<VenusRegionInfo>
            {
                new VenusRegionInfo(VenusRegion.Orbit, "Орбита",
                    "Связь, доставка, ретранслятор", "Транспортные окна"),
                new VenusRegionInfo(VenusRegion.CloudDeck, "Облачный слой",
                    "Аэростатные платформы ~50–60 км", "Кислотные аэрозоли и ветры"),
                new VenusRegionInfo(VenusRegion.LowerAtmosphere, "Нижняя атмосфера",
                    "Роботизированные исследования", "Нагрев и давление"),
                new VenusRegionInfo(VenusRegion.Surface, "Поверхность",
                    "Кратковременные спускаемые аппараты", "Около 465 °C и 92 бар")
            };
    }
}
