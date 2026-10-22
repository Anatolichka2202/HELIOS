from helios.sim import Simulation

sim=Simulation()
sim.command('research',topic='atmosphere')
sim.step(7)
sim.command('build_station')
sim.step(5)
sim.command('resolve_crisis',solution='repair')
sim.command('future',path='terraform')
print('HELIOS 0.1 — deterministic Venus simulation demo')
print(sim.save())
