#include "VenusMissionSubsystem.h"
#include "Subsystems/SubsystemCollection.h"

void UVenusMissionSubsystem::Initialize(FSubsystemCollectionBase& Collection)
{
    Super::Initialize(Collection);
    NewGame(true);
}

void UVenusMissionSubsystem::NewGame(bool bCampaign)
{
    State = FVenusMissionState();
    State.bCampaign = bCampaign;
    State.Credits = bCampaign ? 125 : 170;
    State.Science = bCampaign ? 20 : 36;
    LastMessage = TEXT("Экспедиция HELIOS запущена.");
    AppendEvent(TEXT("Открыт архив закрытой венерианской программы."));
    OnStateChanged.Broadcast();
}

void UVenusMissionSubsystem::AppendEvent(const FString& Message)
{
    State.EventLog.Insert(FString::Printf(TEXT("%d · %s"), State.Year, *Message), 0);
    if (State.EventLog.Num() > 25) State.EventLog.RemoveAt(State.EventLog.Num() - 1);
}

bool UVenusMissionSubsystem::Reject(const FString& Message)
{
    LastMessage = Message;
    return false;
}

bool UVenusMissionSubsystem::Accept(const FString& Message)
{
    LastMessage = Message;
    AppendEvent(Message);
    OnStateChanged.Broadcast();
    return true;
}

bool UVenusMissionSubsystem::HoldScientificCouncil()
{
    if (!State.bCampaign || State.StoryStep != 0 || State.bFinished)
        return Reject(TEXT("Научный совет недоступен."));
    State.StoryStep = 1;
    State.Science += 8;
    return Accept(TEXT("Научный совет согласился изучить материалы."));
}

bool UVenusMissionSubsystem::ChooseFunding(FName Plan)
{
    if (!State.bCampaign || State.StoryStep != 1 || !State.Funding.IsNone() ||
        State.bFinished || (Plan != FName(TEXT("public")) && Plan != FName(TEXT("private"))))
        return Reject(TEXT("Недоступное решение о финансировании."));
    if (Plan == FName(TEXT("public")))
    {
        if (State.Credits < 8) return Reject(TEXT("Не хватает 8 бюджетных единиц."));
        State.Credits -= 8;
        State.Science += 12;
    }
    else
    {
        State.Credits += 36;
        State.Science = FMath::Max(0, State.Science - 6);
    }
    State.Funding = Plan;
    return Accept(TEXT("Выбрана модель финансирования."));
}

bool UVenusMissionSubsystem::SignInternationalTreaty()
{
    if (!State.bCampaign || State.StoryStep != 1 || State.Funding.IsNone() ||
        !HasProject(FName(TEXT("probe"))) || !HasProject(FName(TEXT("relay"))) || State.bFinished)
        return Reject(TEXT("Необходимы финансирование, зонд и ретранслятор."));

    State.StoryStep = 2;
    State.bInternational = true;
    State.Credits += State.Funding == FName(TEXT("public")) ? 65 : 45;
    State.Supplies += State.Funding == FName(TEXT("public")) ? 20 : 8;
    return Accept(TEXT("Международный венерианский консорциум создан."));
}

bool UVenusMissionSubsystem::TryBuildProject(FName ProjectId)
{
    if (State.bFinished || State.CompletedProjects.Contains(ProjectId))
        return Reject(TEXT("Проект уже построен или сценарий завершён."));

    int32 NeedCredits = 0, NeedScience = 0, NeedEnergy = 0, NeedSupplies = 0;
    TArray<FName> Requires;

    if (ProjectId == FName(TEXT("archive"))) { NeedCredits = 12; }
    else if (ProjectId == FName(TEXT("probe"))) { NeedCredits = 24; NeedScience = 6; Requires = { FName(TEXT("archive")) }; }
    else if (ProjectId == FName(TEXT("relay"))) { NeedCredits = 18; NeedEnergy = 4; Requires = { FName(TEXT("archive")) }; }
    else if (ProjectId == FName(TEXT("aerostat"))) { NeedCredits = 40; NeedScience = 12; NeedSupplies = 12; Requires = { FName(TEXT("probe")), FName(TEXT("relay")) }; }
    else if (ProjectId == FName(TEXT("logistics"))) { NeedCredits = 28; NeedEnergy = 6; Requires = { FName(TEXT("relay")) }; }
    else if (ProjectId == FName(TEXT("lab"))) { NeedCredits = 34; NeedScience = 12; NeedSupplies = 6; Requires = { FName(TEXT("aerostat")), FName(TEXT("logistics")) }; }
    else if (ProjectId == FName(TEXT("descent"))) { NeedCredits = 25; NeedScience = 10; Requires = { FName(TEXT("probe")) }; }
    else if (ProjectId == FName(TEXT("lander"))) { NeedCredits = 32; NeedScience = 15; Requires = { FName(TEXT("descent")), FName(TEXT("relay")) }; }
    else return Reject(TEXT("Неизвестный инженерный проект."));

    for (const FName& Required : Requires)
    {
        if (!HasProject(Required)) return Reject(TEXT("Не выполнены предварительные исследования."));
    }
    if (State.Credits < NeedCredits || State.Science < NeedScience ||
        State.Energy < NeedEnergy || State.Supplies < NeedSupplies)
        return Reject(TEXT("Недостаточно ресурсов."));

    State.Credits -= NeedCredits;
    State.Science -= NeedScience;
    State.Energy -= NeedEnergy;
    State.Supplies -= NeedSupplies;
    State.CompletedProjects.Add(ProjectId);

    if (ProjectId == FName(TEXT("probe"))) State.Science += 10;
    if (ProjectId == FName(TEXT("descent"))) State.Science += 8;
    if (ProjectId == FName(TEXT("aerostat"))) State.AerostatCondition = 100;
    return Accept(TEXT("Инженерный проект завершён: ") + ProjectId.ToString());
}

