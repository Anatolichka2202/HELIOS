#include "VenusPrototypeActor.h"
#include "VenusMissionSubsystem.h"
#include "Engine/GameInstance.h"
#include "Components/SceneComponent.h"
#include "Components/StaticMeshComponent.h"
#include "Components/PointLightComponent.h"
#include "UObject/ConstructorHelpers.h"

AVenusPrototypeActor::AVenusPrototypeActor()
{
    PrimaryActorTick.bCanEverTick = false;
    RootComponent = CreateDefaultSubobject<USceneComponent>(TEXT("VenusRoot"));
    Planet = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("VenusPlanet"));
    Aerostat = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("CloudHabitatMarker"));
    Relay = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("OrbitalRelayMarker"));
    Sunlight = CreateDefaultSubobject<UPointLightComponent>(TEXT("PreviewIllumination"));
    Planet->SetupAttachment(RootComponent);
    Aerostat->SetupAttachment(RootComponent);
    Relay->SetupAttachment(RootComponent);
    Sunlight->SetupAttachment(RootComponent);

    static ConstructorHelpers::FObjectFinder<UStaticMesh> SphereMesh(TEXT("/Engine/BasicShapes/Sphere.Sphere"));
    if (SphereMesh.Succeeded())
    {
        Planet->SetStaticMesh(SphereMesh.Object);
        Aerostat->SetStaticMesh(SphereMesh.Object);
        Relay->SetStaticMesh(SphereMesh.Object);
    }

    Planet->SetCollisionEnabled(ECollisionEnabled::NoCollision);
    Aerostat->SetCollisionEnabled(ECollisionEnabled::NoCollision);
    Relay->SetCollisionEnabled(ECollisionEnabled::NoCollision);
    Sunlight->SetIntensity(45000.f);
    Sunlight->SetAttenuationRadius(4500.f);
}

void AVenusPrototypeActor::OnConstruction(const FTransform& Transform)
{
    Super::OnConstruction(Transform);
    const float Radius = FMath::Max(50.f, PlanetPreviewRadius);
    Planet->SetRelativeScale3D(FVector(Radius / 50.f));
    Aerostat->SetRelativeScale3D(FVector(0.36f));
    Aerostat->SetRelativeLocation(FVector(0.f, 0.f, Radius + AtmospherePreviewOffset));
    Relay->SetRelativeScale3D(FVector(0.22f));
    Relay->SetRelativeLocation(FVector(Radius + 260.f, 0.f, 80.f));
    Sunlight->SetRelativeLocation(FVector(-Radius * 2.f, Radius, Radius));
}

void AVenusPrototypeActor::BeginPlay()
{
    Super::BeginPlay();
    if (UGameInstance* Instance = GetGameInstance())
    {
        if (UVenusMissionSubsystem* Mission = Instance->GetSubsystem<UVenusMissionSubsystem>())
        {
            Mission->OnStateChanged.AddDynamic(this, &AVenusPrototypeActor::RefreshVisualState);
        }
    }
    RefreshVisualState();
}

void AVenusPrototypeActor::RefreshVisualState()
{
    UGameInstance* Instance = GetGameInstance();
    UVenusMissionSubsystem* Mission = Instance ? Instance->GetSubsystem<UVenusMissionSubsystem>() : nullptr;
    if (!Mission) return;

    const FVenusMissionState Snapshot = Mission->GetState();
    const bool bAerostat = Snapshot.CompletedProjects.Contains(FName(TEXT("aerostat")));
    const bool bRelay = Snapshot.CompletedProjects.Contains(FName(TEXT("relay")));

    Aerostat->SetVisibility(bAerostat, true);
    Relay->SetVisibility(bRelay, true);

    if (bAerostat)
    {
        // Simple physical health cue; material swapping comes in a later scene pass.
        const float Integrity = FMath::Clamp(Snapshot.AerostatCondition / 100.f, 0.0f, 1.0f);
        Aerostat->SetRelativeScale3D(FVector(0.25f + 0.12f * Integrity));
    }
}
