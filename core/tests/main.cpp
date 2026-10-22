#include "helios/Simulation.h"
#include <iostream>
#include <stdexcept>
#include <string>

using namespace helios;

#define REQUIRE(condition) do { \
    if (!(condition)) { \
        throw std::runtime_error(std::string("Failed: ") + #condition + " at line " + std::to_string(__LINE__)); \
    } \
} while (false)

static void TestCrisis(bool repair)
{
    State s;
    REQUIRE(PowerUsed(s) == 30);
    REQUIRE(!ActivateLaboratory(s));
    REQUIRE(BuildLaboratory(s));
    REQUIRE(!BuildLaboratory(s));
    REQUIRE(ActivateLaboratory(s));
    REQUIRE(PowerUsed(s) == 50);
    for (int i = 0; i < 4; ++i) REQUIRE(Advance(s));
    REQUIRE(s.crisisActive);
    REQUIRE(!Advance(s));
    REQUIRE(ResolveCrisis(s, repair));
    REQUIRE(s.crisisResolved);
    REQUIRE(!ResolveCrisis(s, repair));
    REQUIRE(ResearchAtmosphere(s));
    REQUIRE(Advance(s));
    REQUIRE(ChooseStrategy(s, repair ? Strategy::Terraform : Strategy::Preserve));
    REQUIRE(s.strategy != Strategy::Undecided);
    REQUIRE(!Advance(s));
}

int main()
{
    try {
        TestCrisis(true);   // repair consumes spare materials
        TestCrisis(false);  // evacuation reduces the power capacity
        State insufficient;
        insufficient.materials = 0;
        REQUIRE(!BuildLaboratory(insufficient));
        insufficient.supplies = 3;
        REQUIRE(!Advance(insufficient));
        std::cout << "HELIOS Core: checks passed in Debug and Release\n";
        return 0;
    }
    catch (const std::exception& e) {
        std::cerr << "HELIOS Core test failure: " << e.what() << "\n";
        return 1;
    }
}
