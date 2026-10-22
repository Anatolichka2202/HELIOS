#include "VenusPrototypeGameMode.h"
#include "VenusPrototypeActor.h"
#include "VenusPrototypePlayerController.h"
#include "GameFramework/DefaultPawn.h"
#include "Engine/World.h"

AVenusPrototypeGameMode::AVenusPrototypeGameMode()
{
    PlayerControllerClass = AVenusPrototypePlayerController::StaticClass();
    DefaultPawnClass = ADefaultPawn::StaticClass();
}

void AVenusPrototypeGameMode::BeginPlay()
{
    Super::BeginPlay();

    UWorld* World = GetWorld();
    if (!World) return;
    FActorSpawnParameters Params;
    Params.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AlwaysSpawn;
    World->SpawnActor<AVenusPrototypeActor>(AVenusPrototypeActor::StaticClass(),
        FVector::ZeroVector, FRotator::ZeroRotator, Params);
}
