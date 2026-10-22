#include "VenusMissionConsole.h"
#include "VenusMissionSubsystem.h"
#include "Engine/GameInstance.h"
#include "Components/SceneComponent.h"
#include "Components/StaticMeshComponent.h"
#include "UObject/ConstructorHelpers.h"

AVenusMissionConsole::AVenusMissionConsole()
{
    PrimaryActorTick.bCanEverTick = false;
    RootComponent = CreateDefaultSubobject<USceneComponent>(TEXT("Root"));
    ConsoleMesh = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("ConsoleBody"));
    ConsoleMesh->SetupAttachment(RootComponent);
    static ConstructorHelpers::FObjectFinder<UStaticMesh> Cube(TEXT("/Engine/BasicShapes/Cube.Cube"));
    if (Cube.Succeeded()) ConsoleMesh->SetStaticMesh(Cube.Object);
    ConsoleMesh->SetRelativeScale3D(FVector(0.8f, 0.35f, 0.9f));
}

FString AVenusMissionConsole::ReadOperationsReport() const
{
    UGameInstance* Instance = GetGameInstance();
    const UVenusMissionSubsystem* Mission = Instance ?
        Instance->GetSubsystem<UVenusMissionSubsystem>() : nullptr;
    if (!Mission) return TEXT("Нет данных о венерианской миссии.");

    const FVenusMissionState Snapshot = Mission->GetState();
    return FString::Printf(
        TEXT("Венера / %d: аэростат %d%%, энергия %d, снабжение %d, наука %d, режим %s"),
        Snapshot.Year, Snapshot.AerostatCondition, Snapshot.Energy,
        Snapshot.Supplies, Snapshot.Science, *Snapshot.Policy.ToString());
}

bool AVenusMissionConsole::RequestAerostatRepair()
{
    UGameInstance* Instance = GetGameInstance();
    UVenusMissionSubsystem* Mission = Instance ?
        Instance->GetSubsystem<UVenusMissionSubsystem>() : nullptr;
    return Mission ? Mission->RepairAerostat() : false;
}
