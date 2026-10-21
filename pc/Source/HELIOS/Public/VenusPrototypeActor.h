#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "VenusPrototypeActor.generated.h"

class UStaticMeshComponent;
class UPointLightComponent;

/**
 * Asset-free visual scaffolding for the Venus campaign.
 * Render units are intentionally NOT planetary-scale physics units.
 */
UCLASS()
class HELIOS_API AVenusPrototypeActor : public AActor
{
    GENERATED_BODY()

public:
    AVenusPrototypeActor();

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="HELIOS")
    TObjectPtr<UStaticMeshComponent> Planet;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="HELIOS")
    TObjectPtr<UStaticMeshComponent> Aerostat;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="HELIOS")
    TObjectPtr<UStaticMeshComponent> Relay;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="HELIOS")
    TObjectPtr<UPointLightComponent> Sunlight;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="HELIOS|Prototype")
    float PlanetPreviewRadius = 500.f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="HELIOS|Prototype")
    float AtmospherePreviewOffset = 42.f;

protected:
    virtual void OnConstruction(const FTransform& Transform) override;
};
