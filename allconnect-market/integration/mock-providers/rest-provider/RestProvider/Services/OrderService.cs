using RestProvider.Data;
using RestProvider.Models;

namespace RestProvider.Services;

public class OrderService : IOrderService
{
    private readonly IProductService _productService;
    private static readonly string[] Statuses = { "RECEIVED", "PROCESSING", "SHIPPED", "IN_TRANSIT", "DELIVERED" };
    private static readonly string[] Locations = { "Centro de Distribución", "En Camino", "Ciudad Destino", "Repartidor Local" };

    public OrderService(IProductService productService)
    {
        _productService = productService;
    }

    public OrderResponse CreateOrder(OrderRequest request)
    {
        // Simular delay de procesamiento (500-1500ms)
        Thread.Sleep(Random.Shared.Next(500, 1500));

        // Validar y obtener productos
        var orderItems = new List<OrderItem>();
        foreach (var item in request.Items)
        {
            var product = _productService.GetById(item.ProductId);
            if (product == null)
            {
                return new OrderResponse
                {
                    Success = false,
                    ErrorMessage = $"Product not found: {item.ProductId}"
                };
            }

            if (!_productService.ReserveStock(item.ProductId, item.Quantity))
            {
                return new OrderResponse
                {
                    Success = false,
                    ErrorMessage = $"Insufficient stock for product: {item.ProductId}"
                };
            }

            orderItems.Add(new OrderItem
            {
                ProductId = product.Id,
                ProductName = product.Name,
                Quantity = item.Quantity,
                UnitPrice = product.Price
            });
        }

        var order = new Order
        {
            OrderId = $"ORD-{Guid.NewGuid():N}".Substring(0, 20).ToUpper(),
            CustomerId = request.CustomerId,
            CustomerEmail = request.CustomerEmail,
            Items = orderItems,
            ShippingAddress = request.ShippingAddress,
            Status = "RECEIVED",
            TrackingNumber = $"TRK-{Random.Shared.Next(100000, 999999)}",
            CreatedAt = DateTime.UtcNow,
            EstimatedDelivery = DateTime.UtcNow.AddDays(Random.Shared.Next(3, 7))
        };

        MockData.AddOrder(order);

        return new OrderResponse
        {
            OrderId = order.OrderId,
            Status = order.Status,
            TrackingNumber = order.TrackingNumber,
            EstimatedDelivery = order.EstimatedDelivery,
            Success = true
        };
    }

    public Order? GetOrder(string orderId) => MockData.GetOrder(orderId);

    public OrderStatus GetOrderStatus(string orderId)
    {
        var order = MockData.GetOrder(orderId);
        if (order == null)
        {
            return new OrderStatus
            {
                OrderId = orderId,
                Status = "NOT_FOUND",
                LastUpdate = DateTime.UtcNow
            };
        }

        // Simular progreso del pedido basado en tiempo transcurrido
        var hoursElapsed = (DateTime.UtcNow - order.CreatedAt).TotalHours;
        var statusIndex = Math.Min((int)(hoursElapsed / 24), Statuses.Length - 1);
        var currentStatus = Statuses[statusIndex];

        var history = new List<StatusHistory>();
        for (int i = 0; i <= statusIndex; i++)
        {
            history.Add(new StatusHistory
            {
                Status = Statuses[i],
                Timestamp = order.CreatedAt.AddDays(i),
                Location = i < Locations.Length ? Locations[i] : Locations[^1]
            });
        }

        return new OrderStatus
        {
            OrderId = orderId,
            Status = currentStatus,
            TrackingNumber = order.TrackingNumber,
            CurrentLocation = statusIndex < Locations.Length ? Locations[statusIndex] : Locations[^1],
            LastUpdate = DateTime.UtcNow,
            History = history
        };
    }

    public bool CancelOrder(string orderId)
    {
        var order = MockData.GetOrder(orderId);
        if (order == null || order.Status == "DELIVERED" || order.Status == "CANCELLED")
        {
            return false;
        }

        return MockData.UpdateOrderStatus(orderId, "CANCELLED");
    }

    public IEnumerable<Order> GetOrdersByCustomer(string customerId) =>
        MockData.Orders.Where(o => o.CustomerId == customerId);
}
