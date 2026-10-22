using System;
using UnityEditor;
using UnityEngine;

namespace Helios.Mobile.Editor
{
    /// <summary>Unity-side regression check. Runs in the editor; not verified here.</summary>
    public static class HeliosScenarioSelfCheck
    {
        [MenuItem("HELIOS/Run Venus Model Smoke Tests")]
        public static void Run()
        {
            var mission = new VenusSessionModel(true);
            Check(!mission.Build("aerostat"), "aerostat must be gated");
            Check(mission.Council(), "scientific council");
            Check(mission.Fund("public"), "open financing");
            Check(mission.Build("archive"), "archive");
            Check(mission.Build("probe"), "atmospheric probe");
            Check(mission.Build("relay"), "orbital relay");
            Check(mission.Treaty(), "international treaty");
            Check(mission.Build("aerostat"), "first aerostat");
            Check(mission.Build("logistics"), "Earth supply");
            Check(mission.Build("lab"), "cloud lab");
            Check(mission.SetPolicy("standard"), "operation policy");
            Check(mission.Dispatch(), "transport launch");
            Check(mission.Next(), "first operating period");
            Check(mission.Next(), "second operating period");
            Check(mission.Next(), "third operating period");
            Check(mission.State.Finished && mission.State.Outcome == "victory", "campaign victory");
            Check(mission.Score() > 300, "score");

            var sandbox = new VenusSessionModel(false);
            Check(sandbox.State.Credits == 170, "session budget");
            Check(!sandbox.Treaty(), "story gates apply only to campaign");
            Check(sandbox.Build("archive"), "sandbox project");
            Check(sandbox.State.Completed.Count == 1, "unique projects");

            Debug.Log("HELIOS Unity Venus model smoke checks passed. Editor compile is not a device build.");
        }

        private static void Check(bool result, string name)
        {
            if (!result) throw new InvalidOperationException("HELIOS smoke test failed: " + name);
        }
    }
}
