using System;
using System.Collections.Generic;

namespace Helios.Mobile
{
    // The Venus campaign and sandbox share one local deterministic game model.
    // This is F1 scaffolding for Unity: source rules should ultimately be generated
    // from shared/venus-scenario.json and verified with cross-platform golden tests.
    [Serializable]
    public sealed class VenusDelivery
    {
        public int ArrivalTurn;
        public int Supplies;

        public VenusDelivery(int arrivalTurn, int supplies)
        {
            ArrivalTurn = arrivalTurn;
            Supplies = supplies;
        }
    }

    [Serializable]
    public sealed class VenusGameState
    {
        public int Version = 1;
        public bool Campaign = true;
        public int Turn = 1;
        public int Year = 2034;
        public int Credits = 125;
        public int Science = 20;
        public int Energy = 25;
        public int Supplies = 32;
        public int Condition;
        public int StableYears;
        public int CriticalYears;
        public int StoryStep;
        public bool International;
        public bool Finished;
        public string Outcome = "";
        public string Funding = "";
        public string Policy = "standard";
        public string Zone = "orbit";
        public List<string> Completed = new List<string>();
        public List<VenusDelivery> Deliveries = new List<VenusDelivery>();
        public List<string> Log = new List<string>();
    }

    public sealed class VenusProject
    {
        public readonly string Id;
        public readonly string Name;
        public readonly string Zone;
        public readonly string[] Requirements;
        public readonly int Credits;
        public readonly int Science;
        public readonly int Energy;
        public readonly int Supplies;

        public VenusProject(string id, string name, string zone, string[] requirements,
            int credits = 0, int science = 0, int energy = 0, int supplies = 0)
        {
            Id = id;
            Name = name;
            Zone = zone;
            Requirements = requirements;
            Credits = credits;
            Science = science;
            Energy = energy;
            Supplies = supplies;
        }
    }

    public sealed class VenusSessionModel
    {
        public static readonly VenusProject[] Projects = {
            new VenusProject("archive", "Архив программы", "orbit", Array.Empty<string>(), 12),
            new VenusProject("probe", "Атмосферный зонд", "clouds", new[] { "archive" }, 24, 6),
            new VenusProject("relay", "Ретранслятор", "orbit", new[] { "archive" }, 18, 0, 4),
            new VenusProject("aerostat", "Первый аэростат", "clouds", new[] { "probe", "relay" }, 40, 12, 0, 12),
            new VenusProject("logistics", "Грузовая программа", "orbit", new[] { "relay" }, 28, 0, 6),
            new VenusProject("lab", "Облачная лаборатория", "clouds", new[] { "aerostat", "logistics" }, 34, 12, 0, 6),
            new VenusProject("descent", "Спускаемый аппарат", "lower", new[] { "probe" }, 25, 10),
            new VenusProject("lander", "Поверхностный модуль", "surface", new[] { "descent", "relay" }, 32, 15)
        };

        public VenusGameState State { get; private set; }
        public string LastMessage { get; private set; }

        public VenusSessionModel(bool campaign = true)
        {
            Start(campaign);
        }

        public void Start(bool campaign)
        {
            State = new VenusGameState {
                Campaign = campaign,
                Credits = campaign ? 125 : 170,
                Science = campaign ? 20 : 36
            };
            LastMessage = "Экспедиция HELIOS запущена.";
            AppendLog("Найден архив венерианской программы.");
        }

        public bool Restore(VenusGameState value)
        {
            if (value == null || value.Version != 1 || value.Completed == null || value.Deliveries == null ||
                value.Log == null || value.Credits < 0 || value.Science < 0 || value.Energy < 0 ||
                value.Supplies < 0 || value.Condition < 0 || value.Condition > 100 || value.Turn < 1)
                return false;

            State = value;
            LastMessage = "Партия восстановлена.";
            return true;
        }

        public bool Has(string id) => State.Completed.Contains(id);

        public bool CanBuild(VenusProject project)
        {
            if (project == null || State.Finished || Has(project.Id) ||
                State.Credits < project.Credits || State.Science < project.Science ||
                State.Energy < project.Energy || State.Supplies < project.Supplies)
                return false;

            foreach (var requirement in project.Requirements)
                if (!Has(requirement)) return false;
            return true;
        }

        public bool Build(string projectId)
        {
            VenusProject project = Array.Find(Projects, p => p.Id == projectId);
            if (!CanBuild(project))
                return Reject("Недостаточно ресурсов или проект пока заблокирован.");

            State.Credits -= project.Credits;
            State.Science -= project.Science;
            State.Energy -= project.Energy;
            State.Supplies -= project.Supplies;
            State.Completed.Add(project.Id);
            if (project.Id == "probe") State.Science += 10;
            if (project.Id == "descent") State.Science += 8;
            if (project.Id == "aerostat") State.Condition = 100;

            return Accept("Построено: " + project.Name);
        }

        public bool Council()
        {
            if (!State.Campaign || State.StoryStep != 0 || State.Finished)
                return Reject("Слушания недоступны.");
            State.StoryStep = 1;
            State.Science += 8;
            return Accept("Научный совет согласился провести испытания.");
        }

