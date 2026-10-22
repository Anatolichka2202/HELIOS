import unittest
from helios.sim import Simulation

class SimulationTests(unittest.TestCase):
    def test_deterministic(self):
        a,b=Simulation(),Simulation()
        for sim in (a,b):
            sim.command('research',topic='atmosphere')
            sim.step(7)
            sim.command('build_station')
            sim.step(5)
            sim.command('resolve_crisis',solution='repair')
            sim.command('future',path='terraform')
        self.assertEqual(a.save(),b.save())

    def test_energy_limit(self):
        s=Simulation()
        with self.assertRaises(ValueError):
            s.command('allocate',life=80,science=40)
        self.assertEqual(s.state.life,40)

    def test_save_load(self):
        a=Simulation()
        a.command('research',topic='orbital')
        a.step(9)
        b=Simulation.load(a.save())
        self.assertEqual(a.save(),b.save())
        a.step(4);b.step(4)
        self.assertEqual(a.save(),b.save())

    def test_gates(self):
        s=Simulation()
        with self.assertRaises(ValueError): s.command('future',path='terraform')
        with self.assertRaises(ValueError): s.command('build_station')
        s.step(12)
        self.assertFalse(s.state.crisis)

    def test_both_crisis_paths(self):
        for solution in ('repair','ration'):
            s=Simulation();s.step(12);s.command('build_station');s.step(1)
            s.command('resolve_crisis',solution=solution)
            s.command('future',path='habitats')
            self.assertEqual(s.state.choice,'habitats')

if __name__=='__main__': unittest.main()
