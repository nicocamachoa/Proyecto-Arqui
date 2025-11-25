FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 4002

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["SoapProvider/SoapProvider.csproj", "SoapProvider/"]
RUN dotnet restore "SoapProvider/SoapProvider.csproj"
COPY . .
WORKDIR "/src/SoapProvider"
RUN dotnet build "SoapProvider.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "SoapProvider.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENV ASPNETCORE_URLS=http://+:4002
ENTRYPOINT ["dotnet", "SoapProvider.dll"]