        public bool Fund(string plan)
        {
            if (!State.Campaign || State.StoryStep != 1 || !string.IsNullOrEmpty(State.Funding) ||
                State.Finished || (plan != "public" && plan != "private"))
                return Reject("Финансирование сейчас изменить нельзя.");
            if (plan == "public" && State.Credits < 8)
                return Reject("Нужны 8 бюджетных единиц.");
            State.Funding = plan;
            if (plan == "public") {
                State.Credits -= 8;
                State.Science += 12;
            } else {
                State.Credits += 36;
                State.Science = Math.Max(0, State.Science - 6);
            }
            return Accept("Выбрана модель финансирования: " + plan);
        }

        public bool Treaty()
        {
            if (!State.Campaign || State.StoryStep != 1 || string.IsNullOrEmpty(State.Funding) ||
                !Has("probe") || !Has("relay") || State.Finished)
                return Reject("Нужны финансирование, зонд и ретранслятор.");
            State.International = true;
            State.StoryStep = 2;
            State.Credits += State.Funding == "public" ? 65 : 45;
            State.Supplies += State.Funding == "public" ? 20 : 8;
            return Accept("Международная программа открыта.");
        }

        public bool Dispatch()
        {
            if (!Has("logistics") || State.Credits < 16 || State.Energy < 3 || State.Finished)
                return Reject("Для рейса нужны грузовая программа, бюджет и энергия.");
            State.Credits -= 16;
            State.Energy -= 3;
            State.Deliveries.Add(new VenusDelivery(State.Turn + 2, 22));
            return Accept("Груз отправлен, срок: два игровых хода.");
        }

        public bool Repair()
        {
            if (!Has("aerostat") || State.Condition >= 100 || State.Credits < 12 ||
                State.Supplies < 7 || State.Finished)
                return Reject("Для ремонта нужны 12 бюджета и 7 снабжения.");
            State.Credits -= 12;
            State.Supplies -= 7;
            State.Condition = Math.Min(100, State.Condition + 35);
            return Accept("Ремонт завершён.");
        }

        public bool SetPolicy(string policy)
        {
            if (!Has("aerostat") || State.Finished ||
                (policy != "conserve" && policy != "standard" && policy != "intensive"))
                return Reject("Недоступный режим.");
            State.Policy = policy;
            return Accept("Эксплуатационный режим: " + policy);
        }

        public bool Next()
        {
            if (State.Finished) return Reject("Сценарий завершён. Начните новую игру.");

            State.Turn++;
            State.Year++;
            State.Credits += 13 + (State.International ? 9 : 0);
            State.Science += 3 + (Has("probe") ? 2 : 0);
            State.Energy += 3;

            for (int index = State.Deliveries.Count - 1; index >= 0; index--) {
                if (State.Deliveries[index].ArrivalTurn <= State.Turn) {
                    State.Supplies += State.Deliveries[index].Supplies;
                    State.Deliveries.RemoveAt(index);
                    AppendLog("Доставлен груз с Земли.");
                }
            }

            if (Has("aerostat")) {
                bool lab = Has("lab");
                int supplyUse = lab ? (State.Policy == "conserve" ? 2 : State.Policy == "intensive" ? 8 : 5) : 3;
                int powerUse = lab ? (State.Policy == "conserve" ? 1 : State.Policy == "intensive" ? 5 : 3) : 2;
                int wear = lab ? (State.Policy == "conserve" ? 2 : State.Policy == "intensive" ? 8 : 4) : 4;
                if (State.Supplies >= supplyUse && State.Energy >= powerUse) {
                    State.Supplies -= supplyUse;
                    State.Energy -= powerUse;
                    State.Condition = Math.Max(0, State.Condition - wear);
                } else {
                    State.Condition = Math.Max(0, State.Condition - 22);
                    AppendLog("Нет энергии или расходников: ускоренный износ.");
                }
                if ((State.Turn * 7 + 3) % 13 >= 10) {
                    State.Condition = Math.Max(0, State.Condition - 13);
                    AppendLog("Атмосферный шторм повредил станцию.");
                }
                State.CriticalYears = State.Condition == 0 ? State.CriticalYears + 1 : 0;
            }

            if (Has("lab") && State.Condition >= 40)
                State.Science += State.Policy == "conserve" ? 3 : State.Policy == "intensive" ? 13 : 8;

            if (Has("lab") && State.Condition >= 60 && (!State.Campaign || State.International))
                State.StableYears++;
            else
                State.StableYears = 0;

            if (State.CriticalYears >= 2) {
                State.Finished = true;
                State.Outcome = "failure";
                return Accept("Миссия сорвана. Аэростат потерян.");
            }
            if (State.StableYears >= 3) {
                State.Finished = true;
                State.Outcome = "victory";
                return Accept("Устойчивая исследовательская программа создана.");
            }
            return Accept("Следующий игровой период.");
        }

        public int Score()
        {
            int result = (State.Outcome == "victory" ? 300 : 0) + State.Completed.Count * 25 +
                         State.Science * 2 + State.Condition + State.Credits - (State.Turn - 1) * 8;
            return Math.Max(0, result);
        }

        private bool Reject(string text) { LastMessage = text; return false; }
        private bool Accept(string text) { LastMessage = text; AppendLog(text); return true; }

        private void AppendLog(string text)
        {
            State.Log.Insert(0, State.Year + " · " + text);
            if (State.Log.Count > 25) State.Log.RemoveAt(State.Log.Count - 1);
        }
    }
}
