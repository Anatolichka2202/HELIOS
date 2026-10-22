#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "VenusMissionConsole.generated.h"

class UStaticMeshComponent;

/**
 * Place this inside a future walkable station.
 * An interaction trace/Blueprint can call ReadOperationsReport or RequestRepair.
 * Both camera modes use the same GameInstance mission, never duplicated state.
 */
UCLASS()
class HELIOS_API AVenusMissionConsole : public AActor
{
    GENERATED_BODY()

public:
    AVenusMissionConsole();

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="HELIOS|Interaction")
    TObjectPtr<UStaticMeshComponent> ConsoleMesh;

    UFUNCTION(BlueprintPure, Category="HELIOS|Interaction")
    FString ReadOperationsReport() const;

    UFUNCTION(BlueprintCallable, Category="HELIOS|Interaction")
    bool RequestAerostatRepair();
};
