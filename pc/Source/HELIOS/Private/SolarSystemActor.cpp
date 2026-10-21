#include "SolarSystemActor.h"
#include "Components/StaticMeshComponent.h"
#include "Components/SceneComponent.h"
#include "UObject/ConstructorHelpers.h"
ASolarSystemActor::ASolarSystemActor() { PrimaryActorTick.bCanEverTick = false; RootComponent = CreateDefaultSubobject<USceneComponent>(TEXT("Root")); }
void ASolarSystemActor::OnConstruction(const FTransform& Transform) { Super::OnConstruction(Transform); RebuildSolarSystem(); }
void ASolarSystemActor::RebuildSolarSystem()
{
    for (auto* Mesh : Planets) { if (IsValid(Mesh)) Mesh->DestroyComponent(); }
    Planets.Empty();
    static const TCHAR* Names[] = { TEXT("Mercury"), TEXT("Venus"), TEXT("Earth"), TEXT("Mars"), TEXT("Jupiter"), TEXT("Saturn"), TEXT("Uranus"), TEXT("Neptune") };
    static const float AU[] = { .387f, .723f, 1.f, 1.524f, 5.203f, 9.537f, 19.191f, 30.07f };
    UStaticMesh* Sphere = LoadObject<UStaticMesh>(nullptr, TEXT("/Engine/BasicShapes/Sphere.Sphere"));
    if (!Sphere) return;
    for (int32 i = 0; i < 8; ++i)
    {
        auto* Mesh = NewObject<UStaticMeshComponent>(this, FName(Names[i]));
        Mesh->SetStaticMesh(Sphere);
        Mesh->SetupAttachment(GetRootComponent());
        Mesh->RegisterComponent();
        AddInstanceComponent(Mesh);
        const float Radius = FMath::Loge(1.f + AU[i]) * OrbitScale; // display only, not real orbital physics
        Mesh->SetRelativeLocation(FVector(Radius, 0.f, 0.f));
        Mesh->SetWorldScale3D(FVector(PlanetScale / 100.f));
        Planets.Add(Mesh);
    }
}