using GrpcProvider.Models;

namespace GrpcProvider.Data;

public static class MockData
{
    public static readonly List<Plan> Plans = new()
    {
        new Plan
        {
            Id = "PLAN001",
            Name = "Plan Streaming Premium",
            Description = "Acceso completo a contenido de streaming en HD y 4K",
            Price = 14.99m,
            BillingCycle = "monthly",
            Features = new List<string> { "HD", "4K", "Sin anuncios", "4 pantallas", "Descargas offline" },
            ImageUrl = "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=500"
        },
        new Plan
        {
            Id = "PLAN002",
            Name = "Software Productividad Pro",
            Description = "Suite completa de herramientas de productividad",
            Price = 9.99m,
            BillingCycle = "monthly",
            Features = new List<string> { "Documentos", "Hojas de cálculo", "Presentaciones", "Cloud sync", "100GB almacenamiento" },
            ImageUrl = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500"
        },
        new Plan
        {
            Id = "PLAN003",
            Name = "Contenido Educativo Ilimitado",
            Description = "Acceso a todos los cursos y certificaciones",
            Price = 19.99m,
            BillingCycle = "monthly",
            Features = new List<string> { "Todos los cursos", "Certificados", "Proyectos prácticos", "Soporte 24/7", "Mentorías" },
            ImageUrl = "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=500"
        },
        new Plan
        {
            Id = "PLAN004",
            Name = "Plan Música Familiar",
            Description = "Música ilimitada para toda la familia",
            Price = 12.99m,
            BillingCycle = "monthly",
            Features = new List<string> { "6 cuentas", "Audio HiFi", "Letras", "Sin anuncios", "Descargas" },
            ImageUrl = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500"
        }
    };

    private static readonly List<Subscription> _subscriptions = new();
    private static readonly object _lock = new();

    public static IReadOnlyList<Subscription> Subscriptions
    {
        get
        {
            lock (_lock)
            {
                return _subscriptions.ToList();
            }
        }
    }

    public static void AddSubscription(Subscription subscription)
    {
        lock (_lock)
        {
            _subscriptions.Add(subscription);
        }
    }

    public static Subscription? GetSubscription(string subscriptionId)
    {
        lock (_lock)
        {
            return _subscriptions.FirstOrDefault(s => s.Id == subscriptionId);
        }
    }

    public static bool UpdateSubscriptionStatus(string subscriptionId, string status)
    {
        lock (_lock)
        {
            var subscription = _subscriptions.FirstOrDefault(s => s.Id == subscriptionId);
            if (subscription != null)
            {
                subscription.Status = status;
                return true;
            }
            return false;
        }
    }
}
