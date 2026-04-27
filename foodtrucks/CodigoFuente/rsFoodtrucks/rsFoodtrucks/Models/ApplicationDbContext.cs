using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Microsoft.Extensions.Configuration;


// Code scaffolded by EF Core assumes nullable reference types (NRTs) are not used or disabled.
// If you have enabled NRTs for your project, then un-comment the following line:
// #nullable disable

namespace rsFoodtrucks.Models
{
    public partial class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }
        public virtual DbSet<FT_Foodtrucks> FT_Foodtrucks { get; set; }
        public virtual DbSet<FT_Usuarios> FT_Usuarios { get; set; }
        public virtual DbSet<FT_Categorias> FT_Categorias { get; set; }

        public virtual DbSet<FT_FoodtruckFT_Categoria> FT_FoodtruckFT_Categoria { get; set; }
        public virtual DbSet<FT_Resenias> FT_Resenias { get; set; }
        public virtual DbSet<FT_Preguntas> FT_Preguntas { get; set; }
        public virtual DbSet<FT_Puntajes> FT_Puntajes { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. See http://go.microsoft.com/fwlink/?LinkId=723263 for guidance on storing connection strings.
                //optionsBuilder.UseSqlServer(Configuration.GetConnectionString("MGP026DataBase"));
                //optionsBuilder.UseSqlServer(Configuration.GetConnectionString("MGP015DataBase"));
                //optionsBuilder.UseOracle(Configuration.GetConnectionString("rafam")); 
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.HasAnnotation("Relational:DefaultSchema", "public");
            modelBuilder.Entity<FT_Foodtrucks>(entity =>
            {

                entity.HasKey(e => e.IdFT)
                    .HasName("FT_Id_Foodtruck_PK");

                entity.HasMany(f => f.FoodtrucksCategorias)
                    .WithOne(c => c.foodtruck)
                    .HasForeignKey(f => f.IdFT);

                entity.ToTable("FT_Foodtrucks");

                entity.Property(e => e.NombreFantasia)
                    .HasColumnName("NombreFantasia")
                    .HasColumnType("varchar(2000)")
                    .IsUnicode(false)
                    .IsRequired(true);

                entity.Property(e => e.Logo)
                    .HasColumnName("Logo")
                    .IsRequired(false);
                     //.HasColumnType("image");
                     //.HasColumnType("varbinary(max)");

                entity.Property(e => e.Titular)
                    .HasColumnName("Titular")
                    .HasColumnType("varchar(2000)")
                    .IsUnicode(false)
                    .IsRequired(true); 

                entity.Property(e => e.EmailContacto)
                   .HasColumnName("Email")
                   .HasColumnType("varchar(255)")
                   .IsRequired(false)
                   .IsUnicode(false);

                entity.Property(e => e.Menu)
                    .HasMaxLength(10000)
                    .HasColumnType("TEXT")
                    .IsRequired(false)
                    .HasColumnName("Menu");

                entity.Property(e => e.SinTACC)
                    .HasColumnName("SinTACC")
                    .HasColumnType("char(1)")
                    .HasDefaultValue("N")
                    .IsRequired(false);

                entity.Property(e => e.Emplazado)
                    .HasColumnName("Emplazado")
                    .HasColumnType("char(1)")
                    .HasDefaultValue("N")
                    .IsRequired(false);

                entity.Property(e => e.CelContacto)
                   .HasColumnName("CelContacto")
                   .HasColumnType("varchar(255)")
                   .IsUnicode(false)
                   .IsRequired(false);

                entity.Property(e => e.Estado)
                    .HasColumnName("Estado")
                    .HasColumnType("char(1)")
                    .IsRequired(false)
                    .HasDefaultValueSql("true");
                
                //nuevos campos app de registro
                entity.Property(e => e.CuitCuil)
                    .HasColumnName("CuitCuil")
                    .HasColumnType("varchar(11)")
                    .IsRequired(false);

                entity.Property(e => e.DomicilioLegal)
                    .HasColumnName("DomicilioLegal")
                    .HasColumnType("varchar(255)")
                    .IsRequired(false);

                entity.Property(e => e.Telefono)
                    .HasColumnName("Telefono")
                    .HasColumnType("varchar(100)")
                    .IsRequired(false);

                entity.Property(e => e.EmailTitular)
                    .HasColumnName("EmailTitular")
                    .HasColumnType("varchar(255)")
                    .IsRequired(false);

                entity.Property(e => e.NumeroRegistro)
                    .HasColumnName("NumeroRegistro")
                    .HasColumnType("varchar(50)")
                    .IsRequired(false);

                entity.Property(e => e.FechaVencimiento)
                    .HasColumnName("FechaVencimiento")
                    .HasColumnType("date")
                    .IsRequired(false);

                entity.Property(e => e.SolicitudIngreso)
                    .HasColumnName("SolicitudIngreso")
                    .HasColumnType("varchar(50)")
                    .IsRequired(false);

                entity.Property(e => e.Consumo)
                    .HasColumnName("Consumo")
                    .HasColumnType("varchar(50)")
                    .IsRequired(false);
                
                entity.Property(e => e.CartaMenu)
                    .HasColumnName("CartaMenu")
                    .HasColumnType("bytea")
                    .IsRequired(false);
                

                entity.Property(e => e.DniFrente)
                    .HasColumnName("DniFrente")
                    .HasColumnType("bytea")
                    .IsRequired(false);

                entity.Property(e => e.DniDorso)
                    .HasColumnName("DniDorso")
                    .HasColumnType("bytea")
                    .IsRequired(false);

                entity.Property(e => e.FtFrente)
                    .HasColumnName("FtFrente")
                    .HasColumnType("bytea")
                    .IsRequired(false);


                entity.Property(e => e.HabHoja1)
                    .HasColumnName("HabHoja1")
                    .HasColumnType("bytea")
                    .IsRequired(false);

                entity.Property(e => e.HabHoja2)
                    .HasColumnName("HabHoja2")
                    .HasColumnType("bytea")
                    .IsRequired(false);

                entity.Property(e => e.HabHoja3)
                    .HasColumnName("HabHoja3")
                    .HasColumnType("bytea")
                    .IsRequired(false);

                entity.Property(e => e.QrCode)
                    .HasColumnName("QrCode")
                    .HasColumnType("bytea")
                    .IsRequired(false);

            });

            modelBuilder.Entity<FT_Usuarios>(entity =>
            {
                entity.HasKey(e => e.IdUsuario)
                    .HasName("FT_Usuaior_PK");

                entity.ToTable("FT_Usuarios");

                entity.Property(e => e.Usuario)
                    .HasColumnName("Usuario")
                    .HasColumnType("varchar(255)")
                    .IsUnicode(false)
                    .IsRequired(true);

                entity.Property(e => e.Email)
                    .HasColumnName("Email")
                    .IsRequired(false)
                    .HasColumnType("varchar(255)");

                entity.Property(e => e.Activo)
                    .HasColumnName("Activo")
                     .HasColumnType("boolean")
                    .IsRequired(false)
                    .HasDefaultValueSql("true");


            });

            modelBuilder.Entity<FT_Categorias>(entity =>
            {
                entity.ToTable("FT_Categorias");
                entity.HasKey(e => e.IdCategoria)
                    .HasName("FT_ID_Categoria_PK");
                

                entity.Property(e => e.Nombre)
                    .HasColumnName("Nombre")
                    .HasColumnType("varchar(2000)")
                    .IsUnicode(false)
                    .IsRequired(true);

                entity.HasMany(f => f.FoodtrucksCategorias)
                   .WithOne(c => c.categoria)
                   .HasForeignKey(f => f.IdCategoria);

            });


            modelBuilder.Entity<FT_FoodtruckFT_Categoria>(entity =>
            {
                entity.ToTable("FT_FoodtruckFT_Categoria");

                entity.HasKey(e => e.Id_FT_FoodtruckFT_Categoria);

                entity.Property(e => e.Id_FT_FoodtruckFT_Categoria)
                    .ValueGeneratedOnAdd();
                
                entity.HasOne(e => e.foodtruck)
                    .WithMany(f => f.FoodtrucksCategorias)
                    .HasForeignKey(e => e.IdFT)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.categoria)
                    .WithMany(c => c.FoodtrucksCategorias)
                    .HasForeignKey(e => e.IdCategoria)
                    .OnDelete(DeleteBehavior.Cascade);
                
            });

            modelBuilder.Entity<FT_Resenias>(entity =>
            {
                entity.ToTable("FT_Resenias");

                entity.HasKey(e => e.IdResenia)
                    .HasName("FT_Id_Resenia_PK");

                entity.Property(e => e.IdFT)
                    .HasColumnName("FoodtruckId");

                entity.Property(e => e.Cuil)
                    .HasColumnName("Cuil")
                    .HasColumnType("char(11)");

                entity.Property(e => e.CreatedAt)
                    .HasColumnType("timestamp without time zone");

                entity.Property(e => e.Comment)
                    .HasColumnType("text");

                entity.Property(e => e.NombreUsuario)
                    .HasColumnName("NombreUsuario")
                    .HasColumnType("varchar(255)");
                
                entity.HasOne(d => d.Foodtruck)
                    .WithMany(p => p.Resenias)
                    .HasForeignKey(d => d.IdFT)
                    .OnDelete(DeleteBehavior.Cascade)
                    .HasConstraintName("FT_Resenias_FoodtruckId_fkey");


            });

            modelBuilder.Entity<FT_Preguntas>(entity =>
            {
                entity.ToTable("FT_Preguntas");

                entity.HasKey(e => e.IdPregunta)
                    .HasName("FT_Id_Pregunta_PK");

                entity.Property(e => e.Name)
                    .HasColumnType("varchar(255)");

                entity.Property(e => e.IsActive)
                    .HasColumnType("boolean");
            });

            modelBuilder.Entity<FT_Puntajes>(entity =>
            {
                entity.ToTable("FT_Puntajes");

                entity.HasKey(e => new { e.IdResenia, e.IdPregunta })
                    .HasName("FT_Id_Puntajes_PK");

                entity.Property(e => e.IdResenia)
                    .HasColumnName("ReseniaId");

                entity.Property(e => e.IdPregunta)
                    .HasColumnName("PreguntaId");

                entity.Property(e => e.Score)
                    .HasColumnType("smallint");

                entity.HasOne(d => d.Resenia)
                    .WithMany(p => p.Puntajes)
                    .HasForeignKey(d => d.IdResenia)
                    .OnDelete(DeleteBehavior.Cascade)
                    .HasConstraintName("FT_Puntajes_ReseniaId_fkey");

                entity.HasOne(d => d.Pregunta)
                    .WithMany(p => p.Puntajes)
                    .HasForeignKey(d => d.IdPregunta)
                    .OnDelete(DeleteBehavior.Cascade)
                    .HasConstraintName("FT_Puntajes_PreguntaId_fkey");
            });

            OnModelCreatingPartial(modelBuilder);
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
    }
}