bool UVenusMissionSubsystem::SetOperationPolicy(FName Policy)
{
    if (!HasProject(FName(TEXT("aerostat"))) || State.bFinished ||
        (Policy != FName(TEXT("conserve")) && Policy != FName(TEXT("standard")) && Policy != FName(TEXT("intensive"))))
        return Reject(TEXT("Недоступный эксплуатационный режим."));
    State.Policy = Policy;
    return Accept(TEXT("Режим эксплуатации: ") + Policy.ToString());
}

bool UVenusMissionSubsystem::DispatchSupplies()
{
    if (!HasProject(FName(TEXT("logistics"))) || State.Credits < 16 || State.Energy < 3 || State.bFinished)
        return Reject(TEXT("Нужны грузовая программа, 16 бюджета и 3 энергии."));
    State.Credits -= 16;
    State.Energy -= 3;
    FVenusShipmentState Shipment;
    Shipment.ArrivalTurn = State.Turn + 2;
    Shipment.Supplies = 22;
    State.Shipments.Add(Shipment);
    return Accept(TEXT("Груз отправлен на Венеру."));
}

bool UVenusMissionSubsystem::RepairAerostat()
{
    if (!HasProject(FName(TEXT("aerostat"))) || State.AerostatCondition >= 100 ||
        State.Credits < 12 || State.Supplies < 7 || State.bFinished)
        return Reject(TEXT("Ремонт требует 12 бюджета и 7 снабжения."));
    State.Credits -= 12;
    State.Supplies -= 7;
    State.AerostatCondition = FMath::Min(100, State.AerostatCondition + 35);
    return Accept(TEXT("Ремонт аэростата завершён."));
}

bool UVenusMissionSubsystem::AdvancePeriod()
{
    if (State.bFinished) return Reject(TEXT("Сценарий завершён."));

    ++State.Turn;
    ++State.Year;
    const int32 Income = 13 + (State.bInternational ? 9 : 0);
    State.Credits += Income;
    State.Science += 3 + (HasProject(FName(TEXT("probe"))) ? 2 : 0);
    State.Energy += 3;

    for (int32 Index = State.Shipments.Num() - 1; Index >= 0; --Index)
    {
        if (State.Shipments[Index].ArrivalTurn <= State.Turn)
        {
            State.Supplies += State.Shipments[Index].Supplies;
            State.Shipments.RemoveAt(Index);
            AppendEvent(TEXT("С Земли доставлено снабжение."));
        }
    }

    if (HasProject(FName(TEXT("aerostat"))))
    {
        const bool bLab = HasProject(FName(TEXT("lab")));
        const int32 ConsumedSupplies = !bLab ? 3 : State.Policy == FName(TEXT("conserve")) ? 2 : State.Policy == FName(TEXT("intensive")) ? 8 : 5;
        const int32 ConsumedEnergy = !bLab ? 2 : State.Policy == FName(TEXT("conserve")) ? 1 : State.Policy == FName(TEXT("intensive")) ? 5 : 3;
        const int32 Wear = !bLab ? 4 : State.Policy == FName(TEXT("conserve")) ? 2 : State.Policy == FName(TEXT("intensive")) ? 8 : 4;

        if (State.Supplies >= ConsumedSupplies && State.Energy >= ConsumedEnergy)
        {
            State.Supplies -= ConsumedSupplies;
            State.Energy -= ConsumedEnergy;
            State.AerostatCondition = FMath::Max(0, State.AerostatCondition - Wear);
        }
        else
        {
            State.AerostatCondition = FMath::Max(0, State.AerostatCondition - 22);
            AppendEvent(TEXT("Дефицит расходников или питания: ускоренный износ."));
        }
        if ((State.Turn * 7 + 3) % 13 >= 10)
        {
            State.AerostatCondition = FMath::Max(0, State.AerostatCondition - 13);
            AppendEvent(TEXT("Атмосферный шторм повредил аэростат."));
        }
        State.CriticalYears = State.AerostatCondition == 0 ? State.CriticalYears + 1 : 0;
    }

    if (HasProject(FName(TEXT("lab"))) && State.AerostatCondition >= 40)
        State.Science += State.Policy == FName(TEXT("conserve")) ? 3 : State.Policy == FName(TEXT("intensive")) ? 13 : 8;

    if (HasProject(FName(TEXT("lab"))) && State.AerostatCondition >= 60 &&
        (!State.bCampaign || State.bInternational))
        ++State.StableYears;
    else
        State.StableYears = 0;

    if (State.CriticalYears >= 2)
    {
        State.bFinished = true;
        State.Outcome = FName(TEXT("failure"));
        return Accept(TEXT("Аэростат потерян: миссия сорвана."));
    }
    if (State.StableYears >= 3)
    {
        State.bFinished = true;
        State.Outcome = FName(TEXT("victory"));
        return Accept(TEXT("Создана устойчивая венерианская лаборатория."));
    }
    return Accept(TEXT("Следующий игровой период."));
}

int32 UVenusMissionSubsystem::GetScore() const
{
    const int32 Result = (State.Outcome == FName(TEXT("victory")) ? 300 : 0) +
        State.CompletedProjects.Num() * 25 + State.Science * 2 +
        State.AerostatCondition + State.Credits - (State.Turn - 1) * 8;
    return FMath::Max(0, Result);
}
