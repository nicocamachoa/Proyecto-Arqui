using RestProvider.Models;

namespace RestProvider.Services;

public interface IOrderService
{
    OrderResponse CreateOrder(OrderRequest request);
    Order? GetOrder(string orderId);
    OrderStatus GetOrderStatus(string orderId);
    bool CancelOrder(string orderId);
    IEnumerable<Order> GetOrdersByCustomer(string customerId);
}
