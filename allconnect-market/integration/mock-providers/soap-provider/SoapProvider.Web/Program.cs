var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorPages();
builder.Services.AddHttpClient("SoapProvider", client =>
{
    client.BaseAddress = new Uri("http://localhost:4002");
});

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
}

app.UseStaticFiles();
app.UseRouting();
app.MapRazorPages();

app.Logger.LogInformation("SOAP Provider Web UI starting on port 5002...");
app.Logger.LogInformation("Open http://localhost:5002 in your browser");

app.Run();
