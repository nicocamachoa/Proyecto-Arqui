using CoreWCF;
using CoreWCF.Configuration;
using SoapProvider.Contracts;
using SoapProvider.Services;

var builder = WebApplication.CreateBuilder(args);

// Add CoreWCF services
builder.Services.AddServiceModelServices();

// Register the booking service
builder.Services.AddSingleton<BookingService>();

var app = builder.Build();

// Configure CoreWCF
app.UseServiceModel(serviceBuilder =>
{
    serviceBuilder.AddService<BookingService>(serviceOptions =>
    {
        serviceOptions.DebugBehavior.IncludeExceptionDetailInFaults = true;
    });

    serviceBuilder.AddServiceEndpoint<BookingService, IBookingContract>(
        new BasicHttpBinding(),
        "/BookingService.svc");
});

// Add a simple health check endpoint
app.MapGet("/health", () => new
{
    Status = "Healthy",
    Service = "SOAP Provider - Professional Services",
    Protocol = "SOAP",
    Port = 4002,
    Endpoint = "http://localhost:4002/BookingService.svc",
    Timestamp = DateTime.UtcNow
});

app.MapGet("/", () => "SOAP Provider - Professional Services. Endpoint: /BookingService.svc, REST API: /api/*");

// ===== REST API endpoints for E2E testing =====
// These endpoints call the same BookingService logic but via HTTP/JSON
// This allows easier integration testing from Java without complex SOAP client setup

app.MapGet("/api/services", (BookingService service) =>
{
    var result = service.GetServices();
    return Results.Ok(result);
});

app.MapGet("/api/services/{serviceId}", (string serviceId, BookingService service) =>
{
    var result = service.GetServiceById(serviceId);
    return result != null ? Results.Ok(result) : Results.NotFound(new { error = $"Service {serviceId} not found" });
});

app.MapPost("/api/bookings", (BookingRequest request, BookingService service) =>
{
    var result = service.BookService(request);
    return result.Success ? Results.Ok(result) : Results.BadRequest(result);
});

app.MapGet("/api/bookings/{bookingId}", (string bookingId, BookingService service) =>
{
    var result = service.GetBooking(bookingId);
    return result.Success ? Results.Ok(result) : Results.NotFound(result);
});

app.MapDelete("/api/bookings/{bookingId}", (string bookingId, BookingService service) =>
{
    var result = service.CancelBooking(bookingId);
    return result.Success ? Results.Ok(result) : Results.BadRequest(result);
});

app.MapGet("/api/availability/{serviceId}", (string serviceId, DateTime? date, BookingService service) =>
{
    var checkDate = date ?? DateTime.Today.AddDays(1);
    var result = service.GetAvailability(new AvailabilityRequest
    {
        ServiceId = serviceId,
        Date = checkDate
    });
    return result.Success ? Results.Ok(result) : Results.NotFound(result);
});

app.Logger.LogInformation("SOAP Provider starting on port 4002...");
app.Logger.LogInformation("SOAP Endpoint available at: http://localhost:4002/BookingService.svc");
app.Logger.LogInformation("REST API endpoints available at: http://localhost:4002/api/*");

app.Run();
