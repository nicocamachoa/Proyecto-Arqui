using RestProvider.Models;

namespace RestProvider.Data;

public static class MockData
{
    public static readonly List<Product> Products = new()
    {
        new Product
        {
            Id = "PROD001",
            Name = "Laptop Gaming XPS 15",
            Description = "Laptop de alto rendimiento para gaming con RTX 4070",
            Price = 1299.99m,
            Stock = 50,
            Category = "Electronics",
            ImageUrl = "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500"
        },
        new Product
        {
            Id = "PROD002",
            Name = "Smartphone Galaxy S24 Ultra",
            Description = "Smartphone flagship con cámara de 200MP",
            Price = 899.99m,
            Stock = 100,
            Category = "Electronics",
            ImageUrl = "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500"
        },
        new Product
        {
            Id = "PROD003",
            Name = "Audífonos Bluetooth Pro",
            Description = "Audífonos con cancelación de ruido activa",
            Price = 199.99m,
            Stock = 200,
            Category = "Audio",
            ImageUrl = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500"
        },
        new Product
        {
            Id = "PROD004",
            Name = "Monitor 4K 32 pulgadas",
            Description = "Monitor profesional con panel IPS",
            Price = 549.99m,
            Stock = 30,
            Category = "Electronics",
            ImageUrl = "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500"
        },
        new Product
        {
            Id = "PROD005",
            Name = "Teclado Mecánico RGB",
            Description = "Teclado gaming con switches Cherry MX",
            Price = 149.99m,
            Stock = 150,
            Category = "Peripherals",
            ImageUrl = "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500"
        }
    };

    private static readonly List<Order> _orders = new();
    private static readonly object _lock = new();

    public static IReadOnlyList<Order> Orders
    {
        get
        {
            lock (_lock)
            {
                return _orders.ToList();
            }
        }
    }

    public static void AddOrder(Order order)
    {
        lock (_lock)
        {
            _orders.Add(order);
        }
    }

    public static Order? GetOrder(string orderId)
    {
        lock (_lock)
        {
            return _orders.FirstOrDefault(o => o.OrderId == orderId);
        }
    }

    public static bool UpdateOrderStatus(string orderId, string status)
    {
        lock (_lock)
        {
            var order = _orders.FirstOrDefault(o => o.OrderId == orderId);
            if (order != null)
            {
                order.Status = status;
                return true;
            }
            return false;
        }
    }
}
