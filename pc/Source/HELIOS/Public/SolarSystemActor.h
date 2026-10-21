#pragma once
#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "SolarSystemActor.generated.h"
UCLASS()
class HELIOS_API ASolarSystemActor : public AActor
{
    GENERATED_BODY()
public:
    ASolarSystemActor();
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="HELIOS") float OrbitScale = 1200.f;
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="HELIOS") float PlanetScale = 75.f;
    UFUNCTION(CallInEditor, Category="HELIOS") void RebuildSolarSystem();
protected:
    virtual void OnConstruction(const FTransform& Transform) override;
private:
    UPROPERTY(Transient) TArray<TObjectPtr<class UStaticMeshComponent>> Planets;
};