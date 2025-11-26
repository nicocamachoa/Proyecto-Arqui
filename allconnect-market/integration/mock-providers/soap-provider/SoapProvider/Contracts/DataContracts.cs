using System.Runtime.Serialization;

namespace SoapProvider.Contracts;

[DataContract(Namespace = "http://allconnect.com/services")]
public class BookingRequest
{
    [DataMember]
    public string ServiceId { get; set; } = string.Empty;

    [DataMember]
    public string CustomerId { get; set; } = string.Empty;

    [DataMember]
    public string CustomerName { get; set; } = string.Empty;

    [DataMember]
    public string CustomerEmail { get; set; } = string.Empty;

    [DataMember]
    public DateTime PreferredDateTime { get; set; }

    [DataMember]
    public string? Notes { get; set; }
}

[DataContract(Namespace = "http://allconnect.com/services")]
public class BookingResponse
{
    [DataMember]
    public string BookingId { get; set; } = string.Empty;

    [DataMember]
    public string ConfirmationCode { get; set; } = string.Empty;

    [DataMember]
    public DateTime ScheduledDateTime { get; set; }

    [DataMember]
    public string ProviderName { get; set; } = string.Empty;

    [DataMember]
    public string ServiceName { get; set; } = string.Empty;

    [DataMember]
    public string Status { get; set; } = string.Empty;

    [DataMember]
    public bool Success { get; set; }

    [DataMember]
    public string? ErrorMessage { get; set; }
}

[DataContract(Namespace = "http://allconnect.com/services")]
public class CancelResponse
{
    [DataMember]
    public bool Success { get; set; }

    [DataMember]
    public string? ErrorMessage { get; set; }
}

[DataContract(Namespace = "http://allconnect.com/services")]
public class AvailabilityRequest
{
    [DataMember]
    public string ServiceId { get; set; } = string.Empty;

    [DataMember]
    public DateTime Date { get; set; }
}

[DataContract(Namespace = "http://allconnect.com/services")]
public class AvailabilityResponse
{
    [DataMember]
    public string ServiceId { get; set; } = string.Empty;

    [DataMember]
    public DateTime Date { get; set; }

    [DataMember]
    public List<TimeSlotData> Slots { get; set; } = new();

    [DataMember]
    public bool Success { get; set; }
}

[DataContract(Namespace = "http://allconnect.com/services")]
public class TimeSlotData
{
    [DataMember]
    public DateTime Time { get; set; }

    [DataMember]
    public bool Available { get; set; }
}

[DataContract(Namespace = "http://allconnect.com/services")]
public class ServiceListResponse
{
    [DataMember]
    public List<ServiceData> Services { get; set; } = new();

    [DataMember]
    public bool Success { get; set; }
}

[DataContract(Namespace = "http://allconnect.com/services")]
public class ServiceData
{
    [DataMember]
    public string Id { get; set; } = string.Empty;

    [DataMember]
    public string Name { get; set; } = string.Empty;

    [DataMember]
    public string Description { get; set; } = string.Empty;

    [DataMember]
    public string Category { get; set; } = string.Empty;

    [DataMember]
    public int DurationMinutes { get; set; }

    [DataMember]
    public string ProviderName { get; set; } = string.Empty;

    [DataMember]
    public decimal Price { get; set; }

    [DataMember]
    public string ImageUrl { get; set; } = string.Empty;
}
