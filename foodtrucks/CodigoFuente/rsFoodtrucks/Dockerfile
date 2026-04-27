#FROM mcr.microsoft.com/dotnet/core/sdk:3.1 AS build
#FROM mcr.microsoft.com/dotnet/core/aspnet:3.0-bionic AS build
#FROM mcr.microsoft.com/dotnet/sdk:6.0.302 AS build
#RUN sed -i 's/MinProtocol = TLSv1.2/MinProtocol = TLSv1/g' /usr/lib/ssl/openssl.cnf
#RUN sed -i 's/MinProtocol = TLSv1.2/MinProtocol = TLSv1/g' /etc/ssl/openssl.cnf
#FROM mcr.microsoft.com/dotnet/sdk:6.0.302 AS build
FROM mcr.microsoft.com/dotnet/core/sdk:3.1 as build
#FROM mcr.microsoft.com/dotnet/core/sdk:3.1-bionic AS build
WORKDIR /
# Copy the contents of certs directory from the local machine to
# a new directory certs inside the container
COPY ./certs/ ./certs/
WORKDIR ./certs/
run apt-get install -y ca-certificates
RUN cp fortigate.crt /usr/local/share/ca-certificates
run update-ca-certificates

#FROM mcr.microsoft.com/dotnet/core/sdk:3.0 AS build
WORKDIR /app

# copy csproj and restore as distinct layers
COPY *.sln .
COPY rsFoodtrucks/*.csproj ./rsFoodtrucks/
RUN dotnet restore

# copy everything else and build app
COPY rsFoodtrucks/. ./rsFoodtrucks/
WORKDIR /app/rsFoodtrucks
RUN dotnet publish -c Release -o out --no-restore

FROM mcr.microsoft.com/dotnet/core/aspnet:3.1 AS runtime
#EXPOSE 3000
#EXPOSE 443
#EXPOSE 80
#EXPOSE 80
#EXPOSE 80
#EXPOSE 80
ENV ASPNETCORE_URLS http://+:80
WORKDIR /app

RUN apt update && apt install -y curl libgdiplus gnupg && \
    curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add - && \
    curl https://packages.microsoft.com/config/ubuntu/20.04/prod.list >> /etc/apt/sources.list && \
    apt-get update && \
    ACCEPT_EULA=Y apt-get install -y mssql-tools && \
    apt-get clean && \
    curl -s https://deb.nodesource.com/setup_18.x | bash - && \
    apt update

COPY --from=build /app/rsFoodtrucks/out ./

ENV TZ=America/Argentina/Buenos_Aires
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone 

ENTRYPOINT ["dotnet", "rsFoodtrucks.dll"]
