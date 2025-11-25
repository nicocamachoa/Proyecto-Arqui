FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 4003

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["GrpcProvider/GrpcProvider.csproj", "GrpcProvider/"]
RUN dotnet restore "GrpcProvider/GrpcProvider.csproj"
COPY . .
WORKDIR "/src/GrpcProvider"
RUN dotnet build "GrpcProvider.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "GrpcProvider.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENV ASPNETCORE_URLS=http://+:4003
ENTRYPOINT ["dotnet", "GrpcProvider.dll"]
