#include "VenusPrototypePlayerController.h"
#include "VenusMissionSubsystem.h"
#include "Engine/Engine.h"
#include "Engine/GameInstance.h"
#include "InputCoreTypes.h"

void AVenusPrototypePlayerController::BeginPlay()
{
    Super::BeginPlay();
    Report(TEXT("1 council | 2 funding | 3 archive | 4 probe | 5 relay | 6 treaty | 7 aerostat | 8 logistics | 9 lab | Q ship | E repair | R policy | N next"));
}

UVenusMissionSubsystem* AVenusPrototypePlayerController::Mission() const
{
    UGameInstance* Instance = GetGameInstance();
    return Instance ? Instance->GetSubsystem<UVenusMissionSubsystem>() : nullptr;
}

void AVenusPrototypePlayerController::Report(const FString& Label) const
{
    if (!GEngine) return;
    const UVenusMissionSubsystem* M = Mission();
    const FString Status = M ? M->GetLastMessage() : TEXT("No active Venus mission");
    const FVenusMissionState S = M ? M->GetState() : FVenusMissionState();
    const FString Line = FString::Printf(
        TEXT("%s | %s | Year %d | Credits %d | Science %d | Supplies %d | Aerostat %d%%"),
        *Label, *Status, S.Year, S.Credits, S.Science, S.Supplies, S.AerostatCondition);
    GEngine->AddOnScreenDebugMessage(-1, 7.f, FColor::Cyan, Line);
}

void AVenusPrototypePlayerController::SetupInputComponent()
{
    Super::SetupInputComponent();
    if (!InputComponent) return;
    InputComponent->BindKey(EKeys::One, IE_Pressed, this, &AVenusPrototypePlayerController::Council);
    InputComponent->BindKey(EKeys::Two, IE_Pressed, this, &AVenusPrototypePlayerController::PublicFunding);
    InputComponent->BindKey(EKeys::Three, IE_Pressed, this, &AVenusPrototypePlayerController::BuildArchive);
    InputComponent->BindKey(EKeys::Four, IE_Pressed, this, &AVenusPrototypePlayerController::BuildProbe);
    InputComponent->BindKey(EKeys::Five, IE_Pressed, this, &AVenusPrototypePlayerController::BuildRelay);
    InputComponent->BindKey(EKeys::Six, IE_Pressed, this, &AVenusPrototypePlayerController::Treaty);
    InputComponent->BindKey(EKeys::Seven, IE_Pressed, this, &AVenusPrototypePlayerController::BuildAerostat);
    InputComponent->BindKey(EKeys::Eight, IE_Pressed, this, &AVenusPrototypePlayerController::BuildLogistics);
    InputComponent->BindKey(EKeys::Nine, IE_Pressed, this, &AVenusPrototypePlayerController::BuildLab);
    InputComponent->BindKey(EKeys::Q, IE_Pressed, this, &AVenusPrototypePlayerController::Dispatch);
    InputComponent->BindKey(EKeys::E, IE_Pressed, this, &AVenusPrototypePlayerController::Repair);
    InputComponent->BindKey(EKeys::N, IE_Pressed, this, &AVenusPrototypePlayerController::NextPeriod);
    InputComponent->BindKey(EKeys::R, IE_Pressed, this, &AVenusPrototypePlayerController::CyclePolicy);
}

void AVenusPrototypePlayerController::Council() { if (auto* M = Mission()) { M->HoldScientificCouncil(); Report(TEXT("Council")); } }
void AVenusPrototypePlayerController::PublicFunding() { if (auto* M = Mission()) { M->ChooseFunding(FName(TEXT("public"))); Report(TEXT("Funding")); } }
void AVenusPrototypePlayerController::BuildArchive() { if (auto* M = Mission()) { M->TryBuildProject(FName(TEXT("archive"))); Report(TEXT("Archive")); } }
void AVenusPrototypePlayerController::BuildProbe() { if (auto* M = Mission()) { M->TryBuildProject(FName(TEXT("probe"))); Report(TEXT("Probe")); } }
void AVenusPrototypePlayerController::BuildRelay() { if (auto* M = Mission()) { M->TryBuildProject(FName(TEXT("relay"))); Report(TEXT("Relay")); } }
void AVenusPrototypePlayerController::Treaty() { if (auto* M = Mission()) { M->SignInternationalTreaty(); Report(TEXT("Treaty")); } }
void AVenusPrototypePlayerController::BuildAerostat() { if (auto* M = Mission()) { M->TryBuildProject(FName(TEXT("aerostat"))); Report(TEXT("Aerostat")); } }
void AVenusPrototypePlayerController::BuildLogistics() { if (auto* M = Mission()) { M->TryBuildProject(FName(TEXT("logistics"))); Report(TEXT("Logistics")); } }
void AVenusPrototypePlayerController::BuildLab() { if (auto* M = Mission()) { M->TryBuildProject(FName(TEXT("lab"))); Report(TEXT("Laboratory")); } }
void AVenusPrototypePlayerController::Dispatch() { if (auto* M = Mission()) { M->DispatchSupplies(); Report(TEXT("Shipment")); } }
void AVenusPrototypePlayerController::Repair() { if (auto* M = Mission()) { M->RepairAerostat(); Report(TEXT("Repair")); } }
void AVenusPrototypePlayerController::NextPeriod() { if (auto* M = Mission()) { M->AdvancePeriod(); Report(TEXT("Next period")); } }

void AVenusPrototypePlayerController::CyclePolicy()
{
    if (auto* M = Mission())
    {
        const FName Current = M->GetState().Policy;
        const FName NewMode = Current == FName(TEXT("standard")) ? FName(TEXT("conserve")) :
            Current == FName(TEXT("conserve")) ? FName(TEXT("intensive")) : FName(TEXT("standard"));
        M->SetOperationPolicy(NewMode);
        Report(TEXT("Policy"));
    }
}
