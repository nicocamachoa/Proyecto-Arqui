using Microsoft.AspNetCore.Mvc;

namespace RestProvider.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public ActionResult GetHealth()
    {
        return Ok(new
        {
            Status = "Healthy",
            Service = "REST Provider - Physical Products",
            Protocol = "REST",
            Port = 4001,
            Timestamp = DateTime.UtcNow
        });
    }
}
