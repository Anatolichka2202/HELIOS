#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "VenusMissionSubsystem.generated.h"

/** Shared serializable state between strategic view and any first-person scene. */
USTRUCT(BlueprintType)
struct FVenusShipmentState
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category="HELIOS|Mission")
    int32 ArrivalTurn = 0;

    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category="HELIOS|Mission")
    int32 Supplies = 0;
};

USTRUCT(BlueprintType)
struct FVenusMissionState
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category="HELIOS|Mission")
    int32 Turn = 1;

    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category="HELIOS|Mission")
    int32 Year = 2034;

    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category="HELIOS|Mission")
    int32 Credits = 125;

    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category="HELIOS|Mission")
    int32 Science = 20;

    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category="HELIOS|Mission")
    int32 Energy = 25;

    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category="HELIOS|Mission")
    int32 Supplies = 32;

    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category="HELIOS|Mission")
    int32 AerostatCondition = 0;

    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category="HELIOS|Mission")
    int32 StableYears = 0;

    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category="HELIOS|Mission")
    int32 CriticalYears = 0;

    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category="HELIOS|Mission")
    int32 StoryStep = 0;

    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category="HELIOS|Mission")
    bool bCampaign = true;

    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category="HELIOS|Mission")
    bool bInternational = false;

    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category="HELIOS|Mission")
    bool bFinished = false;

    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category="HELIOS|Mission")
    FName Funding = NAME_None;

    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category="HELIOS|Mission")
    FName Policy = FName(TEXT("standard"));

    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category="HELIOS|Mission")
    FName Outcome = NAME_None;

    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category="HELIOS|Mission")
    TArray<FName> CompletedProjects;

    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category="HELIOS|Mission")
    TArray<FVenusShipmentState> Shipments;

    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category="HELIOS|Mission")
    TArray<FString> EventLog;
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnVenusMissionStateChanged);

/**
 * A single UE GameInstance owner for gameplay state.
 *
 * The same subsystem is used by the planetary strategy camera, station
 * interiors, the main menu and future first-person world interactions.
 * This is currently a small local experiment, NOT an integrated full C++ core.
 */
UCLASS(BlueprintType)
class HELIOS_API UVenusMissionSubsystem : public UGameInstanceSubsystem
{
    GENERATED_BODY()

public:
    virtual void Initialize(FSubsystemCollectionBase& Collection) override;

    UPROPERTY(BlueprintAssignable, Category="HELIOS|Mission")
    FOnVenusMissionStateChanged OnStateChanged;

    UFUNCTION(BlueprintCallable, Category="HELIOS|Mission")
    void NewGame(bool bCampaign);

    UFUNCTION(BlueprintPure, Category="HELIOS|Mission")
    FVenusMissionState GetState() const { return State; }

    UFUNCTION(BlueprintPure, Category="HELIOS|Mission")
    bool HasProject(FName Id) const { return State.CompletedProjects.Contains(Id); }

    UFUNCTION(BlueprintPure, Category="HELIOS|Mission")
    FString GetLastMessage() const { return LastMessage; }

    UFUNCTION(BlueprintCallable, Category="HELIOS|Mission")
    bool HoldScientificCouncil();

    UFUNCTION(BlueprintCallable, Category="HELIOS|Mission")
    bool ChooseFunding(FName Plan);

    UFUNCTION(BlueprintCallable, Category="HELIOS|Mission")
    bool SignInternationalTreaty();

    UFUNCTION(BlueprintCallable, Category="HELIOS|Mission")
    bool TryBuildProject(FName ProjectId);

    UFUNCTION(BlueprintCallable, Category="HELIOS|Mission")
    bool SetOperationPolicy(FName Policy);

    UFUNCTION(BlueprintCallable, Category="HELIOS|Mission")
    bool DispatchSupplies();

    UFUNCTION(BlueprintCallable, Category="HELIOS|Mission")
    bool RepairAerostat();

    UFUNCTION(BlueprintCallable, Category="HELIOS|Mission")
    bool AdvancePeriod();

    UFUNCTION(BlueprintPure, Category="HELIOS|Mission")
    int32 GetScore() const;

private:
    UPROPERTY()
    FVenusMissionState State;

    UPROPERTY()
    FString LastMessage;

    bool Reject(const FString& Message);
    bool Accept(const FString& Message);
    void AppendEvent(const FString& Message);
};
