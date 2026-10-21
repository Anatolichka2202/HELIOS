#pragma once
#include <cstdint>
#include <string>
#include <vector>
namespace helios {
enum class Structure { Habitat, Laboratory, Workshop, Scanner };
enum class Strategy { Undecided, Preserve, Terraform };
struct State {
  int turn = 0;
  int materials = 65;
  int supplies = 50;
  int knowledge = 0;
  int capacityMW = 100;
  bool laboratoryBuilt = false;
  bool laboratoryActive = false;
  bool atmosphereResearched = false;
  bool crisisActive = false;
  bool crisisResolved = false;
  Strategy strategy = Strategy::Undecided;
  std::vector<std::string> history;
};
int PowerUsed(const State& state);
bool BuildLaboratory(State& state);
bool ActivateLaboratory(State& state);
bool Advance(State& state);
bool ResolveCrisis(State& state, bool repair);
bool ResearchAtmosphere(State& state);
bool ChooseStrategy(State& state, Strategy choice);
}
