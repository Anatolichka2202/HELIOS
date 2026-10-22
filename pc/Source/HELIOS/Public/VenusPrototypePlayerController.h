#pragma once

#include "CoreMinimal.h"
#include "GameFramework/PlayerController.h"
#include "VenusPrototypePlayerController.generated.h"

class UVenusMissionSubsystem;

/**
 * Debug-only first playable PC controls: fly around Venus using DefaultPawn
 * and use these keyboard shortcuts to progress the same mission state.
 * Replace with UMG and input mapping assets when the UE project compiles.
 */
UCLASS()
class HELIOS_API AVenusPrototypePlayerController : public APlayerController
{
    GENERATED_BODY()

protected:
    virtual void BeginPlay() override;
    virtual void SetupInputComponent() override;

private:
    UVenusMissionSubsystem* Mission() const;
    void Report(const FString& Label) const;

    void Council();
    void PublicFunding();
    void BuildArchive();
    void BuildProbe();
    void BuildRelay();
    void Treaty();
    void BuildAerostat();
    void BuildLogistics();
    void BuildLab();
    void Dispatch();
    void Repair();
    void NextPeriod();
    void CyclePolicy();
};
