namespace SoapProvider.Models;

public class Booking
{
    public string BookingId { get; set; } = string.Empty;
    public string ServiceId { get; set; } = string.Empty;
    public string CustomerId { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public DateTime ScheduledDateTime { get; set; }
    public string Status { get; set; } = "PENDING";
    public string? ConfirmationCode { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
