#include "helios/Simulation.h"
namespace helios {
int PowerUsed(const State& s) { return 30 + (s.laboratoryActive ? 20 : 0); }
bool BuildLaboratory(State& s) {
  if (s.laboratoryBuilt || s.materials < 18 || s.crisisActive || s.strategy != Strategy::Undecided) return false;
  s.materials -= 18; s.laboratoryBuilt = true; s.history.push_back("Laboratory built"); return true;
}
bool ActivateLaboratory(State& s) {
  if (!s.laboratoryBuilt || s.laboratoryActive || PowerUsed(s)+20 > s.capacityMW || s.crisisActive) return false;
  s.laboratoryActive = true; s.history.push_back("Laboratory activated"); return true;
}
bool Advance(State& s) {
  if (s.crisisActive || s.strategy != Strategy::Undecided || s.supplies <= 3 || PowerUsed(s)>s.capacityMW) return false;
  ++s.turn; s.supplies -= 3;
  if (s.laboratoryActive) s.knowledge += 4;
  if (s.turn == 4 && !s.crisisResolved) { s.crisisActive = true; s.history.push_back("Compressor failure"); }
  else s.history.push_back("Turn advanced");
  return true;
}
bool ResolveCrisis(State& s, bool repair) {
  if (!s.crisisActive) return false;
  if (repair) { if (s.materials < 15) return false; s.materials -= 15; }
  else { if (s.supplies < 10) return false; s.supplies -= 10; s.capacityMW = 80; }
  s.crisisActive = false; s.crisisResolved = true;
  s.history.push_back(repair ? "Compressor repaired" : "Evacuation completed"); return true;
}
bool ResearchAtmosphere(State& s) {
  if (s.crisisActive || s.atmosphereResearched || s.knowledge < 12 || s.strategy != Strategy::Undecided) return false;
  s.knowledge -= 12; s.atmosphereResearched = true; s.history.push_back("Atmosphere researched"); return true;
}
bool ChooseStrategy(State& s, Strategy choice) {
  if (choice == Strategy::Undecided || s.strategy != Strategy::Undecided || s.turn < 5 || !s.crisisResolved || !s.atmosphereResearched) return false;
  s.strategy = choice; s.history.push_back("Venus strategy chosen; Mercury research unlocked"); return true;
}
}
