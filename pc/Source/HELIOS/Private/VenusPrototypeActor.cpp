#include "VenusPrototypeActor.h"
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
