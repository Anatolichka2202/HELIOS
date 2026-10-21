using UnrealBuildTool;
using System.Collections.Generic;
public class HELIOSTarget : TargetRules
{
    public HELIOSTarget(TargetInfo Target) : base(Target)
    {
        Type = TargetType.Game;
        DefaultBuildSettings = BuildSettingsVersion.V5;
        ExtraModuleNames.Add("HELIOS");
    }
}
