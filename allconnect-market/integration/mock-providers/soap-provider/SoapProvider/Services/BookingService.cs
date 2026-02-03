using SoapProvider.Contracts;
using SoapProvider.Data;
using SoapProvider.Models;

namespace SoapProvider.Services;

public class BookingService : IBookingContract
{
    private readonly ILogger<BookingService> _logger;

    public BookingService(ILogger<BookingService> logger)
    {
        _logger = logger;
    }

    public BookingResponse BookService(BookingRequest request)
    {
        _logger.LogInformation("Creating booking for service: {ServiceId}, customer: {CustomerId}",
            request.ServiceId, request.CustomerId);

        // Simular delay de procesamiento (500-1000ms)
        Thread.Sleep(Random.Shared.Next(500, 1000));

        var service = MockData.Services.FirstOrDefault(s => s.Id == request.ServiceId);
        if (service == null)
        {
            _logger.LogWarning("Service not found: {ServiceId}", request.ServiceId);
            return new BookingResponse
            {
                Success = false,
                ErrorMessage = $"Service not found: {request.ServiceId}"
            };
        }

        var booking = new Booking
        {
            BookingId = $"BK-{Guid.NewGuid():N}".Substring(0, 18).ToUpper(),
            ServiceId = request.ServiceId,
            CustomerId = request.CustomerId,
            CustomerName = request.CustomerName,
            CustomerEmail = request.CustomerEmail,
            ScheduledDateTime = request.PreferredDateTime,
            Status = "CONFIRMED",
            ConfirmationCode = $"CONF-{Random.Shared.Next(100000, 999999)}",
            Notes = request.Notes,
            CreatedAt = DateTime.UtcNow
        };

        MockData.AddBooking(booking);

        _logger.LogInformation("Booking created successfully: {BookingId}", booking.BookingId);

        return new BookingResponse
        {
            BookingId = booking.BookingId,
            ConfirmationCode = booking.ConfirmationCode!,
            ScheduledDateTime = booking.ScheduledDateTime,
            ProviderName = service.ProviderName,
            ServiceName = service.Name,
            Status = booking.Status,
            Success = true
        };
    }

    public BookingResponse GetBooking(string bookingId)
    {
        _logger.LogInformation("Getting booking: {BookingId}", bookingId);

        var booking = MockData.GetBooking(bookingId);
        if (booking == null)
        {
            return new BookingResponse
            {
                Success = false,
                ErrorMessage = $"Booking not found: {bookingId}"
            };
        }

        var service = MockData.Services.FirstOrDefault(s => s.Id == booking.ServiceId);

        return new BookingResponse
        {
            BookingId = booking.BookingId,
            ConfirmationCode = booking.ConfirmationCode ?? string.Empty,
            ScheduledDateTime = booking.ScheduledDateTime,
            ProviderName = service?.ProviderName ?? "Unknown",
            ServiceName = service?.Name ?? "Unknown",
            Status = booking.Status,
            Success = true
        };
    }

    public CancelResponse CancelBooking(string bookingId)
    {
        _logger.LogInformation("Cancelling booking: {BookingId}", bookingId);

        var booking = MockData.GetBooking(bookingId);
        if (booking == null)
        {
            return new CancelResponse
            {
                Success = false,
                ErrorMessage = $"Booking not found: {bookingId}"
            };
        }

        if (booking.Status == "CANCELLED" || booking.Status == "COMPLETED")
        {
            return new CancelResponse
            {
                Success = false,
                ErrorMessage = $"Cannot cancel booking with status: {booking.Status}"
            };
        }

        MockData.UpdateBookingStatus(bookingId, "CANCELLED");
        _logger.LogInformation("Booking cancelled: {BookingId}", bookingId);

        return new CancelResponse { Success = true };
    }

    public AvailabilityResponse GetAvailability(AvailabilityRequest request)
    {
        _logger.LogInformation("Checking availability for service: {ServiceId}, date: {Date}",
            request.ServiceId, request.Date);

        var service = MockData.Services.FirstOrDefault(s => s.Id == request.ServiceId);
        if (service == null)
        {
            return new AvailabilityResponse
            {
                Success = false,
                ServiceId = request.ServiceId
            };
        }

        // Generar slots de disponibilidad de 9 AM a 5 PM
        var slots = Enumerable.Range(9, 8)
            .Select(hour => new TimeSlotData
            {
                Time = request.Date.Date.AddHours(hour),
                Available = Random.Shared.Next(2) == 1 // 50% probabilidad
            })
            .ToList();

        return new AvailabilityResponse
        {
            ServiceId = request.ServiceId,
            Date = request.Date,
            Slots = slots,
            Success = true
        };
    }

    public ServiceListResponse GetServices()
    {
        _logger.LogInformation("Getting all services");

        var services = MockData.Services.Select(s => new ServiceData
        {
            Id = s.Id,
            Name = s.Name,
            Description = s.Description,
            Category = s.Category,
            DurationMinutes = s.DurationMinutes,
            ProviderName = s.ProviderName,
            Price = s.Price,
            ImageUrl = s.ImageUrl
        }).ToList();

        return new ServiceListResponse
        {
            Services = services,
            Success = true
        };
    }

    public ServiceData? GetServiceById(string serviceId)
    {
        _logger.LogInformation("Getting service by ID: {ServiceId}", serviceId);

        var service = MockData.Services.FirstOrDefault(s => s.Id == serviceId);
        if (service == null)
        {
            return null;
        }

        return new ServiceData
        {
            Id = service.Id,
            Name = service.Name,
            Description = service.Description,
            Category = service.Category,
            DurationMinutes = service.DurationMinutes,
            ProviderName = service.ProviderName,
            Price = service.Price,
            ImageUrl = service.ImageUrl
        };
    }
}
