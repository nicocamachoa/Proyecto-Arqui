using GrpcProvider.Data;
using GrpcProvider.Models;
using GrpcProvider.Services;

var builder = WebApplication.CreateBuilder(args);

// Add gRPC services
builder.Services.AddGrpc();

var app = builder.Build();

// Map gRPC service
app.MapGrpcService<SubscriptionGrpcService>();

// Health check endpoint (HTTP/1.1)
app.MapGet("/", () => new
{
    Status = "Healthy",
    Service = "gRPC Provider - Digital Subscriptions",
    Protocol = "gRPC",
    Port = 4003,
    Timestamp = DateTime.UtcNow
});

app.MapGet("/health", () => new
{
    Status = "Healthy",
    Service = "gRPC Provider - Digital Subscriptions",
    Protocol = "gRPC",
    Port = 4003,
    Timestamp = DateTime.UtcNow
});

// ===== REST API endpoints for E2E testing =====
// These endpoints mirror the gRPC service functionality via HTTP/JSON
// This allows easier integration testing from Java without gRPC client setup

app.MapGet("/api/plans", () =>
{
    var plans = MockData.Plans.Select(p => new
    {
        p.Id,
        p.Name,
        p.Description,
        p.Price,
        p.BillingCycle,
        p.Features
    });
    return Results.Ok(new { success = true, plans });
});

app.MapGet("/api/plans/{planId}", (string planId) =>
{
    var plan = MockData.Plans.FirstOrDefault(p => p.Id == planId);
    if (plan == null)
        return Results.NotFound(new { success = false, errorMessage = $"Plan not found: {planId}" });

    return Results.Ok(new
    {
        success = true,
        plan = new { plan.Id, plan.Name, plan.Description, plan.Price, plan.BillingCycle, plan.Features }
    });
});

app.MapPost("/api/subscriptions", (SubscriptionRequest request) =>
{
    // Simulate processing delay
    Thread.Sleep(Random.Shared.Next(300, 800));

    var plan = MockData.Plans.FirstOrDefault(p => p.Id == request.PlanId);
    if (plan == null)
        return Results.BadRequest(new { success = false, errorMessage = $"Plan not found: {request.PlanId}" });

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

    return Results.Ok(new
    {
        success = true,
        subscriptionId = subscription.Id,
        planId = plan.Id,
        planName = plan.Name,
        customerId = subscription.CustomerId,
        status = subscription.Status,
        startDate = subscription.StartDate,
        endDate = subscription.EndDate,
        features = plan.Features
    });
});

app.MapGet("/api/subscriptions/{subscriptionId}", (string subscriptionId) =>
{
    var subscription = MockData.GetSubscription(subscriptionId);
    if (subscription == null)
        return Results.NotFound(new { success = false, errorMessage = $"Subscription not found: {subscriptionId}" });

    var plan = MockData.Plans.FirstOrDefault(p => p.Id == subscription.PlanId);

    return Results.Ok(new
    {
        success = true,
        subscriptionId = subscription.Id,
        planId = subscription.PlanId,
        planName = plan?.Name ?? "Unknown",
        customerId = subscription.CustomerId,
        status = subscription.Status,
        startDate = subscription.StartDate,
        endDate = subscription.EndDate,
        features = plan?.Features ?? new List<string>()
    });
});

app.MapDelete("/api/subscriptions/{subscriptionId}", (string subscriptionId, string? reason) =>
{
    var subscription = MockData.GetSubscription(subscriptionId);
    if (subscription == null)
        return Results.NotFound(new { success = false, errorMessage = $"Subscription not found: {subscriptionId}" });

    if (subscription.Status == "CANCELLED")
        return Results.BadRequest(new { success = false, errorMessage = "Subscription is already cancelled" });

    MockData.UpdateSubscriptionStatus(subscriptionId, "CANCELLED");
    return Results.Ok(new { success = true });
});

app.MapGet("/api/subscriptions/{subscriptionId}/access/{contentId}", (string subscriptionId, string contentId) =>
{
    var subscription = MockData.GetSubscription(subscriptionId);
    if (subscription == null)
        return Results.NotFound(new { success = false, hasAccess = false, errorMessage = $"Subscription not found: {subscriptionId}" });

    if (subscription.Status != "ACTIVE")
        return Results.Ok(new { success = true, hasAccess = false, errorMessage = $"Subscription is not active. Status: {subscription.Status}" });

    if (subscription.EndDate < DateTime.UtcNow)
        return Results.Ok(new { success = true, hasAccess = false, errorMessage = "Subscription has expired" });

    return Results.Ok(new
    {
        success = true,
        hasAccess = true,
        accessUrl = $"https://content.allconnect.com/stream/{contentId}?token={Guid.NewGuid():N}",
        expiresAt = DateTime.UtcNow.AddHours(24)
    });
});

app.Logger.LogInformation("gRPC Provider starting on port 4003...");
app.Logger.LogInformation("gRPC endpoint: http://localhost:4003");
app.Logger.LogInformation("REST API endpoints available at: http://localhost:4003/api/*");

app.Run();

// DTO for subscription creation
public record SubscriptionRequest(string PlanId, string CustomerId, string CustomerEmail, string? PaymentMethodId);
