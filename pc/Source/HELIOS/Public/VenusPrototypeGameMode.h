#pragma once

#include "CoreMinimal.h"
#include "GameFramework/GameModeBase.h"
#include "VenusPrototypeGameMode.generated.h"

/** Spawns the Venus demo and uses the debug keyboard mission controller. */
UCLASS()
class HELIOS_API AVenusPrototypeGameMode : public AGameModeBase
{
    GENERATED_BODY()
public:
    AVenusPrototypeGameMode();
protected:
    virtual void BeginPlay() override;
private:
    void PositionPreviewCamera();
};
