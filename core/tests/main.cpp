#include "helios/Simulation.h"
#include <cassert>
#include <iostream>
using namespace helios;
int main() {
  State s;
  assert(!ActivateLaboratory(s));
  assert(BuildLaboratory(s));
  assert(ActivateLaboratory(s));
  for (int i=0;i<4;++i) assert(Advance(s));
  assert(s.crisisActive);
  assert(!Advance(s));
  assert(ResolveCrisis(s,true));
  assert(ResearchAtmosphere(s));
  assert(Advance(s));
  assert(ChooseStrategy(s,Strategy::Terraform));
  assert(s.strategy==Strategy::Terraform);
  assert(!Advance(s));
  std::cout << "HELIOS core smoke test passed\n";
}
