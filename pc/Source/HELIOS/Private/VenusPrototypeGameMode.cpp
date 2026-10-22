#include "VenusPrototypeGameMode.h"
#include "VenusPrototypeActor.h"
#include "VenusPrototypePlayerController.h"
#include "GameFramework/DefaultPawn.h"
#include "Engine/World.h"
#include "TimerManager.h"
#include "GameFramework/Pawn.h"
#include "GameFramework/PlayerController.h"

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
    World->GetTimerManager().SetTimerForNextTick(this, &AVenusPrototypeGameMode::PositionPreviewCamera);
}

void AVenusPrototypeGameMode::PositionPreviewCamera()
{
    UWorld* World = GetWorld();
    APlayerController* Controller = World ? World->GetFirstPlayerController() : nullptr;
    APawn* Pawn = Controller ? Controller->GetPawn() : nullptr;
    if (!Pawn) return;
    const FVector CameraPosition(-1650.f, -200.f, 650.f);
    Pawn->SetActorLocation(CameraPosition, false, nullptr, ETeleportType::TeleportPhysics);
    Pawn->SetActorRotation((FVector::ZeroVector - CameraPosition).Rotation());
}
