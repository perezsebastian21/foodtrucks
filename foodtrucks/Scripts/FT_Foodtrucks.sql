
CREATE TABLE [dbo].[FT_Categorias] (
    [IdCategoria] int NOT NULL IDENTITY,
    [Nombre] varchar(2000) NOT NULL,
    CONSTRAINT [FT_ID_Categoria_PK] PRIMARY KEY ([IdCategoria])
);

GO

CREATE TABLE [dbo].[FT_Usuarios] (
    [IdUsuario] int NOT NULL IDENTITY,
    [Usuario] varchar(255) NOT NULL,
    [Email] varchar(255) NULL,
    [Activo] bit NULL DEFAULT (1),
    CONSTRAINT [FT_Usuaior_PK] PRIMARY KEY ([IdUsuario])
);

GO

CREATE TABLE [dbo].[FT_Foodtrucks] (
    [IdFT] int NOT NULL IDENTITY,
    [IdCategoria] int NOT NULL,
    [NombreFantasia] varchar(2000) NOT NULL,
    [Logo] varbinary(max) NULL,
    [Titular] varchar(2000) NOT NULL,
    [Email] varchar(255) NULL,
    [Menu] TEXT NULL,
    [Vegano] char(1) NULL DEFAULT 'N',
    [Vegetariano] char(1) NULL DEFAULT 'N',
    [SinTACC] char(1) NULL DEFAULT 'N',
    [Emplazado] char(1) NULL DEFAULT 'N',
    [Celiaco] char(1) NULL DEFAULT 'N',
    [Activo] bit NULL DEFAULT (1),
    CONSTRAINT [FT_Id_Foodtruck_PK] PRIMARY KEY ([IdFT]),
    CONSTRAINT [FK_FT_Foodtrucks_FT_Categorias_IdCategoria] FOREIGN KEY ([IdCategoria]) REFERENCES [dbo].[FT_Categorias] ([IdCategoria]) ON DELETE CASCADE
);

GO

INSERT INTO [dbo].[FT_Usuarios] ([Usuario], [Email], [Activo])
VALUES ('sebastianperez', 'sebastianperez@mardelplata.gob.ar', 1);

INSERT INTO [dbo].[FT_Usuarios] ([Usuario], [Email], [Activo])
VALUES ('jcgarcia', 'jcgarcia@mardelplata.gob.ar', 1);

INSERT INTO [dbo].[FT_Usuarios] ([Usuario], [Email], [Activo])
VALUES ('gdgutierrez', 'gdgutierrez@mardelplata.gob.ar', 1);

INSERT INTO [dbo].[FT_Usuarios] ([Usuario], [Email], [Activo])
VALUES ('tramirez', 'tramirez@mardelplata.gob.ar', 1);

GO

INSERT INTO [dbo].[FT_Categorias] ([Nombre])
VALUES ('Alimentos y bebidas');

