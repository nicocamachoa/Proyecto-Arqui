using CoreWCF;

namespace SoapProvider.Contracts;

[ServiceContract(Namespace = "http://allconnect.com/services")]
public interface IBookingContract
{
    [OperationContract]
    BookingResponse BookService(BookingRequest request);

    [OperationContract]
    BookingResponse GetBooking(string bookingId);

    [OperationContract]
    CancelResponse CancelBooking(string bookingId);

    [OperationContract]
    AvailabilityResponse GetAvailability(AvailabilityRequest request);

    [OperationContract]
    ServiceListResponse GetServices();

    [OperationContract]
    ServiceData? GetServiceById(string serviceId);
}
