using UnrealBuildTool;
using System.Collections.Generic;
public class HELIOSEditorTarget : TargetRules
{
    public HELIOSEditorTarget(TargetInfo Target) : base(Target)
    {
        Type = TargetType.Editor;
        DefaultBuildSettings = BuildSettingsVersion.V5;
        ExtraModuleNames.Add("HELIOS");
    }
}
