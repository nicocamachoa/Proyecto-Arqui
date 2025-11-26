using SoapProvider.Models;

namespace SoapProvider.Data;

public static class MockData
{
    public static readonly List<Service> Services = new()
    {
        new Service
        {
            Id = "SVC001",
            Name = "Consulta Médica General",
            Description = "Consulta médica con médico general",
            Category = "Medical",
            DurationMinutes = 30,
            ProviderName = "Dr. García",
            Price = 50.00m,
            ImageUrl = "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=500"
        },
        new Service
        {
            Id = "SVC002",
            Name = "Asesoría Legal",
            Description = "Asesoría legal con abogado especialista",
            Category = "Legal",
            DurationMinutes = 60,
            ProviderName = "Abg. Martínez",
            Price = 100.00m,
            ImageUrl = "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=500"
        },
        new Service
        {
            Id = "SVC003",
            Name = "Clase de Yoga Personal",
            Description = "Clase personalizada de yoga",
            Category = "Fitness",
            DurationMinutes = 60,
            ProviderName = "Ana López",
            Price = 35.00m,
            ImageUrl = "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500"
        },
        new Service
        {
            Id = "SVC004",
            Name = "Consulta Dental",
            Description = "Revisión y limpieza dental",
            Category = "Medical",
            DurationMinutes = 45,
            ProviderName = "Dra. Rodríguez",
            Price = 75.00m,
            ImageUrl = "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=500"
        },
        new Service
        {
            Id = "SVC005",
            Name = "Tutoría de Matemáticas",
            Description = "Tutoría personalizada en matemáticas",
            Category = "Education",
            DurationMinutes = 90,
            ProviderName = "Prof. Sánchez",
            Price = 40.00m,
            ImageUrl = "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=500"
        }
    };

    private static readonly List<Booking> _bookings = new();
    private static readonly object _lock = new();

    public static IReadOnlyList<Booking> Bookings
    {
        get
        {
            lock (_lock)
            {
                return _bookings.ToList();
            }
        }
    }

    public static void AddBooking(Booking booking)
    {
        lock (_lock)
        {
            _bookings.Add(booking);
        }
    }

    public static Booking? GetBooking(string bookingId)
    {
        lock (_lock)
        {
            return _bookings.FirstOrDefault(b => b.BookingId == bookingId);
        }
    }

    public static bool UpdateBookingStatus(string bookingId, string status)
    {
        lock (_lock)
        {
            var booking = _bookings.FirstOrDefault(b => b.BookingId == bookingId);
            if (booking != null)
            {
                booking.Status = status;
                return true;
            }
            return false;
        }
    }
}
