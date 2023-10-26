﻿// <auto-generated />
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using ViewDiagrams.Models;

#nullable disable

namespace ViewDiagrams.Migrations
{
    [DbContext(typeof(ApplicationDbContext))]
    [Migration("20231026151413_InitalCreate")]
    partial class InitalCreate
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "7.0.13")
                .HasAnnotation("Relational:MaxIdentifierLength", 128);

            SqlServerModelBuilderExtensions.UseIdentityColumns(modelBuilder);

            modelBuilder.Entity("UserWorkspace", b =>
                {
                    b.Property<int>("UsersId")
                        .HasColumnType("int");

                    b.Property<int>("WorkspacesId")
                        .HasColumnType("int");

                    b.HasKey("UsersId", "WorkspacesId");

                    b.HasIndex("WorkspacesId");

                    b.ToTable("UserWorkspace");
                });

            modelBuilder.Entity("ViewDiagrams.Models.AccessSettings", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<string>("Test")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<bool>("UseTest")
                        .HasColumnType("bit");

                    b.Property<int>("UseTest2")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.ToTable("AccessSettings");
                });

            modelBuilder.Entity("ViewDiagrams.Models.Settings", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<int>("AccessSettingsId")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("AccessSettingsId");

                    b.ToTable("Settings");
                });

            modelBuilder.Entity("ViewDiagrams.Models.User", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<string>("Mail")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Password")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.ToTable("Users");
                });

            modelBuilder.Entity("ViewDiagrams.Models.Workspace", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<int>("SettingsId")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("SettingsId");

                    b.ToTable("Workspaces");
                });

            modelBuilder.Entity("UserWorkspace", b =>
                {
                    b.HasOne("ViewDiagrams.Models.User", null)
                        .WithMany()
                        .HasForeignKey("UsersId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("ViewDiagrams.Models.Workspace", null)
                        .WithMany()
                        .HasForeignKey("WorkspacesId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("ViewDiagrams.Models.Settings", b =>
                {
                    b.HasOne("ViewDiagrams.Models.AccessSettings", "AccessSettings")
                        .WithMany()
                        .HasForeignKey("AccessSettingsId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("AccessSettings");
                });

            modelBuilder.Entity("ViewDiagrams.Models.Workspace", b =>
                {
                    b.HasOne("ViewDiagrams.Models.Settings", "Settings")
                        .WithMany()
                        .HasForeignKey("SettingsId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Settings");
                });
#pragma warning restore 612, 618
        }
    }
}
