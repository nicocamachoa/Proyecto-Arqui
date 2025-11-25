using Grpc.Core;
using GrpcProvider.Data;
using GrpcProvider.Models;

namespace GrpcProvider.Services;

public class SubscriptionGrpcService : SubscriptionService.SubscriptionServiceBase
{
    private readonly ILogger<SubscriptionGrpcService> _logger;

    public SubscriptionGrpcService(ILogger<SubscriptionGrpcService> logger)
    {
        _logger = logger;
    }

    public override Task<SubscriptionResponse> CreateSubscription(
        CreateSubscriptionRequest request, ServerCallContext context)
    {
        _logger.LogInformation("Creating subscription for plan: {PlanId}, customer: {CustomerId}",
            request.PlanId, request.CustomerId);

        // Simular delay de procesamiento (300-800ms)
        Thread.Sleep(Random.Shared.Next(300, 800));

        var plan = MockData.Plans.FirstOrDefault(p => p.Id == request.PlanId);
        if (plan == null)
        {
            _logger.LogWarning("Plan not found: {PlanId}", request.PlanId);
            return Task.FromResult(new SubscriptionResponse
            {
                Success = false,
                ErrorMessage = $"Plan not found: {request.PlanId}"
            });
        }

        var subscription = new Subscription
        {
            Id = $"SUB-{Guid.NewGuid():N}".Substring(0, 18).ToUpper(),
            PlanId = request.PlanId,
            CustomerId = request.CustomerId,
            CustomerEmail = request.CustomerEmail,
            Status = "ACTIVE",
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddMonths(1),
            CreatedAt = DateTime.UtcNow
        };

        MockData.AddSubscription(subscription);

        _logger.LogInformation("Subscription created: {SubscriptionId}", subscription.Id);

        var response = new SubscriptionResponse
        {
            SubscriptionId = subscription.Id,
            PlanId = plan.Id,
            PlanName = plan.Name,
            CustomerId = subscription.CustomerId,
            Status = subscription.Status,
            StartDate = subscription.StartDate.ToString("O"),
            EndDate = subscription.EndDate.ToString("O"),
            Success = true
        };
        response.Features.AddRange(plan.Features);

        return Task.FromResult(response);
    }

    public override Task<SubscriptionResponse> GetSubscription(
        GetSubscriptionRequest request, ServerCallContext context)
    {
        _logger.LogInformation("Getting subscription: {SubscriptionId}", request.SubscriptionId);

        var subscription = MockData.GetSubscription(request.SubscriptionId);
        if (subscription == null)
        {
            return Task.FromResult(new SubscriptionResponse
            {
                Success = false,
                ErrorMessage = $"Subscription not found: {request.SubscriptionId}"
            });
        }

        var plan = MockData.Plans.FirstOrDefault(p => p.Id == subscription.PlanId);

        var response = new SubscriptionResponse
        {
            SubscriptionId = subscription.Id,
            PlanId = subscription.PlanId,
            PlanName = plan?.Name ?? "Unknown",
            CustomerId = subscription.CustomerId,
            Status = subscription.Status,
            StartDate = subscription.StartDate.ToString("O"),
            EndDate = subscription.EndDate.ToString("O"),
            Success = true
        };
        if (plan != null)
        {
            response.Features.AddRange(plan.Features);
        }

        return Task.FromResult(response);
    }

    public override Task<CancelResponse> CancelSubscription(
        CancelSubscriptionRequest request, ServerCallContext context)
    {
        _logger.LogInformation("Cancelling subscription: {SubscriptionId}, reason: {Reason}",
            request.SubscriptionId, request.Reason);

        var subscription = MockData.GetSubscription(request.SubscriptionId);
        if (subscription == null)
        {
            return Task.FromResult(new CancelResponse
            {
                Success = false,
                ErrorMessage = $"Subscription not found: {request.SubscriptionId}"
            });
        }

        if (subscription.Status == "CANCELLED")
        {
            return Task.FromResult(new CancelResponse
            {
                Success = false,
                ErrorMessage = "Subscription is already cancelled"
            });
        }

        MockData.UpdateSubscriptionStatus(request.SubscriptionId, "CANCELLED");
        _logger.LogInformation("Subscription cancelled: {SubscriptionId}", request.SubscriptionId);

        return Task.FromResult(new CancelResponse { Success = true });
    }

    public override Task<AccessResponse> CheckAccess(
        CheckAccessRequest request, ServerCallContext context)
    {
        _logger.LogInformation("Checking access for subscription: {SubscriptionId}, content: {ContentId}",
            request.SubscriptionId, request.ContentId);

        var subscription = MockData.GetSubscription(request.SubscriptionId);
        if (subscription == null)
        {
            return Task.FromResult(new AccessResponse
            {
                HasAccess = false,
                ErrorMessage = $"Subscription not found: {request.SubscriptionId}"
            });
        }

        if (subscription.Status != "ACTIVE")
        {
            return Task.FromResult(new AccessResponse
            {
                HasAccess = false,
                ErrorMessage = $"Subscription is not active. Status: {subscription.Status}"
            });
        }

        if (subscription.EndDate < DateTime.UtcNow)
        {
            return Task.FromResult(new AccessResponse
            {
                HasAccess = false,
                ErrorMessage = "Subscription has expired"
            });
        }

        return Task.FromResult(new AccessResponse
        {
            HasAccess = true,
            AccessUrl = $"https://content.allconnect.com/stream/{request.ContentId}?token={Guid.NewGuid():N}",
            ExpiresAt = DateTime.UtcNow.AddHours(24).ToString("O")
        });
    }

    public override Task<PlansResponse> GetPlans(
        GetPlansRequest request, ServerCallContext context)
    {
        _logger.LogInformation("Getting all plans");

        var response = new PlansResponse { Success = true };

        foreach (var plan in MockData.Plans)
        {
            var planData = new PlanData
            {
                Id = plan.Id,
                Name = plan.Name,
                Description = plan.Description,
                Price = (double)plan.Price,
                BillingCycle = plan.BillingCycle
            };
            planData.Features.AddRange(plan.Features);
            response.Plans.Add(planData);
        }

        return Task.FromResult(response);
    }

    public override Task<PlanResponse> GetPlan(
        GetPlanRequest request, ServerCallContext context)
    {
        _logger.LogInformation("Getting plan: {PlanId}", request.PlanId);

        var plan = MockData.Plans.FirstOrDefault(p => p.Id == request.PlanId);
        if (plan == null)
        {
            return Task.FromResult(new PlanResponse
            {
                Success = false,
                ErrorMessage = $"Plan not found: {request.PlanId}"
            });
        }

        var planData = new PlanData
        {
            Id = plan.Id,
            Name = plan.Name,
            Description = plan.Description,
            Price = (double)plan.Price,
            BillingCycle = plan.BillingCycle
        };
        planData.Features.AddRange(plan.Features);

        return Task.FromResult(new PlanResponse
        {
            Plan = planData,
            Success = true
        });
    }
}
