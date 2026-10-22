"""HELIOS 0.1: deterministic, dependency-free Venus simulation prototype."""
from dataclasses import dataclass, asdict
import json

@dataclass
class State:
    tick: int = 0
    energy_capacity: int = 100
    life: int = 40
    science: int = 25
    industry: int = 20
    supplies: int = 100
    parts: int = 25
    knowledge: int = 0
    station: bool = False
    crisis: bool = False
    crisis_resolved: bool = False
    choice: str = ""
    research: str = ""
    log: tuple = ()

class Simulation:
    def __init__(self, state=None):
        self.state = state or State()

    def record(self, message):
        self.state.log += (f"T{self.state.tick}: {message}",)

    def command(self, action, **kwargs):
        s = self.state
        if action == 'allocate':
            vals = [kwargs.get(k, getattr(s,k)) for k in ('life','science','industry')]
            if any(not isinstance(v,int) or v<0 for v in vals) or sum(vals)>s.energy_capacity:
                raise ValueError('Invalid energy allocation')
            s.life,s.science,s.industry = vals
            self.record('Energy allocation updated')
        elif action == 'research':
            topic = kwargs.get('topic')
            if topic not in ('atmosphere','industry','orbital'):
                raise ValueError('Unknown research')
            s.research = topic
            self.record(f'Research focus: {topic}')
        elif action == 'build_station':
            if s.station or s.parts<15 or s.knowledge<12:
                raise ValueError('Station prerequisites not met')
            s.parts-=15
            s.station=True
            self.record('Aphrodite-1 commissioned')
        elif action == 'resolve_crisis':
            solution=kwargs.get('solution')
            if not s.crisis or s.crisis_resolved or solution not in ('repair','ration'):
                raise ValueError('Crisis resolution unavailable')
            if solution=='repair':
                if s.parts<8: raise ValueError('Insufficient parts')
                s.parts-=8
            else:
                s.supplies=max(0,s.supplies-15)
            s.crisis_resolved=True
            self.record(f'Crisis resolved via {solution}')
        elif action == 'future':
            path=kwargs.get('path')
            if path not in ('habitats','terraform') or not s.station or not s.crisis_resolved:
                raise ValueError('Future choice locked')
            s.choice=path
            self.record(f'Venus program: {path}; Mercury program unlocked for future releases')
        else:
            raise ValueError('Unknown command')

    def step(self, count=1):
        if not isinstance(count,int) or not 0<=count<=10000: raise ValueError('Invalid steps')
        s=self.state
        for _ in range(count):
            s.tick+=1
            if s.life<30:
                s.supplies=max(0,s.supplies-3)
            else:
                s.supplies=max(0,s.supplies-1)
            if s.science>=20 and s.supplies>0:
                s.knowledge+=2 if s.research else 1
            if s.industry>=20 and s.supplies>0 and s.tick%3==0:
                s.parts+=2
            if s.station and not s.crisis and s.tick>=12:
                s.crisis=True
                self.record('Atmospheric compressor failure: repair or ration')

    def save(self):
        return json.dumps(asdict(self.state),ensure_ascii=False,sort_keys=True)

    @classmethod
    def load(cls,data):
        raw=json.loads(data)
        raw['log']=tuple(raw['log'])
        return cls(State(**raw))
